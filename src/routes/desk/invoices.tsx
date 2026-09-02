import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/desk/StatusBadge";
import { ConfirmDialog } from "@/components/desk/ConfirmDialog";
import { deleteInvoice, listInvoices, updateInvoiceStatus } from "@/lib/studio/fns";
import { money, type InvoiceStatus } from "@/lib/studio/catalog";
import { formatWhen } from "@/lib/studio/time";

type InvoiceSearch = { highlight?: string };

export const Route = createFileRoute("/desk/invoices")({
  validateSearch: (s: Record<string, unknown>): InvoiceSearch => ({
    highlight: typeof s.highlight === "string" ? s.highlight : undefined,
  }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const { highlight } = Route.useSearch();
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listInvoices>>>([]);
  const [pending, setPending] = useState<{ id: string; name: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function reload() {
    void listInvoices().then(setRows).catch(() => setRows([]));
  }

  useEffect(() => {
    reload();
  }, []);

  async function setStatus(id: string, status: InvoiceStatus) {
    await updateInvoiceStatus({ data: { id, status } });
    reload();
  }

  async function confirmDelete() {
    if (!pending) return;
    setBusy(true);
    try {
      await deleteInvoice({ data: { id: pending.id } });
      setPending(null);
      reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-[0.7rem] tracking-[0.2em] text-ink-muted uppercase">Desk</p>
      <h1 className="mt-2 font-display text-4xl">Invoices</h1>
      <p className="mt-3 max-w-xl text-sm text-ink-muted">
        Drafts live here until Square is connected. Mark them sent or paid by hand for
        now — no marketplace cut.
      </p>

      {rows.length === 0 ? (
        <p className="mt-10 text-ink-muted">
          No invoices yet. Open a booking and choose Create invoice.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {rows.map((invoice) => (
            <li
              key={invoice.id}
              className={`border border-ink-border p-5 ${highlight === invoice.id ? "bg-paper-muted/60" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{invoice.clientName ?? "No client"}</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {formatWhen(invoice.createdAt)} · {invoice.notes}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl tabular-nums">
                    {money(invoice.amountCents)}
                  </p>
                  <div className="mt-2">
                    <StatusBadge value={invoice.status} />
                  </div>
                </div>
              </div>
              <ul className="mt-4 space-y-1 text-sm text-ink-muted">
                {invoice.lineItems.map((line, i) => (
                  <li key={`${invoice.id}-${i}`} className="flex justify-between gap-4">
                    <span>{line.label}</span>
                    <span className="tabular-nums">{money(line.cents)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                {invoice.status === "draft" ? (
                  <Button
                    size="sm"
                    variant="invert"
                    onClick={() => void setStatus(invoice.id, "sent")}
                  >
                    Mark sent
                  </Button>
                ) : null}
                {invoice.status === "sent" || invoice.status === "draft" ? (
                  <Button
                    size="sm"
                    variant="paperOutline"
                    onClick={() => void setStatus(invoice.id, "paid")}
                  >
                    Mark paid
                  </Button>
                ) : null}
                {invoice.status !== "void" && invoice.status !== "paid" ? (
                  <Button
                    size="sm"
                    variant="paperOutline"
                    onClick={() => void setStatus(invoice.id, "void")}
                  >
                    Void
                  </Button>
                ) : null}
                {invoice.bookingId ? (
                  <Button size="sm" variant="paperOutline" asChild>
                    <Link
                      to="/desk/bookings/$id"
                      params={{ id: invoice.bookingId }}
                    >
                      Booking
                    </Link>
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="paperOutline"
                  onClick={() =>
                    setPending({
                      id: invoice.id,
                      name: invoice.clientName ?? "this invoice",
                    })
                  }
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(pending)}
        title="Delete this invoice?"
        body={
          pending
            ? `Remove the invoice for ${pending.name}? This does not change the booking on the calendar.`
            : ""
        }
        pending={busy}
        onOpenChange={(next) => {
          if (!next && !busy) setPending(null);
        }}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
