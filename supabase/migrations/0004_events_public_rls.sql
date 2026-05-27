-- Restrict event reads to public events only (private events leak via anon key).
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events for select using (is_public = true);
