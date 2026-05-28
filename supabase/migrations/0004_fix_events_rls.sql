-- Restrict event visibility: public events for everyone, private events only for watching orgs.
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events for select using (
  is_public = true
  or profile_id in (
    select wp.profile_id
    from public.watchlist_profiles wp
    join public.watchlists w on w.id = wp.watchlist_id
    where w.org_id in (select public.current_user_org_ids())
  )
);
