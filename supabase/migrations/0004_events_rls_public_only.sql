-- Restrict event reads to public events; private events are service-role / app-server only.
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events for select using (is_public = true);
