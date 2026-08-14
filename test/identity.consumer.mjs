// ============================================================
// FORGE OS — IDENTITY RELIABILITY HARNESS  (E6.2)
//
// Exercises the real resolveProfile() against a fake Supabase client, so every
// branch of session resolution is verified rather than asserted. The fake
// records what was called, which is how the "never insert from the browser" and
// "never call the RPC unauthenticated" claims are proved rather than trusted.
//
// The RPC contract these tests encode was read from the live database with
// pg_get_functiondef, not from a migration file:
//
//   public.ensure_profile() RETURNS profiles
//     SECURITY DEFINER, search_path = ''
//     insert into public.profiles (id) values (auth.uid()) on conflict do nothing
//     select * into result from public.profiles where id = auth.uid()
//
// Run: node test/identity.consumer.mjs
// ============================================================

import { readFileSync } from "node:fs";
import { resolveProfile, RESOLUTION, PROFILE_COLUMNS, isAuthenticated }
  from "../src/os/profileResolver.js";
import { linkProfileToOrganisation, LINK_OUTCOME, isEstablished, shouldAudit }
  from "../src/os/organisationLink.js";
import { stripComments } from "./lib/source.mjs";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log(`  ok   ${n}`); } else { fail++; console.log(`  FAIL ${n}`); } };

const UID = "32dcbc1f-b053-49b8-8b39-db122e95ab64";     // the real auth.users id
const SESSION = { user: { id: UID }, access_token: "jwt.header.payload" };

// A profile exactly as the schema defaults it: id set, everything else default,
// organisation_id NULL.
const DEFAULTED = Object.freeze({
  id: UID, display_name: null, role: "engineer", actor_kind: "individual",
  organisation_id: null, state: null, discipline: null,
  verification: "unverified", onboarded: false,
});

/**
 * Fake client. Records every call so the tests can assert on what did NOT
 * happen, which is most of the point.
 */
function fakeClient({ selectRow = null, selectError = null, selectThrows = false,
                      rpcRow = undefined, rpcError = null, rpcThrows = false } = {}) {
  const calls = { select: 0, rpc: 0, inserts: 0, tables: [], columns: [], rpcNames: [], filters: [] };
  return {
    calls,
    from(table) {
      calls.tables.push(table);
      return {
        select(cols) {
          calls.select++; calls.columns.push(cols);
          return {
            eq(col, val) {
              calls.filters.push(`${col}=${val}`);
              return {
                async maybeSingle() {
                  if (selectThrows) throw new Error("network down");
                  return { data: selectRow, error: selectError };
                },
              };
            },
          };
        },
        insert() { calls.inserts++; throw new Error("the browser must never insert into profiles"); },
        upsert() { calls.inserts++; throw new Error("the browser must never upsert profiles"); },
      };
    },
    async rpc(name) {
      calls.rpc++; calls.rpcNames.push(name);
      if (rpcThrows) throw new Error("rpc transport failure");
      return { data: rpcRow, error: rpcError };
    },
  };
}

const guard = () => {
  const seen = new Set();
  return { hasAttempted: (id) => seen.has(id), markAttempted: (id) => seen.add(id), seen };
};

console.log("\nFORGE OS — identity reliability (ensure_profile wiring)\n");

// ============================================================
console.log("CASE 1 — authenticated user WITH an existing profile");
// ============================================================
{
  const c = fakeClient({ selectRow: DEFAULTED });
  const r = await resolveProfile({ configured: true, session: SESSION, client: c, ...guard() });

  ok("outcome is EXISTING", r.outcome === RESOLUTION.EXISTING);
  ok("the profile is returned", r.profile?.id === UID);
  ok("no error", r.error === null);
  ok("the RPC was NOT called — an existing profile needs no provisioning", c.calls.rpc === 0);
  ok("exactly one read was issued", c.calls.select === 1);
  ok("it read the profiles table", c.calls.tables.join() === "profiles");
  ok("it filtered by the authenticated id", c.calls.filters.join() === `id=${UID}`);
  ok("it requested the canonical column list", c.calls.columns[0] === PROFILE_COLUMNS);
  ok("nothing was inserted from the browser", c.calls.inserts === 0);
}

