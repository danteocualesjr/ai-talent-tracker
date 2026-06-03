-- Restrict event reads to public events only (private org events via service role / app layer).
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events
  for select using (is_public = true);
