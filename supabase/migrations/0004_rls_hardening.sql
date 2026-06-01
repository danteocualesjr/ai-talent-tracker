-- Harden RLS: block billing self-upgrade, watchlist limit bypass, and private event leaks.

-- ---- organizations: prevent clients from changing plan / billing fields ----
create or replace function public.guard_org_billing_columns()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') = 'service_role' then
    return new;
  end if;
  if new.plan is distinct from old.plan
     or new.profile_limit is distinct from old.profile_limit
     or new.refresh_cadence is distinct from old.refresh_cadence
     or new.stripe_customer_id is distinct from old.stripe_customer_id
     or new.stripe_subscription_id is distinct from old.stripe_subscription_id then
    raise exception 'cannot modify billing fields on organizations';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_org_billing_columns on public.organizations;
create trigger guard_org_billing_columns
  before update on public.organizations
  for each row execute function public.guard_org_billing_columns();

-- ---- watchlist_profiles: reads/deletes only; inserts via service role ----
drop policy if exists "watchlist_profiles by org" on public.watchlist_profiles;

create policy "watchlist_profiles select by org" on public.watchlist_profiles
  for select using (
    watchlist_id in (
      select id from public.watchlists where org_id in (select public.current_user_org_ids())
    )
  );

create policy "watchlist_profiles delete by org" on public.watchlist_profiles
  for delete using (
    watchlist_id in (
      select id from public.watchlists where org_id in (select public.current_user_org_ids())
    )
  );

-- ---- events: public feed or org watchlist only ----
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