// ============================================================
console.log("\nCASE 2 — authenticated user whose profile is MISSING");
// ============================================================
{
  const c = fakeClient({ selectRow: null, rpcRow: DEFAULTED });
  const g = guard();
  const r = await resolveProfile({ configured: true, session: SESSION, client: c, ...g });

  ok("outcome is ENSURED", r.outcome === RESOLUTION.ENSURED);
  ok("the RPC was called exactly once", c.calls.rpc === 1);
  ok("it called ensure_profile by name", c.calls.rpcNames.join() === "ensure_profile");
  ok("the provisioned profile is returned", r.profile?.id === UID);
  ok("calledRpc is reported to the caller", r.calledRpc === true);
  ok("no error", r.error === null);
  ok("the browser still performed NO insert", c.calls.inserts === 0);
  ok("the attempt was recorded in the loop guard", g.hasAttempted(UID) === true);

  // A composite RETURN could arrive wrapped; the resolver must cope.
  const c2 = fakeClient({ selectRow: null, rpcRow: [DEFAULTED] });
  const r2 = await resolveProfile({ configured: true, session: SESSION, client: c2, ...guard() });
  ok("an array-wrapped RPC row is unwrapped", r2.outcome === RESOLUTION.ENSURED && r2.profile?.id === UID);
}

// ============================================================
console.log("\nCASE 3 — unauthenticated session");
// ============================================================
{
  for (const [label, session] of [
    ["null session", null],
    ["session with no user", { access_token: "t" }],
    ["session with no access token", { user: { id: UID } }],
    ["session with an empty user id", { user: { id: "" }, access_token: "t" }],
  ]) {
    const c = fakeClient({ selectRow: DEFAULTED, rpcRow: DEFAULTED });
    const r = await resolveProfile({ configured: true, session, client: c, ...guard() });
    ok(`${label} -> UNAUTHENTICATED`, r.outcome === RESOLUTION.UNAUTHENTICATED);
    ok(`${label} -> profile is null`, r.profile === null);
    ok(`${label} -> NO rpc call (ensure_profile has no anon grant)`, c.calls.rpc === 0);
    ok(`${label} -> NO read either`, c.calls.select === 0);
  }
  ok("isAuthenticated demands both a user id and an access token",
     isAuthenticated(SESSION) === true && isAuthenticated({ user: { id: UID } }) === false);
}

// ============================================================
console.log("\nCASE 4 — Supabase not configured");
// ============================================================
{
  const c = fakeClient({ selectRow: DEFAULTED, rpcRow: DEFAULTED });
  const r = await resolveProfile({ configured: false, session: SESSION, client: c, ...guard() });
  ok("outcome is NOT_CONFIGURED", r.outcome === RESOLUTION.NOT_CONFIGURED);
  ok("profile is null", r.profile === null);
  ok("no error is raised — demo mode is a legitimate state", r.error === null);
  ok("NOTHING was called against the client", c.calls.select === 0 && c.calls.rpc === 0);
  ok("configured=false wins even with a valid session", r.outcome === RESOLUTION.NOT_CONFIGURED);
}

// ============================================================
console.log("\nCASE 5 — RPC failure is explicit, never swallowed");
// ============================================================
{
  const c = fakeClient({ selectRow: null, rpcError: { message: "permission denied for function ensure_profile" } });
  const r = await resolveProfile({ configured: true, session: SESSION, client: c, ...guard() });
  ok("outcome is RPC_FAILED", r.outcome === RESOLUTION.RPC_FAILED);
  ok("profile is null", r.profile === null);
  ok("the error is populated", typeof r.error === "string" && r.error.length > 0);
  ok("the error names the function", /ensure_profile/.test(r.error));
  ok("the error carries the database's own message", /permission denied/.test(r.error));

  const thrown = fakeClient({ selectRow: null, rpcThrows: true });
  const rt = await resolveProfile({ configured: true, session: SESSION, client: thrown, ...guard() });
  ok("a thrown transport error is caught and reported, not propagated",
     rt.outcome === RESOLUTION.RPC_FAILED && /rpc transport failure/.test(rt.error));

  const empty = fakeClient({ selectRow: null, rpcRow: null });
  const re = await resolveProfile({ configured: true, session: SESSION, client: empty, ...guard() });
  ok("an RPC that returns no row is RPC_EMPTY, not silent success",
     re.outcome === RESOLUTION.RPC_EMPTY && re.profile === null && re.error.length > 0);

  const selErr = fakeClient({ selectError: { message: "JWT expired" } });
  const rs = await resolveProfile({ configured: true, session: SESSION, client: selErr, ...guard() });
  ok("a failed READ is SELECT_FAILED and does not trigger the RPC",
     rs.outcome === RESOLUTION.SELECT_FAILED && selErr.calls.rpc === 0);
  ok("the read error is surfaced", /JWT expired/.test(rs.error));

  const selThrow = fakeClient({ selectThrows: true });
  const rst = await resolveProfile({ configured: true, session: SESSION, client: selThrow, ...guard() });
  ok("a thrown read is caught and reported", rst.outcome === RESOLUTION.SELECT_FAILED && /network down/.test(rst.error));
}

