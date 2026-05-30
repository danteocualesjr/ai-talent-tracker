-- Tighten RLS: prevent self-service billing upgrades and hide private events.

-- Only public events are readable via the anon/authenticated client.
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events
  for select using (is_public = true);

-- Block authenticated users from mutating billing fields (service role / webhooks only).
create or replace function public.guard_org_billing_columns()
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
     or new.stripe_subscription_id is distinct from old.stripe_subscription_id then
    raise exception 'billing fields are managed by Stripe';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_org_billing_columns on public.organizations;
create trigger guard_org_billing_columns
  before update on public.organizations
  for each row execute function public.guard_org_billing_columns();
