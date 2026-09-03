import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { site } from "@data/site";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
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

type DaySlots = { date: string; slots: string[] };

export const Route = createFileRoute("/rent")({
  validateSearch: (search: Record<string, unknown>): { cancelled?: boolean } => ({
    cancelled: search.cancelled === "1" || search.cancelled === true,
  }),
  component: RentPage,
  head: () => ({
    meta: [
      { title: "Rent the studio — Lighthill Studio" },
      {
        name: "description",
        content:
          "Instant-book the Lighthill cyclorama. $55 an hour, two-hour minimum, 50% deposit.",
      },
    ],
  }),
});

function prettyTime(hhmm: string): string {
  const [hour, minute] = hhmm.split(":").map(Number);
  const suffix = hour < 12 ? "AM" : "PM";
  const hr = hour % 12 || 12;
  return `${hr}:${pad(minute)} ${suffix}`;
}

function prettyDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

function monthLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(`${iso}T12:00:00`),
  );
}

function RentPage() {
  const { cancelled } = Route.useSearch();
  const [hours, setHours] = useState(rentalMinimumHours);
  const [days, setDays] = useState<DaySlots[]>([]);
  const [ready, setReady] = useState(true);
  const [minHours, setMinHours] = useState(rentalMinimumHours);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
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
        setDate((current) => {
          if (current && result.days.some((day) => day.date === current)) return current;
          return result.days[0]?.date ?? "";
        });
        setTime("");
      })
      .catch(() => {
        if (live) setError("Could not load availability. Refresh and try again.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [durationMinutes]);

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
  const dueNow = depositCents(quote.totalCents);
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

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!date || !time) {
      setError("Pick a date and a start time.");
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
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setPending(false);
    }
  }

  return (
    <main id="main" className="scheme-light bg-paper pb-24 text-ink">
      <div className="bg-bg text-fg">
        <PageHero
          eyebrow="Studio rental"
          title="The cyclorama, by the hour."
          lede="Instant book. $55 an hour, two-hour minimum, 50% deposit due now. The floor stays in step with the studio calendar."
        />
      </div>

      <div className="mx-auto max-w-7xl px-5 pt-12 md:px-8 md:pt-16">
        {cancelled ? (
          <p className="mb-8 border border-ink-border bg-paper-muted px-4 py-3 text-sm">
            Checkout was cancelled. Nothing was charged — pick a time again when you are ready.
          </p>
        ) : null}

        {!ready && !loading ? (
          <div className="max-w-xl space-y-4">
            <p className="text-sm leading-relaxed text-ink-muted">
              Direct checkout is paused. Book the room on Peerspace, or write us.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="invert" size="lg" asChild>
                <a href={site.peerspaceUrl} target="_blank" rel="noopener noreferrer">
                  Book with Peerspace
                  <ArrowUpRight className="size-3.5" />
                </a>
              </Button>
              <Button variant="paperOutline" size="lg" asChild>
                <Link to="/contact" search={{ type: "rental" }}>
                  Write the studio
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-12 lg:grid-cols-12">
            <div className="space-y-10 lg:col-span-7">
              <fieldset>
                <Label>Hours</Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Array.from({ length: 13 - minHours }, (_, i) => i + minHours).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setHours(value)}
                      className={cn(
                        "h-11 min-w-11 border px-3 text-sm tabular-nums",
                        hours === value
                          ? "border-ink bg-ink text-paper"
                          : "border-ink-border bg-paper text-ink hover:border-ink/40",
                      )}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-ink-subtle">
                  {hours >= 8 ? "8+ hour day includes 20% off." : "Two-hour minimum. 20% off at 8 hours."}
                </p>
              </fieldset>

              <fieldset>
                <Label>Date</Label>
                {loading ? (
                  <p className="mt-3 text-sm text-ink-muted">Checking the floor…</p>
                ) : days.length === 0 ? (
                  <p className="mt-3 text-sm text-ink-muted">
                    No openings of {hours} hours in the next 60 days. Try a shorter block.
                  </p>
                ) : (
                  <div className="mt-4 space-y-8">
                    {months.map(([key, monthDays]) => (
                      <MonthGrid
                        key={key}
                        month={key}
                        days={monthDays}
                        selected={date}
                        onSelect={(next) => {
                          setDate(next);
                          setTime("");
                        }}
                      />
                    ))}
                  </div>
                )}
              </fieldset>

              {selected ? (
                <fieldset>
                  <Label>Start time · {prettyDate(selected.date)}</Label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selected.slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTime(slot)}
                        className={cn(
                          "h-11 border px-3 text-sm",
                          time === slot
                            ? "border-ink bg-ink text-paper"
                            : "border-ink-border bg-paper text-ink hover:border-ink/40",
                        )}
                      >
                        {prettyTime(slot)}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ) : null}

              <fieldset className="space-y-4">
                <Label>Add-ons</Label>
                <label className="flex items-center justify-between gap-4 border border-ink-border px-4 py-3 text-sm">
                  <span>Studio flashes · $40</span>
                  <input
                    type="checkbox"
                    checked={flashes}
                    onChange={(e) => setFlashes(e.target.checked)}
                    className="size-4 accent-ink"
                  />
                </label>
                <label className="flex items-center justify-between gap-4 border border-ink-border px-4 py-3 text-sm">
                  <span>Softboxes & modifiers · $30</span>
                  <input
                    type="checkbox"
                    checked={softboxes}
                    onChange={(e) => setSoftboxes(e.target.checked)}
                    className="size-4 accent-ink"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Paper roll colors" htmlFor="paper">
                    <Input
                      id="paper"
                      type="number"
                      min={0}
                      max={6}
                      value={paper}
                      onChange={(e) => setPaper(Math.max(0, Number(e.target.value)))}
                    />
                  </Field>
                  <Field label="Assistant hours" htmlFor="assistant">
                    <Input
                      id="assistant"
                      type="number"
                      min={0}
                      max={hours}
                      value={assistant}
                      onChange={(e) => setAssistant(Math.max(0, Number(e.target.value)))}
                    />
                  </Field>
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" htmlFor="renterName">
                  <Input
                    id="renterName"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </Field>
                <Field label="Guests" htmlFor="guests">
                  <Input
                    id="guests"
                    type="number"
                    min={1}
                    max={20}
                    value={guests}
                    onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
                  />
                </Field>
                <Field label="Email" htmlFor="renterEmail">
                  <Input
                    id="renterEmail"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </Field>
                <Field label="Phone" htmlFor="renterPhone">
                  <Input
                    id="renterPhone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                  />
                </Field>
              </div>
              <Field label="Notes for the studio (optional)" htmlFor="renterNotes">
                <Textarea
                  id="renterNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Shot list, backdrop color, load-in time…"
                />
              </Field>
            </div>

            <aside className="lg:col-span-5">
              <div className="border border-ink-border bg-paper p-6 shadow-[var(--shadow-paper)] lg:sticky lg:top-28">
                <p className="text-[0.68rem] tracking-[0.16em] text-ink-muted uppercase">
                  Quote
                </p>
                <h2 className="mt-2 font-display text-3xl">
                  {date && time ? prettyDate(date) : "Pick a window"}
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  {date && time
                    ? `${prettyTime(time)} · ${hours} hr · up to ${guests} guests`
                    : `${hours} hours · Lawrenceville`}
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
                  <span>Due now · 50%</span>
                  <span className="tabular-nums font-medium">{money(dueNow)}</span>
                </div>
                <div className="mt-1 flex justify-between text-sm text-ink-muted">
                  <span>Balance on the day</span>
                  <span className="tabular-nums">{money(quote.totalCents - dueNow)}</span>
                </div>
                <Button
                  type="submit"
                  variant="invert"
                  size="lg"
                  className="mt-8 w-full"
                  disabled={pending || !date || !time || !name || !email}
                >
                  {pending ? "Sending you to Stripe…" : `Pay ${money(dueNow)} deposit`}
                </Button>
                {error ? <p className="mt-3 text-sm text-ink-muted">{error}</p> : null}
                <p className="mt-4 text-xs leading-relaxed text-ink-subtle">
                  Instant confirmation. The hold drops if checkout is not finished in 45
                  minutes. Balance is due when you arrive.
                </p>
                <a
                  href={site.peerspaceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-xs text-ink-muted underline-offset-4 hover:underline"
                >
                  Prefer Peerspace
                  <ArrowUpRight className="size-3" />
                </a>
              </div>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}

function MonthGrid({
  month,
  days,
  selected,
  onSelect,
}: {
  month: string;
  days: DaySlots[];
  selected: string;
  onSelect: (date: string) => void;
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
    <div>
      <p className="font-display text-2xl">{monthLabel(first)}</p>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[0.65rem] tracking-[0.12em] text-ink-subtle uppercase">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
          <span key={label} className="py-1">
            {label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((iso, index) => {
          if (!iso) return <span key={`e-${index}`} />;
          const isOpen = open.has(iso);
          const isPast = iso < today;
          const isSelected = iso === selected;
          return (
            <button
              key={iso}
              type="button"
              disabled={!isOpen || isPast}
              onClick={() => onSelect(iso)}
              className={cn(
                "flex h-11 items-center justify-center text-sm tabular-nums",
                isSelected
                  ? "bg-ink text-paper"
                  : isOpen
                    ? "bg-paper-muted text-ink hover:bg-ink hover:text-paper"
                    : "text-ink-subtle",
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
