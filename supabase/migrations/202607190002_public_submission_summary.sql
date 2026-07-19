create or replace function public.public_submission_summary()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with eligible as (
    select
      i.incident_date,
      i.noise_type,
      i.effects,
      l.name as broad_area
    from public.incidents i
    join public.broad_locations l on l.id = i.broad_location_id
    where i.status in ('pending', 'approved')
  ),
  monthly as (
    select to_char(incident_date, 'YYYY-MM') as month, count(*)::integer as total
    from eligible
    group by month
  ),
  noise_types as (
    select item.value as noise_type, count(*)::integer as total
    from eligible
    cross join lateral unnest(eligible.noise_type) as item(value)
    group by item.value
  ),
  broad_areas as (
    select broad_area, count(*)::integer as total
    from eligible
    group by broad_area
  )
  select jsonb_build_object(
    'total', (select count(*)::integer from eligible),
    'lastThirtyDays', (
      select count(*)::integer
      from eligible
      where incident_date >= current_date - 29
    ),
    'thisMonth', (
      select count(*)::integer
      from eligible
      where date_trunc('month', incident_date) = date_trunc('month', current_date)
    ),
    'sleepReports', (
      select count(*)::integer
      from eligible
      where effects && array[
        'Woke me or prevented sleep',
        'Disturbed a child''s sleep'
      ]::text[]
    ),
    'areasRepresented', (
      select count(distinct broad_area)::integer from eligible
    ),
    'latestMonth', (
      select to_char(max(incident_date), 'YYYY-MM') from eligible
    ),
    'byMonth', coalesce(
      (select jsonb_object_agg(month, total order by month) from monthly),
      '{}'::jsonb
    ),
    'byNoiseType', coalesce(
      (select jsonb_object_agg(noise_type, total order by noise_type) from noise_types),
      '{}'::jsonb
    ),
    'byBroadArea', coalesce(
      (select jsonb_object_agg(broad_area, total order by broad_area) from broad_areas),
      '{}'::jsonb
    )
  );
$$;

revoke all on function public.public_submission_summary() from public;
grant execute on function public.public_submission_summary() to anon, authenticated;

comment on function public.public_submission_summary() is
  'Anonymous grouped counts from pending and approved submissions. Never add rows, free text, street names, references, IDs, timestamps or personal data.';
