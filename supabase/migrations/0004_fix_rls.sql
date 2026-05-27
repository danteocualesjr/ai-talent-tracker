-- Tighten RLS: private events and billing fields

-- Only public events are globally readable; org members see events for watched profiles.
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events
  for select using (
    is_public = true
    or profile_id in (
      select profile_id from public.watchlist_profiles
      where watchlist_id in (
        select id from public.watchlists where org_id in (select public.current_user_org_ids())
      )
    )
  );

-- Billing/plan fields are updated only via service role (Stripe webhooks), not client SDK.
drop policy if exists "owners can update their org" on public.organizations;
