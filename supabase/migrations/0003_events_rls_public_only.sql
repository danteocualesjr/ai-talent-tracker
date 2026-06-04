-- Restrict event reads to public events only (non-public events are org-private via the app).

drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events
  for select using (is_public = true);
