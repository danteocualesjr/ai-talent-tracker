-- Restrict event reads to public events or profiles on the user's watchlists.

drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events
  for select using (
    is_public = true
    OR profile_id IN (
      SELECT wp.profile_id
      FROM public.watchlist_profiles wp
      JOIN public.watchlists w ON w.id = wp.watchlist_id
      WHERE w.org_id IN (SELECT public.current_user_org_ids())
    )
  );
