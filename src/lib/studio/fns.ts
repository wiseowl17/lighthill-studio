import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDbSource, getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { OWNER_EMAIL } from "./owner";
import {
  bookingKinds,
  bookingStatuses,
  catalogAddons,
  defaultTitle,
  inquiryKinds,
  inquiryStatuses,
  invoiceStatuses,
  kindLabel,
  paymentStatuses,
  quoteBooking,
  rentalMinimumHours,
  shootPackages,
  type AddonSelection,
  type BookingKind,
  type BookingStatus,
  type InquiryKind,
  type InquiryStatus,
  type InvoiceStatus,
  type PaymentStatus,
} from "./catalog";
import { addMinutes, zonedStart } from "./time";
import {
  disconnectGoogle,
  envGoogleConfigured,
  loadGoogleApp,
  mirrorBooking,
  mirrorDelete,
  saveGoogleApp,
} from "./google.server";

type OwnerCtx = { userId: string; email: string };

async function requireOwner(userId: string): Promise<OwnerCtx> {
  const sql = await getSql();
  const rows = await sql<{ email: string }>`
    select email from "user" where id = ${userId} limit 1
  `;
  const email = rows[0]?.email?.toLowerCase() ?? "";
  if (email !== OWNER_EMAIL) {
    const err = new Error("Forbidden") as Error & { status: number };
    err.status = 403;
    throw err;
  }
  return { userId, email };
}

function deskHosted(): boolean {
  return Boolean(process.env.VERCEL?.trim());
}

function parseAddons(raw: unknown): Array<AddonSelection & { name?: string; cents?: number }> {
  if (!raw) return [];
  const value = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (!Array.isArray(value)) return [];
  return value as Array<AddonSelection & { name?: string; cents?: number }>;
}

function parseLines(raw: unknown): Array<{ label: string; cents: number }> {
  if (!raw) return [];
  const value = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (!Array.isArray(value)) return [];
  return value as Array<{ label: string; cents: number }>;
}

export type BookingRow = {
  id: string;
  clientId: string | null;
  clientName: string | null;
  kind: BookingKind;
  sessionType: string | null;
  title: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  guestCount: number | null;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalCents: number;
  depositCents: number;
  notes: string | null;
  addons: Array<AddonSelection & { name?: string; cents?: number }>;
};

function mapBooking(row: {
  id: string;
  client_id: string | null;
  client_name: string | null;
  kind: string;
  session_type: string | null;
  title: string;
  starts_at: string | Date;
  ends_at: string | Date;
  duration_minutes: number;
  guest_count: number | null;
  status: string;
  payment_status: string;
  total_cents: number;
  deposit_cents: number;
  notes: string | null;
  addons: unknown;
}): BookingRow {
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    kind: row.kind as BookingKind,
    sessionType: row.session_type,
    title: row.title,
    startsAt: new Date(row.starts_at).toISOString(),
    endsAt: new Date(row.ends_at).toISOString(),
    durationMinutes: Number(row.duration_minutes),
    guestCount: row.guest_count == null ? null : Number(row.guest_count),
    status: row.status as BookingStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    totalCents: Number(row.total_cents),
    depositCents: Number(row.deposit_cents),
    notes: row.notes,
    addons: parseAddons(row.addons),
  };
}

const bookingSelect = `
  b.id, b.client_id, c.name as client_name, b.kind, b.session_type, b.title,
  b.starts_at, b.ends_at, b.duration_minutes, b.guest_count, b.status,
  b.payment_status, b.total_cents, b.deposit_cents, b.notes, b.addons
`;

export const getDeskStatus = createServerFn({ method: "GET" }).handler(async () => {
  return {
    db: getDbSource(),
    hosted: deskHosted(),
  };
});

export const getDeskSession = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { ensureOwnerAccount } = await import("./ensure-owner.server");
    await ensureOwnerAccount();
    const sql = await getSql();
    const rows = await sql<{ email: string; name: string }>`
      select email, name from "user" where id = ${context.userId} limit 1
    `;
    const email = rows[0]?.email?.toLowerCase() ?? "";
    return {
      userId: context.userId,
      email,
      name: rows[0]?.name ?? "",
      isOwner: email === OWNER_EMAIL,
      db: getDbSource(),
      hosted: deskHosted(),
    };
  });

