-- Security hardening: billing field protection + tighter events RLS

-- Prevent authenticated clients from self-upgrading plan/billing fields.
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

  new.plan := old.plan;
  new.profile_limit := old.profile_limit;
  new.refresh_cadence := old.refresh_cadence;
  new.stripe_customer_id := old.stripe_customer_id;
  new.stripe_subscription_id := old.stripe_subscription_id;
  return new;
end;
$$;

drop trigger if exists guard_org_billing_columns on public.organizations;
create trigger guard_org_billing_columns
  before update on public.organizations
  for each row
  execute function public.guard_org_billing_columns();

-- Restrict event reads: public feed events OR events for profiles on the user's watchlists.
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
