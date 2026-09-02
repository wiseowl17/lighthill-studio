import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BookingForm, defaultBookingValues } from "@/components/desk/BookingForm";
import { StatusBadge } from "@/components/desk/StatusBadge";
import { ConfirmDialog } from "@/components/desk/ConfirmDialog";
import {
  createInvoiceFromBooking,
  deleteBooking,
  getBooking,
} from "@/lib/studio/fns";
import { catalogAddons, kindLabel, money } from "@/lib/studio/catalog";
import { dateInTz, formatRange, timeInTz } from "@/lib/studio/time";

export const Route = createFileRoute("/desk/bookings/$id")({
  component: BookingDetailPage,
});

function BookingDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [booking, setBooking] = useState<Awaited<ReturnType<typeof getBooking>>>(
    null,
  );
  const [loaded, setLoaded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLoaded(false);
    void getBooking({ data: { id } })
      .then((row) => {
        setBooking(row);
      })
      .catch(() => setBooking(null))
      .finally(() => setLoaded(true));
  }, [id]);

  if (!loaded) {
    return <p className="text-ink-muted">Loading booking…</p>;
  }

  if (!booking) {
    return (
      <div>
        <h1 className="font-display text-4xl">Booking not found</h1>
        <Button className="mt-6" variant="paperOutline" asChild>
          <Link to="/desk/bookings">Back to bookings</Link>
        </Button>
      </div>
    );
  }

  const addons = catalogAddons.map((addon) => ({
    id: addon.id,
    qty: booking.addons.find((a) => a.id === addon.id)?.qty ?? 0,
  }));

  return (
    <div>
      <p className="text-[0.7rem] tracking-[0.2em] text-ink-muted uppercase">
        {kindLabel(booking.kind)}
      </p>
      <h1 className="mt-2 max-w-3xl font-display text-4xl">{booking.title}</h1>
      <p className="mt-3 text-ink-muted">{formatRange(booking.startsAt, booking.endsAt)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge value={booking.status} />
        <StatusBadge value={booking.paymentStatus} />
        <span className="flex h-7 items-center text-sm tabular-nums">
          {money(booking.totalCents)}
        </span>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button type="button" variant="invert" onClick={() => setEditing((v) => !v)}>
          {editing ? "Close editor" : "Edit"}
        </Button>
        <Button
          type="button"
          variant="paperOutline"
          onClick={() => {
            void createInvoiceFromBooking({ data: { bookingId: booking.id } })
              .then((res) =>
                navigate({ to: "/desk/invoices", search: { highlight: res.id } }),
              )
              .catch((err: Error) => setMessage(err.message));
          }}
        >
          Create invoice
        </Button>
        <Button
          type="button"
          variant="paperOutline"
          onClick={() => setConfirmOpen(true)}
        >
          Delete
        </Button>
        <Button variant="paperOutline" asChild>
          <Link to="/desk">Calendar</Link>
        </Button>
      </div>
      {message ? <p className="mt-4 text-sm">{message}</p> : null}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this booking?"
        body="Remove this booking from the calendar? This cannot be undone."
        pending={busy}
        onOpenChange={(next) => {
          if (!next && !busy) setConfirmOpen(false);
        }}
        onConfirm={() => {
          setBusy(true);
          void deleteBooking({ data: { id: booking.id } })
            .then(() => navigate({ to: "/desk/bookings" }))
            .catch((err: Error) => {
              setMessage(err.message);
              setBusy(false);
              setConfirmOpen(false);
            });
        }}
      />

      {editing ? (
        <div className="mt-10">
          <BookingForm
            initial={defaultBookingValues({
              id: booking.id,
              kind: booking.kind,
              sessionType: booking.sessionType,
              clientName: booking.clientName ?? "",
              clientEmail: booking.clientEmail ?? "",
              clientPhone: booking.clientPhone ?? "",
              clientId: booking.clientId,
              date: dateInTz(booking.startsAt),
              startTime: timeInTz(booking.startsAt),
              durationMinutes: booking.durationMinutes,
              guestCount: booking.guestCount,
              status: booking.status,
              paymentStatus: booking.paymentStatus,
              notes: booking.notes ?? "",
              addons,
            })}
          />
        </div>
      ) : null}
    </div>
  );
}