export const seedOwnerAccount = createServerFn({ method: "POST" }).handler(
  async () => {
    const { ensureOwnerAccount } = await import("./ensure-owner.server");
    await ensureOwnerAccount();
    return { ok: true as const };
  },
);

const rangeSchema = z.object({
  from: z.string(),
  to: z.string(),
});

export const listBookings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: unknown) => rangeSchema.parse(d))
  .handler(async ({ context, data }) => {
    const { userId } = await requireOwner(context.userId);
    const sql = await getSql();
    const rows = await sql.query<Parameters<typeof mapBooking>[0]>(
      `select ${bookingSelect}
       from bookings b
       left join clients c on c.id = b.client_id
       where b.user_id = $1
         and b.starts_at < $3
         and b.ends_at > $2
       order by b.starts_at asc`,
      [userId, data.from, data.to],
    );
    return rows.map(mapBooking);
  });

export const listUpcoming = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { userId } = await requireOwner(context.userId);
    const sql = await getSql();
    const rows = await sql.query<Parameters<typeof mapBooking>[0]>(
      `select ${bookingSelect}
       from bookings b
       left join clients c on c.id = b.client_id
       where b.user_id = $1
         and b.status <> 'cancelled'
         and b.starts_at >= now() - interval '2 hours'
       order by b.starts_at asc
       limit 12`,
      [userId],
    );
    return rows.map(mapBooking);
  });

export const getDeskSummary = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { userId } = await requireOwner(context.userId);
    const sql = await getSql();
    const today = await sql<{ count: number }>`
      select count(*)::int as count from bookings
      where user_id = ${userId}
        and status <> 'cancelled'
        and (starts_at at time zone 'America/New_York')::date
          = (now() at time zone 'America/New_York')::date
    `;
    const unpaid = await sql<{ count: number }>`
      select count(*)::int as count from invoices
      where user_id = ${userId} and status in ('draft', 'sent')
    `;
    const inbox = await sql<{ count: number }>`
      select count(*)::int as count from inquiries
      where user_id = ${userId} and status = 'new'
    `;
    return {
      todayCount: Number(today[0]?.count ?? 0),
      unpaidInvoices: Number(unpaid[0]?.count ?? 0),
      newInquiries: Number(inbox[0]?.count ?? 0),
    };
  });

const bookingInput = z.object({
  id: z.string().optional(),
  kind: z.enum(bookingKinds),
  sessionType: z.string().nullable().optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().optional(),
  clientPhone: z.string().optional(),
  clientId: z.string().nullable().optional(),
  date: z.string(),
  startTime: z.string(),
  durationMinutes: z.number().int().positive(),
  guestCount: z.number().int().nullable().optional(),
  status: z.enum(bookingStatuses),
  paymentStatus: z.enum(paymentStatuses),
  notes: z.string().optional(),
  addons: z.array(z.object({ id: z.string(), qty: z.number().int().nonnegative() })),
  inquiryId: z.string().optional(),
});

async function upsertClient(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  input: {
    clientId?: string | null;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
  },
): Promise<string | null> {
  const name = input.clientName?.trim() || null;
  const email = input.clientEmail?.trim() || null;
  const phone = input.clientPhone?.trim() || null;

  if (input.clientId) {
    if (name) {
      await sql`
        update clients set
          name = ${name},
          email = ${email},
          phone = ${phone}
        where id = ${input.clientId} and user_id = ${userId}
      `;
    }
    return input.clientId;
  }

  if (email) {
    const match = await sql<{ id: string }>`
      select id from clients
      where user_id = ${userId} and lower(email) = ${email.toLowerCase()}
      limit 1
    `;
    if (match[0]) {
      await sql`
        update clients set
          name = coalesce(${name}, name),
          phone = coalesce(${phone}, phone)
        where id = ${match[0].id} and user_id = ${userId}
      `;
      return match[0].id;
    }
  }

  if (!name) return null;
  const id = crypto.randomUUID();
  await sql`
    insert into clients (id, user_id, name, email, phone)
    values (${id}, ${userId}, ${name}, ${email}, ${phone})
  `;
  return id;
}

