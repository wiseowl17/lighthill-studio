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
import { signOut } from "@/lib/auth/client";
import { STUDIO_TZ } from "@/lib/studio/owner";

const REDIRECT_URIS = [
  "https://lighthillstudio.com/api/google/callback",
  "https://www.lighthillstudio.com/api/google/callback",
];

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
      return "Google Calendar is connected. Pick which calendar the desk should write to below.";
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
  const [square, setSquare] = useState(false);
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

  function hydrate() {
    void getSettings().then((row) => {
      setMinRentalHours(row.minRentalHours);
      setBufferMinutes(row.bufferMinutes);
      setSquare(row.squareConnected);
      setGcal(row.googleCalendarConnected);
      setGcalEmail(row.googleAccountEmail);
      setGoogleReady(row.googleReady);
      setGoogleEnv(row.googleEnvConfigured);
      setClientHint(row.googleClientIdHint);
      if (row.googleCalendarConnected) {
        void listGoogleCalendars().then((items) => {
          setCalendars(items);
          setCalendarId((current) => {
            if (current && items.some((item) => item.id === current)) return current;
            const studio = items.find((item) => item.name.toLowerCase() === "lighthill studio");
            return studio?.id || items[0]?.id || current;
          });
        });
      } else {
        setCalendars([]);
      }
    });
  }

  useEffect(() => {
    hydrate();
  }, []);

  async function copyUri(uri: string) {
    try {
      await navigator.clipboard.writeText(uri);
      setCopied(uri);
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

  const selectedCalendar = calendars.find((item) => item.id === calendarId);
  const notice = googleBanner(google);

  return (
    <div className="max-w-2xl">
      <p className="text-[0.7rem] tracking-[0.2em] text-ink-muted uppercase">Desk</p>
      <h1 className="mt-2 font-display text-4xl">Settings</h1>
      <p className="mt-3 text-sm text-ink-muted">
        Floor rules live here. Google Calendar mirrors the desk — the desk stays
        the source of truth.
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
              ? `Connected${gcalEmail ? ` as ${gcalEmail}` : ""}. The desk writes bookings, holds, and blocks to the calendar you pick — it does not import events from Google.`
              : "Connect the studio Gmail. Then choose which calendar the desk should write to — usually Lighthill Studio."}
          </p>

          {gcal ? (
            <form onSubmit={onSaveCalendar} className="mt-5 space-y-3">
              <Field label="Write to this calendar" htmlFor="gcalTarget">
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
                    <Button type="button" variant="paperOutline" size="sm" onClick={() => void copyUri(uri)}>
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

        <ConnectRow
          title="Square"
          body={
            square
              ? "Connected. Invoices can take a card."
              : "Not connected. Keep marking invoices sent or paid by hand. We’ll hook this up once the studio Square account is ready — no public checkout until then."
          }
          connected={square}
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
