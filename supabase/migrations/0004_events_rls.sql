-- Restrict event reads: public events for everyone; org members see events for watched profiles.

drop policy if exists "events are readable" on public.events;

create policy "public events are readable" on public.events
  for select using (is_public = true);

create policy "org members read watched profile events" on public.events
  for select using (
    profile_id in (
      select profile_id from public.watchlist_profiles
      where watchlist_id in (
        select id from public.watchlists where org_id in (select public.current_user_org_ids())
      )
    )
  );
