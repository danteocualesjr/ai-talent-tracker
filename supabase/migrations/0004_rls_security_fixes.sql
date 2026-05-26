-- Security fixes: billing column protection, watchlist limits, event visibility

-- Prevent authenticated users from self-upgrading plan via direct Supabase updates.
create or replace function public.protect_org_billing_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    new.plan := old.plan;
    new.profile_limit := old.profile_limit;
    new.refresh_cadence := old.refresh_cadence;
    new.stripe_customer_id := old.stripe_customer_id;
    new.stripe_subscription_id := old.stripe_subscription_id;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_org_billing_columns on public.organizations;
create trigger protect_org_billing_columns
  before update on public.organizations
  for each row execute function public.protect_org_billing_columns();

-- Enforce profile_limit when adding to a watchlist (server actions are not the only path).
create or replace function public.enforce_watchlist_profile_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  org_id uuid;
  profile_limit int;
  current_count int;
begin
  select w.org_id into org_id from public.watchlists w where w.id = new.watchlist_id;
  if org_id is null then
    raise exception 'watchlist not found';
  end if;

  select o.profile_limit into profile_limit from public.organizations o where o.id = org_id;

  select count(*)::int into current_count
  from public.watchlist_profiles wp
  join public.watchlists w on w.id = wp.watchlist_id
  where w.org_id = org_id;

  if current_count >= profile_limit then
    raise exception 'profile limit reached for organization';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_watchlist_profile_limit on public.watchlist_profiles;
create trigger enforce_watchlist_profile_limit
  before insert on public.watchlist_profiles
  for each row execute function public.enforce_watchlist_profile_limit();

-- Restrict event reads: public events OR events for profiles on the user's watchlist.
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
