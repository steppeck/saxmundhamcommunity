create extension if not exists pgcrypto;
create schema if not exists private;

create type public.report_status as enum
  ('pending', 'approved', 'duplicate', 'excluded', 'removed');

create table public.broad_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 80),
  display_order integer not null default 0,
  active boolean not null default true
);

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (reference ~ '^SAX-[0-9]{4}-[A-Z0-9]{6}$'),
  incident_date date not null check (incident_date <= current_date),
  approximate_time time not null,
  broad_location_id uuid not null references public.broad_locations(id),
  street_name text check (char_length(street_name) <= 100),
  noise_type text not null check (noise_type in (
    'Train horn', 'Engine noise or idling', 'Wheel or rail squeal',
    'Track or engineering work', 'Crossing or barrier alarm', 'Vibration',
    'Repeated passing trains', 'Other or unsure'
  )),
  duration text not null check (duration in (
    'Under 1 minute', '1-5 minutes', '6-15 minutes', '16-30 minutes',
    '31-60 minutes', 'Over 1 hour', 'Repeated intermittently', 'Unsure'
  )),
  experienced_at text not null check (experienced_at in ('Indoors', 'Outdoors', 'Both')),
  window_state text check (window_state in (
    'Windows closed', 'Windows open', 'Unsure or not applicable'
  )),
  effects text[] not null check (cardinality(effects) between 1 and 9),
  disruption_level text not null check (disruption_level in (
    'Not very disruptive', 'Slightly disruptive', 'Moderately disruptive',
    'Very disruptive', 'Extremely disruptive'
  )),
  frequency text not null check (frequency in (
    'This was the first time', 'Less than weekly', 'One or two days a week',
    'Three or four days a week', 'Most days', 'Several times a day', 'Unsure'
  )),
  report_timing text not null check (report_timing in (
    'While it is happening', 'Later the same day', 'One or more days later'
  )),
  status public.report_status not null default 'pending',
  submission_fingerprint text not null unique,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table private.reporter_details (
  incident_id uuid primary key references public.incidents(id) on delete cascade,
  name text check (char_length(name) <= 100),
  email text check (char_length(email) <= 254),
  updates_opt_in boolean not null default false,
  delete_after date not null default (current_date + 365)
);

create table private.report_comments (
  incident_id uuid primary key references public.incidents(id) on delete cascade,
  comment text not null check (char_length(comment) <= 2000)
);

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 100),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table private.admin_notes (
  incident_id uuid primary key references public.incidents(id) on delete cascade,
  note text not null check (char_length(note) <= 2000),
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now()
);

create table private.audit_log (
  id bigint generated always as identity primary key,
  incident_id uuid references public.incidents(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  from_status public.report_status,
  to_status public.report_status,
  reason text check (char_length(reason) <= 1000),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = auth.uid() and active = true
  );
$$;

create or replace view public.approved_reports
with (security_invoker = true)
as
select
  i.reference,
  i.incident_date,
  to_char(i.approximate_time, 'HH24:MI') as approximate_time,
  case
    when i.approximate_time < time '06:00' then 'Overnight (midnight-6am)'
    when i.approximate_time < time '12:00' then 'Morning (6am-midday)'
    when i.approximate_time < time '18:00' then 'Afternoon (midday-6pm)'
    else 'Evening (6pm-midnight)'
  end as time_period,
  l.name as broad_area,
  i.street_name,
  i.noise_type,
  i.duration,
  i.experienced_at,
  i.window_state,
  i.effects,
  i.disruption_level,
  i.frequency,
  i.report_timing
from public.incidents i
join public.broad_locations l on l.id = i.broad_location_id
where i.status = 'approved';

alter table public.broad_locations enable row level security;
alter table public.incidents enable row level security;
alter table public.admin_profiles enable row level security;

create policy "locations are public" on public.broad_locations
for select to anon, authenticated using (active = true);
create policy "approved incidents support public view" on public.incidents
for select to anon, authenticated using (status = 'approved');
create policy "admins see profiles" on public.admin_profiles
for select to authenticated using (public.is_admin());

revoke all on schema private from public, anon, authenticated;
revoke all on all tables in schema private from public, anon, authenticated;
revoke all on public.incidents from anon, authenticated;
grant select on public.approved_reports to anon, authenticated;
grant select on public.broad_locations to anon, authenticated;
grant select on public.admin_profiles to authenticated;

create or replace function public.submit_incident(payload jsonb)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  new_id uuid;
  new_reference text;
  location_id uuid;
  incident_day date;
  contact_days integer;
begin
  incident_day := (payload->>'incidentDate')::date;
  if incident_day > current_date or incident_day < current_date - interval '2 years' then
    raise exception 'Incident date is outside the allowed range';
  end if;

  select id into location_id from public.broad_locations
  where name = payload->>'broadArea' and active = true;
  if location_id is null then raise exception 'Unknown area'; end if;

  new_reference := 'SAX-' || extract(year from incident_day)::int || '-' ||
    upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 6));
  contact_days := least(greatest(coalesce((payload->>'retentionDays')::int, 365), 30), 730);

  insert into public.incidents (
    reference, incident_date, approximate_time, broad_location_id, street_name, noise_type,
    duration, experienced_at, window_state, effects, disruption_level,
    frequency, report_timing, submission_fingerprint
  ) values (
    new_reference, incident_day, (payload->>'approximateTime')::time, location_id,
    nullif(trim(payload->>'streetName'), ''),
    payload->>'noiseType', payload->>'duration', payload->>'experiencedAt',
    nullif(payload->>'windowState', ''),
    array(select jsonb_array_elements_text(payload->'effects')),
    payload->>'disruptionLevel', payload->>'frequency', payload->>'reportTiming',
    payload->>'fingerprint'
  ) returning id into new_id;

  if nullif(trim(payload->>'reporterName'), '') is not null
     or nullif(trim(payload->>'reporterEmail'), '') is not null then
    insert into private.reporter_details
      (incident_id, name, email, updates_opt_in, delete_after)
    values (
      new_id, nullif(trim(payload->>'reporterName'), ''),
      nullif(lower(trim(payload->>'reporterEmail')), ''),
      coalesce((payload->>'updatesOptIn')::boolean, false),
      current_date + contact_days
    );
  end if;

  if nullif(trim(payload->>'privateComments'), '') is not null then
    insert into private.report_comments (incident_id, comment)
    values (new_id, trim(payload->>'privateComments'));
  end if;

  insert into private.audit_log (incident_id, action, to_status)
  values (new_id, 'Report submitted', 'pending');
  return new_reference;
