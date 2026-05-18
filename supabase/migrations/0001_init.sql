-- AI Talent Tracker - initial schema
-- Run with: supabase db push (or paste into the SQL editor)

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- Tenancy
-- ============================================================

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  plan text not null default 'free' check (plan in ('free','pro','team','enterprise')),
  profile_limit int not null default 5,
  refresh_cadence text not null default 'weekly' check (refresh_cadence in ('weekly','daily','hourly')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.org_members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- ============================================================
-- Labs (curated AI orgs)
-- ============================================================

create table if not exists public.labs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  domain text,
  logo_url text,
  description text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Profiles (canonical tracked person)
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  linkedin_url text unique not null,
  linkedin_handle text generated always as (
    lower(regexp_replace(linkedin_url, '^https?://(www\.)?linkedin\.com/in/([^/?#]+).*$', '\2'))
  ) stored,
  full_name text,
  headline text,
  current_company text,
  current_company_lab_id uuid references public.labs(id),
  current_title text,
  location text,
  avatar_url text,
  github_handle text,
  x_handle text,
  about text,
  status text not null default 'active' check (status in ('active','left','stealth','founder','unknown')),
  last_synced_at timestamptz,
  next_sync_at timestamptz,
  is_opted_out boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_lab_idx on public.profiles(current_company_lab_id);
create index if not exists profiles_next_sync_idx on public.profiles(next_sync_at) where is_opted_out = false;
create index if not exists profiles_status_idx on public.profiles(status);

-- ============================================================
-- Snapshots (append-only history for diffing)
-- ============================================================

create table if not exists public.profile_snapshots (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  source text not null,
  raw jsonb not null,
  fetched_at timestamptz not null default now(),
  content_hash text not null
);

create index if not exists snapshots_profile_idx on public.profile_snapshots(profile_id, fetched_at desc);
create unique index if not exists snapshots_unique on public.profile_snapshots(profile_id, content_hash);

-- ============================================================
-- Watchlists
-- ============================================================

create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.watchlist_profiles (
  watchlist_id uuid not null references public.watchlists(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  added_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  primary key (watchlist_id, profile_id)
);

create index if not exists watchlist_profiles_profile_idx on public.watchlist_profiles(profile_id);

-- ============================================================
-- Events (detected changes)
-- ============================================================

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in (
    'left_company',
    'joined_company',
    'went_stealth',
    'headline_signals_founding',
    'role_change_internal',
    'about_changed',
    'location_changed',
    'github_dark',
    'new_domain',
    'other'
  )),
  confidence numeric(3,2) not null default 0.5 check (confidence between 0 and 1),
  summary text not null,
  before jsonb,
  after jsonb,
  detected_at timestamptz not null default now(),
  is_public boolean not null default false
);

create index if not exists events_profile_idx on public.events(profile_id, detected_at desc);
create index if not exists events_public_idx on public.events(detected_at desc) where is_public = true;
create index if not exists events_type_idx on public.events(type);

-- ============================================================
-- Notification channels
-- ============================================================

create table if not exists public.notification_channels (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  type text not null check (type in ('email','slack','webhook')),
  config jsonb not null,
  is_active boolean not null default true,
  event_types text[] not null default array['left_company','went_stealth','headline_signals_founding'],
  created_at timestamptz not null default now()
);

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.notification_channels(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  status text not null check (status in ('queued','sent','failed','skipped')),
  error text,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  unique (channel_id, event_id)
);

-- ============================================================
-- Helpers
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

-- Convenience: which orgs the current user belongs to.
create or replace function public.current_user_org_ids() returns setof uuid
language sql security definer stable as $$
  select org_id from public.org_members where user_id = auth.uid();
$$;
