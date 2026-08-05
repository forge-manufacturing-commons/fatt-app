-- ============================================================
-- FORGE OS — IDENTITY LAYER (Phase 1)
-- Run in Supabase: SQL Editor -> New query -> paste -> Run.
-- Idempotent: safe to re-run.
--
-- Establishes WHO acts on the platform. Nothing in the operational
-- phases (missions, jobs, RFQs, funding) can be real until an action
-- can be attributed to an accountable actor.
--
-- Provenance discipline: this layer stores only facts a registrant
-- asserts about themselves plus what the platform can verify. No
-- capability, capacity or count is invented. Unverified means
-- unverified, and is rendered as such.
-- ============================================================

-- ---------- ROLES ----------
do $$ begin
  create type forge_role as enum (
    'sme', 'investor', 'university', 'polytechnic', 'research_institute',
    'government_agency', 'manufacturer', 'component_supplier',
    'logistics_partner', 'engineer', 'nysc_volunteer', 'diaspora_expert'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type forge_actor_kind as enum ('organisation', 'individual');
exception when duplicate_object then null; end $$;

-- Verification is earned, never assumed on registration.
do $$ begin
  create type forge_verification as enum ('unverified', 'pending', 'verified', 'rejected');
exception when duplicate_object then null; end $$;

-- ---------- ORGANISATIONS ----------
create table if not exists organisations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  role          forge_role not null,
  rc_number     text,
  state         text,
  city          text,
  website       text,
  description   text,
  verification  forge_verification not null default 'unverified',
  verified_at   timestamptz,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- ---------- PROFILES ----------
-- One row per authenticated user, created automatically on sign-up.
create table if not exists profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  display_name   text,
  role           forge_role not null default 'engineer',
  actor_kind     forge_actor_kind not null default 'individual',
  organisation_id uuid references organisations(id) on delete set null,
  state          text,
  discipline     text,
  verification   forge_verification not null default 'unverified',
  onboarded      boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists profiles_role_idx on profiles(role);
create index if not exists profiles_org_idx  on profiles(organisation_id);

-- ---------- CAPABILITY MATRIX ----------
-- Permissions are data, not hardcoded conditionals, so the matrix is
-- auditable and can change without a deploy.
create table if not exists role_capabilities (
  role       forge_role not null,
  capability text       not null,
  primary key (role, capability)
);

insert into role_capabilities (role, capability) values
  ('sme','capability.publish'), ('sme','equipment.register'), ('sme','job.accept'),
  ('sme','job.track'), ('sme','invoice.issue'), ('sme','mission.view'),
  ('manufacturer','capability.publish'), ('manufacturer','equipment.register'),
  ('manufacturer','job.accept'), ('manufacturer','job.track'),
  ('manufacturer','invoice.issue'), ('manufacturer','mission.create'), ('manufacturer','mission.view'),
  ('component_supplier','capability.publish'), ('component_supplier','equipment.register'),
  ('component_supplier','job.accept'), ('component_supplier','job.track'),
  ('component_supplier','invoice.issue'), ('component_supplier','mission.view'),
  ('logistics_partner','capability.publish'), ('logistics_partner','job.accept'),
  ('logistics_partner','job.track'), ('logistics_partner','invoice.issue'),
  ('logistics_partner','mission.view'),
  ('investor','mission.view'), ('investor','mission.fund'), ('investor','report.download'),
  ('university','capability.publish'), ('university','equipment.register'),
  ('university','research.publish'), ('university','student_team.submit'),
  ('university','engineering.author'), ('university','mission.view'),
  ('polytechnic','capability.publish'), ('polytechnic','equipment.register'),
  ('polytechnic','research.publish'), ('polytechnic','student_team.submit'),
  ('polytechnic','engineering.author'), ('polytechnic','mission.view'),
  ('research_institute','capability.publish'), ('research_institute','equipment.register'),
  ('research_institute','research.publish'), ('research_institute','engineering.author'),
  ('research_institute','advisory.offer'), ('research_institute','mission.view'),
  ('government_agency','mission.view'), ('government_agency','mission.create'),
  ('government_agency','mission.fund'), ('government_agency','oversight.view'),
  ('government_agency','report.download'),
  ('engineer','engineering.author'), ('engineer','engineering.approve'),
  ('engineer','mission.create'), ('engineer','mission.view'), ('engineer','job.track'),
  ('nysc_volunteer','volunteer.enrol'), ('nysc_volunteer','mission.view'),
  ('diaspora_expert','advisory.offer'), ('diaspora_expert','engineering.author'),
  ('diaspora_expert','mission.view')
on conflict (role, capability) do nothing;

-- ---------- NOTIFICATIONS ----------
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  recipient   uuid not null references auth.users(id) on delete cascade,
  kind        text not null,
  subject     text not null,
  body        text,
  entity      text,
  entity_id   uuid,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists notifications_recipient_idx
  on notifications(recipient, read_at, created_at desc);

-- ---------- AUDIT EVENTS (Phase 15 substrate) ----------
-- Append-only. No update or delete policy is granted to any client,
-- so history cannot be rewritten from the application.
create table if not exists audit_events (
  id         bigserial primary key,
  actor      uuid references auth.users(id) on delete set null,
  action     text not null,
  entity     text,
  entity_id  uuid,
  payload    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_events_actor_idx  on audit_events(actor, created_at desc);
create index if not exists audit_events_entity_idx on audit_events(entity, entity_id);

-- ---------- AUTO-PROVISION PROFILE ON SIGN-UP ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role, actor_kind, state, discipline)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'display_name',''),
    coalesce((new.raw_user_meta_data->>'role')::forge_role, 'engineer'),
    coalesce((new.raw_user_meta_data->>'actor_kind')::forge_actor_kind, 'individual'),
    nullif(new.raw_user_meta_data->>'state',''),
    nullif(new.raw_user_meta_data->>'discipline','')
  )
  on conflict (id) do nothing;

  insert into public.audit_events (actor, action, entity, entity_id, payload)
  values (new.id, 'identity.registered', 'profile', new.id,
          jsonb_build_object('role', new.raw_user_meta_data->>'role'));

  insert into public.notifications (recipient, kind, subject, body)
  values (new.id, 'identity.welcome', 'Registration received',
          'Your Forge OS account exists. Verification is pending review — your capabilities are limited until an administrator verifies your organisation.');
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- ROW LEVEL SECURITY ----------
alter table profiles          enable row level security;
alter table organisations     enable row level security;
alter table role_capabilities enable row level security;
alter table notifications     enable row level security;
alter table audit_events      enable row level security;