exception when unique_violation then
  raise exception 'This report has already been submitted';
end;
$$;

grant execute on function public.submit_incident(jsonb) to anon;

create or replace function public.admin_reports(report_id uuid default null)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'Not authorised'; end if;
  return (
    select coalesce(jsonb_agg(row_to_json(r) order by r.submitted_at desc), '[]'::jsonb)
    from (
      select i.id, i.reference, i.incident_date, to_char(i.approximate_time, 'HH24:MI') approximate_time,
        l.name broad_area, i.street_name, i.noise_type, i.duration, i.experienced_at, i.window_state,
        i.effects, i.disruption_level, i.frequency, i.report_timing, i.status,
        i.submitted_at, d.name reporter_name, d.email reporter_email,
        c.comment private_comments, n.note admin_note,
        (
          select coalesce(jsonb_agg(jsonb_build_object(
            'action', a.action, 'fromStatus', a.from_status,
            'toStatus', a.to_status, 'reason', a.reason, 'createdAt', a.created_at
          ) order by a.created_at desc), '[]'::jsonb)
          from private.audit_log a where a.incident_id = i.id
        ) history
      from public.incidents i
      join public.broad_locations l on l.id = i.broad_location_id
      left join private.reporter_details d on d.incident_id = i.id
      left join private.report_comments c on c.incident_id = i.id
      left join private.admin_notes n on n.incident_id = i.id
      where report_id is null or i.id = report_id
    ) r
  );
end;
$$;
grant execute on function public.admin_reports(uuid) to authenticated;

create or replace function public.moderate_report(
  report_id uuid, new_status public.report_status, reason text default null,
  corrected_fields jsonb default '{}'::jsonb, admin_note text default null
) returns void
language plpgsql security definer set search_path = ''
as $$
declare old_status public.report_status;
begin
  if not public.is_admin() then raise exception 'Not authorised'; end if;
  if new_status in ('excluded', 'removed') and nullif(trim(reason), '') is null then
    raise exception 'A reason is required';
  end if;
  select status into old_status from public.incidents where id = report_id for update;
  if old_status is null then raise exception 'Report not found'; end if;

  update public.incidents set
    status = new_status,
    incident_date = coalesce((corrected_fields->>'incidentDate')::date, incident_date),
    approximate_time = coalesce((corrected_fields->>'approximateTime')::time, approximate_time),
    updated_at = now()
  where id = report_id;

  if admin_note is not null then
    insert into private.admin_notes (incident_id, note, updated_by)
    values (report_id, admin_note, auth.uid())
    on conflict (incident_id) do update
      set note = excluded.note, updated_by = auth.uid(), updated_at = now();
  end if;

  insert into private.audit_log
    (incident_id, actor_id, action, from_status, to_status, reason)
  values (report_id, auth.uid(), 'Moderation status changed', old_status, new_status, reason);
end;
$$;
grant execute on function public.moderate_report(uuid, public.report_status, text, jsonb, text)
to authenticated;

create or replace function public.anonymise_reporter(report_id uuid)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'Not authorised'; end if;
  delete from private.reporter_details where incident_id = report_id;
  insert into private.audit_log (incident_id, actor_id, action)
  values (report_id, auth.uid(), 'Personal contact details deleted');
end;
$$;
grant execute on function public.anonymise_reporter(uuid) to authenticated;

create or replace function public.delete_expired_contact_details()
returns integer language plpgsql security definer set search_path = ''
as $$
declare deleted_count integer;
begin
  if not public.is_admin() then raise exception 'Not authorised'; end if;
  with deleted as (
    delete from private.reporter_details
    where delete_after <= current_date
    returning incident_id
  ), audit as (
    insert into private.audit_log (incident_id, actor_id, action)
    select incident_id, auth.uid(), 'Expired personal contact details deleted'
    from deleted
  )
  select count(*) into deleted_count from deleted;
  return deleted_count;
end;
$$;
grant execute on function public.delete_expired_contact_details() to authenticated;

insert into public.broad_locations (name, display_order) values
  ('Town centre and station', 1), ('North of the station', 2),
  ('South of the station', 3), ('East of the railway', 4),
  ('West of the railway', 5), ('Outlying Saxmundham area', 6), ('Unsure', 7)
on conflict (name) do nothing;

comment on view public.approved_reports is
  'Only approved, structured, non-personal report data. Never add free text or IDs.';
