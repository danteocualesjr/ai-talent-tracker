-- Tighten RLS: stop leaking private events and self-service plan upgrades.

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

drop policy if exists "owners can update their org" on public.organizations;
create policy "owners can update safe org fields" on public.organizations
  for update using (
    id in (
      select org_id from public.org_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  )
  with check (
    plan is not distinct from (select o.plan from public.organizations o where o.id = organizations.id)
    and profile_limit is not distinct from (
      select o.profile_limit from public.organizations o where o.id = organizations.id
    )
    and refresh_cadence is not distinct from (
      select o.refresh_cadence from public.organizations o where o.id = organizations.id
    )
    and stripe_customer_id is not distinct from (
      select o.stripe_customer_id from public.organizations o where o.id = organizations.id
    )
    and stripe_subscription_id is not distinct from (
      select o.stripe_subscription_id from public.organizations o where o.id = organizations.id
    )
  );

create unique index if not exists organizations_stripe_customer_id_key
  on public.organizations (stripe_customer_id)
  where stripe_customer_id is not null;
