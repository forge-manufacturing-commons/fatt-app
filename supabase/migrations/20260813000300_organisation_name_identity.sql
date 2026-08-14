-- ============================================================
-- FORGE OS — ORGANISATION NAME IDENTITY  (E6.1)
--
-- The only new DDL in this convergence pass. Everything else was already
-- declared correctly; the column-level contract check found ZERO gaps between
-- what src/ reads and what the schema declares.
--
-- WHAT THIS CLOSES.
-- `src/os/pilot.js` joins the database to the pilot configuration BY NAME,
-- because organisations.id is a per-deployment uuid that may not appear in
-- source (TRANSITIONAL.md D5):
--
--     organisations.name  ->  pilotOrganisationByName()  ->  event.organisation
--
-- `ensureOrganisation()` also relies on name identity to stay idempotent: it
-- looks up an existing row by (created_by, name) before inserting, and refuses
-- to adopt a name already held by another creator.
--
-- Both of those depend on a name identifying at most one organisation, and
-- nothing in the database enforced it. Two concurrent registrations could
-- create two "SOLC" rows, after which the name join is ambiguous and the pilot
-- resolves to whichever row the query happened to return. An application-level
-- guard cannot fix that; only the database can.
--
-- CASE-INSENSITIVE, because the resolver is. pilotOrganisationByName() lowercases
-- and trims before comparing, so "solc" and "SOLC" must not be two organisations
-- when they are one organisation to the code that reads them.
--
-- FORWARD-ONLY. Adds an index. Drops nothing, renames nothing, changes no
-- column type and no RLS policy.
--
-- IF THIS MIGRATION FAILS, IT IS TELLING YOU SOMETHING TRUE: the remote database
-- already contains two organisations whose names differ only by case or
-- whitespace. The guard below names them rather than leaving you with a bare
-- "could not create unique index". Resolve the duplicates, then re-run. Do not
-- weaken the index to make the push succeed — that would restore the ambiguity
-- the pilot identity chain depends on being absent.
-- ============================================================

-- ORDERING DEPENDENCY, made explicit rather than assumed.
-- This migration requires the identity layer to exist first. The identity DDL
-- lives in `002_identity.sql`, whose filename does NOT match the CLI's
-- <14-digit-timestamp>_name.sql convention, so the CLI cannot see or apply it.
-- Rename it to 20260813000200_identity.sql and it sorts between the legacy
-- baseline and this file. Verified empirically on 2026-08-13: the linked project
-- exposed ZERO tables, which is exactly what an unapplied identity layer looks
-- like. Failing with a legible message beats failing with "relation does not exist".
do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'organisations'
  ) then
    raise exception
      'Table public.organisations does not exist. The identity layer has not been applied — rename supabase/migrations/002_identity.sql to 20260813000200_identity.sql so the CLI applies it before this migration.';
  end if;
end $$;

do $$
declare
  dup text;
begin
  select string_agg(format('%s (%s rows)', nm, cnt), '; ')
    into dup
  from (
    select lower(btrim(name)) as nm, count(*) as cnt
    from organisations
    group by lower(btrim(name))
    having count(*) > 1
  ) d;

  if dup is not null then
    raise exception
      'Cannot enforce organisation name identity — duplicates exist: %. Resolve these before applying; do not relax the constraint.', dup;
  end if;
end $$;

create unique index if not exists organisations_name_identity_idx
  on organisations (lower(btrim(name)));

comment on index organisations_name_identity_idx is
  'Name identity for the pilot configuration join (src/os/pilot.js, TRANSITIONAL.md D5). Case- and whitespace-insensitive to match pilotOrganisationByName(). Remove only when organisations are resolved by uuid rather than by name.';
