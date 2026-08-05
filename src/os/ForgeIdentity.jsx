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

  const signIn = useCallback(async ({ email, password }) => {
    if (!isConfigured) return { error: "Supabase is not configured in this environment." };
    const { error: e } = await supabase.auth.signInWithPassword({ email, password });
    return { error: e?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (!isConfigured) return;
    await supabase.auth.signOut();
    setProfile(null); setNotifications([]);
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
    session, user: session?.user ?? null, profile,
    role: profile?.role ?? null,
    roleMeta: roleById(profile?.role),
    verified,
    capabilities: granted,
    gatedCapabilities: granted.filter((c) => VERIFICATION_GATED.includes(c) && !verified),
    can,
    notifications,
    unreadCount: notifications.filter((n) => !n.read_at).length,
    register, signIn, signOut, markRead, record,
    refresh: () => { loadProfile(); loadNotifications(); },
  }), [loading, error, session, profile, verified, granted, can, notifications,
       register, signIn, signOut, markRead, record, loadProfile, loadNotifications]);

  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>;
}

export function useIdentity() {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error("useIdentity must be used inside <ForgeIdentityProvider>");
  return ctx;
}

export default ForgeIdentityProvider;