// ============================================================
console.log("\nCASE 6 — organisation_id stays NULL until explicitly established");
// ============================================================
{
  const c = fakeClient({ selectRow: null, rpcRow: DEFAULTED });
  const r = await resolveProfile({ configured: true, session: SESSION, client: c, ...guard() });
  ok("a freshly provisioned profile has organisation_id NULL", r.profile.organisation_id === null);
  ok("no organisation was assigned", !("organisation" in r.profile));

  // Nothing in the resolution path may infer an organisation from identity data.
  const rich = { user: { id: UID, email: "forgeatruck@gmail.com",
                         user_metadata: { display_name: "SOLC", role: "sme", state: "Delta",
                                          actor_kind: "organisation" } },
                 access_token: "t" };
  const c2 = fakeClient({ selectRow: null, rpcRow: DEFAULTED });
  const r2 = await resolveProfile({ configured: true, session: rich, client: c2, ...guard() });
  ok("an email of forgeatruck@gmail.com does NOT produce an organisation",
     r2.profile.organisation_id === null);
  ok("display_name 'SOLC' in metadata does NOT link the SOLC organisation",
     r2.profile.organisation_id === null);
  ok("role 'sme' does NOT imply an organisation", r2.profile.organisation_id === null);
  ok("actor_kind 'organisation' does NOT create one", r2.profile.organisation_id === null);
  ok("the RPC is called with NO arguments — identity comes from auth.uid()",
     c2.calls.rpcNames.join() === "ensure_profile");

  // An existing link must be preserved, not reset, by a later resolution.
  const linked = { ...DEFAULTED, organisation_id: "10ce25cd-2c35-4093-ad52-fb7099642f1a",
                   role: "sme", actor_kind: "organisation" };
  const c3 = fakeClient({ selectRow: linked });
  const r3 = await resolveProfile({ configured: true, session: SESSION, client: c3, ...guard() });
  ok("an established organisation link survives resolution",
     r3.profile.organisation_id === "10ce25cd-2c35-4093-ad52-fb7099642f1a");
  ok("an established role survives resolution", r3.profile.role === "sme");
  ok("an established actor_kind survives resolution", r3.profile.actor_kind === "organisation");
  ok("no RPC runs when the profile exists, so nothing can be reset", c3.calls.rpc === 0);
}

// ============================================================
console.log("\nLOOP SAFETY — the RPC is attempted at most once per identity");
// ============================================================
{
  const g = guard();
  const c = fakeClient({ selectRow: null, rpcRow: null });   // provisioning keeps failing

  const first  = await resolveProfile({ configured: true, session: SESSION, client: c, ...g });
  const second = await resolveProfile({ configured: true, session: SESSION, client: c, ...g });
  const third  = await resolveProfile({ configured: true, session: SESSION, client: c, ...g });

  ok("first pass attempts the RPC", first.outcome === RESOLUTION.RPC_EMPTY);
  ok("second pass does NOT attempt it again", second.outcome === RESOLUTION.ALREADY_ATTEMPTED);
  ok("third pass does not either", third.outcome === RESOLUTION.ALREADY_ATTEMPTED);
  ok("the RPC ran exactly once across three resolutions", c.calls.rpc === 1);
  ok("the repeated outcome still carries a visible explanation", second.error.length > 0);
  ok("and it tells the operator what to do", /sign out|administrator/i.test(second.error));

  // A different user is a different identity and gets its own attempt.
  const other = { user: { id: "aaaaaaaa-0000-0000-0000-000000000000" }, access_token: "t" };
  const r4 = await resolveProfile({ configured: true, session: other, client: c, ...g });
  ok("a different user is not blocked by another user's attempt",
     r4.outcome === RESOLUTION.RPC_EMPTY && c.calls.rpc === 2);
}

