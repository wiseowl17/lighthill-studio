import { createCipheriv, createDecipheriv, createHmac, createHash, randomBytes } from "node:crypto";
import { getSql } from "@/lib/db";
import { OWNER_EMAIL, STUDIO_TZ } from "./owner";
import { kindLabel, type BookingKind } from "./catalog";
import { zonedStart } from "./time";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

const PREFERRED_CALENDAR_NAMES = ["Lighthill Studio", "Lighthill Floor"];
const STATE_COOKIE = "lh_gcal_n";
const STUDIO_HOSTS = new Set(["lighthillstudio.com", "www.lighthillstudio.com"]);

function envTrim(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value || undefined;
}

function signingSecret(): string {
  return envTrim("BETTER_AUTH_SECRET") ?? envTrim("GOOGLE_CLIENT_SECRET") ?? "lighthill-preview";
}

function encKey(): Buffer {
  return createHash("sha256").update(`gcal:${signingSecret()}`).digest();
}

function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}.${tag.toString("hex")}.${enc.toString("hex")}`;
}

function decrypt(payload: string): string {
  if (!payload.includes(".")) return payload;
  const [ivH, tagH, dataH] = payload.split(".");
  const decipher = createDecipheriv("aes-256-gcm", encKey(), Buffer.from(ivH, "hex"));
  decipher.setAuthTag(Buffer.from(tagH, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(dataH, "hex")), decipher.final()]).toString("utf8");
}

export function envGoogleConfigured(): boolean {
  return Boolean(envTrim("GOOGLE_CLIENT_ID") && envTrim("GOOGLE_CLIENT_SECRET"));
}

/** Browser-facing origin. Prefer the custom domain over a Vercel deployment host. */
export function publicOrigin(request: Request): string {
  const url = new URL(request.url);
  const forwarded = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (url.protocol === "http:" ? "http" : "https");
  const host = (forwarded || url.host).replace(/:\d+$/, "");
  if (STUDIO_HOSTS.has(host)) return `${proto}://${host}`;
  const authUrl = envTrim("BETTER_AUTH_URL");
  if (authUrl) {
    try {
      const parsed = new URL(authUrl.includes("://") ? authUrl : `https://${authUrl}`);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      /* fall through */
    }
  }
  return `${url.protocol}//${url.host}`;
}

export function redirectUriFromRequest(request: Request): string {
  const explicit = envTrim("GOOGLE_REDIRECT_URI");
  if (explicit) return explicit;
  return `${publicOrigin(request)}/api/google/callback`;
}

type AppCreds = { clientId: string; clientSecret: string };

export async function loadGoogleApp(userId: string): Promise<AppCreds | null> {
  const envId = envTrim("GOOGLE_CLIENT_ID");
  const envSecret = envTrim("GOOGLE_CLIENT_SECRET");
  if (envId && envSecret) return { clientId: envId, clientSecret: envSecret };
  const sql = await getSql();
  const rows = await sql<{ google_client_id: string | null; google_client_secret: string | null }>`
    select google_client_id, google_client_secret from studio_settings where user_id = ${userId} limit 1
  `;
  const id = rows[0]?.google_client_id?.trim();
  const secretEnc = rows[0]?.google_client_secret?.trim();
  if (!id || !secretEnc) return null;
  try {
    return { clientId: id, clientSecret: decrypt(secretEnc) };
  } catch {
    return null;
  }
}

export async function saveGoogleApp(userId: string, clientId: string, clientSecret: string): Promise<void> {
  const sql = await getSql();
  await sql`
    insert into studio_settings (user_id, google_client_id, google_client_secret)
    values (${userId}, ${clientId.trim()}, ${encrypt(clientSecret.trim())})
    on conflict (user_id) do update set
      google_client_id = excluded.google_client_id,
      google_client_secret = excluded.google_client_secret
  `;
}

