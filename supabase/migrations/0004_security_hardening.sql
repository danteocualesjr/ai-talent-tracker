-- Harden RLS: prevent client-side billing bypass and private event leakage.

-- Block authenticated users from mutating billing columns on organizations.
create or replace function public.guard_org_billing_columns()
returns trigger
language plpgsql
as $$
begin
  if auth.role() = 'service_role' then
    return NEW;
  end if;

  if NEW.plan is distinct from OLD.plan
     or NEW.profile_limit is distinct from OLD.profile_limit
     or NEW.refresh_cadence is distinct from OLD.refresh_cadence
     or NEW.stripe_customer_id is distinct from OLD.stripe_customer_id
     or NEW.stripe_subscription_id is distinct from OLD.stripe_subscription_id then
    raise exception 'billing fields are read-only';
  end if;

  return NEW;
end;
$$;

drop trigger if exists guard_org_billing_columns on public.organizations;
create trigger guard_org_billing_columns
  before update on public.organizations
  for each row execute function public.guard_org_billing_columns();

-- Only expose public events globally; private events require watchlist membership.
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
