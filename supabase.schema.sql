create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  incident_date date not null,
  incident_time time not null,
  location text not null,
  category text not null,
  impact text not null,
  description text not null,
  reporter_name text not null,
  reporter_email text not null,
  postcode text not null,
  consent_network_rail boolean not null default false,
  consent_council boolean not null default false,
  consent_mp boolean not null default false,
  status text not null default 'Pending',
  created_at timestamptz not null default now()
);

alter table public.incidents enable row level security;

-- This app uses the server-side Supabase service role key only from GPT Sites
-- runtime environment variables. Do not expose the service role key in browser code.