async function findOverlap(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  start: Date,
  end: Date,
  excludeId?: string,
) {
  const rows = await sql.query<{ id: string; title: string; starts_at: string }>(
    `select id, title, starts_at from bookings
     where user_id = $1
       and status <> 'cancelled'
       and starts_at < $3
       and ends_at > $2
       and ($4::text is null or id <> $4)
     limit 1`,
    [userId, start.toISOString(), end.toISOString(), excludeId ?? null],
  );
  return rows[0] ?? null;
}

export const saveBooking = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) => bookingInput.parse(d))
  .handler(async ({ context, data }) => {
    const { userId } = await requireOwner(context.userId);
    const sql = await getSql();

    const settings = await sql<{
      min_rental_hours: number;
      buffer_minutes: number;
    }>`
      select min_rental_hours, buffer_minutes
      from studio_settings
      where user_id = ${userId}
      limit 1
    `;
    const minHours = Number(settings[0]?.min_rental_hours ?? rentalMinimumHours);
    const buffer = Number(settings[0]?.buffer_minutes ?? 0);

    if (data.kind === "rental" && data.durationMinutes < minHours * 60) {
      throw new Error(`Rentals need at least ${minHours} hours.`);
    }

    const start = zonedStart(data.date, data.startTime);
    const end = addMinutes(start, data.durationMinutes);
    const overlap = await findOverlap(
      sql,
      userId,
      addMinutes(start, -buffer),
      addMinutes(end, buffer),
      data.id,
    );
    if (overlap) {
      throw new Error(`That window overlaps “${overlap.title}”.`);
    }

    const clientId =
      data.kind === "blocked"
        ? null
        : await upsertClient(sql, userId, data);

    const quote = quoteBooking({
      kind: data.kind,
      sessionType: data.sessionType,
      durationMinutes: data.durationMinutes,
      addons: data.addons,
    });
    const storedAddons = data.addons
      .filter((a) => a.qty > 0)
      .map((a) => {
        const meta = catalogAddons.find((c) => c.id === a.id);
        return {
          id: a.id,
          qty: a.qty,
          name: meta?.name ?? a.id,
          cents: (meta?.unitCents ?? 0) * a.qty,
        };
      });

    const title =
      data.kind === "blocked" || data.kind === "hold"
        ? (data.notes?.trim() ? data.notes.trim().slice(0, 80) : defaultTitle(data.kind, data.sessionType))
        : clientId
          ? `${defaultTitle(data.kind, data.sessionType)}`
          : defaultTitle(data.kind, data.sessionType);

    const displayTitle = data.clientName?.trim()
      ? `${defaultTitle(data.kind, data.sessionType)} · ${data.clientName.trim()}`
      : title;

    const id = data.id ?? crypto.randomUUID();
    const sessionType = data.kind === "shoot" ? (data.sessionType ?? null) : null;

    if (data.id) {
      await sql`
        update bookings set
          client_id = ${clientId},
          kind = ${data.kind},
          session_type = ${sessionType},
          title = ${displayTitle},
          starts_at = ${start.toISOString()},
          ends_at = ${end.toISOString()},
          duration_minutes = ${data.durationMinutes},
          guest_count = ${data.guestCount ?? null},
          status = ${data.status},
          payment_status = ${data.paymentStatus},
          total_cents = ${quote.totalCents},
          notes = ${data.notes?.trim() || null},
          addons = ${JSON.stringify(storedAddons)}::jsonb,
          updated_at = now()
        where id = ${id} and user_id = ${userId}
      `;
    } else {
      await sql`
        insert into bookings (
          id, user_id, client_id, kind, session_type, title,
          starts_at, ends_at, duration_minutes, guest_count,
          status, payment_status, total_cents, notes, addons
        ) values (
          ${id}, ${userId}, ${clientId}, ${data.kind}, ${sessionType}, ${displayTitle},
          ${start.toISOString()}, ${end.toISOString()}, ${data.durationMinutes}, ${data.guestCount ?? null},
          ${data.status}, ${data.paymentStatus}, ${quote.totalCents},
          ${data.notes?.trim() || null}, ${JSON.stringify(storedAddons)}::jsonb
        )
      `;
    }

    if (data.inquiryId) {
      await sql`
        update inquiries set status = 'booked'
        where id = ${data.inquiryId} and user_id = ${userId}
      `;
    }

    void mirrorBooking(userId, id);
    return { id };
  });

