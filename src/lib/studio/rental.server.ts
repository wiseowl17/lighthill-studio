import { getSql } from "@/lib/db";
import {
  catalogAddons,
  defaultTitle,
  depositCents,
  quoteBooking,
  rentalHoldMinutes,
  rentalLeadMinutes,
  rentalMinimumHours,
  type AddonSelection,
} from "./catalog";
import { findGoogleOverlap, listGoogleFloorEvents, mirrorBooking, publicOrigin } from "./google.server";
import { addDays, addMinutes, formatRange, pad, todayInTz, zonedStart } from "./time";
import {
  createCheckoutSession,
  loadStripeApp,
  paymentIntentId,
  retrieveCheckoutSession,
} from "./stripe.server";

const DAYS_AHEAD = 60;
const SLOT_START_MIN = 7 * 60;
const SLOT_END_MIN = 22 * 60;
const SLOT_STEP = 30;

type BusyWindow = { start: Date; end: Date };

export type CheckoutInput = {
  date: string;
  startTime: string;
  durationMinutes: number;
  guestCount: number;
  name: string;
  email: string;
  phone?: string;
  addons: AddonSelection[];
  notes?: string;
};

async function ownerUserId(): Promise<string> {
  const { ensureOwnerAccount } = await import("./ensure-owner.server");
  return ensureOwnerAccount();
}

async function expireStaleHolds(userId: string): Promise<void> {
  const sql = await getSql();
  const cutoff = new Date(Date.now() - 50 * 60 * 1000).toISOString();
  await sql`
    update bookings
    set status = 'cancelled', updated_at = now()
    where user_id = ${userId}
      and kind = 'rental'
      and status = 'tentative'
      and payment_status = 'unpaid'
      and created_at < ${cutoff}
  `;
}

export async function recoverPaidHolds(userId: string): Promise<void> {
  const sql = await getSql();
  const rows = await sql<{ stripe_session_id: string }>`
    select stripe_session_id from bookings
    where user_id = ${userId}
      and kind = 'rental'
      and status in ('tentative', 'cancelled')
      and payment_status = 'unpaid'
      and stripe_session_id is not null
  `;
  for (const row of rows) {
    if (!row.stripe_session_id) continue;
    try {
      await fulfillStripeSession(row.stripe_session_id);
    } catch (err) {
      console.error("[stripe] recover", row.stripe_session_id, err);
    }
  }
}

async function loadFloorRules(userId: string): Promise<{ minHours: number; buffer: number }> {
  const sql = await getSql();
  const rows = await sql<{ min_rental_hours: number; buffer_minutes: number }>`
    select min_rental_hours, buffer_minutes from studio_settings where user_id = ${userId} limit 1
  `;
  return {
    minHours: Number(rows[0]?.min_rental_hours ?? rentalMinimumHours),
    buffer: Number(rows[0]?.buffer_minutes ?? 0),
  };
}

async function listBusy(userId: string, from: Date, to: Date): Promise<BusyWindow[]> {
  const sql = await getSql();
  const rows = await sql<{ starts_at: string; ends_at: string }>`
    select starts_at, ends_at from bookings
    where user_id = ${userId}
      and status <> 'cancelled'
      and starts_at < ${to.toISOString()}
      and ends_at > ${from.toISOString()}
  `;
  const busy: BusyWindow[] = rows.map((row) => ({
    start: new Date(row.starts_at),
    end: new Date(row.ends_at),
  }));
  const google = await listGoogleFloorEvents(userId, from.toISOString(), to.toISOString());
  for (const event of google) {
    busy.push({ start: new Date(event.startsAt), end: new Date(event.endsAt) });
  }
  return busy;
}

function overlaps(start: Date, end: Date, busy: BusyWindow[]): boolean {
  const startMs = start.getTime();
  const endMs = end.getTime();
  return busy.some((window) => window.start.getTime() < endMs && window.end.getTime() > startMs);
}

