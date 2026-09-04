import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/desk/Field";
import {
  disconnectGoogleCalendar,
  getSettings,
  saveGoogleCredentials,
  saveSettings,
} from "@/lib/studio/fns";
import { listGoogleCalendars, saveGoogleCalendar } from "@/lib/studio/gcal-fns";
import {
  disconnectStripe,
  getStripeSettings,
  saveStripeCredentials,
} from "@/lib/studio/stripe-fns";
import { signOut } from "@/lib/auth/client";
import { STUDIO_TZ } from "@/lib/studio/owner";

const REDIRECT_URIS = [
  "https://lighthillstudio.com/api/google/callback",
  "https://www.lighthillstudio.com/api/google/callback",
];

const STRIPE_WEBHOOK = "https://lighthillstudio.com/api/stripe/webhook";

export const Route = createFileRoute("/desk/settings")({
  validateSearch: (search: Record<string, unknown>): { google?: string } => {
    if (typeof search.google === "string" && search.google.length > 0) {
      return { google: search.google };
    }
    return {};
  },
  component: SettingsPage,
});

function googleBanner(code: string | undefined): string | null {
  switch (code) {
    case "connected":
      return "Google Calendar is connected. Desk bookings write there; existing events show on the floor.";
    case "denied":
      return "Google access was declined. You can try Connect again.";
    case "need-app":
      return "Save the Google Cloud client ID and secret below, then connect.";
    case "error":
      return "Google could not finish connecting. Check the redirect URI and try again.";
    default:
      return null;
  }
}

