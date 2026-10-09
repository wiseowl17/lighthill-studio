import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type Ref,
} from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { site } from "@data/site";
import { PageHero } from "@/components/layout/PageHero";
import { PeerspaceMark } from "@/components/layout/PeerspaceMark";
import { ReviewStrip } from "@/components/home/ReviewStrip";
import { ratings } from "@data/reviews";

const peerspace = ratings.find((r) => r.source === "Peerspace")!;
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/desk/Field";
import {
  catalogAddons,
  depositCents,
  money,
  quoteBooking,
  rentalMinimumHours,
} from "@/lib/studio/catalog";
import { listRentalAvailability, startRentalCheckout } from "@/lib/studio/rental-fns";
import { pad, todayInTz } from "@/lib/studio/time";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";
import { pageHead } from "@/lib/seo";

type DaySlots = { date: string; slots: string[] };

const MAX_GUESTS = 20;
/** Errors thrown by startRentalCheckoutSession that are safe to show as-is. */
const RENTER_MESSAGES =
  /^(That window just filled|That start time is too soon|Rentals need at least|Deposit is too small)/;
const MAX_PAPER = 6;
const addonPrice = (id: string) =>
  money(catalogAddons.find((addon) => addon.id === id)?.unitCents ?? 0).replace(".00", "");

/** Start-time groups, in clock order: an "Early hours" slot is before that day's morning. */
const PERIODS = [
  { id: "early", label: "Early hours", range: "12–6 AM", from: 0, to: 6 },
  { id: "morning", label: "Morning", range: "6 AM–12 PM", from: 6, to: 12 },
  { id: "afternoon", label: "Afternoon", range: "12–5 PM", from: 12, to: 17 },
  { id: "evening", label: "Evening", range: "5 PM–12 AM", from: 17, to: 24 },
] as const;

export const Route = createFileRoute("/rent")({
  validateSearch: (search: Record<string, unknown>): { cancelled?: boolean } => {
    if (search.cancelled === "1" || search.cancelled === true) return { cancelled: true };
    return {};
  },
  component: RentPage,
  head: () =>
    pageHead({
      path: "/rent",
      title: "Infinity Wall Studio Rental, $55/hr | Lighthill, Lawrenceville GA",
      description:
        "Instant-book the Lighthill infinity wall studio in Lawrenceville, GA, any hour of the day. $55 an hour, two-hour minimum, 20% off eight hours or more, 50% deposit to confirm.",
    }),
});

function prettyTime(hhmm: string): string {
  const [hour, minute] = hhmm.split(":").map(Number);
  const suffix = hour < 12 ? "AM" : "PM";
  const hr = hour % 12 || 12;
  return `${hr}:${pad(minute)} ${suffix}`;
}

function prettyDate(iso: string, weekday: "long" | "short" = "long"): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday,
    month: weekday === "long" ? "long" : "short",
    day: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

function monthLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(`${iso}T12:00:00`),
  );
}

/** "10:00 AM – 12:00 PM", with "(next day)" when the block runs past midnight. */
function windowLabel(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  const endMinutes = h * 60 + m + hours * 60;
  const end = `${pad(Math.floor(endMinutes / 60) % 24)}:${pad(endMinutes % 60)}`;
  const nextDay = endMinutes >= 24 * 60 ? " (next day)" : "";
  return `${prettyTime(time)} – ${prettyTime(end)}${nextDay}`;
}

