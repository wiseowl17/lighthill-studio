-- Stripe keys and rental checkout sessions.
alter table studio_settings
  add column if not exists stripe_publishable_key text,
  add column if not exists stripe_secret_key text,
  add column if not exists stripe_webhook_secret text;

alter table bookings
  add column if not exists stripe_session_id text,
  add column if not exists stripe_payment_intent text;

create unique index if not exists bookings_stripe_session_idx
  on bookings (stripe_session_id)
  where stripe_session_id is not null;