// ============================================================
console.log("\nWIRING — code-only evidence in ForgeIdentity.jsx");
// ============================================================
{
  const id = stripComments(readFileSync(new URL("../src/os/ForgeIdentity.jsx", import.meta.url), "utf8"));

  ok("the provider resolves the profile through the shared resolver",
     /resolveProfile\(\{/.test(id));
  ok("it injects the real supabase client", /client:\s*supabase/.test(id));
  ok("it passes the configured flag rather than assuming it", /configured:\s*isConfigured/.test(id));
  ok("the loop guard is a ref, so marking cannot cause a render",
     /ensureAttempts\s*=\s*useRef\(/.test(id));
  ok("the effect keys on a stable auth key, not the session object",
     /const authKey\s*=/.test(id) && /\}, \[authKey\]\)/.test(id));
  ok("the guard is cleared on sign-out", /ensureAttempts\.current\.clear\(\)/.test(id));
  ok("resolution errors are surfaced to state", /setError\(resolveError\)/.test(id));
  ok("there is NO direct insert into profiles anywhere in the provider",
     !/from\(\s*["']profiles["']\s*\)[\s\S]{0,80}\.(insert|upsert)\(/.test(id));
  ok("no service_role key is referenced", !/service_role|SERVICE_ROLE/.test(id));
  ok("ensure_profile is never called by string literal outside the resolver",
     !/rpc\(\s*["']ensure_profile["']/.test(id));
  ok("existing organisation onboarding is still present",
     /ensureOrganisation/.test(id) && /from\(\s*["']organisations["']\s*\)/.test(id));
  ok("registration behaviour is untouched", /supabase\.auth\.signUp\(/.test(id));

  const res = stripComments(readFileSync(new URL("../src/os/profileResolver.js", import.meta.url), "utf8"));
  ok("the resolver is the single caller of the RPC", /rpc\(\s*["']ensure_profile["']\s*\)/.test(res));
  ok("the resolver never inserts", !/\.insert\(|\.upsert\(/.test(res));
  ok("the resolver never references a service key", !/service_role|SERVICE_ROLE/.test(res));

  const wk = stripComments(readFileSync(new URL("../src/os/Workspace.jsx", import.meta.url), "utf8"));
  ok("the workspace renders the resolution error visibly", /\{error &&/.test(wk));
}

// ============================================================
console.log("\nTRIGGER HARDENING — the migration's guarantees, enforced by the suite");
// ============================================================
{
  // The database is the source of truth, but the migration must not drift from
  // it: a future `db reset` replays this file, so if the file loses a guard the
  // deployed function silently loses it too. Verified live on 2026-08-13 with
  // pg_get_functiondef; asserted here so it stays true.
  const mig = readFileSync(
    new URL("../supabase/migrations/20260813170000_harden_handle_new_user.sql", import.meta.url), "utf8");
  const sql = mig.replace(/^\s*--.*$/gm, "");   // strip SQL line comments

  ok("a safe-resolution helper is defined",
     /create or replace function public\.forge_enum_label/.test(sql));
  ok("the helper trims before comparing, so whitespace is treated as absent",
     /btrim/.test(sql));
  ok("the helper validates against pg_enum rather than trusting a cast",
     /pg_catalog\.pg_enum/.test(sql));
  ok("the helper is scoped to the public schema",
     /n\.nspname\s*=\s*'public'/.test(sql));
  ok("an unrecognised label resolves to NULL, not an error", /else null/.test(sql));

  ok("role is resolved through the helper before casting",
     /forge_enum_label\('forge_role',[^)]*\)::public\.forge_role/.test(sql));
  ok("actor_kind is resolved through the helper before casting",
     /forge_enum_label\('forge_actor_kind',[^)]*\)::public\.forge_actor_kind/.test(sql));
  // EVERY cast must be fed by the validating helper. Counting is the precise
  // form of this check — my first attempt was a negative regex for
  // `->>'role')::public.forge_role`, which also matched the SAFE expression,
  // because that `)` is the helper call's own closing paren. The test failed and
  // was wrong; the migration was right.
  const castCount = (re) => (sql.match(re) || []).length;
  ok("every cast to forge_role is fed by the validating helper",
     castCount(/::public\.forge_role/g) >= 1 &&
     castCount(/::public\.forge_role/g) ===
       castCount(/forge_enum_label\('forge_role',[^)]*\)::public\.forge_role/g));
  ok("every cast to forge_actor_kind is fed by the validating helper",
     castCount(/::public\.forge_actor_kind/g) >= 1 &&
     castCount(/::public\.forge_actor_kind/g) ===
       castCount(/forge_enum_label\('forge_actor_kind',[^)]*\)::public\.forge_actor_kind/g));
  ok("the discarded unsafe form — nullif() cast straight to an enum — is absent",
     !/nullif\([^)]*->>'(role|actor_kind)'[^)]*\)::public\.forge_/.test(sql));
  ok("safe defaults are preserved", /'engineer'/.test(sql) && /'individual'/.test(sql));

  ok("the profile insert stays idempotent", /on conflict \(id\) do nothing/.test(sql));
  ok("audit and notification inserts are existence-guarded",
     (sql.match(/where not exists/g) || []).length >= 2);
  ok("side effects cannot abort sign-up — each has its own handler",
     (sql.match(/exception when others then/g) || []).length >= 3);
  ok("no failure is swallowed silently",
     /raise warning/.test(sql) && !/exception when others then\s*null\s*;/.test(sql));

  ok("SECURITY DEFINER is preserved on the trigger function",
     /create or replace function public\.handle_new_user\(\)[\s\S]*?security definer/.test(sql));
  ok("search_path is pinned to empty on both functions",
     (sql.match(/set search_path = ''/g) || []).length >= 2);
  ok("the helper is SECURITY INVOKER — it needs no elevated rights",
     /security invoker/.test(sql));
  ok("every object reference is schema-qualified, as search_path='' requires",
     /public\.profiles/.test(sql) && /pg_catalog\./.test(sql));

  ok("organisation_id is never written by the trigger", !/organisation_id/.test(sql));
  ok("auth.users ownership is not altered", !/alter table auth\.users/i.test(sql));
  ok("the trigger itself is not dropped or recreated",
     !/drop trigger/i.test(sql) && !/create trigger/i.test(sql));
  ok("this migration contains no profile data correction — it is kept separate",
     !/update public\.profiles/i.test(sql));

  const reg = readFileSync(
    new URL("../supabase/diagnostics/handle_new_user_regression.sql", import.meta.url), "utf8");
  ok("the regression suite covers absent metadata", /'absent'/.test(reg));
  ok("the regression suite covers empty-string metadata", /'empty string'/.test(reg));
  ok("the regression suite covers whitespace-only metadata", /'whitespace only'/.test(reg));
  ok("the regression suite covers valid metadata", /'valid'/.test(reg));
  ok("the regression suite covers invalid labels", /'invalid label'/.test(reg));
  ok("the regression suite is read-only — it never writes to auth.users",
     !/insert into auth\.users/i.test(reg) && !/delete from/i.test(reg));
}

// ============================================================
console.log("\nORGANISATION ONBOARDING — properties of the existing ensureOrganisation()");
// ============================================================
{
  // ensureOrganisation() lives inside the provider and closes over the supabase
  // client, so it is asserted here as code-only evidence. Its RUNTIME behaviour
  // was verified separately by replaying its exact three statements against
  // production under `role authenticated` with the real JWT, where RLS applied:
  //   step 2 matched the existing SOLC row (no insert)
  //   step 3 linked profiles.organisation_id -> 10ce25cd-…
  //   re-runs wrote 0 rows; organisations stayed at 1
  const id = stripComments(readFileSync(new URL("../src/os/ForgeIdentity.jsx", import.meta.url), "utf8"));

  // --- one organisation model, one table ---
  ok("onboarding writes only the existing organisations table",
     /from\(\s*["']organisations["']\s*\)/.test(id));
  ok("no second organisation table is referenced",
     !/from\(\s*["'](orgs|companies|organizations|organisation)["']\s*\)/.test(id));

  // --- step 1: short-circuit on an existing link ---
  ok("an already-linked profile short-circuits before any write",
     /if\s*\(\s*profile\?\.organisation_id\s*\)/.test(id));
  ok("the short-circuit reports created:false", /created:\s*false/.test(id));

  // --- step 2: reuse, scoped so another party's row cannot be adopted ---
  ok("the reuse lookup is scoped to created_by",
     /\.eq\(\s*["']created_by["']\s*,\s*userId\s*\)/.test(id));
  ok("the reuse lookup matches the supplied name",
     /\.ilike\(\s*["']name["']\s*,\s*clean\s*\)/.test(id));
  ok("a name held by a different creator is refused, not adopted",
     /created_by\s*!==\s*userId/.test(id) && /requires an invitation/.test(id));

  // --- insert: only when absent, and never privileged ---
  ok("the insert sets created_by to the authenticated user",
     /created_by:\s*userId/.test(id));
  ok("the insert writes verification 'unverified' explicitly",
     /verification:\s*["']unverified["']/.test(id));
  ok("no organisation uuid is hardcoded",
     !/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(id));
  ok("the uuid is read back from the database",
     /\.select\(\s*["'][^"']*\bid\b[^"']*["']\s*\)/.test(id));

  // --- step 3: the link is conditional IN THE DATABASE ---
  // These four assertions previously read ForgeIdentity.jsx. E6.4 moved the
  // update into organisationLink.js, and they failed — correctly detecting the
  // move rather than passing on a stale location. Retargeted, same guarantees.
  const link = stripComments(readFileSync(new URL("../src/os/organisationLink.js", import.meta.url), "utf8"));
  ok("the profile link is guarded by organisation_id is null",
     /\.is\(\s*["']organisation_id["']\s*,\s*null\s*\)/.test(link));
  ok("the link is scoped to the authenticated user",
     /\.eq\(\s*["']id["']\s*,\s*userId\s*\)/.test(link));
  ok("the provider no longer issues the update itself",
     !/\.is\(\s*["']organisation_id["']\s*,\s*null\s*\)/.test(id));

  // --- the identity fields onboarding must NOT touch ---
  const orgFn = id.slice(id.indexOf("const ensureOrganisation"), id.indexOf("const signIn"));
  // Assert on the UPDATE PAYLOAD itself, not on the surrounding function. My
  // first version scanned everything after the update call and tripped on
  // `role: org.role` inside the audit payload — which is the ORGANISATION's role
  // in an audit record, not a write to profiles.role. Test wrong, code right.
  const profUpdate = (link.match(/from\(\s*["']profiles["']\s*\)[\s\S]*?\.update\(\{([^}]*)\}\)/) || [])[1] ?? "";
  ok("a profiles update payload was located", profUpdate.length > 0);
  ok("the profiles update sets exactly organisation_id and updated_at",
     /organisation_id/.test(profUpdate) && /updated_at/.test(profUpdate) &&
     !/\brole\b|\bactor_kind\b|\bverification\b|\bonboarded\b|\bdisplay_name\b|\bstate\b|\bid\b:/.test(profUpdate));
  ok("onboarding never writes verification onto the profile",
     !/profiles["']\s*\)[\s\S]{0,120}verification/.test(orgFn));
  ok("onboarding never writes onboarded", !/onboarded/.test(orgFn));
  ok("onboarding never writes actor_kind", !/actor_kind/.test(orgFn));
  ok("onboarding never writes display_name onto the profile", !/display_name/.test(orgFn));

  // --- nothing is inferred ---
  ok("the organisation name is an argument, never derived from the session",
     /ensureOrganisation\s*=\s*useCallback\(async\s*\(\{\s*name,\s*role/.test(id));
  ok("the role must be supplied and is never inferred",
     /An organisation role is required/.test(orgFn));
  ok("no email is read anywhere in onboarding", !/email/.test(orgFn));
  ok("no organisation is inferred from the profile's own role",
     !/role:\s*profile\?\.role/.test(orgFn));
  ok("SOLC is not named in the identity runtime", !/SOLC/.test(id));

  // --- gating ---
  ok("onboarding refuses to run unconfigured", /if\s*\(!isConfigured\)/.test(orgFn));
  ok("onboarding refuses to run without a session", /Sign in before establishing/.test(orgFn));

  // --- the pilot resolver joins on name, so the DB must hold one SOLC ---
  const pilot = stripComments(readFileSync(new URL("../src/os/pilot.js", import.meta.url), "utf8"));
  ok("the pilot configuration resolves an organisation by exact trimmed name",
     /trim\(\)\.toLowerCase\(\)/.test(pilot));
  ok("a partial name still does not resolve", /=== k/.test(pilot));
}

// ============================================================
console.log("\nORGANISATION LINK — the silent-no-op fix (E6.4)");
// ============================================================
{
  const ORG = "10ce25cd-2c35-4093-ad52-fb7099642f1a";

  /**
   * Fake client for the link path. Records the update payload and the filters so
   * the tests can assert on what was NOT written.
   */
  function linkClient({ updateRows = [], updateError = null, updateThrows = false,
                        checkRow = undefined, checkError = null } = {}) {
    const calls = { updates: 0, selects: 0, inserts: 0, payloads: [], filters: [],
                    selectedCols: [], tables: [] };
    return {
      calls,
      from(table) {
        calls.tables.push(table);
        return {
          update(payload) {
            calls.updates++; calls.payloads.push(payload);
            const chain = {
              eq(c, v) { calls.filters.push(`eq:${c}=${v}`); return chain; },
              is(c, v) { calls.filters.push(`is:${c}=${v}`); return chain; },
              async select(cols) {
                calls.selectedCols.push(cols);
                if (updateThrows) throw new Error("update transport failure");
                return { data: updateRows, error: updateError };
              },
            };
            return chain;
          },
          select(cols) {
            calls.selects++; calls.selectedCols.push(cols);
            return { eq: () => ({ async maybeSingle() { return { data: checkRow, error: checkError }; } }) };
          },
          insert() { calls.inserts++; throw new Error("the link step must never insert"); },
        };
      },
    };
  }

  // ---- A. existing profile links successfully ----
  {
    const c = linkClient({ updateRows: [{ id: UID }] });
    const r = await linkProfileToOrganisation({ client: c, userId: UID, organisationId: ORG });
    ok("A. one matched row -> LINKED", r.outcome === LINK_OUTCOME.LINKED);
    ok("A. it is reported as established", isEstablished(r.outcome) === true);
    ok("A. rows affected is reported as 1", r.rows === 1);
    ok("A. no error", r.error === null);
    ok("A. a fresh link DOES audit", shouldAudit(r.outcome) === true);
    ok("A. the update asked the database what it changed", c.calls.selectedCols.includes("id"));
    ok("A. the null guard is still applied in the database",
       c.calls.filters.includes("is:organisation_id=null"));
    ok("A. the update is scoped to the authenticated id",
       c.calls.filters.includes(`eq:id=${UID}`));
    ok("A. no diagnostic read was needed", c.calls.selects === 0);
    ok("A. it touched only the profiles table", [...new Set(c.calls.tables)].join() === "profiles");
    // the payload must not carry any identity field
    const payload = c.calls.payloads[0];
    ok("A. the payload writes exactly organisation_id and updated_at",
       Object.keys(payload).sort().join() === "organisation_id,updated_at");
    ok("A. role / actor_kind / verification / onboarded / display_name are untouched",
       ["role","actor_kind","verification","onboarded","display_name","state","id"]
         .every((k) => !(k in payload)));
  }

  // ---- B. already-linked profile is a no-op, not a failure ----
  {
    const c = linkClient({ updateRows: [], checkRow: { id: UID, organisation_id: ORG } });
    const r = await linkProfileToOrganisation({ client: c, userId: UID, organisationId: ORG });
    ok("B. zero rows but already this organisation -> ALREADY_LINKED",
       r.outcome === LINK_OUTCOME.ALREADY_LINKED);
    ok("B. it still counts as established", isEstablished(r.outcome) === true);
    ok("B. no error is raised on a correct system", r.error === null);
    ok("B. a no-op does NOT re-audit", shouldAudit(r.outcome) === false);
    ok("B. exactly ONE diagnostic read — not a retry loop", c.calls.selects === 1);
    ok("B. the update was attempted only once", c.calls.updates === 1);
  }

  // ---- C. missing profile cannot report success ----
  {
    const c = linkClient({ updateRows: [], checkRow: null });
    const r = await linkProfileToOrganisation({ client: c, userId: UID, organisationId: ORG });
    ok("C. zero rows and no profile -> NO_PROFILE", r.outcome === LINK_OUTCOME.NO_PROFILE);
    ok("C. it is NOT established", isEstablished(r.outcome) === false);
    ok("C. it does NOT audit", shouldAudit(r.outcome) === false);
    ok("C. no profile was fabricated", c.calls.inserts === 0);
  }

  // ---- D. the zero-row failure is surfaced with the specified message ----
  {
    const c = linkClient({ updateRows: [], checkRow: null });
    const r = await linkProfileToOrganisation({ client: c, userId: UID, organisationId: ORG });
    ok("D. the error is populated", typeof r.error === "string" && r.error.length > 0);
    ok("D. it states the organisation exists but could not be linked",
       /Organisation exists but could not be linked to the authenticated profile/.test(r.error));
    ok("D. rows affected is reported as 0", r.rows === 0);

    const errC = linkClient({ updateError: { message: "new row violates row-level security policy" } });
    const rErr = await linkProfileToOrganisation({ client: errC, userId: UID, organisationId: ORG });
    ok("D. an RLS refusal is surfaced verbatim, not swallowed",
       rErr.outcome === LINK_OUTCOME.FAILED && /row-level security/.test(rErr.error));
    ok("D. an RLS refusal does not audit", shouldAudit(rErr.outcome) === false);

    const thrown = linkClient({ updateThrows: true });
    const rThrown = await linkProfileToOrganisation({ client: thrown, userId: UID, organisationId: ORG });
    ok("D. a thrown update is caught and reported",
       rThrown.outcome === LINK_OUTCOME.FAILED && /update transport failure/.test(rThrown.error));

    const badCheck = linkClient({ updateRows: [], checkError: { message: "JWT expired" } });
    const rBad = await linkProfileToOrganisation({ client: badCheck, userId: UID, organisationId: ORG });
    ok("D. an unconfirmable link is a failure, never a success",
       rBad.outcome === LINK_OUTCOME.FAILED && isEstablished(rBad.outcome) === false);
  }

  // ---- E. no duplicate organisation is created by the link path ----
  {
    const link = stripComments(readFileSync(new URL("../src/os/organisationLink.js", import.meta.url), "utf8"));
    ok("E. the link module never inserts anything", !/\.insert\(|\.upsert\(/.test(link));
    ok("E. the link module never touches the organisations table",
       !/from\(\s*["']organisations["']\s*\)/.test(link));
    ok("E. the link module writes only the profiles table",
       (link.match(/from\(\s*["'](\w+)["']\s*\)/g) || []).every((m) => /profiles/.test(m)));
    ok("E. it never writes an identity field",
       !/\b(role|actor_kind|verification|onboarded|display_name):/.test(link));

    // an existing link to a DIFFERENT organisation is refused, never reassigned
    const other = linkClient({ updateRows: [], checkRow: { id: UID, organisation_id: "ffffffff-0000-0000-0000-000000000000" } });
    const rOther = await linkProfileToOrganisation({ client: other, userId: UID, organisationId: ORG });
    ok("E. a profile owned by another organisation is REFUSED",
       rOther.outcome === LINK_OUTCOME.LINKED_ELSEWHERE);
    ok("E. it is not established and not audited",
       isEstablished(rOther.outcome) === false && shouldAudit(rOther.outcome) === false);
    ok("E. the refusal names the conflicting organisation", /already belongs to organisation/.test(rOther.error));
  }

  // ---- F. repeated execution remains idempotent ----
  {
    // First call links; every later call sees zero rows and reports ALREADY_LINKED.
    const first = linkClient({ updateRows: [{ id: UID }] });
    const r1 = await linkProfileToOrganisation({ client: first, userId: UID, organisationId: ORG });

    const later = linkClient({ updateRows: [], checkRow: { id: UID, organisation_id: ORG } });
    const r2 = await linkProfileToOrganisation({ client: later, userId: UID, organisationId: ORG });
    const r3 = await linkProfileToOrganisation({ client: later, userId: UID, organisationId: ORG });

    ok("F. run 1 links", r1.outcome === LINK_OUTCOME.LINKED);
    ok("F. run 2 is a no-op", r2.outcome === LINK_OUTCOME.ALREADY_LINKED);
    ok("F. run 3 is a no-op", r3.outcome === LINK_OUTCOME.ALREADY_LINKED);
    ok("F. all three report the organisation as established",
       [r1, r2, r3].every((r) => isEstablished(r.outcome)));
    ok("F. only the first would emit an audit event",
       [r1, r2, r3].filter((r) => shouldAudit(r.outcome)).length === 1);
    ok("F. no insert on any run", first.calls.inserts === 0 && later.calls.inserts === 0);
  }

  // ---- invariant violations fail loudly ----
  {
    const two = linkClient({ updateRows: [{ id: UID }, { id: UID }] });
    const rTwo = await linkProfileToOrganisation({ client: two, userId: UID, organisationId: ORG });
    ok("two matched rows -> INVARIANT", rTwo.outcome === LINK_OUTCOME.INVARIANT);
    ok("the invariant error explains why it is impossible",
       /primary key/.test(rTwo.error) && /must never happen/.test(rTwo.error));
    ok("an invariant violation is neither established nor audited",
       isEstablished(rTwo.outcome) === false && shouldAudit(rTwo.outcome) === false);

    const wrong = linkClient({ updateRows: [{ id: "aaaaaaaa-0000-0000-0000-000000000000" }] });
    const rWrong = await linkProfileToOrganisation({ client: wrong, userId: UID, organisationId: ORG });
    ok("updating someone else's row -> INVARIANT", rWrong.outcome === LINK_OUTCOME.INVARIANT);
    ok("it is not treated as success", isEstablished(rWrong.outcome) === false);

    const noUser = await linkProfileToOrganisation({ client: linkClient(), userId: null, organisationId: ORG });
    ok("no authenticated id -> FAILED", noUser.outcome === LINK_OUTCOME.FAILED);
    const noOrg = await linkProfileToOrganisation({ client: linkClient(), userId: UID, organisationId: null });
    ok("no organisation id -> FAILED", noOrg.outcome === LINK_OUTCOME.FAILED);
  }

  // ---- the provider wires it correctly, and audits only after proof ----
  {
    const id = stripComments(readFileSync(new URL("../src/os/ForgeIdentity.jsx", import.meta.url), "utf8"));
    ok("the provider delegates the link to the shared module",
       /linkProfileToOrganisation\(\{/.test(id));
    ok("the raw unguarded update is gone",
       !/\.is\(\s*["']organisation_id["']\s*,\s*null\s*\)\s*;/.test(id));
    ok("the audit is gated on shouldAudit", /if\s*\(shouldAudit\(outcome\)\)/.test(id));
    ok("the audit insert sits INSIDE that gate",
       /if\s*\(shouldAudit\(outcome\)\)\s*\{[\s\S]{0,240}organisation\.established/.test(id));
    ok("a non-established outcome returns linked:false with the reason",
       /if\s*\(!isEstablished\(outcome\)\)/.test(id) && /linked:\s*false/.test(id));
    ok("a successful link reports linked:true", /linked:\s*true/.test(id));
    // The early return for a non-established outcome must come BEFORE the
    // reload-and-succeed tail, so a failure can never fall through to success.
    // Compared by position rather than by an exact multi-line literal — my first
    // version matched on whitespace that comment-stripping had already changed.
    const guardAt   = id.indexOf("if (!isEstablished(outcome))");
    const successAt = id.lastIndexOf("linked: true");
    ok("the non-established early return precedes the success path",
       guardAt > -1 && successAt > -1 && guardAt < successAt);
    ok("the audit gate precedes the early return",
       id.indexOf("shouldAudit(outcome)") < guardAt);
  }
}

console.log(`\n${pass}/${pass + fail} assertions passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
