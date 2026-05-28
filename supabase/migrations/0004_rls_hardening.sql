-- Harden RLS: billing fields, public events only, watchlist limits

-- Org billing/plan fields are updated only via service role (Stripe webhooks, server actions).
drop policy if exists "owners can update their org" on public.organizations;

-- Only public events are readable via the anon/authenticated API.
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events for select using (is_public = true);

-- Enforce per-org profile limits on watchlist inserts.
create or replace function public.enforce_watchlist_profile_limit()
returns trigger
language plpgsql
as $$
declare
  org_id uuid;
  org_limit int;
  current_count int;
begin
  select w.org_id into org_id from public.watchlists w where w.id = new.watchlist_id;
  if org_id is null then
    raise exception 'watchlist not found';
  end if;

  select o.profile_limit into org_limit from public.organizations o where o.id = org_id;

  select count(*)::int into current_count
  from public.watchlist_profiles wp
  join public.watchlists w on w.id = wp.watchlist_id
  where w.org_id = org_id;

  if current_count >= org_limit then
    raise exception 'profile limit reached for organization';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_watchlist_profile_limit on public.watchlist_profiles;
create trigger enforce_watchlist_profile_limit
  before insert on public.watchlist_profiles
  for each row execute function public.enforce_watchlist_profile_limit();
