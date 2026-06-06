-- Restrict event reads: public feed for anon, org-scoped for authenticated users.

drop policy if exists "events are readable" on public.events;

create policy "public events readable" on public.events
  for select to anon using (is_public = true);

create policy "org events readable" on public.events
  for select to authenticated using (
    profile_id in (
      select wp.profile_id
      from public.watchlist_profiles wp
      join public.watchlists w on w.id = wp.watchlist_id
      where w.org_id in (select public.current_user_org_ids())
    )
  );
