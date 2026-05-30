-- Restrict event reads: public feed only sees is_public events;
-- org members can read events for profiles on their watchlists.

drop policy if exists "events are readable" on public.events;
create policy "public events are readable" on public.events
  for select using (is_public = true);

drop policy if exists "org members read watched profile events" on public.events;
create policy "org members read watched profile events" on public.events
  for select using (
    profile_id in (
      select profile_id from public.watchlist_profiles
      where watchlist_id in (
        select id from public.watchlists where org_id in (select public.current_user_org_ids())
      )
    )
  );