export function signOauthState(userId: string, nonce: string): string {
  const exp = Date.now() + 10 * 60 * 1000;
  const body = `${userId}.${nonce}.${exp}`;
  const sig = createHmac("sha256", signingSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyOauthState(state: string, nonce: string): { userId: string } | null {
  const parts = state.split(".");
  if (parts.length !== 4) return null;
  const [userId, gotNonce, exp, sig] = parts;
  if (gotNonce !== nonce) return null;
  if (Number(exp) < Date.now()) return null;
  const body = `${userId}.${gotNonce}.${exp}`;
  const expected = createHmac("sha256", signingSecret()).update(body).digest("base64url");
  if (expected !== sig) return null;
  return { userId };
}

export function oauthCookie(nonce: string, secure: boolean, maxAge = 600): string {
  const parts = [`${STATE_COOKIE}=${nonce}`, "Path=/", "HttpOnly", "SameSite=Lax", `Max-Age=${maxAge}`];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function readOauthNonce(request: Request): string | null {
  const raw = request.headers.get("cookie") ?? "";
  const match = raw.split(";").map((p) => p.trim()).find((p) => p.startsWith(`${STATE_COOKIE}=`));
  return match ? match.slice(STATE_COOKIE.length + 1) : null;
}

export function buildGoogleAuthUrl(clientId: string, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    login_hint: OWNER_EMAIL,
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function googleJson<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Google ${res.status}: ${text.slice(0, 240)}`);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

type TokenRes = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};

async function exchangeCode(creds: AppCreds, code: string, redirectUri: string): Promise<TokenRes> {
  return googleJson<TokenRes>("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
}

async function refreshAccess(creds: AppCreds, refreshToken: string): Promise<string> {
  const tokens = await googleJson<TokenRes>("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      grant_type: "refresh_token",
    }),
  });
  return tokens.access_token;
}

async function authHeader(userId: string): Promise<{ token: string; calendarId: string } | null> {
  const creds = await loadGoogleApp(userId);
  if (!creds) return null;
  const sql = await getSql();
  const rows = await sql<{
    google_refresh_token: string | null;
    google_calendar_id: string | null;
    google_calendar_connected: boolean;
  }>`
    select google_refresh_token, google_calendar_id, google_calendar_connected
    from studio_settings where user_id = ${userId} limit 1
  `;
  const row = rows[0];
  if (!row?.google_calendar_connected || !row.google_refresh_token) return null;
  const refresh = decrypt(row.google_refresh_token);
  const token = await refreshAccess(creds, refresh);
  return { token, calendarId: row.google_calendar_id || "primary" };
}

export type GoogleCalendarOption = {
  id: string;
  name: string;
  primary: boolean;
};

function mapCalendarList(
  items?: Array<{ id?: string; summary?: string; summaryOverride?: string; primary?: boolean }>,
): GoogleCalendarOption[] {
  return (items ?? [])
    .filter((item): item is { id: string; summary?: string; summaryOverride?: string; primary?: boolean } =>
      Boolean(item.id),
    )
    .map((item) => ({
      id: item.id,
      name: item.summaryOverride?.trim() || item.summary?.trim() || item.id,
      primary: Boolean(item.primary),
    }));
}

async function listCalendarsWithToken(accessToken: string): Promise<GoogleCalendarOption[]> {
  const list = await googleJson<{
    items?: Array<{ id?: string; summary?: string; summaryOverride?: string; primary?: boolean }>;
  }>("https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=writer", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return mapCalendarList(list.items);
}

async function pickTargetCalendar(accessToken: string): Promise<string> {
  const calendars = await listCalendarsWithToken(accessToken);
  for (const name of PREFERRED_CALENDAR_NAMES) {
    const match = calendars.find((item) => item.name.toLowerCase() === name.toLowerCase());
    if (match) return match.id;
  }
  const primary = calendars.find((item) => item.primary);
  if (primary) return primary.id;
  if (calendars[0]) return calendars[0].id;
  const created = await googleJson<{ id: string }>("https://www.googleapis.com/calendar/v3/calendars", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ summary: "Lighthill Studio", timeZone: STUDIO_TZ }),
  });
  return created.id;
}

export async function listWritableCalendars(userId: string): Promise<GoogleCalendarOption[]> {
  const authz = await authHeader(userId);
  if (!authz) return [];
  try {
    return await listCalendarsWithToken(authz.token);
  } catch (err) {
    console.error("[gcal] list", err);
    return [];
  }
}

export type GoogleFloorEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  htmlLink: string | null;
};

type GoogleEventItem = {
  id?: string;
  status?: string;
  summary?: string;
  htmlLink?: string;
  transparency?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
  extendedProperties?: { private?: Record<string, string> };
};

function parseGoogleSlot(
  slot: { date?: string; dateTime?: string } | undefined,
): { iso: string; allDay: boolean } | null {
  if (!slot) return null;
  if (slot.dateTime) return { iso: new Date(slot.dateTime).toISOString(), allDay: false };
  if (slot.date) return { iso: zonedStart(slot.date, "00:00").toISOString(), allDay: true };
  return null;
}

export async function listGoogleFloorEvents(
  userId: string,
  fromIso: string,
  toIso: string,
): Promise<GoogleFloorEvent[]> {
  const authz = await authHeader(userId);
  if (!authz) return [];
  try {
    const sql = await getSql();
    const known = await sql<{ google_event_id: string | null }>`
      select google_event_id from bookings
      where user_id = ${userId} and google_event_id is not null
    `;
    const skip = new Set(
      known.map((row) => row.google_event_id).filter((id): id is string => Boolean(id)),
    );

    const items: GoogleEventItem[] = [];
    let pageToken: string | undefined;
    do {
      const url = new URL(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(authz.calendarId)}/events`,
      );
      url.searchParams.set("timeMin", fromIso);
      url.searchParams.set("timeMax", toIso);
      url.searchParams.set("singleEvents", "true");
      url.searchParams.set("orderBy", "startTime");
      url.searchParams.set("maxResults", "250");
      if (pageToken) url.searchParams.set("pageToken", pageToken);
      const data = await googleJson<{ items?: GoogleEventItem[]; nextPageToken?: string }>(
        url.toString(),
        { headers: { Authorization: `Bearer ${authz.token}` } },
      );
      items.push(...(data.items ?? []));
      pageToken = data.nextPageToken;
    } while (pageToken && items.length < 500);

    const out: GoogleFloorEvent[] = [];
    for (const item of items) {
      if (!item.id || item.status === "cancelled") continue;
      if (item.transparency === "transparent") continue;
      if (skip.has(item.id)) continue;
      const priv = item.extendedProperties?.private;
      if (priv?.lighthill === "desk" || priv?.lighthillBookingId) continue;
      const start = parseGoogleSlot(item.start);
      const end = parseGoogleSlot(item.end);
      if (!start || !end) continue;
      out.push({
        id: item.id,
        title: item.summary?.trim() || "Busy",
        startsAt: start.iso,
        endsAt: end.iso,
        allDay: start.allDay || end.allDay,
        htmlLink: item.htmlLink ?? null,
      });
    }
    return out;
  } catch (err) {
    console.error("[gcal] events", err);
    return [];
  }
}

