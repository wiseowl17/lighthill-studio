import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/desk/Field";
import { getSettings, saveSettings } from "@/lib/studio/fns";
import { signOut } from "@/lib/auth/client";
import { STUDIO_TZ } from "@/lib/studio/owner";
import {
  colorSwatches,
  defaultCategoryColors,
  floorCategories,
  swatchStyle,
  type ColorSwatchId,
} from "@/lib/studio/colors";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/desk/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [minRentalHours, setMinRentalHours] = useState(2);
  const [bufferMinutes, setBufferMinutes] = useState(0);
  const [colors, setColors] = useState<Record<string, ColorSwatchId>>(defaultCategoryColors);
  const [square, setSquare] = useState(false);
  const [gcal, setGcal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void getSettings().then((row) => {
      setMinRentalHours(row.minRentalHours);
      setBufferMinutes(row.bufferMinutes);
      setColors(row.categoryColors);
      setSquare(row.squareConnected);
      setGcal(row.googleCalendarConnected);
    });
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setSaved(false);
    try {
      await saveSettings({
        data: { minRentalHours, bufferMinutes, categoryColors: colors },
      });
      setSaved(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="text-[0.7rem] tracking-[0.2em] text-ink-muted uppercase">Desk</p>
      <h1 className="mt-2 font-display text-4xl">Settings</h1>
      <p className="mt-3 text-sm text-ink-muted">
        Floor rules live here. Payments and the public calendar wait until Square
        and Google Calendar accounts are in hand.
      </p>

      <form onSubmit={onSubmit} className="mt-10 space-y-6">
        <Field label="Studio timezone">
          <p className="flex h-12 items-center border border-ink-border px-3.5 text-sm">
            {STUDIO_TZ}
          </p>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Minimum rental hours" htmlFor="minHours">
            <Input
              id="minHours"
              type="number"
              min={1}
              max={12}
              value={minRentalHours}
              onChange={(e) => setMinRentalHours(Number(e.target.value))}
            />
          </Field>
          <Field label="Buffer between bookings (min)" htmlFor="buffer">
            <Input
              id="buffer"
              type="number"
              min={0}
              max={180}
              step={15}
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(Number(e.target.value))}
            />
          </Field>
        </div>

        <section className="border border-ink-border p-5">
          <h2 className="font-display text-2xl">Floor colors</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Each session type and rental gets a color on the calendar so the day
            reads at a glance.
          </p>
          <ul className="mt-6 space-y-5">
            {floorCategories.map((category) => (
              <li key={category.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="size-4 shrink-0"
                    style={swatchStyle(colors[category.id] ?? "ink")}
                    aria-hidden
                  />
                  <p className="text-sm font-medium">{category.label}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {colorSwatches.map((swatch) => {
                    const selected = (colors[category.id] ?? "ink") === swatch.id;
                    return (
                      <button
                        key={swatch.id}
                        type="button"
                        aria-label={`${category.label} ${swatch.label}`}
                        aria-pressed={selected}
                        onClick={() =>
                          setColors((current) => ({ ...current, [category.id]: swatch.id }))
                        }
                        className={cn(
                          "size-9 border border-ink/15",
                          selected && "outline outline-offset-2 outline-ink",
                        )}
                        style={swatchStyle(swatch.id)}
                      />
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="invert" disabled={pending}>
            {pending ? "Saving…" : "Save floor rules"}
          </Button>
          {saved ? <p className="text-sm text-ink-muted">Saved.</p> : null}
        </div>
      </form>

      <section className="mt-14 space-y-4">
        <h2 className="font-display text-3xl">Connections</h2>
        <ConnectRow
          title="Square"
          body={
            square
              ? "Connected. Invoices can take a card."
              : "Not connected. Keep marking invoices sent or paid by hand. We’ll hook this up once the studio Square account is ready — no public checkout until then."
          }
          connected={square}
        />
        <ConnectRow
          title="Google Calendar"
          body={
            gcal
              ? "Connected. The desk calendar is the source of truth; Google is the mirror."
              : "Not connected. The desk calendar is the source of truth. Google will mirror holds once we have access."
          }
          connected={gcal}
        />
      </section>

      <section className="mt-14">
        <h2 className="font-display text-3xl">How booking works</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-muted">
          <li>In-house shoots are booked here by you — never a public self-serve checkout.</li>
          <li>Studio rentals still go through Peerspace until we turn on in-house rental checkout.</li>
          <li>
            Public notes from the contact page appear in{" "}
            <Link to="/desk/inbox" className="underline underline-offset-4">
              Inbox
            </Link>
            .
          </li>
        </ul>
      </section>

      <div className="mt-14 border-t border-ink-border pt-8">
        <Button type="button" variant="paperOutline" onClick={() => void signOut("/login")}>
          Sign out
        </Button>
      </div>
    </div>
  );
}

function ConnectRow({
  title,
  body,
  connected,
}: {
  title: string;
  body: string;
  connected: boolean;
}) {
  return (
    <div className="border border-ink-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-medium">{title}</p>
        <span className="text-[0.62rem] tracking-[0.14em] text-ink-muted uppercase">
          {connected ? "Connected" : "Waiting"}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{body}</p>
      <Button type="button" variant="paperOutline" className="mt-4" disabled>
        Connect later
      </Button>
    </div>
  );
}
