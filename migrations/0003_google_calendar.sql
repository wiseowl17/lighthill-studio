-- Google Calendar mirror for the owner desk.
alter table studio_settings
  add column if not exists google_refresh_token text,
  add column if not exists google_calendar_id text,
  add column if not exists google_account_email text,
  add column if not exists google_client_id text,
  add column if not exists google_client_secret text;

alter table bookings
  add column if not exists google_event_id text;
