-- ============================================================
-- FORGE OS — LEGACY BASELINE  (E6.1 Supabase Contract Convergence)
--
-- WHY THIS FILE EXISTS.
-- `supabase/schema.sql` declares four tables, two of which the application
-- actively reads and writes today:
--
--   component_jobs   src/lib/supabase.js fetchJobs()  -> select *
--                    src/lib/supabase.js updateJobStage() -> update stage, signed_off_by
--                    consumed by BoardPreview.jsx (ROUTED) and Join.jsx (ROUTED)
--   diaspora_leads   src/lib/supabase.js submitLead() -> insert
--                    consumed by Join.jsx (ROUTED)
--
-- But schema.sql sits OUTSIDE supabase/migrations/, so the migration chain
-- cannot reproduce the database the code requires. A fresh `supabase db push`
-- against an empty project would create the identity layer and none of this,
-- and every one of those three call sites would fail at runtime. That is the
-- convergence defect this file closes.
--
-- FORWARD-ONLY AND ADDITIVE. Nothing is dropped, renamed or re-typed. Every
-- statement is `if not exists` or drop-guarded, so this is safe to apply to a
-- project where schema.sql was already run by hand — which is the likely state
-- of the linked project, since `002_identity.sql` does not match the CLI's
-- <timestamp>_name.sql convention and cannot have been applied by the CLI either.
--
-- WHAT IS DELIBERATELY NOT HERE.
--   * SEED DATA. schema.sql ends with one `builds` row and eight
--     `component_jobs` rows. Fixture rows must never be installed into a real
--     pilot database — that is precisely the seed/real confusion E5 and E6
--     forbid. They now live in supabase/seed.sql, which the CLI applies only to
--     a local `db reset` and never pushes to a remote project.
--   * ANY TABLE FOR KERNEL STATE. No events, components, missions,
--     specifications, machines, hubs or capabilities table is created here. The
--     event log and its projections are kernel-owned and in-memory by design;
--     giving them database tables would create a second source of truth for
--     manufacturing state and a second writer beside the event bus.
--   * DROPS OF ANYTHING. `people` has no reader anywhere in src/, and `builds`
--     is never selected — but both are retained. `builds` is the foreign-key
--     target of component_jobs.build_id and is structurally required; `people`
--     is a separate retirement decision and this pass is forward-only.
-- ============================================================

-- ---------- BUILDS ----------
-- Never read by application code. Retained because component_jobs.build_id
-- references it — dropping it would break a table the app does use.
create table if not exists builds (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  location     text,
  status       text not null default 'active',   -- active | complete | archived
  created_at   timestamptz not null default now()
);

-- ---------- PEOPLE ----------
-- No reader and no writer in src/. Retained, not dropped: see the header.
create table if not exists people (
  id           uuid primary key default gen_random_uuid(),
  full_name    text not null,
  role         text not null,
  org          text,
  skills       text,
  build_id     uuid references builds(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ---------- COMPONENT JOBS ----------
-- REQUIRED. Read by fetchJobs(), written by updateJobStage().
--
-- Note for the record: these rows are component FAMILIES ("Gas locker +
-- plumbing"), not component instances, and `owner_org` holds role descriptions
-- ("Sheet-metal SME") rather than organisation names. It is therefore NOT an
-- authority for manufacturing responsibility — see TRANSITIONAL.md D1/D3. The
-- table is declared here because code depends on it, not because it is
-- promoted to authority.
create table if not exists component_jobs (
  id                 uuid primary key default gen_random_uuid(),
  build_id           uuid references builds(id) on delete cascade,
  name               text not null,
  detail             text,
  category           text,                            -- chassis | body | kitchen | gas | electrical | livery
  owner_org          text,
  stage              text not null default 'queued',  -- queued | fabricating | qa | done
  safety_critical    boolean not null default false,
  signed_off_by      text,
  head_count         int not null default 1,
  partnership_open   boolean not null default false,
  stake_range        text,
  created_at         timestamptz not null default now()
);

-- ---------- DIASPORA LEADS ----------
-- REQUIRED. Insert-only from submitLead().
create table if not exists diaspora_leads (
  id           uuid primary key default gen_random_uuid(),
  lane         text not null,                    -- mentor | inkind | capital | partner
  target_sme   text,
  full_name    text not null,
  email        text not null,
  location     text,
  field        text,
  message      text,
  status       text not null default 'new',      -- new | contacted | active | declined
  created_at   timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
--
-- The policy SET is unchanged from schema.sql. The only difference is that each
-- one is now drop-guarded: schema.sql declared 8 policies with 0 guards, so
-- re-running it failed with duplicate_object and it could never be replayed as
-- a migration. Existing policy semantics are preserved exactly — this pass does
-- not tighten or loosen access, because changing an access rule while claiming
-- to fix migration hygiene would smuggle a security change into a chore.
-- ============================================================
alter table builds          enable row level security;
alter table people          enable row level security;
alter table component_jobs  enable row level security;
alter table diaspora_leads  enable row level security;

drop policy if exists "public read builds" on builds;
create policy "public read builds" on builds for select using (true);

drop policy if exists "public read people" on people;
create policy "public read people" on people for select using (true);

drop policy if exists "public read jobs" on component_jobs;
create policy "public read jobs" on component_jobs for select using (true);

-- Public submission is intentional: the intake form is open to the diaspora.
-- There is deliberately NO select policy for anonymous users, so a lead can be
-- written and never read back by the public.
drop policy if exists "public insert leads" on diaspora_leads;
create policy "public insert leads" on diaspora_leads for insert with check (true);

drop policy if exists "auth update jobs" on component_jobs;
create policy "auth update jobs" on component_jobs for update using (auth.role() = 'authenticated');

drop policy if exists "auth insert jobs" on component_jobs;
create policy "auth insert jobs" on component_jobs for insert with check (auth.role() = 'authenticated');

drop policy if exists "auth manage people" on people;
create policy "auth manage people" on people for all using (auth.role() = 'authenticated');

drop policy if exists "auth read leads" on diaspora_leads;
create policy "auth read leads" on diaspora_leads for select using (auth.role() = 'authenticated');
