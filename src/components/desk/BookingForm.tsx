import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field, NativeSelect } from "@/components/desk/Field";
import {
  bookingKinds,
  bookingStatuses,
  catalogAddons,
  kindLabel,
  money,
  paymentStatuses,
  quoteBooking,
  rentalMinimumHours,
  shootPackages,
  type AddonSelection,
  type BookingKind,
  type BookingStatus,
  type PaymentStatus,
} from "@/lib/studio/catalog";
import { saveBooking } from "@/lib/studio/fns";
import { todayInTz } from "@/lib/studio/time";

export type BookingFormValues = {
  id?: string;
  kind: BookingKind;
  sessionType?: string | null;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientId?: string | null;
  date: string;
  startTime: string;
  durationMinutes: number;
  guestCount?: number | null;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  addons: AddonSelection[];
  inquiryId?: string;
};

const emptyAddons = (): AddonSelection[] =>
  catalogAddons.map((addon) => ({ id: addon.id, qty: 0 }));

export function defaultBookingValues(
  overrides: Partial<BookingFormValues> = {},
): BookingFormValues {
  const next: BookingFormValues = {
    kind: "shoot",
    sessionType: "maternity",
    date: todayInTz(),
    startTime: "10:00",
    durationMinutes: 90,
    status: "confirmed",
    paymentStatus: "unpaid",
    addons: emptyAddons(),
    ...overrides,
  };
  if (!next.date) next.date = todayInTz();
  if (!next.startTime) next.startTime = "10:00";
  if (!Number.isFinite(next.durationMinutes) || next.durationMinutes <= 0) {
    next.durationMinutes = 90;
  }
  if (!next.addons?.length) next.addons = emptyAddons();
  return next;
}