export const getBooking = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    const { userId } = await requireOwner(context.userId);
    const sql = await getSql();
    const rows = await sql.query<
      Parameters<typeof mapBooking>[0] & {
        client_email: string | null;
        client_phone: string | null;
      }
    >(
      `select ${bookingSelect}, c.email as client_email, c.phone as client_phone
       from bookings b
       left join clients c on c.id = b.client_id
       where b.user_id = $1 and b.id = $2
       limit 1`,
      [userId, data.id],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      ...mapBooking(row),
      clientEmail: row.client_email,
      clientPhone: row.client_phone,
    };
  });

export const deleteBooking = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    const { userId } = await requireOwner(context.userId);
    const sql = await getSql();
    const rows = await sql<{ google_event_id: string | null }>`
      select google_event_id from bookings where id = ${data.id} and user_id = ${userId} limit 1
    `;
    await sql`delete from bookings where id = ${data.id} and user_id = ${userId}`;
    void mirrorDelete(userId, rows[0]?.google_event_id ?? null);
    return { ok: true };
  });

export const listClients = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { userId } = await requireOwner(context.userId);
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
      instagram: string | null;
      notes: string | null;
      last_visit: string | Date | null;
    }>`
      select c.id, c.name, c.email, c.phone, c.instagram, c.notes,
        (select max(b.starts_at) from bookings b where b.client_id = c.id) as last_visit
      from clients c
      where c.user_id = ${userId}
      order by c.name asc
    `;
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      instagram: row.instagram,
      notes: row.notes,
      last_visit: row.last_visit ? new Date(row.last_visit).toISOString() : null,
    }));
  });

export const saveClient = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z
      .object({
        id: z.string().optional(),
        name: z.string().min(1),
        email: z.string().optional(),
        phone: z.string().optional(),
        instagram: z.string().optional(),
        notes: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { userId } = await requireOwner(context.userId);
    const sql = await getSql();
    const id = data.id ?? crypto.randomUUID();
    if (data.id) {
      await sql`
        update clients set
          name = ${data.name.trim()},
          email = ${data.email?.trim() || null},
          phone = ${data.phone?.trim() || null},
          instagram = ${data.instagram?.trim() || null},
          notes = ${data.notes?.trim() || null}
        where id = ${id} and user_id = ${userId}
      `;
    } else {
      await sql`
        insert into clients (id, user_id, name, email, phone, instagram, notes)
        values (
          ${id}, ${userId}, ${data.name.trim()},
          ${data.email?.trim() || null}, ${data.phone?.trim() || null},
          ${data.instagram?.trim() || null}, ${data.notes?.trim() || null}
        )
      `;
    }
    return { id };
  });

export const deleteClient = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    const { userId } = await requireOwner(context.userId);
    const sql = await getSql();
    await sql`delete from clients where id = ${data.id} and user_id = ${userId}`;
    return { ok: true };
  });

