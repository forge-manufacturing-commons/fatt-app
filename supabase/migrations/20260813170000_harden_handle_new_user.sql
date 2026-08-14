-- ============================================================
-- FORGE OS — HARDEN handle_new_user  (E6.3, operation B)
--
-- SEPARATE FROM THE PROFILE RECONCILIATION ON PURPOSE. That correction was a
-- one-row DML fix to existing data and is not represented here; this migration
-- changes only function bodies. Nothing in the existing migration architecture
-- required combining them, so they are not combined.
--
-- WHAT WAS ALREADY FIXED, AND IS NOT CLAIMED HERE.
-- Migrations 20260813151259 / 20260813151328 already moved the blank check to
-- the correct side of the cast:
--
--     coalesce(nullif(new.raw_user_meta_data->>'role','')::public.forge_role, 'engineer')
--
-- so an EMPTY STRING role now resolves to NULL and then to the default instead
-- of raising 22P02. They also wrapped the audit and notification inserts in
-- their own exception blocks and added an outer handler, so side-effect failures
-- can no longer abort a sign-up. Those were the big ones and they are done.
--
-- WHAT IS STILL BROKEN, AND IS WHAT THIS MIGRATION FIXES.
--
-- 1. A NON-EMPTY BUT INVALID LABEL STILL RAISES.
--    '{"role":"not_a_role"}' survives nullif() and reaches the cast, which
--    raises 22P02. The outer `exception when others then return new` catches it,
--    so the sign-up succeeds — but the profile INSERT is abandoned and the user
--    ends up authenticated with no profile. That is precisely the failure mode
--    this whole pass exists to eliminate, and it is currently reachable from any
--    caller that sets metadata we do not control: the Admin API, an invite, an
--    OAuth provider mapping, or a hand-crafted signUp payload.
--
-- 2. WHITESPACE IS NOT BLANK. nullif(x,'') only matches the empty string, so
--    '{"role":"   "}' also reaches the cast and raises.
--
-- 3. FAILURES ARE SWALLOWED SILENTLY. `exception when others then null` leaves
--    no trace at all. A side effect must not abort sign-up, but it must not
--    vanish either — these now RAISE WARNING, which lands in the Postgres logs
--    while still allowing the transaction to complete.
--
-- 4. THE SIDE EFFECTS ARE NOT IDEMPOTENT. The profile insert is guarded by
--    `on conflict (id) do nothing`, but the audit and notification inserts are
--    unconditional, so a re-fire produces duplicate registration audits and
--    duplicate welcome notifications. Both are now existence-guarded.
--
-- APPROACH: MAKE THE CAST UNREACHABLE FOR BAD INPUT.
-- `public.forge_enum_label()` returns a label only if it is genuinely a member
-- of the target enum, and NULL otherwise. The cast is then applied to either a
-- known-good label or NULL, neither of which can raise. Invalid metadata
-- degrades to the schema default instead of destroying the profile.
--
-- It is a separate function rather than an inline CASE for one reason: it makes
-- the requirement testable. The absent / empty / whitespace / valid / invalid
-- cases can be asserted directly against the same expression the trigger uses,
-- with a pure SELECT and no writes to auth.users. See
-- supabase/diagnostics/handle_new_user_regression.sql.
--
-- SECURITY, UNCHANGED AND EXPLICIT.
--   * handle_new_user stays SECURITY DEFINER — it must insert into public.profiles
--     on behalf of a user who has no rights to it yet.
--   * search_path stays pinned to '' on both functions, so every single object
--     reference below is fully schema-qualified. An unqualified name would be a
--     privilege-escalation vector in a DEFINER function.
--   * forge_enum_label is SECURITY INVOKER and IMMUTABLE. It reads only the
--     system catalogs and needs no elevated rights, so it does not get any.
--   * auth.users ownership is NOT touched. The trigger itself is NOT dropped or
--     recreated — it already resolves handle_new_user() by name, so replacing
--     the body is sufficient and requires no privilege on the auth schema.
-- ============================================================

