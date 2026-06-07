-- Restrict event reads to public events for anon/authenticated clients.
-- Private events remain readable via the service role (admin client).

drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events for select using (is_public = true);