export const createInvoiceFromBooking = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) => z.object({ bookingId: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    const { userId } = await requireOwner(context.userId);
    const sql = await getSql();
    const rows = await sql.query<Parameters<typeof mapBooking>[0]>(
      `select ${bookingSelect}
       from bookings b
       left join clients c on c.id = b.client_id
       where b.user_id = $1 and b.id = $2
       limit 1`,
      [userId, data.bookingId],
    );
    const booking = rows[0];
    if (!booking) throw new Error("Booking not found.");
    const mapped = mapBooking(booking);
    const quote = quoteBooking({
      kind: mapped.kind,
      sessionType: mapped.sessionType,
      durationMinutes: mapped.durationMinutes,
      addons: mapped.addons,
    });
    const id = crypto.randomUUID();
    await sql`
      insert into invoices (id, user_id, booking_id, client_id, status, amount_cents, line_items, notes)
      values (
        ${id}, ${userId}, ${mapped.id}, ${mapped.clientId},
        'draft', ${quote.totalCents}, ${JSON.stringify(quote.lines)}::jsonb,
        ${kindLabel(mapped.kind)}
      )
    `;
    return { id };
  });

export const listInvoices = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { userId } = await requireOwner(context.userId);
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      booking_id: string | null;
      client_name: string | null;
      status: string;
      amount_cents: number;
      line_items: unknown;
      notes: string | null;
      sent_at: string | Date | null;
      paid_at: string | Date | null;
      created_at: string | Date;
    }>`
      select i.id, i.booking_id, c.name as client_name, i.status, i.amount_cents,
        i.line_items, i.notes, i.sent_at, i.paid_at, i.created_at
      from invoices i
      left join clients c on c.id = i.client_id
      where i.user_id = ${userId}
      order by i.created_at desc
    `;
    return rows.map((row) => ({
      id: row.id,
      bookingId: row.booking_id,
      clientName: row.client_name,
      status: row.status as InvoiceStatus,
      amountCents: Number(row.amount_cents),
      lineItems: parseLines(row.line_items),
      notes: row.notes,
      sentAt: row.sent_at ? new Date(row.sent_at).toISOString() : null,
      paidAt: row.paid_at ? new Date(row.paid_at).toISOString() : null,
      createdAt: new Date(row.created_at).toISOString(),
    }));
  });

export const updateInvoiceStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z.object({ id: z.string(), status: z.enum(invoiceStatuses) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { userId } = await requireOwner(context.userId);
    const sql = await getSql();
    const sentAt = data.status === "sent" ? new Date().toISOString() : null;
    const paidAt = data.status === "paid" ? new Date().toISOString() : null;
    await sql`
      update invoices set
        status = ${data.status},
        sent_at = coalesce(${sentAt}, sent_at),
        paid_at = coalesce(${paidAt}, paid_at)
      where id = ${data.id} and user_id = ${userId}
    `;
    if (data.status === "paid") {
      await sql`
        update bookings b
        set payment_status = 'paid', updated_at = now()
        from invoices i
        where i.id = ${data.id}
          and i.user_id = ${userId}
          and b.id = i.booking_id
          and b.user_id = ${userId}
      `;
    }
    return { ok: true };
  });

export const deleteInvoice = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    const { userId } = await requireOwner(context.userId);
    const sql = await getSql();
    await sql`delete from invoices where id = ${data.id} and user_id = ${userId}`;
    return { ok: true };
  });

export const listInquiries = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { userId } = await requireOwner(context.userId);
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      name: string;
      email: string;
      phone: string | null;
      kind: string;
      message: string;
      status: string;
      created_at: string | Date;
    }>`
      select id, name, email, phone, kind, message, status, created_at
      from inquiries
      where user_id = ${userId}
      order by created_at desc
    `;
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      kind: row.kind as InquiryKind,
      message: row.message,
      status: row.status as InquiryStatus,
      createdAt: new Date(row.created_at).toISOString(),
    }));
  });

export const updateInquiryStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z.object({ id: z.string(), status: z.enum(inquiryStatuses) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { userId } = await requireOwner(context.userId);
    const sql = await getSql();
    await sql`
      update inquiries set status = ${data.status}
      where id = ${data.id} and user_id = ${userId}
    `;
    return { ok: true };
  });

export const deleteInquiry = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    const { userId } = await requireOwner(context.userId);
    const sql = await getSql();
    await sql`delete from inquiries where id = ${data.id} and user_id = ${userId}`;
    return { ok: true };
  });

