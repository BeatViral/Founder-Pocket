-- Founder Pocket Supabase setup: 03_policies_rpc.sql
-- Run this third, after 01_tables.sql and 02_indexes_triggers_rls.sql succeed.
-- It creates the RLS policies and public share-view RPC.
drop policy if exists "users manage own profile" on public.users;
create policy "users manage own profile" on public.users
  for all using (id = auth.uid()::text) with check (id = auth.uid()::text);

drop policy if exists "founder profiles manage own rows" on public.founder_profiles;
create policy "founder profiles manage own rows" on public.founder_profiles
  for all using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);

drop policy if exists "observations manage own rows" on public.observations;
create policy "observations manage own rows" on public.observations
  for all using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);

drop policy if exists "business scans manage own rows" on public.business_scans;
create policy "business scans manage own rows" on public.business_scans
  for all using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);

drop policy if exists "startup dossiers manage own rows" on public.startup_dossiers;
create policy "startup dossiers manage own rows" on public.startup_dossiers
  for all using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);

drop policy if exists "analytics insert from anon or users" on public.analytics_events;
create policy "analytics insert from anon or users" on public.analytics_events
  for insert with check (user_id is null or user_id = auth.uid()::text);

drop policy if exists "analytics read own rows" on public.analytics_events;
create policy "analytics read own rows" on public.analytics_events
  for select using (user_id is null or user_id = auth.uid()::text);

drop policy if exists "share links manage own dossier links" on public.share_links;
create policy "share links manage own dossier links" on public.share_links
  for all using (
    exists (
      select 1 from public.startup_dossiers
      where startup_dossiers.id = share_links.dossier_id
      and startup_dossiers.user_id = auth.uid()::text
    )
  )
  with check (
    exists (
      select 1 from public.startup_dossiers
      where startup_dossiers.id = share_links.dossier_id
      and startup_dossiers.user_id = auth.uid()::text
    )
  );

drop policy if exists "public can read active share links" on public.share_links;
create policy "public can read active share links" on public.share_links
  for select using (is_active and (expires_at is null or expires_at > now()));

drop policy if exists "public can read shared dossiers" on public.startup_dossiers;
create policy "public can read shared dossiers" on public.startup_dossiers
  for select using (
    exists (
      select 1 from public.share_links
      where share_links.dossier_id = startup_dossiers.id
      and share_links.is_active
      and (share_links.expires_at is null or share_links.expires_at > now())
    )
  );

drop policy if exists "public can record share views" on public.share_views;
create policy "public can record share views" on public.share_views
  for insert with check (
    exists (
      select 1 from public.share_links
      where share_links.id = share_views.share_link_id
      and share_links.is_active
      and (share_links.expires_at is null or share_links.expires_at > now())
    )
  );

create or replace function public.record_share_view(p_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_share_link_id text;
begin
  select id
    into v_share_link_id
    from public.share_links
   where token = p_token
     and is_active
     and (expires_at is null or expires_at > now())
   limit 1;

  if v_share_link_id is null then
    return;
  end if;

  update public.share_links
     set view_count = view_count + 1
   where id = v_share_link_id;

  insert into public.share_views(share_link_id)
  values (v_share_link_id);
end;
$$;

grant execute on function public.record_share_view(text) to anon, authenticated;

