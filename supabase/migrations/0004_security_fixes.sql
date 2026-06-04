-- Security fixes: prevent client-side billing bypass and restrict event visibility

-- Block org owners from self-upgrading plan/limit/cadence via the anon key.
create or replace function public.guard_org_billing_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') = 'service_role' then
    return NEW;
  end if;

  if NEW.plan is distinct from OLD.plan
     or NEW.profile_limit is distinct from OLD.profile_limit
     or NEW.refresh_cadence is distinct from OLD.refresh_cadence
     or NEW.stripe_customer_id is distinct from OLD.stripe_customer_id
     or NEW.stripe_subscription_id is distinct from OLD.stripe_subscription_id then
    raise exception 'billing fields cannot be updated by clients';
  end if;

  return NEW;
end;
$$;

drop trigger if exists guard_org_billing on public.organizations;
create trigger guard_org_billing
  before update on public.organizations
  for each row execute function public.guard_org_billing_fields();

-- Only expose public events or events for profiles on the user's watchlist.
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events for select using (
  is_public = true
  or profile_id in (
    select wp.profile_id
    from public.watchlist_profiles wp
    join public.watchlists w on w.id = wp.watchlist_id
    where w.org_id in (select public.current_user_org_ids())
  )
);
