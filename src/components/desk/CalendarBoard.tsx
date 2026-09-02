import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { kindLabel } from "@/lib/studio/catalog";
import { getSettings, listBookings, type BookingRow } from "@/lib/studio/fns";
import {
  categoryKey,
  defaultCategoryColors,
  floorCategories,
  swatchStyle,
  type ColorSwatchId,
} from "@/lib/studio/colors";
import {
  addDays,
  dateInTz,
  formatRange,
  startOfWeekMonday,
  timeInTz,
  todayInTz,
  zonedStart,
} from "@/lib/studio/time";

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
  const [colors, setColors] = useState<Record<string, ColorSwatchId>>(defaultCategoryColors);
  const [loading, setLoading] = useState(true);

  const weekStart = startOfWeekMonday(mode === "day" ? cursor : cursor);
  const rangeFrom = mode === "day" ? cursor : weekStart;
  const rangeTo = mode === "day" ? addDays(cursor, 1) : addDays(weekStart, 7);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const from = zonedStart(rangeFrom, "00:00").toISOString();
    const to = zonedStart(rangeTo, "00:00").toISOString();
    void Promise.all([
      listBookings({ data: { from, to } }),
      getSettings().catch(() => null),
    ])
      .then(([rows, settings]) => {
        if (!alive) return;
        setBookings(rows);
        if (settings) setColors(settings.categoryColors);
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
  const usedKeys = useMemo(() => {
    const keys = new Set(bookings.map((booking) => categoryKey(booking.kind, booking.sessionType)));
    return floorCategories.filter((category) => keys.has(category.id));
  }, [bookings]);

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
              colors={colors}
            />
          ))}
        </div>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-ink-muted">Loading the floor…</p>
      ) : null}

      {usedKeys.length > 0 ? (
        <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
          {usedKeys.map((category) => (
            <li key={category.id} className="flex items-center gap-2 text-xs text-ink-muted">
              <span
                className="size-2.5"
                style={swatchStyle(colors[category.id] ?? "ink")}
                aria-hidden
              />
              {category.label}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-3 text-xs text-ink-subtle">
        Change colors in{" "}
        <Link to="/desk/settings" className="underline underline-offset-4">
          Settings
        </Link>
        .
      </p>

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
                    className="flex items-start gap-3 py-4"
                  >
                    <span
                      className="mt-1 size-2.5 shrink-0"
                      style={swatchStyle(
                        colors[categoryKey(booking.kind, booking.sessionType)] ?? "ink",
                      )}
                      aria-hidden
                    />
                    <span>
                      <p className="text-sm font-medium">{booking.title}</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {formatRange(booking.startsAt, booking.endsAt)} · {kindLabel(booking.kind)}
                      </p>
                    </span>
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
  colors,
}: {
  hour: number;
  days: string[];
  bookings: BookingRow[];
  colors: Record<string, ColorSwatchId>;
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
              const swatch = colors[categoryKey(booking.kind, booking.sessionType)] ?? "ink";
              return (
                <Link
                  key={booking.id}
                  to="/desk/bookings/$id"
                  params={{ id: booking.id }}
                  className={cn(
                    "absolute inset-x-1 z-10 overflow-hidden px-1.5 py-1 text-[0.65rem] leading-tight",
                    booking.status === "cancelled" && "opacity-40",
                  )}
                  style={{
                    top: `${(start - hour) * 100}%`,
                    height: `${Math.max(booking.durationMinutes / 60, 0.5) * 100}%`,
                    ...swatchStyle(swatch),
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
