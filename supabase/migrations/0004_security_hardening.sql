-- Security hardening: RLS tightening and DB-enforced limits

-- Only public events are readable via the anon/authenticated API.
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events
  for select using (is_public = true);

-- Prevent self-service upgrades of billing fields (service role bypasses via trigger).
create or replace function public.guard_organization_billing_columns()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

  if new.plan is distinct from old.plan
     or new.profile_limit is distinct from old.profile_limit
     or new.refresh_cadence is distinct from old.refresh_cadence
     or new.stripe_customer_id is distinct from old.stripe_customer_id
     or new.stripe_subscription_id is distinct from old.stripe_subscription_id
  then
    raise exception 'billing fields are read-only';
  end if;

  return new;
end;
$$;

drop trigger if exists organizations_guard_billing on public.organizations;
create trigger organizations_guard_billing
  before update on public.organizations
  for each row execute function public.guard_organization_billing_columns();

-- Enforce per-org watchlist profile limits at insert time.
create or replace function public.enforce_watchlist_profile_limit()
returns trigger
language plpgsql
as $$
declare
  org_id uuid;
  lim int;
  cnt int;
begin
  select w.org_id, o.profile_limit into org_id, lim
  from public.watchlists w
  join public.organizations o on o.id = w.org_id
  where w.id = new.watchlist_id;

  select count(*)::int into cnt
  from public.watchlist_profiles wp
  join public.watchlists w on w.id = wp.watchlist_id
  where w.org_id = org_id;

  if cnt >= lim then
    raise exception 'profile limit reached for organization';
  end if;

  return new;
end;
$$;

drop trigger if exists watchlist_profiles_enforce_limit on public.watchlist_profiles;
create trigger watchlist_profiles_enforce_limit
  before insert on public.watchlist_profiles
  for each row execute function public.enforce_watchlist_profile_limit();
