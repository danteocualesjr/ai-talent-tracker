-- Restrict event reads: public feed events are open; private events require org membership.

drop policy if exists "events are readable" on public.events;
create policy "public events are readable" on public.events for select using (is_public = true);

drop policy if exists "events readable to org members" on public.events;
create policy "events readable to org members" on public.events for select using (
  profile_id in (
    select profile_id from public.watchlist_profiles
    where watchlist_id in (
      select id from public.watchlists where org_id in (select public.current_user_org_ids())
    )
  )
);
