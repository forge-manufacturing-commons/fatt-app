// ============================================================
// FORGE OS — IDENTITY RUNTIME (Phase 1)
//
// Who is acting, what they are permitted to do, and what they have been
// told. Everything operational depends on this: a job cannot be accepted,
// a design cannot be approved and funding cannot be committed until the
// actor is accountable.
//
// Honest degradation: with no Supabase keys the app still runs, but it
// runs UNAUTHENTICATED and says so. There is no fake signed-in user —
// a demo identity would be a lie about who is accountable.
// ============================================================

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { supabase, isConfigured } from "../lib/supabase";
import { capabilitiesFor, roleById, VERIFICATION_GATED } from "./Roles.js";

const IdentityContext = createContext(null);

export function ForgeIdentityProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [organisation, setOrganisation] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(Boolean(isConfigured));
  const [error, setError] = useState(null);

  // ---- session lifecycle ----
  useEffect(() => {
    if (!isConfigured) { setLoading(false); return; }
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data?.session ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!cancelled) setSession(s ?? null);
    });
    return () => { cancelled = true; sub?.subscription?.unsubscribe?.(); };
  }, []);

  const userId = session?.user?.id ?? null;

  // ---- profile ----
  const loadProfile = useCallback(async () => {
    if (!isConfigured || !userId) { setProfile(null); return; }
    const { data, error: e } = await supabase
      .from("profiles")
      .select("id, display_name, role, actor_kind, organisation_id, state, discipline, verification, onboarded")
      .eq("id", userId)
      .maybeSingle();
    if (e) { setError(e.message); return; }
    setProfile(data ?? null);
  }, [userId]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // ---- organisation ----
  // A profile's organisation was previously only ever SELECTed as an id and
  // never resolved, so no surface could say which organisation an actor belongs
  // to. This reads the row itself, and reads nothing when the link is absent —
  // an actor without an organisation is a real and common state, not an error.
  const loadOrganisation = useCallback(async () => {
    if (!isConfigured || !profile?.organisation_id) { setOrganisation(null); return; }
    const { data, error: e } = await supabase
      .from("organisations")
      .select("id, name, role, rc_number, state, city, website, description, verification, created_by")
      .eq("id", profile.organisation_id)
      .maybeSingle();
    if (e) { setError(e.message); return; }
    setOrganisation(data ?? null);
  }, [profile?.organisation_id]);

  useEffect(() => { loadOrganisation(); }, [loadOrganisation]);

  // ---- notifications ----
  const loadNotifications = useCallback(async () => {
    if (!isConfigured || !userId) { setNotifications([]); return; }
    const { data } = await supabase
      .from("notifications")
      .select("id, kind, subject, body, entity, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(30);
    setNotifications(data ?? []);
  }, [userId]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  useEffect(() => {
    if (!isConfigured || !userId) return;
    const ch = supabase
      .channel("forge-notifications")
      .on("postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `recipient=eq.${userId}` },
          (payload) => setNotifications((n) => [payload.new, ...n]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId]);

  // ---- actions ----
  const register = useCallback(async ({ email, password, role, displayName, state, discipline }) => {
    if (!isConfigured) return { error: "Supabase is not configured in this environment." };
    const meta = {
      role,
      display_name: displayName ?? "",
      actor_kind: roleById(role)?.kind === "organisation" ? "organisation" : "individual",
      state: state ?? "",
      discipline: discipline ?? "",
    };
    const { error: e } = await supabase.auth.signUp({
      email, password, options: { data: meta },
    });
    return { error: e?.message ?? null };
  }, []);

  // ORGANISATION ONBOARDING.
  //
  // Registration created an authenticated PERSON and never an organisation, so
  // every profile the application produced had organisation_id null and the
  // `organisations` table could not be populated by any running code. This is
  // the smallest path that closes that gap, and it deliberately does very
  // little:
  //
  //   * it uses the existing table and the existing profiles.organisation_id.
  //     No second organisation model.
  //   * `role` must be supplied. It is never inferred from the person's own
  //     profile role, because a sheet-metal engineer may work for a logistics
  //     partner and guessing would put a false role on a real company.
  //   * `verification: "unverified"` is written explicitly. The RLS insert
  //     policy requires it, and being admitted is not being verified.
  //   * the uuid comes back from Postgres. Nothing here hardcodes one.
  //
  // IDEMPOTENT IN THREE PLACES, because repeated registration is normal:
  //   1. an already-linked profile returns its organisation and writes nothing
  //   2. an organisation this user already created is reused, not duplicated
  //   3. the profile link is only written when it is actually absent
  //
  // IT WILL NOT JOIN AN ORGANISATION SOMEBODY ELSE CREATED. Typing an existing
  // company's name must not attach you to it — that is impersonation, and the
  // authority to admit a colleague is an invitation model that does not exist
  // yet. Refused explicitly rather than quietly permitted.
  const ensureOrganisation = useCallback(async ({ name, role, state = null, city = null }) => {
    if (!isConfigured) return { error: "Supabase is not configured in this environment." };
    if (!userId)       return { error: "Sign in before establishing an organisation." };

    const clean = typeof name === "string" ? name.trim() : "";
    if (!clean) return { error: "An organisation name is required." };
    if (!role)  return { error: "An organisation role is required. It is never inferred." };

    // 1. already linked — nothing to do.
    if (profile?.organisation_id) {
      const { data } = await supabase
        .from("organisations").select("id, name, role, verification")
        .eq("id", profile.organisation_id).maybeSingle();
      return { organisation: data ?? null, created: false, error: null };
    }

    // 2. reuse one this user already created. Scoped to created_by so the
    //    lookup can never surface, and then link to, another party's row.
    const { data: mine, error: findErr } = await supabase
      .from("organisations")
      .select("id, name, role, verification, created_by")
      .eq("created_by", userId)
      .ilike("name", clean)
      .maybeSingle();
    if (findErr) return { error: findErr.message };

    let org = mine ?? null;

    if (!org) {
      // Refuse to adopt a name already held by a different creator.
      const { data: taken } = await supabase
        .from("organisations").select("id, created_by").ilike("name", clean).limit(1);
      if (taken?.length && taken[0].created_by !== userId) {
        return {
          error: `"${clean}" is already registered by another account. ` +
                 `Joining an existing organisation requires an invitation from it, ` +
                 `which this deployment does not yet issue.`,
        };
      }

      const { data: created, error: insErr } = await supabase
        .from("organisations")
        .insert({ name: clean, role, state, city, created_by: userId, verification: "unverified" })
        .select("id, name, role, verification, created_by")
        .single();
      if (insErr) return { error: insErr.message };
      org = created;
    }

    // 3. link the profile. `.is("organisation_id", null)` makes the write
    //    conditional in the database rather than in this function, so two tabs
    //    racing cannot overwrite an existing link.
    const { error: linkErr } = await supabase
      .from("profiles")
      .update({ organisation_id: org.id, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .is("organisation_id", null);
    if (linkErr) return { error: linkErr.message };

    await supabase.from("audit_events").insert({
      actor: userId, action: "organisation.established", entity: "organisation",
      entity_id: org.id, payload: { name: org.name, role: org.role },
    });

    await loadProfile();
    return { organisation: org, created: !mine, error: null };
  }, [userId, profile?.organisation_id, loadProfile]);

  const signIn = useCallback(async ({ email, password }) => {
    if (!isConfigured) return { error: "Supabase is not configured in this environment." };
    const { error: e } = await supabase.auth.signInWithPassword({ email, password });
    return { error: e?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (!isConfigured) return;
    await supabase.auth.signOut();
    setProfile(null); setOrganisation(null); setNotifications([]);
  }, []);

  const markRead = useCallback(async (id) => {
    if (!isConfigured) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read_at: new Date().toISOString() } : x)));
  }, []);

  // Append-only trail. Every operational action should call this.
  const record = useCallback(async (action, entity, entityId, payload = {}) => {
    if (!isConfigured || !userId) return;
    await supabase.from("audit_events").insert({
      actor: userId, action, entity, entity_id: entityId ?? null, payload,
    });
  }, [userId]);

  // ---- permissions ----
  const granted = useMemo(() => capabilitiesFor(profile?.role), [profile?.role]);
  const verified = profile?.verification === "verified";

  const can = useCallback((capability) => {
    if (!granted.includes(capability)) return false;
    // Authority that carries real-world consequence stays shut until verified.
    if (VERIFICATION_GATED.includes(capability) && !verified) return false;
    return true;
  }, [granted, verified]);

  const value = useMemo(() => ({
    configured: isConfigured,
    loading, error,
    session, user: session?.user ?? null, profile, organisation,
    role: profile?.role ?? null,
    roleMeta: roleById(profile?.role),
    verified,
    capabilities: granted,
    gatedCapabilities: granted.filter((c) => VERIFICATION_GATED.includes(c) && !verified),
    can,
    notifications,
    unreadCount: notifications.filter((n) => !n.read_at).length,
    register, signIn, signOut, markRead, record, ensureOrganisation,
    refresh: () => { loadProfile(); loadOrganisation(); loadNotifications(); },
  }), [loading, error, session, profile, organisation, verified, granted, can, notifications,
       register, signIn, signOut, markRead, record, ensureOrganisation,
       loadProfile, loadOrganisation, loadNotifications]);

  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>;
}

export function useIdentity() {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error("useIdentity must be used inside <ForgeIdentityProvider>");
  return ctx;
}

export default ForgeIdentityProvider;
