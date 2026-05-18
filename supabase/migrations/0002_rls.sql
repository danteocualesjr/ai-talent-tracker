-- Row Level Security policies

alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.watchlists enable row level security;
alter table public.watchlist_profiles enable row level security;
alter table public.notification_channels enable row level security;
alter table public.notification_deliveries enable row level security;

-- profiles, snapshots, events, labs are global-read; only service role writes.
alter table public.labs enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_snapshots enable row level security;
alter table public.events enable row level security;

-- ---- organizations ----
drop policy if exists "members can read their org" on public.organizations;
create policy "members can read their org" on public.organizations
  for select using (id in (select public.current_user_org_ids()));

drop policy if exists "owners can update their org" on public.organizations;
create policy "owners can update their org" on public.organizations
  for update using (
    id in (select org_id from public.org_members where user_id = auth.uid() and role in ('owner','admin'))
  );

-- ---- org_members ----
drop policy if exists "members read own memberships" on public.org_members;
create policy "members read own memberships" on public.org_members
  for select using (user_id = auth.uid() or org_id in (select public.current_user_org_ids()));

-- ---- watchlists ----
drop policy if exists "watchlists by org" on public.watchlists;
create policy "watchlists by org" on public.watchlists
  for all using (org_id in (select public.current_user_org_ids()))
  with check (org_id in (select public.current_user_org_ids()));

drop policy if exists "watchlist_profiles by org" on public.watchlist_profiles;
create policy "watchlist_profiles by org" on public.watchlist_profiles
  for all using (
    watchlist_id in (
      select id from public.watchlists where org_id in (select public.current_user_org_ids())
    )
  )
  with check (
    watchlist_id in (
      select id from public.watchlists where org_id in (select public.current_user_org_ids())
    )
  );

-- ---- notification channels ----
drop policy if exists "channels by org" on public.notification_channels;
create policy "channels by org" on public.notification_channels
  for all using (org_id in (select public.current_user_org_ids()))
  with check (org_id in (select public.current_user_org_ids()));

drop policy if exists "deliveries by org" on public.notification_deliveries;
create policy "deliveries by org" on public.notification_deliveries
  for select using (
    channel_id in (
      select id from public.notification_channels where org_id in (select public.current_user_org_ids())
    )
  );

-- ---- public read tables ----
drop policy if exists "labs are readable" on public.labs;
create policy "labs are readable" on public.labs for select using (true);

drop policy if exists "profiles are readable" on public.profiles;
create policy "profiles are readable" on public.profiles for select using (is_opted_out = false);

drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events for select using (true);

drop policy if exists "snapshots readable to org members" on public.profile_snapshots;
create policy "snapshots readable to org members" on public.profile_snapshots for select using (
  profile_id in (
    select profile_id from public.watchlist_profiles
    where watchlist_id in (
      select id from public.watchlists where org_id in (select public.current_user_org_ids())
    )
  )
);
