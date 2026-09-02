import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarBoard } from "@/components/desk/CalendarBoard";
import { getDeskSummary, listUpcoming } from "@/lib/studio/fns";
import { formatRange } from "@/lib/studio/time";
import { kindLabel } from "@/lib/studio/catalog";

export const Route = createFileRoute("/desk/")({
  component: DeskHome,
});

function DeskHome() {
  const [summary, setSummary] = useState({
    todayCount: 0,
    unpaidInvoices: 0,
    newInquiries: 0,
  });
  const [upcoming, setUpcoming] = useState<Awaited<ReturnType<typeof listUpcoming>>>(
    [],
  );

  useEffect(() => {
    void getDeskSummary().then(setSummary).catch(() => undefined);
    void listUpcoming().then(setUpcoming).catch(() => setUpcoming([]));
  }, []);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat to="/desk" label="On the floor today" value={summary.todayCount} />
        <Stat to="/desk/invoices" label="Open invoices" value={summary.unpaidInvoices} />
        <Stat to="/desk/inbox" label="New inquiries" value={summary.newInquiries} />
      </div>
      <div className="mt-12">
        <CalendarBoard />
      </div>
      <section className="mt-14">
        <h2 className="font-display text-3xl">Coming up</h2>
        {upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">
            Nothing on the books. Add a shoot, a rental, or block the floor.
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-ink-border border-y border-ink-border">
            {upcoming.map((booking) => (
              <li key={booking.id}>
                <Link
                  to="/desk/bookings/$id"
                  params={{ id: booking.id }}
                  className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <span className="font-medium">{booking.title}</span>
                  <span className="text-sm text-ink-muted">
                    {formatRange(booking.startsAt, booking.endsAt)} · {kindLabel(booking.kind)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  to,
  label,
  value,
}: {
  to: "/desk" | "/desk/invoices" | "/desk/inbox";
  label: string;
  value: number;
}) {
  return (
    <Link to={to} className="border border-ink-border px-4 py-4">
      <p className="text-[0.65rem] tracking-[0.16em] text-ink-muted uppercase">{label}</p>
      <p className="mt-2 font-display text-4xl tabular-nums">{value}</p>
    </Link>
  );
}
