-- Restrict direct Supabase client reads of events to public feed items only.
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events
  for select using (is_public = true);
