alter table studio_settings
  add column if not exists category_colors jsonb not null default '{}'::jsonb;
