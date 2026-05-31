-- Restrict event reads: public events for everyone; org-scoped events for members watching the profile.
drop policy if exists "events are readable" on public.events;

create policy "public events are readable"
  on public.events for select
  using (is_public = true);

create policy "org members read watched profile events"
  on public.events for select
  using (
    profile_id in (
      select wp.profile_id
      from public.watchlist_profiles wp
      join public.watchlists w on w.id = wp.watchlist_id
      where w.org_id in (select public.current_user_org_ids())
    )
  );
