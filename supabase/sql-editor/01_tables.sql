-- Founder Pocket Supabase setup: 01_tables.sql
-- Run this first in Supabase SQL Editor. It creates extensions, helper functions, and all app tables.
-- If a later file says a relation/table does not exist, this file did not run successfully from the top.
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

