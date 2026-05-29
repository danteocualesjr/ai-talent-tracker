-- Tighten RLS and enforce watchlist limits at the database layer.

-- Billing fields must not be writable via the anon/authenticated client.
drop policy if exists "owners can update their org" on public.organizations;

-- Only public events are readable via the anon key.
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events
  for select using (is_public = true);

-- Enforce per-org distinct profile limits on direct client inserts.
create or replace function public.enforce_watchlist_profile_limit()
returns trigger
language plpgsql
as $$
declare
  v_org_id uuid;
  v_limit int;
  v_count int;
begin
  select w.org_id into v_org_id
  from public.watchlists w
  where w.id = new.watchlist_id;

  select o.profile_limit into v_limit
  from public.organizations o
  where o.id = v_org_id;

  select count(distinct wp.profile_id) into v_count
  from public.watchlist_profiles wp
  inner join public.watchlists w on w.id = wp.watchlist_id
  where w.org_id = v_org_id
    and wp.profile_id <> new.profile_id;

  if v_count >= v_limit then
    raise exception 'watchlist profile limit reached'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists watchlist_profiles_limit_check on public.watchlist_profiles;
create trigger watchlist_profiles_limit_check
  before insert on public.watchlist_profiles
  for each row execute function public.enforce_watchlist_profile_limit();
