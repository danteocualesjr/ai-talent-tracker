-- Restrict anonymous reads of events to public departures only.
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events for select using (is_public = true);