function slotsForDay(
  date: string,
  durationMinutes: number,
  buffer: number,
  busy: BusyWindow[],
  now: Date,
): string[] {
  const lead = addMinutes(now, rentalLeadMinutes);
  const out: string[] = [];
  for (let minutes = SLOT_START_MIN; minutes <= SLOT_END_MIN; minutes += SLOT_STEP) {
    const time = `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
    const start = zonedStart(date, time);
    if (start.getTime() < lead.getTime()) continue;
    const end = addMinutes(start, durationMinutes);
    if (overlaps(addMinutes(start, -buffer), addMinutes(end, buffer), busy)) continue;
    out.push(time);
  }
  return out;
}

async function upsertRenter(
  userId: string,
  input: { name: string; email: string; phone?: string },
): Promise<string> {
  const sql = await getSql();
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const phone = input.phone?.trim() || null;
  const match = await sql<{ id: string }>`
    select id from clients
    where user_id = ${userId} and lower(email) = ${email}
    limit 1
  `;
  if (match[0]) {
    await sql`
      update clients set
        name = ${name},
        phone = coalesce(${phone}, phone)
      where id = ${match[0].id} and user_id = ${userId}
    `;
    return match[0].id;
  }
  const id = crypto.randomUUID();
  await sql`
    insert into clients (id, user_id, name, email, phone)
    values (${id}, ${userId}, ${name}, ${email}, ${phone})
  `;
  return id;
}

function storedAddons(addons: AddonSelection[]) {
  return addons
    .filter((item) => item.qty > 0)
    .map((item) => {
      const meta = catalogAddons.find((addon) => addon.id === item.id);
      return {
        id: item.id,
        qty: item.qty,
        name: meta?.name ?? item.id,
        cents: (meta?.unitCents ?? 0) * item.qty,
      };
    });
}

export async function getRentalAvailability(durationMinutes: number) {
  const userId = await ownerUserId();
  await recoverPaidHolds(userId);
  await expireStaleHolds(userId);
  const stripe = await loadStripeApp(userId);
  const rules = await loadFloorRules(userId);
  if (durationMinutes < rules.minHours * 60) {
    return {
      ready: Boolean(stripe),
      minHours: rules.minHours,
      days: [] as Array<{ date: string; slots: string[] }>,
    };
  }
  const from = todayInTz();
  const to = addDays(from, DAYS_AHEAD);
  const busy = await listBusy(
    userId,
    zonedStart(from, "00:00"),
    zonedStart(addDays(to, 1), "00:00"),
  );
  const now = new Date();
  const days: Array<{ date: string; slots: string[] }> = [];
  for (let i = 0; i < DAYS_AHEAD; i += 1) {
    const date = addDays(from, i);
    const slots = slotsForDay(date, durationMinutes, rules.buffer, busy, now);
    if (slots.length > 0) days.push({ date, slots });
  }
  return { ready: Boolean(stripe), minHours: rules.minHours, days };
}

export async function startRentalCheckoutSession(data: CheckoutInput): Promise<{ url: string }> {
  const userId = await ownerUserId();
  await expireStaleHolds(userId);
  const stripe = await loadStripeApp(userId);
  if (!stripe) throw new Error("Stripe is not connected yet.");

  const rules = await loadFloorRules(userId);
  if (data.durationMinutes < rules.minHours * 60) {
    throw new Error(`Rentals need at least ${rules.minHours} hours.`);
  }

  const start = zonedStart(data.date, data.startTime);
  const end = addMinutes(start, data.durationMinutes);
  if (start.getTime() < addMinutes(new Date(), rentalLeadMinutes).getTime()) {
    throw new Error("That start time is too soon. Pick a later slot.");
  }

  const paddedStart = addMinutes(start, -rules.buffer);
  const paddedEnd = addMinutes(end, rules.buffer);
  const sql = await getSql();
  const clash = await sql<{ title: string }>`
    select title from bookings
    where user_id = ${userId}
      and status <> 'cancelled'
      and starts_at < ${paddedEnd.toISOString()}
      and ends_at > ${paddedStart.toISOString()}
    limit 1
  `;
  if (clash[0]) throw new Error("That window just filled. Pick another time.");
  const googleBusy = await findGoogleOverlap(userId, paddedStart, paddedEnd);
  if (googleBusy) throw new Error("That window just filled. Pick another time.");

  const quote = quoteBooking({
    kind: "rental",
    durationMinutes: data.durationMinutes,
    addons: data.addons,
  });
  const dueNow = depositCents(quote.totalCents);
  if (dueNow < 50) throw new Error("Deposit is too small to charge.");

  const clientId = await upsertRenter(userId, data);
  const bookingId = crypto.randomUUID();
  const addons = storedAddons(data.addons);
  const title = `${defaultTitle("rental")} · ${data.name.trim()}`;
  const noteParts = ["Public rental. 50% deposit via Stripe.", data.notes?.trim() || ""].filter(Boolean);

  await sql`
    insert into bookings (
      id, user_id, client_id, kind, title,
      starts_at, ends_at, duration_minutes, guest_count,
      status, payment_status, total_cents, deposit_cents, notes, addons
    ) values (
      ${bookingId}, ${userId}, ${clientId}, 'rental', ${title},
      ${start.toISOString()}, ${end.toISOString()}, ${data.durationMinutes}, ${data.guestCount},
      'tentative', 'unpaid', ${quote.totalCents}, ${dueNow},
      ${noteParts.join(" ")}, ${JSON.stringify(addons)}::jsonb
    )
  `;

  const stillFree = await sql<{ id: string }>`
    select id from bookings
    where user_id = ${userId}
      and status <> 'cancelled'
      and id <> ${bookingId}
      and starts_at < ${paddedEnd.toISOString()}
      and ends_at > ${paddedStart.toISOString()}
    limit 1
  `;
  if (stillFree[0]) {
    await sql`update bookings set status = 'cancelled', updated_at = now() where id = ${bookingId}`;
    throw new Error("That window just filled. Pick another time.");
  }

  let origin = "https://lighthillstudio.com";
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    if (request) origin = publicOrigin(request);
  } catch {
    /* keep studio origin */
  }

  const when = formatRange(start.toISOString(), end.toISOString());
  try {
    const session = await createCheckoutSession(stripe.secretKey, {
      amountCents: dueNow,
      name: "Lighthill Studio rental deposit",
      description: `${when} · 50% to confirm`,
      email: data.email.trim(),
      bookingId,
      successUrl: `${origin}/rent/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/rent?cancelled=1`,
      expiresAt: Math.floor(Date.now() / 1000) + rentalHoldMinutes * 60,
      origin,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    await sql`
      update bookings set stripe_session_id = ${session.id}, updated_at = now()
      where id = ${bookingId} and user_id = ${userId}
    `;
    return { url: session.url };
  } catch (err) {
    await sql`update bookings set status = 'cancelled', updated_at = now() where id = ${bookingId}`;
    throw err instanceof Error ? err : new Error("Could not start checkout.");
  }
}

export async function fulfillStripeSession(sessionId: string): Promise<{ ok: boolean; bookingId?: string }> {
  const cleanId = sessionId.trim();
  if (!cleanId.startsWith("cs_")) {
    console.error("[stripe] fulfill bad session id");
    return { ok: false };
  }
  const userId = await ownerUserId();
  const stripe = await loadStripeApp(userId);
  if (!stripe) {
    console.error("[stripe] fulfill missing keys");
    return { ok: false };
  }

  let session: Awaited<ReturnType<typeof retrieveCheckoutSession>>;
  try {
    session = await retrieveCheckoutSession(stripe.secretKey, cleanId);
  } catch (err) {
    console.error("[stripe] retrieve", err);
    return { ok: false };
  }
  const paid = session.payment_status === "paid" || session.status === "complete";
  if (!paid) {
    console.error("[stripe] fulfill not paid", session.status, session.payment_status);
    return { ok: false };
  }

  const sql = await getSql();
  const bookingId = session.metadata?.bookingId || session.client_reference_id || "";
  const rows = await sql<{
    id: string;
    status: string;
    deposit_cents: number;
    total_cents: number;
    client_id: string | null;
    duration_minutes: number;
    addons: unknown;
  }>`
    select id, status, deposit_cents, total_cents, client_id, duration_minutes, addons
    from bookings
    where user_id = ${userId}
      and (
        stripe_session_id = ${cleanId}
        or stripe_session_id = ${session.id}
        or id = ${bookingId}
      )
    limit 1
  `;
  const booking = rows[0];
  if (!booking) {
    console.error("[stripe] fulfill no booking", cleanId, bookingId);
    return { ok: false };
  }
  if (booking.status === "confirmed" || booking.status === "completed") {
    return { ok: true, bookingId: booking.id };
  }

  const intent = paymentIntentId(session.payment_intent);
  await sql`
    update bookings set
      status = 'confirmed',
      payment_status = 'deposit',
      stripe_session_id = ${session.id},
      stripe_payment_intent = ${intent},
      updated_at = now()
    where id = ${booking.id} and user_id = ${userId}
  `;

  const existingInvoice = await sql<{ id: string }>`
    select id from invoices where booking_id = ${booking.id} limit 1
  `;
  if (!existingInvoice[0]) {
    const addons = Array.isArray(booking.addons) ? (booking.addons as AddonSelection[]) : [];
    const quote = quoteBooking({
      kind: "rental",
      durationMinutes: Number(booking.duration_minutes),
      addons,
    });
    const deposit = Number(booking.deposit_cents);
    const remaining = Math.max(0, quote.totalCents - deposit);
    const lines = [
      ...quote.lines,
      { label: "Deposit paid via Stripe", cents: -deposit },
    ];
    await sql`
      insert into invoices (
        id, user_id, booking_id, client_id, status, amount_cents, line_items, notes, sent_at
      ) values (
        ${crypto.randomUUID()}, ${userId}, ${booking.id}, ${booking.client_id},
        'sent', ${remaining}, ${JSON.stringify(lines)}::jsonb,
        ${"Balance due on arrival. Deposit collected through Stripe."},
        now()
      )
    `;
  }

  try {
    await mirrorBooking(userId, booking.id);
  } catch (err) {
    console.error("[stripe] mirror after pay", err);
  }
  return { ok: true, bookingId: booking.id };
}

export async function getConfirmedRental(sessionId: string) {
  const result = await fulfillStripeSession(sessionId);
  if (!result.ok || !result.bookingId) return { ok: false as const };
  const userId = await ownerUserId();
  const sql = await getSql();
  const rows = await sql<{
    title: string;
    starts_at: string;
    ends_at: string;
    total_cents: number;
    deposit_cents: number;
    guest_count: number | null;
    duration_minutes: number;
    client_name: string | null;
    client_email: string | null;
  }>`
    select b.title, b.starts_at, b.ends_at, b.total_cents, b.deposit_cents,
      b.guest_count, b.duration_minutes, c.name as client_name, c.email as client_email
    from bookings b
    left join clients c on c.id = b.client_id
    where b.id = ${result.bookingId} and b.user_id = ${userId}
    limit 1
  `;
  const row = rows[0];
  if (!row) return { ok: false as const };
  const invoice = await sql<{ id: string; amount_cents: number }>`
    select id, amount_cents from invoices
    where booking_id = ${result.bookingId}
    order by created_at desc
    limit 1
  `;
  return {
    ok: true as const,
    when: formatRange(row.starts_at, row.ends_at),
    title: "Studio rental",
    name: row.client_name,
    email: row.client_email,
    guests: row.guest_count,
    hours: row.duration_minutes / 60,
    totalCents: row.total_cents,
    depositCents: row.deposit_cents,
    balanceCents: invoice[0]?.amount_cents ?? Math.max(0, row.total_cents - row.deposit_cents),
  };
}
