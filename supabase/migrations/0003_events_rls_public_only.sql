-- Restrict anonymous/authenticated reads of events to the public feed only.
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events for select using (is_public = true);
