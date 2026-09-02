import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BookingForm,
  defaultBookingValues,
  type BookingFormValues,
} from "@/components/desk/BookingForm";
import { catalogAddons } from "@/lib/studio/catalog";
import { getInquiry } from "@/lib/studio/fns";

type NewSearch = {
  date?: string;
  time?: string;
  inquiry?: string;
};

export const Route = createFileRoute("/desk/new")({
  validateSearch: (s: Record<string, unknown>): NewSearch => ({
    date: typeof s.date === "string" ? s.date : undefined,
    time: typeof s.time === "string" ? s.time : undefined,
    inquiry: typeof s.inquiry === "string" ? s.inquiry : undefined,
  }),
  component: NewBookingPage,
});

function NewBookingPage() {
  const search = Route.useSearch();
  const [initial, setInitial] = useState<BookingFormValues | null>(null);

  useEffect(() => {
    const base = defaultBookingValues({
      ...(search.date ? { date: search.date } : {}),
      ...(search.time ? { startTime: search.time } : {}),
    });
    if (!search.inquiry) {
      setInitial(base);
      return;
    }
    void getInquiry({ data: { id: search.inquiry } }).then((inquiry) => {
      if (!inquiry) {
        setInitial(base);
        return;
      }
      setInitial(
        defaultBookingValues({
          ...base,
          kind: inquiry.kind,
          clientName: inquiry.name,
          clientEmail: inquiry.email,
          clientPhone: inquiry.phone ?? "",
          notes: inquiry.message,
          inquiryId: inquiry.id,
          addons: catalogAddons.map((a) => ({ id: a.id, qty: 0 })),
          durationMinutes: inquiry.kind === "rental" ? 120 : 90,
        }),
      );
    });
  }, [search.date, search.time, search.inquiry]);

  if (!initial) {
    return <p className="text-ink-muted">Preparing the booking…</p>;
  }

  return (
    <div>
      <p className="text-[0.7rem] tracking-[0.2em] text-ink-muted uppercase">Desk</p>
      <h1 className="mt-2 font-display text-4xl">New booking</h1>
      <div className="mt-8">
        <BookingForm initial={initial} submitLabel="Add to calendar" />
      </div>
    </div>
  );
}
