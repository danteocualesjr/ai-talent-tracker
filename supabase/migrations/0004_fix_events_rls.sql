-- Restrict event reads: public events for everyone; private events only for watching org members.
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events for select using (
  is_public = true
  or profile_id in (
    select profile_id from public.watchlist_profiles
    where watchlist_id in (
      select id from public.watchlists where org_id in (select public.current_user_org_ids())
    )
  )
);
