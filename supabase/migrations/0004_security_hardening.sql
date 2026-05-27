-- Security hardening: billing fields, event visibility, unique Stripe customers

-- Prevent duplicate Stripe customer IDs mapping to multiple orgs
create unique index if not exists organizations_stripe_customer_id_unique
  on public.organizations (stripe_customer_id)
  where stripe_customer_id is not null;

-- One org per user (prevents duplicate org race on concurrent signups)
create unique index if not exists org_members_user_id_unique
  on public.org_members (user_id);

-- Billing/plan fields must not be self-service upgraded via the browser client
drop policy if exists "owners can update their org" on public.organizations;

-- Events: public feed only, or profiles on the user's watchlists
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