export const getInquiry = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    const { userId } = await requireOwner(context.userId);
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      name: string;
      email: string;
      phone: string | null;
      kind: string;
      message: string;
    }>`
      select id, name, email, phone, kind, message
      from inquiries
      where id = ${data.id} and user_id = ${userId}
      limit 1
    `;
    return rows[0]
      ? {
          id: rows[0].id,
          name: rows[0].name,
          email: rows[0].email,
          phone: rows[0].phone,
          kind: rows[0].kind as InquiryKind,
          message: rows[0].message,
        }
      : null;
  });

export const submitInquiry = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z
      .object({
        name: z.string().min(1).max(120),
        email: z.string().email().max(180),
        phone: z.string().max(40).optional(),
        kind: z.enum(inquiryKinds),
        message: z.string().min(1).max(4000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { ensureOwnerAccount, ownerIdOrNull } = await import(
      "./ensure-owner.server"
    );
    await ensureOwnerAccount();
    const ownerId = await ownerIdOrNull();
    if (!ownerId) return { ok: false };
    const sql = await getSql();
    await sql`
      insert into inquiries (id, user_id, name, email, phone, kind, message)
      values (
        ${crypto.randomUUID()},
        ${ownerId},
        ${data.name.trim()},
        ${data.email.trim()},
        ${data.phone?.trim() || null},
        ${data.kind},
        ${data.message.trim()}
      )
    `;
    return { ok: true };
  });

export const getSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { userId } = await requireOwner(context.userId);
    const sql = await getSql();
    await sql`
      insert into studio_settings (user_id)
      values (${userId})
      on conflict (user_id) do nothing
    `;
    const rows = await sql<{
      timezone: string;
      min_rental_hours: number;
      buffer_minutes: number;
      square_connected: boolean;
      google_calendar_connected: boolean;
      google_account_email: string | null;
      google_client_id: string | null;
    }>`
      select timezone, min_rental_hours, buffer_minutes,
        square_connected, google_calendar_connected,
        google_account_email, google_client_id
      from studio_settings
      where user_id = ${userId}
      limit 1
    `;
    const row = rows[0];
    const app = await loadGoogleApp(userId);
    return {
      timezone: row?.timezone ?? "America/New_York",
      minRentalHours: Number(row?.min_rental_hours ?? 2),
      bufferMinutes: Number(row?.buffer_minutes ?? 0),
      squareConnected: Boolean(row?.square_connected),
      googleCalendarConnected: Boolean(row?.google_calendar_connected),
      googleAccountEmail: row?.google_account_email ?? null,
      googleReady: Boolean(app),
      googleEnvConfigured: envGoogleConfigured(),
      googleClientIdHint: envGoogleConfigured()
        ? "env"
        : row?.google_client_id
          ? `${row.google_client_id.slice(0, 12)}…`
          : null,
    };
  });

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z
      .object({
        minRentalHours: z.number().int().min(1).max(12),
        bufferMinutes: z.number().int().min(0).max(180),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { userId } = await requireOwner(context.userId);
    const sql = await getSql();
    await sql`
      insert into studio_settings (user_id, min_rental_hours, buffer_minutes)
      values (${userId}, ${data.minRentalHours}, ${data.bufferMinutes})
      on conflict (user_id) do update set
        min_rental_hours = excluded.min_rental_hours,
        buffer_minutes = excluded.buffer_minutes
    `;
    return { ok: true };
  });

export const saveGoogleCredentials = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z
      .object({
        clientId: z.string().trim().min(12),
        clientSecret: z.string().trim().min(8),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { userId } = await requireOwner(context.userId);
    await saveGoogleApp(userId, data.clientId, data.clientSecret);
    return { ok: true };
  });

export const disconnectGoogleCalendar = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { userId } = await requireOwner(context.userId);
    await disconnectGoogle(userId);
    return { ok: true };
  });

export const catalogPayload = {
  shootPackages,
  catalogAddons,
  rentalMinimumHours,
};
