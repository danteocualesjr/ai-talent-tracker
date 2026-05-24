-- Tighten RLS: scope private events to watchlists; block self-service billing upgrades.

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

-- Owners may rename their org; plan/billing fields are service-role only.
drop policy if exists "owners can update their org" on public.organizations;

create or replace function public.guard_org_billing_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') = 'service_role' then
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

drop trigger if exists guard_org_billing_columns on public.organizations;
create trigger guard_org_billing_columns
  before update on public.organizations
  for each row execute function public.guard_org_billing_columns();

create policy "owners can update their org" on public.organizations
  for update using (
    id in (select org_id from public.org_members where user_id = auth.uid() and role in ('owner', 'admin'))
  );
