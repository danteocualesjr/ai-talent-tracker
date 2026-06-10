-- Tighten RLS: prevent billing self-upgrade and restrict private event reads.

-- Organizations: clients may read but not write billing fields (service role only).
drop policy if exists "owners can update their org" on public.organizations;

drop policy if exists "owners can update org name" on public.organizations;
create policy "owners can update org name" on public.organizations
  for update using (
    id in (
      select org_id from public.org_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  )
  with check (
    plan = (select o.plan from public.organizations o where o.id = organizations.id)
    and profile_limit = (select o.profile_limit from public.organizations o where o.id = organizations.id)
    and refresh_cadence = (select o.refresh_cadence from public.organizations o where o.id = organizations.id)
    and stripe_customer_id is not distinct from (
      select o.stripe_customer_id from public.organizations o where o.id = organizations.id
    )
    and stripe_subscription_id is not distinct from (
      select o.stripe_subscription_id from public.organizations o where o.id = organizations.id
    )
  );

-- Events: public feed events are open; private events only for orgs watching the profile.
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
