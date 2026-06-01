-- Restrict event reads: public feed events for everyone; private events only for orgs watching the profile.

drop policy if exists "events are readable" on public.events;

drop policy if exists "public events are readable" on public.events;
create policy "public events are readable" on public.events
  for select using (is_public = true);

drop policy if exists "events readable to watchers" on public.events;
create policy "events readable to watchers" on public.events
  for select using (
    profile_id in (
      select profile_id from public.watchlist_profiles
      where watchlist_id in (
        select id from public.watchlists where org_id in (select public.current_user_org_ids())
      )
    )
  );