function SettingsPage() {
  const { google } = Route.useSearch();
  const navigate = useNavigate({ from: "/desk/settings" });
  const [minRentalHours, setMinRentalHours] = useState(2);
  const [bufferMinutes, setBufferMinutes] = useState(0);
  const [gcal, setGcal] = useState(false);
  const [gcalEmail, setGcalEmail] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleEnv, setGoogleEnv] = useState(false);
  const [clientHint, setClientHint] = useState<string | null>(null);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [saved, setSaved] = useState(false);
  const [credSaved, setCredSaved] = useState(false);
  const [credError, setCredError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmOff, setConfirmOff] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<Array<{ id: string; name: string; primary: boolean }>>([]);
  const [calendarId, setCalendarId] = useState("");
  const [calendarSaved, setCalendarSaved] = useState<string | null>(null);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [stripeReady, setStripeReady] = useState(false);
  const [stripeHint, setStripeHint] = useState<string | null>(null);
  const [stripeTest, setStripeTest] = useState<boolean | null>(null);
  const [stripeHasWebhook, setStripeHasWebhook] = useState(false);
  const [stripeEnv, setStripeEnv] = useState(false);
  const [pk, setPk] = useState("");
  const [sk, setSk] = useState("");
  const [whsec, setWhsec] = useState("");
  const [stripeSaved, setStripeSaved] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [confirmStripeOff, setConfirmStripeOff] = useState(false);

  function hydrate() {
    void getSettings().then((row) => {
      setMinRentalHours(row.minRentalHours);
      setBufferMinutes(row.bufferMinutes);
      setGcal(row.googleCalendarConnected);
      setGcalEmail(row.googleAccountEmail);
      setGoogleReady(row.googleReady);
      setGoogleEnv(row.googleEnvConfigured);
      setClientHint(row.googleClientIdHint);
      if (row.googleCalendarId) setCalendarId(row.googleCalendarId);
      if (row.googleCalendarConnected) {
        void listGoogleCalendars().then((items) => {
          setCalendars(items);
          setCalendarId((current) => {
            if (row.googleCalendarId && items.some((item) => item.id === row.googleCalendarId)) {
              return row.googleCalendarId;
            }
            if (current && items.some((item) => item.id === current)) return current;
            const studio = items.find((item) => item.name.toLowerCase() === "lighthill studio");
            return studio?.id || items[0]?.id || current;
          });
        });
      } else {
        setCalendars([]);
      }
    });
    void getStripeSettings()
      .then((stripe) => {
        setStripeReady(stripe.ready);
        setStripeHint(stripe.publishableHint);
        setStripeTest(stripe.testMode);
        setStripeHasWebhook(stripe.hasWebhook);
        setStripeEnv(stripe.envConfigured);
      })
      .catch(() => undefined);
  }

  useEffect(() => {
    hydrate();
  }, []);

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setSaved(false);
    try {
      await saveSettings({
        data: { minRentalHours, bufferMinutes },
      });
      setSaved(true);
    } finally {
      setPending(false);
    }
  }

  async function onSaveGoogleApp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setCredSaved(false);
    setCredError(null);
    try {
      await saveGoogleCredentials({ data: { clientId, clientSecret } });
      setClientSecret("");
      setCredSaved(true);
      hydrate();
    } catch {
      setCredError("Could not save. Stay signed in as the studio owner and try again.");
    } finally {
      setPending(false);
    }
  }

  async function onDisconnect() {
    if (!confirmOff) {
      setConfirmOff(true);
      return;
    }
    setPending(true);
    try {
      await disconnectGoogleCalendar();
      setConfirmOff(false);
      hydrate();
      void navigate({ search: (prev) => ({ ...prev, google: undefined }) });
    } finally {
      setPending(false);
    }
  }

  async function onSaveCalendar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!calendarId) return;
    setPending(true);
    setCalendarSaved(null);
    setCalendarError(null);
    try {
      const result = await saveGoogleCalendar({ data: { calendarId } });
      setCalendarSaved(result.name);
      hydrate();
    } catch {
      setCalendarError("Could not switch calendars. Try again, or reconnect Google.");
    } finally {
      setPending(false);
    }
  }

  async function onSaveStripe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStripeSaved(false);
    setStripeError(null);
    try {
      await saveStripeCredentials({
        data: {
          publishableKey: pk,
          secretKey: sk,
          webhookSecret: whsec || undefined,
        },
      });
      setSk("");
      setWhsec("");
      setStripeSaved(true);
      setConfirmStripeOff(false);
      hydrate();
    } catch (err) {
      setStripeError(err instanceof Error ? err.message : "Could not save Stripe keys.");
    } finally {
      setPending(false);
    }
  }

  async function onDisconnectStripe() {
    if (!confirmStripeOff) {
      setConfirmStripeOff(true);
      return;
    }
    setPending(true);
    try {
      await disconnectStripe();
      setConfirmStripeOff(false);
      setPk("");
      hydrate();
    } finally {
      setPending(false);
    }
  }

  const selectedCalendar = calendars.find((item) => item.id === calendarId);
  const notice = googleBanner(google);
  const stripeLabel = !stripeReady
    ? "Needs keys"
    : stripeTest
      ? "Test mode"
      : "Live";

  return (
    <div className="max-w-2xl">
      <p className="text-[0.7rem] tracking-[0.2em] text-ink-muted uppercase">Desk</p>
      <h1 className="mt-2 font-display text-4xl">Settings</h1>
      <p className="mt-3 text-sm text-ink-muted">
        Floor rules live here. The desk and Google Calendar stay in step — bookings
        you add here write to the chosen calendar, and events already on that
        calendar show up on the floor.
      </p>

      {notice ? (
        <p className="mt-6 border border-ink-border bg-paper-muted px-4 py-3 text-sm text-ink">
          {notice}
        </p>
      ) : null}

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

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="invert" disabled={pending}>
            {pending ? "Saving…" : "Save floor rules"}
          </Button>
          {saved ? <p className="text-sm text-ink-muted">Saved.</p> : null}
        </div>
      </form>

      <section className="mt-14 space-y-4">
        <h2 className="font-display text-3xl">Connections</h2>

        <div className="border border-ink-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-medium">Google Calendar</p>
            <span className="text-[0.62rem] tracking-[0.14em] text-ink-muted uppercase">
              {gcal ? "Connected" : googleReady ? "Ready to connect" : "Needs app"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            {gcal
              ? `Connected${gcalEmail ? ` as ${gcalEmail}` : ""}. Bookings, holds, and blocks write to the calendar you pick. Events already on that calendar appear on the desk as busy time — they do not become invoices.`
              : "Connect the studio Gmail. Then choose which calendar to sync — usually Lighthill Studio."}
          </p>

          {gcal ? (
            <form onSubmit={onSaveCalendar} className="mt-5 space-y-3">
              <Field label="Sync this calendar" htmlFor="gcalTarget">
                <select
                  id="gcalTarget"
                  value={calendarId}
                  onChange={(e) => {
                    setCalendarId(e.target.value);
                    setCalendarSaved(null);
                  }}
                  className="h-12 w-full border border-ink-border bg-paper px-3.5 text-sm text-ink outline-none focus-visible:border-ink/40 focus-visible:ring-2 focus-visible:ring-ink/15"
                >
                  {calendars.length === 0 ? (
                    <option value={calendarId || ""}>Loading calendars…</option>
                  ) : (
                    calendars.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                        {item.primary ? " (primary)" : ""}
                      </option>
                    ))
                  )}
                </select>
              </Field>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" variant="invert" disabled={pending || !calendarId}>
                  {pending ? "Saving…" : "Use this calendar"}
                </Button>
                {calendarSaved ? (
                  <p className="text-sm text-ink-muted">Now writing to {calendarSaved}.</p>
                ) : selectedCalendar ? (
                  <p className="text-sm text-ink-muted">Currently {selectedCalendar.name}.</p>
                ) : null}
                {calendarError ? <p className="text-sm text-ink-muted">{calendarError}</p> : null}
              </div>
            </form>
          ) : null}

          {!googleEnv ? (
            <form onSubmit={onSaveGoogleApp} className="mt-5 space-y-4">
              <ol className="list-decimal space-y-2 pl-5 text-xs leading-relaxed text-ink-subtle">
                <li>
                  Open{" "}
                  <a
                    href="https://console.cloud.google.com/apis/library/calendar-json.googleapis.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-ink underline underline-offset-4"
                  >
                    Google Cloud
                  </a>{" "}
                  signed in as studiolighthill@gmail.com. Enable the Calendar API.
                </li>
                <li>
                  APIs & Services → OAuth consent screen: External. Add{" "}
                  <span className="text-ink">studiolighthill@gmail.com</span> as a test user.
                </li>
                <li>
                  Create credentials → OAuth client ID → application type{" "}
                  <strong>Web application</strong>. Add both redirect URIs:
                </li>
              </ol>
              <ul className="space-y-2">
                {REDIRECT_URIS.map((uri) => (
                  <li key={uri} className="flex flex-wrap items-center gap-2">
                    <code className="grow border border-ink-border bg-paper-muted px-3 py-2 text-[0.7rem] text-ink break-all">
                      {uri}
                    </code>
                    <Button type="button" variant="paperOutline" size="sm" onClick={() => void copyText(uri)}>
                      {copied === uri ? "Copied" : "Copy"}
                    </Button>
                  </li>
                ))}
              </ul>
              <p className="text-xs leading-relaxed text-ink-subtle">
                Paste the client ID and secret here. Tokens stay encrypted in the studio
                database — not in a Grok plugin.
              </p>
              <Field label="Google client ID" htmlFor="gClientId">
                <Input
                  id="gClientId"
                  autoComplete="off"
                  value={clientId}
                  placeholder={clientHint && clientHint !== "env" ? clientHint : "….apps.googleusercontent.com"}
                  onChange={(e) => setClientId(e.target.value)}
                />
              </Field>
              <Field label="Google client secret" htmlFor="gClientSecret">
                <Input
                  id="gClientSecret"
                  type="password"
                  autoComplete="off"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                />
              </Field>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" variant="paperOutline" disabled={pending || !clientId || !clientSecret}>
                  Save Google app
                </Button>
                {credSaved ? <p className="text-sm text-ink-muted">Saved. Connect below.</p> : null}
                {credError ? <p className="text-sm text-ink-muted">{credError}</p> : null}
              </div>
            </form>
          ) : (
            <p className="mt-4 text-xs text-ink-subtle">
              Google app credentials are already on the server. Connect the studio Gmail below.
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            {gcal ? (
              <Button type="button" variant="paperOutline" disabled={pending} onClick={() => void onDisconnect()}>
                {confirmOff ? "Confirm disconnect" : "Disconnect"}
              </Button>
            ) : (
              <Button asChild variant="invert" className={!googleReady ? "pointer-events-none opacity-50" : undefined}>
                <a href={googleReady ? "/api/google/connect" : undefined} aria-disabled={!googleReady}>
                  Connect Google Calendar
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="border border-ink-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-medium">Stripe</p>
            <span className="text-[0.62rem] tracking-[0.14em] text-ink-muted uppercase">
              {stripeLabel}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            {stripeReady
              ? `Keys are saved${stripeTest ? " in test mode" : " in live mode"}${stripeHasWebhook ? ", webhook secret on file" : ""}. Rent now will take a 50% deposit through Stripe Checkout.`
              : "Paste the studio Stripe keys here. Start in test mode (pk_test_ / sk_test_). Rent now uses these for the 50% deposit — Square is not used."}
          </p>

          {stripeEnv ? (
            <p className="mt-4 text-xs text-ink-subtle">
              Stripe keys are already on the server. You can replace them below if you need to rotate.
            </p>
          ) : null}

          <ol className="mt-5 list-decimal space-y-2 pl-5 text-xs leading-relaxed text-ink-subtle">
            <li>
              Open{" "}
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noreferrer"
                className="text-ink underline underline-offset-4"
              >
                Stripe → Developers → API keys
              </a>
              . Turn Test mode <span className="text-ink">off</span> to go live.
            </li>
            <li>
              Paste the live publishable key (pk_live_…) and secret key (sk_live_…). The Colorful
              Experience page pulls the three ticket products from this Stripe account.
            </li>
            <li>
              Optional: Developers → Webhooks → add this endpoint, event{" "}
              <span className="text-ink">checkout.session.completed</span>, then paste the signing secret.
            </li>
            <li>
              For the renter confirmation email, open{" "}
              <a
                href="https://dashboard.stripe.com/settings/emails"
                target="_blank"
                rel="noreferrer"
                className="text-ink underline underline-offset-4"
              >
                Stripe → Settings → Customer emails
              </a>{" "}
              and turn on <span className="text-ink">Successful payments</span>.
            </li>
          </ol>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="grow border border-ink-border bg-paper-muted px-3 py-2 text-[0.7rem] text-ink break-all">
              {STRIPE_WEBHOOK}
            </code>
            <Button type="button" variant="paperOutline" size="sm" onClick={() => void copyText(STRIPE_WEBHOOK)}>
              {copied === STRIPE_WEBHOOK ? "Copied" : "Copy"}
            </Button>
          </div>

          <form onSubmit={onSaveStripe} className="mt-5 space-y-4">
            <Field label="Publishable key" htmlFor="stripePk">
              <Input
                id="stripePk"
                autoComplete="off"
                value={pk}
                placeholder={stripeHint ?? "pk_test_…"}
                onChange={(e) => setPk(e.target.value)}
              />
            </Field>
            <Field label="Secret key" htmlFor="stripeSk">
              <Input
                id="stripeSk"
                type="password"
                autoComplete="off"
                value={sk}
                placeholder="sk_test_…"
                onChange={(e) => setSk(e.target.value)}
              />
            </Field>
            <Field label="Webhook signing secret (optional)" htmlFor="stripeWh">
              <Input
                id="stripeWh"
                type="password"
                autoComplete="off"
                value={whsec}
                placeholder="whsec_…"
                onChange={(e) => setWhsec(e.target.value)}
              />
            </Field>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" variant="invert" disabled={pending || !pk || !sk}>
                {pending ? "Saving…" : "Save Stripe keys"}
              </Button>
              {stripeReady ? (
                <Button type="button" variant="paperOutline" disabled={pending} onClick={() => void onDisconnectStripe()}>
                  {confirmStripeOff ? "Confirm remove keys" : "Remove keys"}
                </Button>
              ) : null}
              {stripeSaved ? <p className="text-sm text-ink-muted">Saved.</p> : null}
              {stripeError ? <p className="text-sm text-ink-muted">{stripeError}</p> : null}
            </div>
          </form>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-3xl">How booking works</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-muted">
          <li>In-house shoots are booked here by you — never a public self-serve checkout.</li>
          <li>Studio rentals take a 50% Stripe deposit on Rent now. Peerspace stays as a second door until you retire it.</li>
          <li>
            Events that already exist on the connected Google calendar appear on
            the desk floor as busy time. They are not turned into invoices.
          </li>
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
