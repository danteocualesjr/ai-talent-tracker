-- Restrict event reads to public events for anon/authenticated clients.
-- Service role bypasses RLS for internal jobs.

drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events
  for select using (is_public = true);
