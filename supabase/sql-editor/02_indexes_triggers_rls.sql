-- Founder Pocket Supabase setup: 02_indexes_triggers_rls.sql
-- Run this second, after 01_tables.sql succeeds. It creates indexes, updated_at triggers, and enables RLS.
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

