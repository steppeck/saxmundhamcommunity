drop view if exists public.approved_reports;

alter table public.incidents
drop constraint if exists incidents_noise_type_check;

alter table public.incidents
drop constraint if exists incidents_incident_date_check;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'incidents'
      and column_name = 'noise_type'
      and data_type = 'text'
  ) then
    alter table public.incidents
    alter column noise_type type text[]
    using array[noise_type];
  end if;
end;
$$;

alter table public.incidents
add constraint incidents_noise_type_check check (
  cardinality(noise_type) between 1 and 8 and noise_type <@ array[
    'Train horn', 'Engine noise or idling', 'Wheel or rail squeal',
    'Track or engineering work', 'Crossing or barrier alarm', 'Vibration',
    'Repeated passing trains', 'Other or unsure'
  ]::text[]
);

create view public.approved_reports
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

grant select on public.approved_reports to anon, authenticated;

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
  uk_now timestamp := clock_timestamp() at time zone 'Europe/London';
  selected_noise_types text[];
begin
  incident_day := (payload->>'incidentDate')::date;
  if jsonb_typeof(payload->'noiseType') = 'array' then
    selected_noise_types := array(select jsonb_array_elements_text(payload->'noiseType'));
  else
    selected_noise_types := array[payload->>'noiseType'];
  end if;
  if incident_day > uk_now::date or incident_day < uk_now::date - interval '2 years' then
    raise exception 'Incident date is outside the allowed range';
  end if;
  if incident_day = uk_now::date
     and (payload->>'approximateTime')::time > uk_now::time then
    raise exception 'Incident time is in the future';
  end if;

  select id into location_id from public.broad_locations
  where name = payload->>'broadArea' and active = true;
  if location_id is null then raise exception 'Unknown area'; end if;

  new_reference := 'SAX-' || extract(year from incident_day)::int || '-' ||
    upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 6));
  contact_days := least(greatest(coalesce((payload->>'retentionDays')::int, 365), 30), 730);

  insert into public.incidents (
    reference, incident_date, approximate_time, broad_location_id, street_name,
    noise_type, duration, experienced_at, window_state, effects,
    disruption_level, frequency, report_timing, submission_fingerprint
  ) values (
    new_reference, incident_day, (payload->>'approximateTime')::time, location_id,
    nullif(trim(payload->>'streetName'), ''),
    selected_noise_types,
    payload->>'duration', payload->>'experiencedAt',
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
        l.name broad_area, i.street_name, i.noise_type, i.duration, i.experienced_at,
        i.window_state, i.effects, i.disruption_level, i.frequency, i.report_timing,
        i.status, i.submitted_at, d.name reporter_name, d.email reporter_email,
        c.comment private_comments, n.note admin_note,
        (
          select coalesce(array_agg(other.reference order by other.submitted_at), array[]::text[])
          from public.incidents other
          join private.reporter_details other_details on other_details.incident_id = other.id
          where other.id <> i.id
            and d.email is not null
            and other_details.email = d.email
            and other.incident_date = i.incident_date
            and other.broad_location_id = i.broad_location_id
            and coalesce(lower(other.street_name), '') = coalesce(lower(i.street_name), '')
            and abs(extract(epoch from (other.approximate_time - i.approximate_time))) <= 900
            and other.noise_type && i.noise_type
            and other.status not in ('duplicate', 'excluded', 'removed')
        ) possible_duplicates,
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

comment on view public.approved_reports is
  'Only approved, structured, non-personal report data. Never add free text or IDs.';