export function BookingForm({
  initial,
  submitLabel = "Save booking",
}: {
  initial: BookingFormValues;
  submitLabel?: string;
}) {
  const navigate = useNavigate();
  const [values, setValues] = useState<BookingFormValues>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const quote = useMemo(
    () =>
      quoteBooking({
        kind: values.kind,
        sessionType: values.sessionType,
        durationMinutes: values.durationMinutes,
        addons: values.addons,
      }),
    [values.kind, values.sessionType, values.durationMinutes, values.addons],
  );

  function patch(partial: Partial<BookingFormValues>) {
    setValues((prev) => ({ ...prev, ...partial }));
  }

  function setKind(kind: BookingKind) {
    const pack = shootPackages.find((p) => p.id === values.sessionType) ?? shootPackages[0];
    patch({
      kind,
      durationMinutes:
        kind === "rental"
          ? Math.max(values.durationMinutes, rentalMinimumHours * 60)
          : kind === "shoot"
            ? pack.durationMinutes
            : values.durationMinutes,
      sessionType: kind === "shoot" ? pack.id : null,
    });
  }

  async function onSubmit() {
    setError(null);
    setPending(true);
    try {
      const result = await saveBooking({
        data: {
          id: values.id,
          kind: values.kind,
          sessionType: values.sessionType ?? null,
          clientName: values.clientName,
          clientEmail: values.clientEmail,
          clientPhone: values.clientPhone,
          clientId: values.clientId,
          date: values.date,
          startTime: values.startTime,
          durationMinutes: values.durationMinutes,
          guestCount: values.guestCount ?? null,
          status: values.status,
          paymentStatus: values.paymentStatus,
          notes: values.notes,
          addons: values.addons,
          inquiryId: values.inquiryId,
        },
      });
      await navigate({ to: "/desk/bookings/$id", params: { id: result.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
      setPending(false);
    }
  }

  const hours = values.durationMinutes / 60;
  const showClient = values.kind !== "blocked";
  const showAddons = values.kind === "rental" || values.kind === "shoot";

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit();
        }}
      >
        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="Type" htmlFor="kind">
            <NativeSelect
              id="kind"
              value={values.kind}
              onChange={(e) => setKind(e.target.value as BookingKind)}
            >
              {bookingKinds.map((kind) => (
                <option key={kind} value={kind}>
                  {kindLabel(kind)}
                </option>
              ))}
            </NativeSelect>
          </Field>
          {values.kind === "shoot" ? (
            <Field label="Session" htmlFor="sessionType">
              <NativeSelect
                id="sessionType"
                value={values.sessionType ?? "maternity"}
                onChange={(e) => {
                  const pack = shootPackages.find((p) => p.id === e.target.value);
                  patch({
                    sessionType: e.target.value,
                    durationMinutes: pack?.durationMinutes ?? values.durationMinutes,
                  });
                }}
              >
                {shootPackages.map((pack) => (
                  <option key={pack.id} value={pack.id}>
                    {pack.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          ) : (
            <div className="hidden sm:block" />
          )}
        </section>

        {showClient ? (
          <section className="grid gap-4 sm:grid-cols-2">
            <Field label="Client name" htmlFor="clientName" className="sm:col-span-2">
              <Input
                id="clientName"
                value={values.clientName ?? ""}
                onChange={(e) => patch({ clientName: e.target.value })}
                required={values.kind !== "hold"}
              />
            </Field>
            <Field label="Email" htmlFor="clientEmail">
              <Input
                id="clientEmail"
                type="email"
                value={values.clientEmail ?? ""}
                onChange={(e) => patch({ clientEmail: e.target.value })}
              />
            </Field>
            <Field label="Phone" htmlFor="clientPhone">
              <Input
                id="clientPhone"
                value={values.clientPhone ?? ""}
                onChange={(e) => patch({ clientPhone: e.target.value })}
              />
            </Field>
          </section>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-3">
          <Field label="Date" htmlFor="date">
            <Input
              id="date"
              type="date"
              value={values.date}
              onChange={(e) => patch({ date: e.target.value })}
              required
            />
          </Field>
          <Field label="Start" htmlFor="startTime">
            <Input
              id="startTime"
              type="time"
              value={values.startTime}
              onChange={(e) => patch({ startTime: e.target.value })}
              required
            />
          </Field>
          <Field label="Hours" htmlFor="hours">
            <Input
              id="hours"
              type="number"
              min={values.kind === "rental" ? rentalMinimumHours : 0.5}
              step={0.5}
              value={hours}
              onChange={(e) =>
                patch({ durationMinutes: Math.round(Number(e.target.value) * 60) })
              }
              required
            />
            {values.kind === "rental" ? (
              <p className="text-xs text-ink-muted">
                {rentalMinimumHours} hour minimum.
              </p>
            ) : null}
          </Field>
        </section>

        {values.kind === "rental" || values.kind === "shoot" ? (
          <Field label="Guests" htmlFor="guests">
            <Input
              id="guests"
              type="number"
              min={1}
              max={20}
              value={values.guestCount ?? ""}
              onChange={(e) =>
                patch({
                  guestCount: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </Field>
        ) : null}

        {showAddons ? (
          <section>
            <p className="mb-3 text-[0.68rem] font-medium tracking-[0.16em] text-ink-muted uppercase">
              Add-ons
            </p>
            <div className="space-y-3">
              {catalogAddons.map((addon) => {
                const current = values.addons.find((a) => a.id === addon.id)?.qty ?? 0;
                return (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between gap-4 border border-ink-border px-4 py-3"
                  >
                    <div>
                      <p className="text-sm text-ink">{addon.name}</p>
                      <p className="text-xs text-ink-muted">
                        {money(addon.unitCents)} / {addon.unit}
                      </p>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      className="h-11 w-20"
                      value={current}
                      onChange={(e) => {
                        const qty = Math.max(0, Number(e.target.value) || 0);
                        patch({
                          addons: values.addons.map((a) =>
                            a.id === addon.id ? { ...a, qty } : a,
                          ),
                        });
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="Status" htmlFor="status">
            <NativeSelect
              id="status"
              value={values.status}
              onChange={(e) => patch({ status: e.target.value as BookingStatus })}
            >
              {bookingStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Payment" htmlFor="payment">
            <NativeSelect
              id="payment"
              value={values.paymentStatus}
              onChange={(e) =>
                patch({ paymentStatus: e.target.value as PaymentStatus })
              }
            >
              {paymentStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </section>

        <Field label="Notes" htmlFor="notes">
          <Textarea
            id="notes"
            value={values.notes ?? ""}
            onChange={(e) => patch({ notes: e.target.value })}
            className="min-h-28"
          />
        </Field>

        {error ? <p className="text-sm text-ink">{error}</p> : null}

        <Button type="submit" variant="invert" size="lg" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </form>

      <aside className="h-fit border border-ink-border bg-paper-muted/50 p-5">
        <p className="text-[0.68rem] tracking-[0.16em] text-ink-muted uppercase">
          Quote
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {quote.lines.length === 0 ? (
            <li className="text-ink-muted">No charge</li>
          ) : (
            quote.lines.map((line, i) => (
              <li key={`${line.label}-${i}`} className="flex justify-between gap-3">
                <span className="text-ink-muted">{line.label}</span>
                <span className="tabular-nums">{money(line.cents)}</span>
              </li>
            ))
          )}
        </ul>
        <p className="mt-5 flex justify-between border-t border-ink-border pt-4 font-medium">
          <span>Total</span>
          <span className="tabular-nums">{money(quote.totalCents)}</span>
        </p>
      </aside>
    </div>
  );
}
