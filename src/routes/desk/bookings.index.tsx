import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { listBookings, type BookingRow } from "@/lib/studio/fns";
import { kindLabel, money } from "@/lib/studio/catalog";
import { StatusBadge } from "@/components/desk/StatusBadge";
import { NativeSelect } from "@/components/desk/Field";
import { addDays, dateInTz, formatRange, todayInTz, zonedStart } from "@/lib/studio/time";

export const Route = createFileRoute("/desk/bookings/")({
  component: BookingsPage,
});

function BookingsPage() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("upcoming");

  useEffect(() => {
    const from = zonedStart(addDays(todayInTz(), -60), "00:00").toISOString();
    const to = zonedStart(addDays(todayInTz(), 180), "00:00").toISOString();
    void listBookings({ data: { from, to } })
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  const today = todayInTz();
  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (kind !== "all" && row.kind !== kind) return false;
      const day = dateInTz(row.endsAt);
      if (status === "upcoming") return row.status !== "cancelled" && day >= today;
      if (status === "past") return day < today;
      if (status === "cancelled") return row.status === "cancelled";
      return true;
    });
  }, [rows, kind, status, today]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.7rem] tracking-[0.2em] text-ink-muted uppercase">Desk</p>
          <h1 className="mt-2 font-display text-4xl">Bookings</h1>
        </div>
        <div className="flex gap-2">
          <NativeSelect value={kind} onChange={(e) => setKind(e.target.value)} className="w-40">
            <option value="all">All types</option>
            <option value="shoot">In-house</option>
            <option value="rental">Rental</option>
            <option value="hold">Hold</option>
            <option value="blocked">Blocked</option>
          </NativeSelect>
          <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="cancelled">Cancelled</option>
            <option value="all">All</option>
          </NativeSelect>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-ink-muted">No bookings in this view.</p>
      ) : (
        <ul className="mt-8 divide-y divide-ink-border border-y border-ink-border">
          {filtered.map((booking) => (
            <li key={booking.id}>
              <Link
                to="/desk/bookings/$id"
                params={{ id: booking.id }}
                className="grid gap-2 py-4 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div>
                  <p className="font-medium">{booking.title}</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {formatRange(booking.startsAt, booking.endsAt)} · {kindLabel(booking.kind)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={booking.status} />
                  <StatusBadge value={booking.paymentStatus} />
                  <span className="text-sm tabular-nums">{money(booking.totalCents)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
