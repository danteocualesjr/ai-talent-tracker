-- Security hardening: restrict public event reads and prevent billing self-upgrade

-- Only expose public events to anon/authenticated clients (private events via service role).
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events
  for select using (is_public = true);

-- Block org owners from updating billing-sensitive fields via the Supabase client.
create or replace function public.prevent_org_billing_self_upgrade()
returns trigger language plpgsql as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') = 'service_role' then
    return new;
  end if;

  if new.plan is distinct from old.plan
     or new.profile_limit is distinct from old.profile_limit
     or new.refresh_cadence is distinct from old.refresh_cadence
     or new.stripe_customer_id is distinct from old.stripe_customer_id
     or new.stripe_subscription_id is distinct from old.stripe_subscription_id then
    raise exception 'billing fields are managed by the system';
  end if;

  return new;
end;
$$;

drop trigger if exists organizations_billing_guard on public.organizations;
create trigger organizations_billing_guard
  before update on public.organizations
  for each row execute function public.prevent_org_billing_self_upgrade();
