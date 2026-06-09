-- Restrict event reads to public events only (anon key must not see private before/after data).
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events for select using (is_public = true);
