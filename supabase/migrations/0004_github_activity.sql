-- GitHub commit activity tracking for github_dark signal detection

alter table public.profiles
  add column if not exists github_last_commit_at timestamptz,
  add column if not exists github_commits_30d int;
