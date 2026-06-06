-- Restrict event visibility: public events for everyone, private events for org members only.

drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events
  for select using (is_public = true);

drop policy if exists "events readable to org members" on public.events;
create policy "events readable to org members" on public.events
  for select using (
    profile_id in (
      select wp.profile_id
      from public.watchlist_profiles wp
      join public.watchlists w on w.id = wp.watchlist_id
      where w.org_id in (select public.current_user_org_ids())
    )
  );