function scrollToEl(el: HTMLElement | null) {
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

function RentPage() {
  const { cancelled } = Route.useSearch();
  const { copy } = useI18n();
  const [hours, setHours] = useState(rentalMinimumHours);
  const [days, setDays] = useState<DaySlots[]>([]);
  const [ready, setReady] = useState(true);
  const [minHours, setMinHours] = useState(rentalMinimumHours);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [monthIndex, setMonthIndex] = useState(0);
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paper, setPaper] = useState(0);
  const [flashes, setFlashes] = useState(false);
  const [softboxes, setSoftboxes] = useState(false);
  const [assistant, setAssistant] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteVisible, setQuoteVisible] = useState(false);
  // 12 a.m.–6 a.m. starts are real (24-hour studio) but rarely wanted; fold
  // them so daytime times aren't pushed a screen down.
  const [showEarly, setShowEarly] = useState(false);

  const dateRef = useRef<HTMLFieldSetElement | null>(null);
  const timesRef = useRef<HTMLFieldSetElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const quoteRef = useRef<HTMLDivElement | null>(null);

  const durationMinutes = hours * 60;

  useEffect(() => {
    let live = true;
    setLoading(true);
    void listRentalAvailability({ data: { durationMinutes } })
      .then((result) => {
        if (!live) return;
        setReady(result.ready);
        setMinHours(result.minHours);
        setHours((current) => Math.max(current, result.minHours));
        setDays(result.days);
        // Keep a chosen date if it still fits the new length; never auto-pick
        // one (auto-picking today used to show only late-night times).
        setDate((current) =>
          current && result.days.some((day) => day.date === current) ? current : "",
        );
        setTime("");
      })
      .catch(() => {
        if (live) setError("We couldn't load the calendar. Refresh the page and try again.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [durationMinutes]);

  // Hide the phone summary bar while the full quote box is on screen.
  useEffect(() => {
    const el = quoteRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    // Also stays hidden once the quote has scrolled above the viewport, so the
    // bar never sits on top of the footer.
    const io = new IntersectionObserver(
      ([entry]) => setQuoteVisible(entry.isIntersecting || entry.boundingClientRect.top < 0),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ready, loading]);

  const selected = days.find((day) => day.date === date);
  const addons = useMemo(
    () =>
      catalogAddons.map((addon) => {
        if (addon.id === "paper") return { id: addon.id, qty: paper };
        if (addon.id === "flashes") return { id: addon.id, qty: flashes ? 1 : 0 };
        if (addon.id === "softboxes") return { id: addon.id, qty: softboxes ? 1 : 0 };
        if (addon.id === "assistant") return { id: addon.id, qty: assistant };
        return { id: addon.id, qty: 0 };
      }),
    [paper, flashes, softboxes, assistant],
  );
  const quote = quoteBooking({ kind: "rental", durationMinutes, addons });
  // Room price alone, shown beside the hours picker.
  const roomQuote = quoteBooking({ kind: "rental", durationMinutes, addons: [] });
  const roomOnly = {
    total: roomQuote.totalCents,
    full: roomQuote.lines[0]?.cents ?? roomQuote.totalCents,
    discounted: roomQuote.lines.length > 1,
  };
  const dueNow = depositCents(quote.totalCents);
  const balance = quote.totalCents - dueNow;

  const months = useMemo(() => {
    const map = new Map<string, DaySlots[]>();
    for (const day of days) {
      const key = day.date.slice(0, 7);
      const list = map.get(key) ?? [];
      list.push(day);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [days]);
  const month = months[Math.min(monthIndex, Math.max(months.length - 1, 0))];

  const groupedSlots = useMemo(() => {
    if (!selected) return [];
    return PERIODS.map((period) => ({
      ...period,
      slots: selected.slots.filter((slot) => {
        const hour = Number(slot.slice(0, 2));
        return hour >= period.from && hour < period.to;
      }),
    })).filter((group) => group.slots.length > 0);
  }, [selected]);

  // What still blocks checkout, in form order. Shown instead of a silent
  // disabled button.
  const missing: Array<{ label: string; short: string; go: () => void }> = [];
  if (!date)
    missing.push({
      label: "pick a date",
      short: "Pick a date",
      go: () => scrollToEl(dateRef.current),
    });
  if (!time)
    missing.push({
      label: "pick a start time",
      short: "Pick a time",
      go: () => scrollToEl(date ? timesRef.current : dateRef.current),
    });
  if (name.trim().length < 2)
    missing.push({
      label: "add your name",
      short: "Your name",
      go: () => nameRef.current?.focus(),
    });
  if (!email.includes("@"))
    missing.push({
      label: "add your email",
      short: "Your email",
      go: () => emailRef.current?.focus(),
    });
  const complete = missing.length === 0;

  function chooseDate(next: string) {
    setDate(next);
    setTime("");
    setError(null);
    // The times render below the calendar; bring them into view so a phone
    // user isn't left wondering what the tap did.
    requestAnimationFrame(() => scrollToEl(timesRef.current));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!complete) {
      missing[0]?.go();
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await startRentalCheckout({
        data: {
          date,
          startTime: time,
          durationMinutes,
          guestCount: guests,
          name,
          email,
          phone: phone || undefined,
          addons,
          notes: notes || undefined,
        },
      });
      window.location.assign(result.url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      // Only the booking-rule messages from rental.server.ts are written for
      // renters. Zod dumps and raw Stripe errors get a plain fallback.
      const isZod = message.trim().startsWith("[") || message.includes('"code"');
      setError(
        RENTER_MESSAGES.test(message)
          ? message
          : isZod
            ? "Something in the form needs another look. Check your name and email, then try again."
            : "Checkout didn't open, and nothing was charged. Try again in a minute, or write the studio.",
      );
      setPending(false);
    }
  }

  const summary =
    date && time
      ? `${prettyDate(date, "short")} · ${prettyTime(time)} · ${hours} hr`
      : date
        ? `${prettyDate(date, "short")} · ${hours} hr`
        : `${hours} hours`;
  const short = (cents: number) => money(cents).replace(/\.00$/, "");

  return (
    <main id="main" className="scheme-light bg-paper pb-32 text-ink lg:pb-24">
      <div className="bg-bg text-fg">
        <PageHero eyebrow={copy.rent.eyebrow} title={copy.rent.title} lede={copy.rent.lede} />
      </div>

      <div className="mx-auto max-w-7xl px-5 pt-12 md:px-8 md:pt-16">
        {cancelled ? (
          <p className="mb-8 border border-ink-border bg-paper-muted px-4 py-3 text-sm">
            {copy.rent.cancelled}
          </p>
        ) : null}

        {!ready && !loading ? (
          <div className="max-w-xl space-y-4">
            <p className="text-sm leading-relaxed text-ink-muted">{copy.rent.paused}</p>
            <div className="flex flex-wrap items-center gap-3">
              <PeerspaceMark iconClassName="h-10 w-10" />
              <Button variant="paperOutline" size="lg" asChild>
                <Link to="/contact" search={{ type: "rental" }}>
                  {copy.rent.write}
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <form
            id="rent-form"
            onSubmit={onSubmit}
            noValidate
            className="grid gap-12 lg:grid-cols-12"
          >
            <div className="space-y-12 lg:col-span-7">
              <Step n={1} title={copy.rent.hours}>
                {/* One native select instead of 11 buttons: same choice, a fraction of
                    the space, and the phone's own picker on mobile. */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                  <label htmlFor="rentHours" className="sr-only">
                    {copy.rent.hours}
                  </label>
                  <div className="relative w-full sm:w-56">
                    <select
                      id="rentHours"
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                      className="h-12 w-full appearance-none rounded-md border border-ink-border bg-paper px-3.5 pr-10 font-sans text-sm text-ink tabular-nums outline-none focus-visible:border-ink/40 focus-visible:ring-2 focus-visible:ring-ink/15"
                    >
                      {Array.from({ length: 13 - minHours }, (_, i) => i + minHours).map(
                        (value) => (
                          <option key={value} value={value}>
                            {value} hours{value >= 8 ? " · 20% off" : ""}
                          </option>
                        ),
                      )}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </div>
                  <p className="text-sm text-ink-muted" aria-live="polite">
                    {roomOnly.discounted ? (
                      <>
                        Room <span className="text-ink tabular-nums">{short(roomOnly.total)}</span>,
                        20% off {short(roomOnly.full)}
                      </>
                    ) : (
                      <>
                        Room <span className="text-ink tabular-nums">{short(roomOnly.total)}</span>{" "}
                        · 20% off from 8 hours
                      </>
                    )}
                  </p>
                </div>
              </Step>

              <Step n={2} title={copy.rent.date} ref={dateRef}>
                {loading ? (
                  <p className="text-sm text-ink-muted" aria-live="polite">
                    {copy.rent.checking}
                  </p>
                ) : !month ? (
                  <p className="text-sm text-ink-muted">{copy.rent.noOpenings}</p>
                ) : (
                  <MonthGrid
                    month={month[0]}
                    days={month[1]}
                    selected={date}
                    onSelect={chooseDate}
                    canPrev={monthIndex > 0}
                    canNext={monthIndex < months.length - 1}
                    onPrev={() => setMonthIndex((i) => Math.max(0, i - 1))}
                    onNext={() => setMonthIndex((i) => Math.min(months.length - 1, i + 1))}
                  />
                )}
                <p className="mt-3 text-sm text-ink-muted">
                  Open 24 hours. Book up to 60 days out, at least two hours ahead.
                </p>
              </Step>

              {selected ? (
                <Step
                  n={3}
                  title={`${copy.rent.startTime} · ${prettyDate(selected.date)}`}
                  ref={timesRef}
                >
                  <div className="space-y-5">
                    {groupedSlots.map((group) =>
                      group.id === "early" && !showEarly ? (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => setShowEarly(true)}
                          className="text-sm text-ink-muted underline underline-offset-4 hover:text-ink"
                        >
                          Show early hours · 12–6 AM ({group.slots.length} times)
                        </button>
                      ) : (
                        <div key={group.id}>
                          <p className="text-sm text-ink-muted">
                            <span className="font-medium text-ink">{group.label}</span> ·{" "}
                            {group.range}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {group.slots.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                aria-pressed={time === slot}
                                onClick={() => {
                                  setTime(slot);
                                  setError(null);
                                }}
                                className={cn(
                                  "h-11 border px-3 text-sm tabular-nums",
                                  time === slot
                                    ? "border-ink bg-ink text-paper"
                                    : "border-ink-border bg-paper text-ink hover:border-ink/40",
                                )}
                              >
                                {prettyTime(slot)}
                              </button>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                  {time ? (
                    <p className="mt-4 text-sm text-ink" aria-live="polite">
                      Your window: {windowLabel(time, hours)}
                    </p>
                  ) : null}
                </Step>
              ) : null}

              <Step n={selected ? 4 : 3} title={copy.rent.addons} optional>
                <div className="space-y-3">
                  <label className="flex min-h-12 items-center justify-between gap-4 border border-ink-border px-4 py-3 text-sm">
                    <span>{copy.rent.flashes}</span>
                    <input
                      type="checkbox"
                      checked={flashes}
                      onChange={(e) => setFlashes(e.target.checked)}
                      className="size-5 accent-ink"
                    />
                  </label>
                  <label className="flex min-h-12 items-center justify-between gap-4 border border-ink-border px-4 py-3 text-sm">
                    <span>{copy.rent.softboxes}</span>
                    <input
                      type="checkbox"
                      checked={softboxes}
                      onChange={(e) => setSoftboxes(e.target.checked)}
                      className="size-5 accent-ink"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label={`${copy.rent.paper} · ${addonPrice("paper")} each`}
                      htmlFor="paper"
                    >
                      <Input
                        id="paper"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={MAX_PAPER}
                        value={paper}
                        onChange={(e) => setPaper(clamp(e.target.value, 0, MAX_PAPER))}
                      />
                    </Field>
                    <Field
                      label={`${copy.rent.assistant} · ${addonPrice("assistant")}/hr`}
                      htmlFor="assistant"
                    >
                      <Input
                        id="assistant"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={hours}
                        value={assistant}
                        onChange={(e) => setAssistant(clamp(e.target.value, 0, hours))}
                      />
                    </Field>
                  </div>
                </div>
              </Step>

              <Step n={selected ? 5 : 4} title="Your details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={copy.rent.yourName} htmlFor="renterName">
                    <Input
                      id="renterName"
                      ref={nameRef}
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                    />
                  </Field>
                  <Field label={`${copy.rent.guests} · up to ${MAX_GUESTS}`} htmlFor="guests">
                    <Input
                      id="guests"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={MAX_GUESTS}
                      value={guests}
                      onChange={(e) => setGuests(clamp(e.target.value, 1, MAX_GUESTS))}
                    />
                  </Field>
                  <Field label={copy.rent.email} htmlFor="renterEmail">
                    <Input
                      id="renterEmail"
                      ref={emailRef}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </Field>
                  <Field label={`${copy.rent.phone} (optional)`} htmlFor="renterPhone">
                    <Input
                      id="renterPhone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                    />
                  </Field>
                </div>
                <div className="mt-4">
                  <Field label={copy.rent.notes} htmlFor="renterNotes">
                    <Textarea
                      id="renterNotes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Shot list, backdrop color, load-in time…"
                    />
                  </Field>
                </div>
              </Step>
            </div>

            <aside className="lg:col-span-5">
              <div
                ref={quoteRef}
                className="border border-ink-border bg-paper p-6 shadow-[var(--shadow-paper)] lg:sticky lg:top-28"
              >
                <p className="text-xs tracking-[0.16em] text-ink-muted uppercase">Your booking</p>
                <h2 className="mt-2 font-display text-3xl">
                  {date ? prettyDate(date) : "Pick a date"}
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  {time
                    ? `${windowLabel(time, hours)} · up to ${guests} guests`
                    : `${hours} hours · ${site.address.city}, ${site.address.region}`}
                </p>
                <ul className="mt-6 space-y-2 border-t border-ink-border pt-4 text-sm">
                  {quote.lines.map((line) => (
                    <li key={line.label} className="flex justify-between gap-4">
                      <span className="text-ink-muted">{line.label}</span>
                      <span className="tabular-nums">{money(line.cents)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-between border-t border-ink-border pt-4 text-sm">
                  <span>Total</span>
                  <span className="tabular-nums">{money(quote.totalCents)}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span>Due now · 50% deposit</span>
                  <span className="tabular-nums font-medium">{money(dueNow)}</span>
                </div>
                <div className="mt-1 flex justify-between text-sm text-ink-muted">
                  <span>Balance at the studio</span>
                  <span className="tabular-nums">{money(balance)}</span>
                </div>
                <Button
                  type="submit"
                  variant="invert"
                  size="lg"
                  className="mt-8 w-full"
                  disabled={pending}
                  aria-describedby="rent-status"
                >
                  {pending ? copy.rent.paying : `${copy.rent.pay} · ${money(dueNow)}`}
                </Button>
                <div id="rent-status" aria-live="polite" className="mt-3 text-sm">
                  {error ? (
                    <p role="alert" className="text-danger">
                      {error}
                    </p>
                  ) : !complete ? (
                    <p className="text-ink-muted">
                      To continue:{" "}
                      {missing.map((item, i) => (
                        <span key={item.label}>
                          {i > 0 ? " · " : ""}
                          <button
                            type="button"
                            onClick={item.go}
                            className="underline underline-offset-4 hover:text-ink"
                          >
                            {item.label}
                          </button>
                        </span>
                      ))}
                    </p>
                  ) : null}
                </div>
                <ul className="mt-6 space-y-2 border-t border-ink-border pt-4 text-sm leading-relaxed text-ink-muted">
                  <li>
                    <span className="text-ink">Free cancellation</span> up to 48 hours before your
                    start: the deposit is refunded in full.{" "}
                    <Link to="/faq" className="underline underline-offset-4 hover:text-ink">
                      Policy
                    </Link>
                  </li>
                  <li>
                    <span className="text-ink">Instant confirmation.</span> Stripe emails your
                    receipt; entry notes follow from the studio.
                  </li>
                  <li>
                    <span className="text-ink">Where:</span>{" "}
                    <a
                      href={site.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 hover:text-ink"
                    >
                      {site.address.street}, {site.address.city}
                    </a>
                    . Free parking, street-level entry.
                  </li>
                  <li>
                    Your time is held for 45 minutes while you pay. The {money(balance)} balance is
                    due when you arrive.
                  </li>
                </ul>
                <div className="mt-5 flex items-center gap-3 text-sm text-ink-muted">
                  <PeerspaceMark />
                  <span>
                    Rated {peerspace.rating.toFixed(1)} by {peerspace.count} renters on Peerspace.
                    You can book it there too.
                  </span>
                </div>
              </div>
            </aside>
          </form>
        )}

        <ReviewStrip
          title="From people who rented the room"
          pick={(r) => r.kind === "rental" && r.author !== "Marisol H."}
          className="mt-24"
        />
      </div>

      {ready && !loading ? (
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg text-fg transition-transform duration-200 lg:hidden",
            quoteVisible ? "translate-y-full" : "translate-y-0",
          )}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          aria-hidden={quoteVisible}
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{summary}</p>
              <p className="text-xs text-fg-muted tabular-nums">
                {short(dueNow)} due now of {short(quote.totalCents)}
              </p>
            </div>
            {complete ? (
              <Button
                type="submit"
                form="rent-form"
                size="lg"
                disabled={pending}
                tabIndex={quoteVisible ? -1 : 0}
              >
                {pending ? copy.rent.paying : "Pay deposit"}
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                onClick={() => missing[0]?.go()}
                tabIndex={quoteVisible ? -1 : 0}
              >
                {missing[0]?.short ?? "Continue"}
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}

function clamp(raw: string, min: number, max: number): number {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function Step({
  n,
  title,
  optional,
  children,
  ref,
}: {
  n: number;
  title: string;
  optional?: boolean;
  children: ReactNode;
  ref?: Ref<HTMLFieldSetElement>;
}) {
  return (
    <fieldset ref={ref} className="scroll-mt-28">
      <legend className="mb-4 flex items-baseline gap-3">
        <span className="font-display text-2xl tabular-nums text-ink-muted">{n}</span>
        <span className="text-xs font-medium tracking-[0.16em] text-ink uppercase">{title}</span>
        {optional ? <span className="text-xs text-ink-muted">Optional</span> : null}
      </legend>
      {children}
    </fieldset>
  );
}

function MonthGrid({
  month,
  days,
  selected,
  onSelect,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: {
  month: string;
  days: DaySlots[];
  selected: string;
  onSelect: (date: string) => void;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const first = `${month}-01`;
  const weekday = new Date(`${first}T12:00:00`).getDay();
  const offset = (weekday + 6) % 7;
  const open = new Set(days.map((day) => day.date));
  const startMonth = Number(month.slice(5));
  const startYear = Number(month.slice(0, 4));
  const daysInMonth = new Date(startYear, startMonth, 0).getDate();
  const today = todayInTz();
  const cells: Array<string | null> = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${pad(i + 1)}`),
  ];

  return (
    <div className="max-w-md">
      <div className="flex items-center justify-between">
        <p className="font-display text-2xl" aria-live="polite">
          {monthLabel(first)}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canPrev}
            aria-label="Previous month"
            className="flex size-11 items-center justify-center border border-ink-border disabled:opacity-30"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            aria-label="Next month"
            className="flex size-11 items-center justify-center border border-ink-border disabled:opacity-30"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
      <div
        className="mt-3 grid grid-cols-7 gap-1 text-center text-xs tracking-[0.08em] text-ink-muted uppercase"
        aria-hidden
      >
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
          <span key={label} className="py-1">
            {label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((iso, index) => {
          if (!iso) return <span key={`e-${index}`} />;
          const isOpen = open.has(iso) && iso >= today;
          const isSelected = iso === selected;
          return (
            <button
              key={iso}
              type="button"
              disabled={!isOpen}
              aria-pressed={isSelected}
              aria-label={`${prettyDate(iso)}${isOpen ? "" : ", unavailable"}`}
              onClick={() => onSelect(iso)}
              className={cn(
                "flex h-11 items-center justify-center text-sm tabular-nums",
                isSelected
                  ? "bg-ink text-paper"
                  : isOpen
                    ? "bg-paper-muted text-ink hover:bg-ink hover:text-paper"
                    : "text-ink-subtle line-through decoration-ink-subtle/50",
              )}
            >
              {Number(iso.slice(8))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
