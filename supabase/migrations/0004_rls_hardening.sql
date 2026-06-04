-- Harden RLS: block client-side billing tampering and restrict event reads.

-- Organizations: no client-side updates (billing via service role / webhooks only).
drop policy if exists "owners can update their org" on public.organizations;

-- Events: public feed entries OR profiles on the user's org watchlists.
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events
  for select using (
    is_public = true
    or profile_id in (
      select wp.profile_id
      from public.watchlist_profiles wp
      join public.watchlists w on w.id = wp.watchlist_id
      where w.org_id in (select public.current_user_org_ids())
    )
  );
