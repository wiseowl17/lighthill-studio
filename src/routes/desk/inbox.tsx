import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/desk/StatusBadge";
import { listInquiries, updateInquiryStatus } from "@/lib/studio/fns";
import { type InquiryStatus } from "@/lib/studio/catalog";
import { formatWhen } from "@/lib/studio/time";
import { cn } from "@/lib/utils";

const filters: Array<{ id: "open" | InquiryStatus | "all"; label: string }> = [
  { id: "open", label: "Open" },
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "booked", label: "Booked" },
  { id: "archived", label: "Archived" },
  { id: "all", label: "All" },
];

export const Route = createFileRoute("/desk/inbox")({
  component: InboxPage,
});

function InboxPage() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listInquiries>>>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("open");

  function reload() {
    void listInquiries()
      .then(setRows)
      .catch(() => setRows([]));
  }

  useEffect(() => {
    reload();
  }, []);

  const visible = useMemo(() => {
    return rows.filter((row) => {
      if (filter === "all") return true;
      if (filter === "open") return row.status === "new" || row.status === "contacted";
      return row.status === filter;
    });
  }, [rows, filter]);

  async function setStatus(id: string, status: InquiryStatus) {
    await updateInquiryStatus({ data: { id, status } });
    reload();
  }

  return (
    <div>
      <p className="text-[0.7rem] tracking-[0.2em] text-ink-muted uppercase">Desk</p>
      <h1 className="mt-2 font-display text-4xl">Inbox</h1>
      <p className="mt-3 max-w-xl text-sm text-ink-muted">
        Notes from the public contact form land here. Book the ones you want to take —
        in-house sessions stay by hand, never a public checkout.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "h-10 px-3 text-[0.68rem] tracking-[0.14em] uppercase",
              filter === item.id ? "bg-ink text-paper" : "border border-ink-border text-ink-muted",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-ink-muted">Nothing in this view.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {visible.map((inquiry) => (
            <li key={inquiry.id} className="border border-ink-border p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{inquiry.name}</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {inquiry.email}
                    {inquiry.phone ? ` · ${inquiry.phone}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={inquiry.kind} />
                  <StatusBadge value={inquiry.status} />
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                {inquiry.message}
              </p>
              <p className="mt-3 text-xs text-ink-subtle">{formatWhen(inquiry.createdAt)}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {inquiry.status !== "booked" && inquiry.status !== "archived" ? (
                  <Button size="sm" variant="invert" asChild>
                    <Link to="/desk/new" search={{ inquiry: inquiry.id }}>
                      Book this
                    </Link>
                  </Button>
                ) : null}
                {inquiry.status === "new" ? (
                  <Button
                    size="sm"
                    variant="paperOutline"
                    onClick={() => void setStatus(inquiry.id, "contacted")}
                  >
                    Mark contacted
                  </Button>
                ) : null}
                {inquiry.status === "booked" ? (
                  <Button size="sm" variant="paperOutline" asChild>
                    <Link to="/desk/bookings">Bookings</Link>
                  </Button>
                ) : null}
                {inquiry.status !== "archived" ? (
                  <Button
                    size="sm"
                    variant="paperOutline"
                    onClick={() => void setStatus(inquiry.id, "archived")}
                  >
                    Archive
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="paperOutline"
                    onClick={() => void setStatus(inquiry.id, "new")}
                  >
                    Restore
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
