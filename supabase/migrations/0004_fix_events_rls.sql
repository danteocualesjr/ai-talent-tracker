-- Restrict public event reads to is_public events only.
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events for select using (is_public = true);