export async function findGoogleOverlap(
  userId: string,
  start: Date,
  end: Date,
): Promise<{ title: string } | null> {
  const events = await listGoogleFloorEvents(
    userId,
    new Date(start.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    new Date(end.getTime() + 12 * 60 * 60 * 1000).toISOString(),
  );
  const startMs = start.getTime();
  const endMs = end.getTime();
  const hit = events.find((event) => {
    const from = new Date(event.startsAt).getTime();
    const to = new Date(event.endsAt).getTime();
    return from < endMs && to > startMs;
  });
  return hit ? { title: hit.title } : null;
}

export async function setTargetCalendar(
  userId: string,
  calendarId: string,
): Promise<{ name: string }> {
  const authz = await authHeader(userId);
  if (!authz) throw new Error("Google Calendar is not connected.");
  const calendars = await listCalendarsWithToken(authz.token);
  const match = calendars.find((item) => item.id === calendarId);
  if (!match) throw new Error("That calendar is not writable from this Google account.");

  const sql = await getSql();
  if (authz.calendarId && authz.calendarId !== calendarId) {
    const oldEvents = await sql<{ google_event_id: string | null }>`
      select google_event_id from bookings
      where user_id = ${userId} and google_event_id is not null
    `;
    for (const row of oldEvents) {
      if (!row.google_event_id) continue;
      try {
        await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(authz.calendarId)}/events/${encodeURIComponent(row.google_event_id)}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${authz.token}` } },
        );
      } catch {
        /* leave the old event if Google rejects the delete */
      }
    }
    await sql`update bookings set google_event_id = null where user_id = ${userId}`;
  }

  await sql`
    update studio_settings set google_calendar_id = ${calendarId}
    where user_id = ${userId}
  `;
  await backfillUpcoming(userId);
  return { name: match.name };
}

export async function completeGoogleConnect(
  userId: string,
  code: string,
  redirectUri: string,
): Promise<{ email: string }> {
  const creds = await loadGoogleApp(userId);
  if (!creds) throw new Error("Google app is not configured.");
  const tokens = await exchangeCode(creds, code, redirectUri);
  if (!tokens.refresh_token) {
    throw new Error("Google did not return a refresh token. Disconnect in Google Account permissions and try again.");
  }
  const profile = await googleJson<{ email?: string }>("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const email = profile.email?.toLowerCase() ?? "";
  const calendarId = await pickTargetCalendar(tokens.access_token);
  const sql = await getSql();
  await sql`
    insert into studio_settings (
      user_id, google_calendar_connected, google_refresh_token, google_calendar_id, google_account_email
    ) values (
      ${userId}, true, ${encrypt(tokens.refresh_token)}, ${calendarId}, ${email || null}
    )
    on conflict (user_id) do update set
      google_calendar_connected = true,
      google_refresh_token = excluded.google_refresh_token,
      google_calendar_id = excluded.google_calendar_id,
      google_account_email = excluded.google_account_email
  `;
  await backfillUpcoming(userId);
  return { email };
}

export async function disconnectGoogle(userId: string): Promise<void> {
  const sql = await getSql();
  const rows = await sql<{ google_refresh_token: string | null }>`
    select google_refresh_token from studio_settings where user_id = ${userId} limit 1
  `;
  const enc = rows[0]?.google_refresh_token;
  if (enc) {
    try {
      const token = decrypt(enc);
      await fetch("https://oauth2.googleapis.com/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token }),
      });
    } catch {
      /* still clear local state */
    }
  }
  await sql`
    update studio_settings set
      google_calendar_connected = false,
      google_refresh_token = null,
      google_calendar_id = null,
      google_account_email = null
    where user_id = ${userId}
  `;
}

async function backfillUpcoming(userId: string): Promise<void> {
  const sql = await getSql();
  const since = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
  const rows = await sql<{ id: string }>`
    select id from bookings
    where user_id = ${userId}
      and status <> 'cancelled'
      and starts_at > ${since}
    order by starts_at asc
    limit 80
  `;
  for (const row of rows) {
    try {
      await upsertGoogleEvent(userId, row.id);
    } catch (err) {
      console.error("[gcal] backfill", row.id, err);
    }
  }
}

export async function upsertGoogleEvent(userId: string, bookingId: string): Promise<void> {
  const authz = await authHeader(userId);
  if (!authz) return;
  const sql = await getSql();
  const rows = await sql<{
    title: string;
    kind: string;
    status: string;
    notes: string | null;
    starts_at: string | Date;
    ends_at: string | Date;
    google_event_id: string | null;
  }>`
    select title, kind, status, notes, starts_at, ends_at, google_event_id
    from bookings where id = ${bookingId} and user_id = ${userId} limit 1
  `;
  const booking = rows[0];
  if (!booking) return;
  if (booking.status === "cancelled") {
    await deleteGoogleEvent(userId, booking.google_event_id);
    await sql`update bookings set google_event_id = null where id = ${bookingId} and user_id = ${userId}`;
    return;
  }
  const body = {
    summary: booking.title,
    description: `${kindLabel(booking.kind as BookingKind)}\n${booking.notes?.trim() ?? ""}`.trim(),
    start: { dateTime: new Date(booking.starts_at).toISOString(), timeZone: STUDIO_TZ },
    end: { dateTime: new Date(booking.ends_at).toISOString(), timeZone: STUDIO_TZ },
    status: booking.status === "tentative" || booking.kind === "hold" ? "tentative" : "confirmed",
    transparency: "opaque" as const,
    extendedProperties: {
      private: {
        lighthill: "desk",
        lighthillBookingId: bookingId,
      },
    },
  };
  const headers = {
    Authorization: `Bearer ${authz.token}`,
    "Content-Type": "application/json",
  };
  if (booking.google_event_id) {
    try {
      await googleJson(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(authz.calendarId)}/events/${encodeURIComponent(booking.google_event_id)}`,
        { method: "PATCH", headers, body: JSON.stringify(body) },
      );
      return;
    } catch {
      /* recreate */
    }
  }
  const created = await googleJson<{ id: string }>(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(authz.calendarId)}/events`,
    { method: "POST", headers, body: JSON.stringify(body) },
  );
  await sql`update bookings set google_event_id = ${created.id} where id = ${bookingId} and user_id = ${userId}`;
}

export async function deleteGoogleEvent(userId: string, eventId: string | null | undefined): Promise<void> {
  if (!eventId) return;
  const authz = await authHeader(userId);
  if (!authz) return;
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(authz.calendarId)}/events/${encodeURIComponent(eventId)}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${authz.token}` } },
  );
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw new Error(`Google delete ${res.status}`);
  }
}

export async function mirrorBooking(userId: string, bookingId: string): Promise<void> {
  try {
    await upsertGoogleEvent(userId, bookingId);
  } catch (err) {
    console.error("[gcal] upsert", bookingId, err);
  }
}

export async function mirrorDelete(userId: string, eventId: string | null): Promise<void> {
  try {
    await deleteGoogleEvent(userId, eventId);
  } catch (err) {
    console.error("[gcal] delete", eventId, err);
  }
}
