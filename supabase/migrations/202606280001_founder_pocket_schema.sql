create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id text primary key,
  auth_user_id uuid,
  name text not null,
  email text not null unique,
  password_hash text,
  role text not null default 'user' check (role in ('user', 'admin')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.founder_profiles (
  id text primary key,
  user_id text not null,
  background text,
  role_type text,
  industry text,
  years_experience int,
  strengths jsonb not null default '[]'::jsonb,
  communication_style text,
  risk_comfort text,
  validation_comfort text,
  technical_ability text,
  network_access text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.observations (
  id text primary key,
  user_id text,
  text text not null,
  context text,
  where_noticed text,
  intent text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_scans (
  id text primary key,
  user_id text,
  observation_id text,
  summary text,
  signal_types jsonb not null default '[]'::jsonb,
  affected_groups jsonb not null default '[]'::jsonb,
  current_workarounds jsonb not null default '[]'::jsonb,
  business_potential_score int not null default 0,
  status text,
  strong_signals jsonb not null default '[]'::jsonb,
  weak_signals jsonb not null default '[]'::jsonb,
  missing_proof jsonb not null default '[]'::jsonb,
  recommended_next_step text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_angles (
  id text primary key,
  scan_id text not null,
  name text not null,
  one_line_description text,
  who_it_helps text,
  who_might_pay text,
  why_it_might_work text,
  first_version text,
  business_type text,
  difficulty int,
  potential int,
  risk int,
  founder_fit int,
  recommended_next_step text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.proof_checks (
  id text primary key,
  user_id text,
  business_angle_id text,
  proof_strength int default 0,
  buyer_clarity int default 0,
  mvp_clarity int default 0,
  risk_awareness int default 0,
  sendability int default 0,
  missing_proof jsonb not null default '[]'::jsonb,
  summary text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.proof_answers (
  id text primary key,
  proof_check_id text not null,
  question text not null,
  answer text,
  helper_text text,
  score_signal text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.startup_dossiers (
  id text primary key,
  user_id text,
  observation_id text,
  business_angle_id text,
  proof_check_id text,
  startup_name text not null,
  one_liner text,
  status text,
  readiness_score int not null default 0,
  founder_fit_score int not null default 0,
  visibility text not null default 'private' check (visibility in ('private', 'unlisted', 'public')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dossier_sections (
  id text primary key,
  dossier_id text not null,
  section_type text not null,
  title text not null,
  content text not null,
  order_index int not null default 0,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.validation_tasks (
  id text primary key,
  dossier_id text not null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'doing', 'done', 'blocked')),
  evidence_type text,
  evidence_url text,
  notes text,
  due_date timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.share_links (
  id text primary key,
  dossier_id text not null,
  token text not null unique,
  mode text not null check (mode in ('full', 'investor', 'builder', 'accelerator')),
  is_active boolean not null default true,
  expires_at timestamptz,
  view_count int not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.share_views (
  id text primary key default gen_random_uuid()::text,
  share_link_id text not null,
  viewed_at timestamptz not null default now(),
  referrer text,
  user_agent text,
  ip_hash text
);

create table if not exists public.export_records (
  id text primary key default gen_random_uuid()::text,
  dossier_id text not null,
  export_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id text primary key,
  user_id text,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_settings (
  id text primary key default gen_random_uuid()::text,
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_jobs (
  id text primary key default gen_random_uuid()::text,
  user_id text,
  job_type text not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed')),
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_business_scans_user_id on public.business_scans(user_id);
create index if not exists idx_startup_dossiers_user_id on public.startup_dossiers(user_id);
create index if not exists idx_share_links_token on public.share_links(token);
create index if not exists idx_analytics_events_event_name on public.analytics_events(event_name);

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at before update on public.users for each row execute function public.set_updated_at();
drop trigger if exists set_founder_profiles_updated_at on public.founder_profiles;
create trigger set_founder_profiles_updated_at before update on public.founder_profiles for each row execute function public.set_updated_at();
drop trigger if exists set_observations_updated_at on public.observations;
create trigger set_observations_updated_at before update on public.observations for each row execute function public.set_updated_at();
drop trigger if exists set_business_scans_updated_at on public.business_scans;
create trigger set_business_scans_updated_at before update on public.business_scans for each row execute function public.set_updated_at();
drop trigger if exists set_startup_dossiers_updated_at on public.startup_dossiers;
create trigger set_startup_dossiers_updated_at before update on public.startup_dossiers for each row execute function public.set_updated_at();
drop trigger if exists set_share_links_updated_at on public.share_links;
create trigger set_share_links_updated_at before update on public.share_links for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.founder_profiles enable row level security;
alter table public.observations enable row level security;
alter table public.business_scans enable row level security;
alter table public.business_angles enable row level security;
alter table public.proof_checks enable row level security;
alter table public.proof_answers enable row level security;
alter table public.startup_dossiers enable row level security;
alter table public.dossier_sections enable row level security;
alter table public.validation_tasks enable row level security;
alter table public.share_links enable row level security;
alter table public.share_views enable row level security;
alter table public.export_records enable row level security;
alter table public.analytics_events enable row level security;
alter table public.admin_settings enable row level security;
alter table public.ai_jobs enable row level security;

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
