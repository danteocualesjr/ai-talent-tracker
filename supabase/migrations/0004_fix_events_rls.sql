-- Restrict public event reads to public events for non-opted-out profiles.
drop policy if exists "events are readable" on public.events;
create policy "events are readable" on public.events for select using (
  is_public = true
  and exists (
    select 1 from public.profiles p
    where p.id = profile_id and p.is_opted_out = false
  )
);
