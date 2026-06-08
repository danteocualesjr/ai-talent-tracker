-- Restrict event visibility: public feed events for everyone, private events for org watchlist members only.

drop policy if exists "events are readable" on public.events;

drop policy if exists "public events are readable" on public.events;
create policy "public events are readable" on public.events
  for select using (is_public = true);

drop policy if exists "org members read watchlist events" on public.events;
create policy "org members read watchlist events" on public.events
  for select using (
    profile_id in (
      select profile_id from public.watchlist_profiles
      where watchlist_id in (
        select id from public.watchlists where org_id in (select public.current_user_org_ids())
      )
    )
  );
