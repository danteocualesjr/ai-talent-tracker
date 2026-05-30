-- Restrict anonymous/authenticated reads of events to public rows only.
-- Server-side admin client continues to serve org-scoped private events.

drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events
  for select using (is_public = true);
