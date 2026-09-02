import { TZDate } from "@date-fns/tz";
import { STUDIO_TZ } from "./owner";

export function zonedStart(date: string, time: string, tz = STUDIO_TZ): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new TZDate(year, month - 1, day, hour, minute, 0, tz);
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function dateInTz(iso: string | Date, tz = STUDIO_TZ): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${d}`;
}

export function timeInTz(iso: string | Date, tz = STUDIO_TZ): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const h = parts.find((p) => p.type === "hour")?.value ?? "00";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${h}:${m}`;
}

export function formatWhen(iso: string | Date, tz = STUDIO_TZ): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatRange(startIso: string, endIso: string, tz = STUDIO_TZ): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(start);
  const t = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
  });
  return `${day} · ${t.format(start)} – ${t.format(end)}`;
}

export function weekdayLabels(start: Date, tz = STUDIO_TZ): string[] {
  const out: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(start.getTime() + i * 86400000);
    out.push(
      new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(d),
    );
  }
  return out;
}

export function startOfWeekMonday(isoDate: string, tz = STUDIO_TZ): string {
  const start = zonedStart(isoDate, "00:00", tz);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
  }).format(start);
  const map: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  const offset = map[weekday] ?? 0;
  const monday = new Date(start.getTime() - offset * 86400000);
  return dateInTz(monday, tz);
}

export function addDays(isoDate: string, days: number, tz = STUDIO_TZ): string {
  const d = zonedStart(isoDate, "12:00", tz);
  return dateInTz(new Date(d.getTime() + days * 86400000), tz);
}

export function todayInTz(tz = STUDIO_TZ): string {
  return dateInTz(new Date(), tz);
}
