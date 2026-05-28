-- Security hardening: RLS, event idempotency, org update restrictions

-- Restrict public event reads to published events only
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events
  for select using (is_public = true);

-- Org members may read events for profiles on their watchlists
drop policy if exists "org members read watched profile events" on public.events;
create policy "org members read watched profile events" on public.events
  for select using (
    profile_id in (
      select wp.profile_id
      from public.watchlist_profiles wp
      join public.watchlists w on w.id = wp.watchlist_id
      where w.org_id in (select public.current_user_org_ids())
    )
  );

-- Prevent self-service upgrades of billing fields via the browser client
drop policy if exists "owners can update their org" on public.organizations;
drop policy if exists "owners can update org name" on public.organizations;
create policy "owners can update org name" on public.organizations
  for update using (
    id in (select org_id from public.org_members where user_id = auth.uid() and role in ('owner','admin'))
  )
  with check (
    id in (select org_id from public.org_members where user_id = auth.uid() and role in ('owner','admin'))
  );

create or replace function public.restrict_org_update()
returns trigger language plpgsql as $$
begin
  if new.plan is distinct from old.plan
    or new.profile_limit is distinct from old.profile_limit
    or new.refresh_cadence is distinct from old.refresh_cadence
    or new.stripe_customer_id is distinct from old.stripe_customer_id
    or new.stripe_subscription_id is distinct from old.stripe_subscription_id
    or new.slug is distinct from old.slug
  then
    raise exception 'billing fields are managed by the service';
  end if;
  return new;
end;
$$;

drop trigger if exists organizations_restrict_billing on public.organizations;
create trigger organizations_restrict_billing
  before update on public.organizations
  for each row execute function public.restrict_org_update();

-- Idempotent event creation on Inngest retries
alter table public.events add column if not exists content_hash text;

create unique index if not exists events_profile_content_hash_idx
  on public.events(profile_id, content_hash)
  where content_hash is not null;
