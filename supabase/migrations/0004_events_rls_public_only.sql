-- Restrict event reads to public events for anon/authenticated clients using the anon key.
-- Private events remain accessible via the service role (server-side admin client).

drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events
  for select
  using (is_public = true);
