-- Lighthill owner desk: clients, bookings, invoices, inquiries, settings.
-- Per-user rows are scoped to the studio owner account (user_id TEXT).

create table if not exists clients (
  id          text primary key,
  user_id     text not null,
  name        text not null,
  email       text,
  phone       text,
  instagram   text,
  notes       text,
  created_at  timestamptz not null default now()
);
create index if not exists clients_user_id_idx on clients (user_id);
create index if not exists clients_user_name_idx on clients (user_id, name);

create table if not exists bookings (
  id                 text primary key,
  user_id            text not null,
  client_id          text references clients (id) on delete set null,
  kind               text not null,
  session_type       text,
  title              text not null,
  starts_at          timestamptz not null,
  ends_at            timestamptz not null,
  duration_minutes   integer not null,
  guest_count        integer,
  status             text not null default 'confirmed',
  payment_status     text not null default 'unpaid',
  total_cents        integer not null default 0,
  deposit_cents      integer not null default 0,
  notes              text,
  addons             jsonb not null default '[]'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists bookings_user_starts_idx on bookings (user_id, starts_at);
create index if not exists bookings_user_status_idx on bookings (user_id, status);

create table if not exists invoices (
  id            text primary key,
  user_id       text not null,
  booking_id    text references bookings (id) on delete set null,
  client_id     text references clients (id) on delete set null,
  status        text not null default 'draft',
  amount_cents  integer not null,
  line_items    jsonb not null default '[]'::jsonb,
  notes         text,
  sent_at       timestamptz,
  paid_at       timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists invoices_user_idx on invoices (user_id, created_at desc);

create table if not exists inquiries (
  id          text primary key,
  user_id     text not null,
  name        text not null,
  email       text not null,
  phone       text,
  kind        text not null,
  message     text not null,
  status      text not null default 'new',
  created_at  timestamptz not null default now()
);
create index if not exists inquiries_user_idx on inquiries (user_id, created_at desc);

create table if not exists studio_settings (
  user_id                     text primary key,
  timezone                    text not null default 'America/New_York',
  min_rental_hours            integer not null default 2,
  buffer_minutes              integer not null default 0,
  square_connected            boolean not null default false,
  google_calendar_connected   boolean not null default false
);
