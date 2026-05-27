-- Harden RLS: restrict events visibility and block client-side billing field updates

drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events for select using (
  is_public = true
  or profile_id in (
    select profile_id from public.watchlist_profiles
    where watchlist_id in (
      select id from public.watchlists where org_id in (select public.current_user_org_ids())
    )
  )
);

create or replace function public.guard_org_billing_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    if new.plan is distinct from old.plan
       or new.profile_limit is distinct from old.profile_limit
       or new.refresh_cadence is distinct from old.refresh_cadence
       or new.stripe_customer_id is distinct from old.stripe_customer_id
       or new.stripe_subscription_id is distinct from old.stripe_subscription_id
    then
      raise exception 'billing fields cannot be updated directly';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_org_billing_fields on public.organizations;
create trigger guard_org_billing_fields
  before update on public.organizations
  for each row execute function public.guard_org_billing_fields();
