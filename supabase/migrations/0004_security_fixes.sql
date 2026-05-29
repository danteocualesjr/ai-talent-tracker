-- Restrict public event reads to public events only.
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events for select using (is_public = true);

-- One org per user (prevents duplicate org race on concurrent first login).
create unique index if not exists org_members_user_id_unique on public.org_members(user_id);
