-- Restrict event reads: public feed only exposes is_public rows; org members see watched profiles.

drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events
  for select using (is_public = true);

drop policy if exists "events readable to org watchers" on public.events;
create policy "events readable to org watchers" on public.events
  for select using (
    profile_id in (
      select profile_id from public.watchlist_profiles
      where watchlist_id in (
        select id from public.watchlists where org_id in (select public.current_user_org_ids())
      )
    )
  );
