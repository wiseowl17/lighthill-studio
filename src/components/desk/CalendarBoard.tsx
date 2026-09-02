import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { kindLabel } from "@/lib/studio/catalog";
import { listBookings, type BookingRow } from "@/lib/studio/fns";
import { listGoogleEvents, type GoogleFloorEvent } from "@/lib/studio/gcal-fns";
import { floorBlockClass, floorDotClass } from "@/components/desk/StatusBadge";
import {
  addDays,
  dateInTz,
  formatRange,
  startOfWeekMonday,
  todayInTz,
  zonedStart,
} from "@/lib/studio/time";

const GRID_START = 7;
const GRID_HOURS = 16;

type FloorBlock = {
  key: string;
  title: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  variant: "desk" | "google";
  kind: string;
  status: string;
  bookingId?: string;
  href?: string | null;
};

function hoursOnDay(startsAt: string, endsAt: string, day: string): { start: number; end: number } {
  const dayStart = zonedStart(day, "00:00").getTime();
  const dayEnd = zonedStart(addDays(day, 1), "00:00").getTime();
  const startMs = Math.max(new Date(startsAt).getTime(), dayStart);
  const endMs = Math.min(new Date(endsAt).getTime(), dayEnd);
  return {
    start: (startMs - dayStart) / 3_600_000,
    end: (endMs - dayStart) / 3_600_000,
  };
}

function overlapsDay(startsAt: string, endsAt: string, day: string): boolean {
  const dayStart = zonedStart(day, "00:00").getTime();
  const dayEnd = zonedStart(addDays(day, 1), "00:00").getTime();
  return new Date(startsAt).getTime() < dayEnd && new Date(endsAt).getTime() > dayStart;
}

export function CalendarBoard() {
  const today = todayInTz();
  const [cursor, setCursor] = useState(today);
  const [mode, setMode] = useState<"week" | "day">("week");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [google, setGoogle] = useState<GoogleFloorEvent[]>([]);
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
      listBookings({ data: { from, to } }).catch(() => [] as BookingRow[]),
      listGoogleEvents({ data: { from, to } }).catch(() => [] as GoogleFloorEvent[]),
    ])
      .then(([rows, events]) => {
        if (!alive) return;
        setBookings(rows);
        setGoogle(events);
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

  const blocks: FloorBlock[] = useMemo(() => {
    const desk: FloorBlock[] = bookings.map((booking) => ({
      key: booking.id,
      title: booking.title,
      startsAt: booking.startsAt,
      endsAt: booking.endsAt,
      allDay: false,
      variant: "desk",
      kind: booking.kind,
      status: booking.status,
      bookingId: booking.id,
    }));
    const imported: FloorBlock[] = google.map((event) => ({
      key: `g-${event.id}`,
      title: event.title,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      allDay: event.allDay,
      variant: "google",
      kind: "google",
      status: "confirmed",
      href: event.htmlLink,
    }));
    return [...desk, ...imported];
  }, [bookings, google]);

  const hourRows = Array.from({ length: GRID_HOURS }, (_, i) => i + GRID_START);
  const hasAllDay = blocks.some((block) => block.allDay);

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

          {hasAllDay ? (
            <>
              <div className="border-b border-ink-border py-2 pr-2 text-right text-[0.65rem] text-ink-subtle">
                All day
              </div>
              {days.map((day) => {
                const dayBlocks = blocks.filter(
                  (block) => block.allDay && overlapsDay(block.startsAt, block.endsAt, day),
                );
                return (
                  <div
                    key={`all-${day}`}
                    className="min-h-12 space-y-1 border-b border-l border-ink-border/80 px-1 py-1"
                  >
                    {dayBlocks.map((block) => (
                      <FloorLink
                        key={block.key}
                        block={block}
                        className={cn(
                          "block px-1.5 py-1 text-[0.65rem] leading-tight",
                          floorBlockClass(block.kind, block.status),
                        )}
                      />
                    ))}
                  </div>
                );
              })}
            </>
          ) : null}

          {hourRows.map((hour) => (
            <HourRow key={hour} hour={hour} days={days} blocks={blocks} />
          ))}
        </div>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-ink-muted">Loading the floor…</p>
      ) : null}

      <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
        <li className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="size-2.5 bg-ink" aria-hidden />
          Booked
        </li>
        <li className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="size-2.5 border border-ink bg-paper" aria-hidden />
          Hold
        </li>
        <li className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="size-2.5 bg-ink" aria-hidden />
          Blocked
        </li>
        <li className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="size-2.5 border border-dashed border-ink" aria-hidden />
          Google
        </li>
      </ul>

      <div className="mt-10 md:hidden">
        <p className="text-[0.68rem] tracking-[0.16em] text-ink-muted uppercase">
          This day
        </p>
        {blocks.filter((b) => overlapsDay(b.startsAt, b.endsAt, mode === "day" ? cursor : today))
          .length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">Nothing on this day.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-border border-y border-ink-border">
            {blocks
              .filter((block) => overlapsDay(block.startsAt, block.endsAt, mode === "day" ? cursor : today))
              .map((block) => (
                <li key={block.key}>
                  <FloorLink block={block} className="flex items-start gap-3 py-4">
                    <span
                      className={cn(
                        "mt-1 size-2.5 shrink-0",
                        floorDotClass(block.kind, block.status),
                      )}
                      aria-hidden
                    />
                    <span>
                      <p className="text-sm font-medium">{block.title}</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {block.allDay
                          ? "All day"
                          : formatRange(block.startsAt, block.endsAt)}
                        {block.variant === "google"
                          ? " · Google"
                          : ` · ${kindLabel(block.kind as "shoot" | "rental" | "hold" | "blocked")}`}
                      </p>
                    </span>
                  </FloorLink>
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
  blocks,
}: {
  hour: number;
  days: string[];
  blocks: FloorBlock[];
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
        const cellBlocks = blocks.filter((block) => {
          if (block.allDay) return false;
          if (!overlapsDay(block.startsAt, block.endsAt, day)) return false;
          const { start, end } = hoursOnDay(block.startsAt, block.endsAt, day);
          const visStart = Math.max(start, GRID_START);
          const visEnd = Math.min(end, GRID_START + GRID_HOURS);
          return visStart < hour + 1 && visEnd > hour;
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
            {cellBlocks.map((block) => {
              const { start, end } = hoursOnDay(block.startsAt, block.endsAt, day);
              const visStart = Math.max(start, GRID_START);
              const visEnd = Math.min(end, GRID_START + GRID_HOURS);
              if (Math.floor(visStart) !== hour) return null;
              return (
                <FloorLink
                  key={block.key}
                  block={block}
                  className={cn(
                    "absolute inset-x-1 z-10 overflow-hidden px-1.5 py-1 text-[0.65rem] leading-tight",
                    floorBlockClass(block.kind, block.status),
                  )}
                  style={{
                    top: `${(visStart - hour) * 100}%`,
                    height: `${Math.max(visEnd - visStart, 0.5) * 100}%`,
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </>
  );
}

function FloorLink({
  block,
  className,
  style,
  children,
}: {
  block: FloorBlock;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const label = children ?? block.title;
  if (block.bookingId) {
    return (
      <Link
        to="/desk/bookings/$id"
        params={{ id: block.bookingId }}
        className={className}
        style={style}
      >
        {label}
      </Link>
    );
  }
  if (block.href) {
    return (
      <a
        href={block.href}
        target="_blank"
        rel="noreferrer"
        className={className}
        style={style}
        title="Opens in Google Calendar"
      >
        {label}
      </a>
    );
  }
  return (
    <span className={className} style={style}>
      {label}
    </span>
  );
}
