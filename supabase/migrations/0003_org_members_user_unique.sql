-- One organization membership per user (prevents duplicate orgs on concurrent sign-in).
create unique index if not exists org_members_user_id_unique on public.org_members (user_id);