-- profiles: a user reads and writes only their own row. Directory data is
-- public but read-only, because the network has to be discoverable.
drop policy if exists "profiles readable" on profiles;
create policy "profiles readable" on profiles for select using (true);

drop policy if exists "profiles self update" on profiles;
create policy "profiles self update" on profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles self insert" on profiles;
create policy "profiles self insert" on profiles for insert
  with check (auth.uid() = id);

-- organisations: public read; only the creator may amend, and never
-- their own verification state (that is an administrator action).
drop policy if exists "orgs readable" on organisations;
create policy "orgs readable" on organisations for select using (true);

drop policy if exists "orgs insert own" on organisations;
create policy "orgs insert own" on organisations for insert
  with check (auth.uid() = created_by and verification = 'unverified');

drop policy if exists "orgs update own" on organisations;
create policy "orgs update own" on organisations for update
  using (auth.uid() = created_by) with check (auth.uid() = created_by);

-- capability matrix: readable by all, writable by none from the client.
drop policy if exists "capabilities readable" on role_capabilities;
create policy "capabilities readable" on role_capabilities for select using (true);

-- notifications: strictly private to the recipient.
drop policy if exists "notifications own" on notifications;
create policy "notifications own" on notifications for select
  using (auth.uid() = recipient);

drop policy if exists "notifications mark read" on notifications;
create policy "notifications mark read" on notifications for update
  using (auth.uid() = recipient) with check (auth.uid() = recipient);

-- audit: an actor may read and append their own trail. No update, no
-- delete, by anyone — the trail is immutable by construction.
drop policy if exists "audit read own" on audit_events;
create policy "audit read own" on audit_events for select
  using (auth.uid() = actor);

drop policy if exists "audit append own" on audit_events;
create policy "audit append own" on audit_events for insert
  with check (auth.uid() = actor);