-- ---------- SAFE ENUM RESOLUTION ----------
create or replace function public.forge_enum_label(p_type text, p_value text)
returns text
language sql
immutable
security invoker
set search_path = ''
as $$
  select case
    -- absent, empty, or whitespace-only: not a claim about anything
    when nullif(pg_catalog.btrim(coalesce(p_value, '')), '') is null then null
    -- present and a real member of the enum: pass it through
    when exists (
      select 1
      from pg_catalog.pg_enum e
      join pg_catalog.pg_type t      on t.oid = e.enumtypid
      join pg_catalog.pg_namespace n on n.oid = t.typnamespace
      where n.nspname   = 'public'
        and t.typname   = p_type
        and e.enumlabel = pg_catalog.btrim(p_value)
    ) then pg_catalog.btrim(p_value)
    -- present but not a member: refuse the value, do not raise
    else null
  end;
$$;

comment on function public.forge_enum_label(text, text) is
  'Returns p_value trimmed if it is a label of public.<p_type>, else NULL. Lets a caller cast untrusted metadata to an enum without any possibility of 22P02.';

-- ---------- AUTO-PROVISION PROFILE ON SIGN-UP ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meta pg_catalog.jsonb := coalesce(new.raw_user_meta_data, '{}'::pg_catalog.jsonb);
begin
  -- THE PROFILE. Only `id` is truly required; everything else is either
  -- validated metadata or a schema default. organisation_id is deliberately
  -- absent so it stays NULL — an organisation is established by explicit
  -- onboarding and is never inferred from a registration payload.
  begin
    insert into public.profiles (id, display_name, role, actor_kind, state, discipline)
    values (
      new.id,
      nullif(pg_catalog.btrim(coalesce(v_meta->>'display_name', '')), ''),
      coalesce(
        public.forge_enum_label('forge_role', v_meta->>'role')::public.forge_role,
        'engineer'
      ),
      coalesce(
        public.forge_enum_label('forge_actor_kind', v_meta->>'actor_kind')::public.forge_actor_kind,
        'individual'
      ),
      nullif(pg_catalog.btrim(coalesce(v_meta->>'state', '')), ''),
      nullif(pg_catalog.btrim(coalesce(v_meta->>'discipline', '')), '')
    )
    on conflict (id) do nothing;
  exception when others then
    -- Should now be unreachable for metadata reasons. If it ever fires, the
    -- sign-up still completes and public.ensure_profile() will provision the
    -- profile on the user's first authenticated session — but we say so loudly
    -- rather than leaving a silent gap.
    raise warning 'handle_new_user: profile insert failed for % (%): %',
      new.id, sqlstate, sqlerrm;
  end;

  -- AUDIT. Existence-guarded so a re-fire cannot duplicate the registration
  -- record. Never allowed to abort the sign-up, never silent.
  begin
    insert into public.audit_events (actor, action, entity, entity_id, payload)
    select new.id, 'identity.registered', 'profile', new.id,
           pg_catalog.jsonb_build_object('role', v_meta->>'role')
    where not exists (
      select 1 from public.audit_events a
      where a.actor = new.id and a.action = 'identity.registered'
    );
  exception when others then
    raise warning 'handle_new_user: audit insert failed for % (%): %',
      new.id, sqlstate, sqlerrm;
  end;

  -- WELCOME NOTIFICATION. Same treatment.
  begin
    insert into public.notifications (recipient, kind, subject, body)
    select new.id, 'identity.welcome', 'Registration received',
           'Your Forge OS account exists. Verification is pending review — your capabilities are limited until an administrator verifies your organisation.'
    where not exists (
      select 1 from public.notifications n
      where n.recipient = new.id and n.kind = 'identity.welcome'
    );
  exception when others then
    raise warning 'handle_new_user: notification insert failed for % (%): %',
      new.id, sqlstate, sqlerrm;
  end;

  return new;

-- Final backstop. Authentication must never fail because identity provisioning
-- did. Reaching here is a defect, so it is reported before returning.
exception when others then
  raise warning 'handle_new_user: unexpected failure for % (%): %',
    new.id, pg_catalog.sqlstate, pg_catalog.sqlerrm;
  return new;
end;
$$;

comment on function public.handle_new_user() is
  'AFTER INSERT trigger on auth.users. Provisions public.profiles with validated metadata. Cannot raise on untrusted enum metadata and cannot abort a sign-up. Complements public.ensure_profile(), which covers users this trigger could not reach.';
