-- Restrict event reads to public events only (prevents leaking private events via anon client).
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events for select using (is_public = true);

-- Prevent duplicate orgs per user from concurrent first-login races.
create unique index if not exists org_members_user_id_unique on public.org_members (user_id);
