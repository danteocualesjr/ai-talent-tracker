-- Restrict event reads to public feed entries; private watchlist events require org membership via service role in app code.
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events for select using (is_public = true);
