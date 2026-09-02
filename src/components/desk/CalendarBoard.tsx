import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { kindLabel, type BookingKind } from "@/lib/studio/catalog";
import { listBookings, type BookingRow } from "@/lib/studio/fns";
import {
  addDays,
  dateInTz,
  formatRange,
  startOfWeekMonday,
  timeInTz,
  todayInTz,
  zonedStart,
} from "@/lib/studio/time";

const kindTone: Record<BookingKind, string> = {
  shoot: "bg-ink text-paper",
  rental: "border border-ink bg-paper text-ink",
  hold: "bg-paper-muted text-ink",
  blocked: "bg-ink/15 text-ink",
};

function hoursFor(booking: BookingRow): { start: number; end: number } {
  const [sh, sm] = timeInTz(booking.startsAt).split(":").map(Number);
  const [eh, em] = timeInTz(booking.endsAt).split(":").map(Number);
  return { start: sh + sm / 60, end: eh + em / 60 };
}

export function CalendarBoard() {
  const today = todayInTz();
  const [cursor, setCursor] = useState(today);
  const [mode, setMode] = useState<"week" | "day">("week");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const weekStart = startOfWeekMonday(mode === "day" ? cursor : cursor);
  const rangeFrom = mode === "day" ? cursor : weekStart;
  const rangeTo = mode === "day" ? addDays(cursor, 1) : addDays(weekStart, 7);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const from = zonedStart(rangeFrom, "00:00").toISOString();
    const to = zonedStart(rangeTo, "00:00").toISOString();
    void listBookings({ data: { from, to } })
      .then((rows) => {
        if (alive) setBookings(rows);
      })
      .catch(() => {
        if (alive) setBookings([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [rangeFrom, rangeTo]);

  const days = useMemo(() => {
    if (mode === "day") return [cursor];
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [mode, cursor, weekStart]);

  const hourRows = Array.from({ length: 16 }, (_, i) => i + 7);

  function shift(dir: number) {
    setCursor(addDays(cursor, mode === "day" ? dir : dir * 7));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex size-11 items-center justify-center border border-ink-border"
            onClick={() => shift(-1)}
            aria-label="Previous"
          >
            <ChevronLeft className="size-5" strokeWidth={1.25} />
          </button>
          <button
            type="button"
            className="flex size-11 items-center justify-center border border-ink-border"
            onClick={() => shift(1)}
            aria-label="Next"
          >
            <ChevronRight className="size-5" strokeWidth={1.25} />
          </button>
          <Button type="button" variant="paperOutline" size="sm" onClick={() => setCursor(today)}>
            Today
          </Button>
        </div>
        <div className="flex border border-ink-border">
          {(["week", "day"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={cn(
                "h-11 px-4 text-[0.7rem] tracking-[0.14em] uppercase",
                mode === value ? "bg-ink text-paper" : "text-ink-muted",
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 font-display text-3xl md:text-4xl">
        {mode === "day"
          ? new Intl.DateTimeFormat("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            }).format(new Date(`${cursor}T12:00:00`))
          : `Week of ${new Intl.DateTimeFormat("en-US", {
              month: "long",
              day: "numeric",
            }).format(new Date(`${weekStart}T12:00:00`))}`}
      </p>

      <div className="mt-6 overflow-x-auto">
        <div
          className="min-w-[720px]"
          style={{
            display: "grid",
            gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))`,
          }}
        >
          <div />
          {days.map((day) => {
            const isToday = day === today;
            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  setCursor(day);
                  setMode("day");
                }}
                className={cn(
                  "border-b border-ink-border px-2 py-3 text-left text-xs tracking-[0.12em] uppercase",
                  isToday ? "text-ink" : "text-ink-muted",
                )}
              >
                {new Intl.DateTimeFormat("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                }).format(new Date(`${day}T12:00:00`))}
              </button>
            );
          })}

          {hourRows.map((hour) => (
            <HourRow
              key={hour}
              hour={hour}
              days={days}
              bookings={bookings}
            />
          ))}
        </div>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-ink-muted">Loading the floor…</p>
      ) : null}

      <div className="mt-10 md:hidden">
        <p className="text-[0.68rem] tracking-[0.16em] text-ink-muted uppercase">
          This day
        </p>
        {bookings.filter((b) => dateInTz(b.startsAt) === (mode === "day" ? cursor : today))
          .length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">Nothing on this day.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-border border-y border-ink-border">
            {bookings
              .filter((b) => dateInTz(b.startsAt) === (mode === "day" ? cursor : today))
              .map((booking) => (
                <li key={booking.id}>
                  <Link
                    to="/desk/bookings/$id"
                    params={{ id: booking.id }}
                    className="block py-4"
                  >
                    <p className="text-sm font-medium">{booking.title}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {formatRange(booking.startsAt, booking.endsAt)} · {kindLabel(booking.kind)}
                    </p>
                  </Link>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function HourRow({
  hour,
  days,
  bookings,
}: {
  hour: number;
  days: string[];
  bookings: BookingRow[];
}) {
  const label = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
  }).format(new Date(2020, 0, 1, hour));

  return (
    <>
      <div className="border-b border-ink-border py-2 pr-2 text-right text-[0.65rem] text-ink-subtle tabular-nums">
        {label}
      </div>
      {days.map((day) => {
        const cellBookings = bookings.filter((booking) => {
          if (dateInTz(booking.startsAt) !== day) return false;
          const { start, end } = hoursFor(booking);
          return start < hour + 1 && end > hour;
        });
        return (
          <div
            key={`${day}-${hour}`}
            className="relative min-h-12 border-b border-l border-ink-border/80 hover:bg-paper-muted/70"
          >
            <Link
              to="/desk/new"
              search={{ date: day, time: `${hour.toString().padStart(2, "0")}:00` }}
              className="absolute inset-0"
              aria-label={`New booking ${day} ${hour}:00`}
            />
            {cellBookings.map((booking) => {
              const { start } = hoursFor(booking);
              if (Math.floor(start) !== hour) return null;
              return (
                <Link
                  key={booking.id}
                  to="/desk/bookings/$id"
                  params={{ id: booking.id }}
                  className={cn(
                    "absolute inset-x-1 z-10 overflow-hidden px-1.5 py-1 text-[0.65rem] leading-tight",
                    kindTone[booking.kind],
                    booking.status === "cancelled" && "opacity-40",
                  )}
                  style={{
                    top: `${(start - hour) * 100}%`,
                    height: `${Math.max(booking.durationMinutes / 60, 0.5) * 100}%`,
                  }}
                >
                  {booking.title}
                </Link>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
