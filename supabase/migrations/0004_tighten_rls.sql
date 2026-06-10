-- Tighten overly permissive public read policies

drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events
  for select using (is_public = true);

drop policy if exists "profiles are readable" on public.profiles;
create policy "profiles are readable" on public.profiles
  for select using (
    is_opted_out = false
    and (
      id in (
        select wp.profile_id
        from public.watchlist_profiles wp
        join public.watchlists w on w.id = wp.watchlist_id
        where w.org_id in (select public.current_user_org_ids())
      )
      or id in (select profile_id from public.events where is_public = true)
      or current_company_lab_id is not null
    )
  );
