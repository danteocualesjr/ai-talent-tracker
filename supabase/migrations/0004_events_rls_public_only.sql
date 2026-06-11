-- Restrict event reads to public events for anon/authenticated clients.
-- Private watchlist events remain accessible only via the service role.

drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events
  for select using (is_public = true);
