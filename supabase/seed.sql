-- Fictional development data only. Apply after the initial migration if wanted.
do $$
declare location_id uuid;
begin
  select id into location_id from public.broad_locations
  where name = 'Town centre and station';
  insert into public.incidents (
    reference, incident_date, approximate_time, broad_location_id, noise_type,
    duration, experienced_at, window_state, effects, disruption_level,
    frequency, report_timing, status, submission_fingerprint
  ) values (
    'SAX-2026-DEMO01', current_date - 2, '01:30', location_id, 'Engine noise or idling',
    '16-30 minutes', 'Indoors', 'Windows closed',
    array['Woke me or prevented sleep'], 'Very disruptive',
    'One or two days a week', 'Later the same day', 'approved', 'fictional-demo-01'
  ) on conflict do nothing;
end $$;
