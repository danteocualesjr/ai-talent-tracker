-- Harden RLS: block self-service billing upgrades, scope events to public or own watchlist.

-- Prevent authenticated users from mutating billing fields on their org.
create or replace function public.guard_org_billing_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.plan is distinct from old.plan
     or new.profile_limit is distinct from old.profile_limit
     or new.refresh_cadence is distinct from old.refresh_cadence
     or new.stripe_customer_id is distinct from old.stripe_customer_id
     or new.stripe_subscription_id is distinct from old.stripe_subscription_id then
    raise exception 'billing fields cannot be updated by clients';
  end if;

  return new;
end;
$$;

drop trigger if exists organizations_guard_billing on public.organizations;
create trigger organizations_guard_billing
  before update on public.organizations
  for each row execute function public.guard_org_billing_columns();

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
