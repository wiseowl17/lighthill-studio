import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarBoard } from "@/components/desk/CalendarBoard";
import { getDeskSummary, listUpcoming } from "@/lib/studio/fns";
import { listGoogleEvents } from "@/lib/studio/gcal-fns";
import { addDays, formatRange, todayInTz, zonedStart } from "@/lib/studio/time";
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
  const [googleUpcoming, setGoogleUpcoming] = useState<
    Array<{ id: string; title: string; startsAt: string; endsAt: string; htmlLink: string | null }>
  >([]);

  useEffect(() => {
    void getDeskSummary().then(setSummary).catch(() => undefined);
    void listUpcoming().then(setUpcoming).catch(() => setUpcoming([]));
    const from = new Date().toISOString();
    const to = zonedStart(addDays(todayInTz(), 14), "00:00").toISOString();
    void listGoogleEvents({ data: { from, to } })
      .then(setGoogleUpcoming)
      .catch(() => setGoogleUpcoming([]));
  }, []);

  const coming = useMemo(() => {
    const desk = upcoming.map((booking) => ({
      key: booking.id,
      title: booking.title,
      startsAt: booking.startsAt,
      endsAt: booking.endsAt,
      detail: kindLabel(booking.kind),
      href: null as string | null,
      external: false,
    }));
    const google = googleUpcoming.map((event) => ({
      key: `g-${event.id}`,
      title: event.title,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      detail: "Google",
      href: event.htmlLink,
      external: true,
    }));
    return [...desk, ...google]
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .slice(0, 12);
  }, [upcoming, googleUpcoming]);

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
        {coming.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">
            Nothing on the books. Add a shoot, a rental, or block the floor.
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-ink-border border-y border-ink-border">
            {coming.map((item) => (
              <li key={item.key}>
                {item.external ? (
                  item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between"
                    >
                      <span className="font-medium">{item.title}</span>
                      <span className="text-sm text-ink-muted">
                        {formatRange(item.startsAt, item.endsAt)} · {item.detail}
                      </span>
                    </a>
                  ) : (
                    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-sm text-ink-muted">
                        {formatRange(item.startsAt, item.endsAt)} · {item.detail}
                      </span>
                    </div>
                  )
                ) : (
                  <Link
                    to="/desk/bookings/$id"
                    params={{ id: item.key }}
                    className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between"
                  >
                    <span className="font-medium">{item.title}</span>
                    <span className="text-sm text-ink-muted">
                      {formatRange(item.startsAt, item.endsAt)} · {item.detail}
                    </span>
                  </Link>
                )}
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