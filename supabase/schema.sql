-- ============================================================
-- Forge-A-Truck-Thon — database schema
-- Run this in your Supabase project: SQL Editor -> New query -> paste -> Run
-- ============================================================

-- ---------- BUILDS ----------
-- One row per truck. Multi-tenant from day one so the record attempt
-- (many trucks) shares one schema.
create table if not exists builds (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  location     text,
  status       text not null default 'active',   -- active | complete | archived
  created_at   timestamptz not null default now()
);

-- ---------- PEOPLE / TEAMS ----------
-- Every participant. head_count for the GWR record falls out of this table.
create table if not exists people (
  id           uuid primary key default gen_random_uuid(),
  full_name    text not null,
  role         text not null,                    -- sme | hod | student | mentor | coordinator
  org          text,                             -- workshop / institution / company
  skills       text,
  build_id     uuid references builds(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ---------- COMPONENT JOBS ----------
-- THE KEIRETSU MAP, LIVE. Each row is one component family in one build.
-- This replaces the hand-typed component table.
create table if not exists component_jobs (
  id                 uuid primary key default gen_random_uuid(),
  build_id           uuid references builds(id) on delete cascade,
  name               text not null,              -- e.g. "Gas locker + plumbing"
  detail             text,
  category           text,                        -- chassis | body | kitchen | gas | electrical | livery
  owner_org          text,                        -- SME / workshop responsible
  stage              text not null default 'queued', -- queued | fabricating | qa | done
  safety_critical    boolean not null default false,
  signed_off_by      text,                        -- named engineer (required to close a safety-critical job)
  head_count         int not null default 1,      -- builders on this component (feeds record count)
  created_at         timestamptz not null default now()
);

-- ---------- DIASPORA INTAKE ----------
-- Three-tier: mentorship / in-kind / capital, kept as distinct lanes.
create table if not exists diaspora_leads (
  id           uuid primary key default gen_random_uuid(),
  lane         text not null,                    -- mentor | inkind | capital
  full_name    text not null,
  email        text not null,
  location     text,
  field        text,                             -- engineering field / donation type / backing range
  message      text,
  status       text not null default 'new',      -- new | contacted | active | declined
  created_at   timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Public can READ the showcase data and SUBMIT a diaspora lead.
-- Writes to the board require an authenticated user.
-- (Tighten per-role once you wire real auth — see comments.)
-- ============================================================
alter table builds          enable row level security;
alter table people          enable row level security;
alter table component_jobs  enable row level security;
alter table diaspora_leads  enable row level security;

-- public read (showcase + board are viewable)
create policy "public read builds"    on builds         for select using (true);
create policy "public read people"    on people         for select using (true);
create policy "public read jobs"      on component_jobs for select using (true);

-- public can submit a diaspora lead (the intake forms)
create policy "public insert leads"   on diaspora_leads for insert with check (true);

-- authenticated users can move jobs on the board
create policy "auth update jobs"      on component_jobs for update using (auth.role() = 'authenticated');
create policy "auth insert jobs"      on component_jobs for insert with check (auth.role() = 'authenticated');
create policy "auth manage people"    on people         for all    using (auth.role() = 'authenticated');
create policy "auth read leads"       on diaspora_leads for select using (auth.role() = 'authenticated');

-- ============================================================
-- SEED DATA — the NAWEDOAM build #1, eight component families
-- ============================================================
insert into builds (id, name, location, status) values
  ('00000000-0000-0000-0000-000000000001', 'NAWEDOAM — Build 1', 'Nigeria', 'active')
on conflict (id) do nothing;

insert into component_jobs (build_id, name, detail, category, owner_org, stage, safety_critical, head_count) values
  ('00000000-0000-0000-0000-000000000001', 'Donor chassis',         'Kei-class vehicle, prepped and reinforced',        'chassis',    'Automotive workshop',    'fabricating', true,  5),
  ('00000000-0000-0000-0000-000000000001', 'Body / facade panels',  'Folded cybertruck-style sheet-metal panels',       'body',       'Sheet-metal SME',        'fabricating', false, 6),
  ('00000000-0000-0000-0000-000000000001', 'Kitchen box shell',     'Six welded panels, no booleans',                   'kitchen',    'Sheet-metal SME',        'done',        false, 4),
  ('00000000-0000-0000-0000-000000000001', 'Gas locker + plumbing', '12.5kg LPG cylinder, sealed, vented',              'gas',        'Certified gas fitter',   'qa',          true,  3),
  ('00000000-0000-0000-0000-000000000001', 'House electrical',      '24V bank, accessories only, separate from traction','electrical', 'Solar / inverter SME',   'fabricating', false, 4),
  ('00000000-0000-0000-0000-000000000001', 'Cook line + oven',      'Red-glass hob, SUGGAR burners, LPG oven',          'kitchen',    'Stainless kitchen SME',  'done',        false, 5),
  ('00000000-0000-0000-0000-000000000001', 'Extraction / hood',     'Roof-ducted stack over the cook line',             'kitchen',    'Ventilation SME',        'queued',      false, 3),
  ('00000000-0000-0000-0000-000000000001', 'Ankara livery wrap',    'Wax-print graphics, both box sides',               'livery',     'Print / graphics SME',   'done',        false, 2)
on conflict do nothing;
