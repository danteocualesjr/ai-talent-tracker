-- Restrict event reads to public rows only (private org events are app-layer via service role).

drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events for select using (is_public = true);
