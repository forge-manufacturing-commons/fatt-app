// ============================================================
// FORGE OS — WORKSPACE (Phase 1)
//
// The signed-in actor's own surface: identity, verification standing,
// the permissions they hold, what is withheld and why, and their
// notifications. One workspace, rendered from the actor's role — this is
// the seam the mission-centric architecture grows into, rather than
// twelve separate portals.
//
// Provenance: this screen reports only what the database returns about
// the signed-in actor. Where there is no data it says so. No counts are
// invented to make the surface look populated.
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { T, stateColor } from "./forge.js";
import { useIdentity } from "./ForgeIdentity.jsx";
import { CAPABILITIES, ROLES, VERIFICATION, VERIFICATION_GATED } from "./Roles.js";
import { FORGE_CLIPS } from "./geometry.js";
import { pilotOrganisationByName } from "./pilot.js";
import PilotEntry from "./PilotEntry.jsx";

// Palette is NOT declared here. Canonical tokens only — see src/os/forge.js.
const { black:BLACK, ivory:IVORY, teal:TEAL, amber:AMBER, pink:PINK,
        surface:SURFACE_T, border:BORDER_T, grey:GREY_T, green:GREEN_T } = T;
const SURFACE=SURFACE_T, BORDER=BORDER_T, MUTED=GREY_T, GREEN=GREEN_T;
const UI="var(--forge-brand-font, 'Poppins', system-ui, sans-serif)";
const DISPLAY="var(--forge-display-font, 'Poppins', system-ui, sans-serif)";

// Verification standing is a state — it uses the one semantic mapping.

function Label({ children }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ fontFamily:UI, fontWeight:600, fontSize:10, letterSpacing:"0.2em",
        textTransform:"uppercase", color:TEAL }}>{children}</div>
      <div style={{ width:40, height:2, background:PINK, marginTop:6 }} />
    </div>
  );
}

function Panel({ children, variant="panelBR", accent=TEAL }) {
  return (
    <div style={{ clipPath:FORGE_CLIPS[variant], background:SURFACE,
      borderTop:`2px solid ${accent}`, padding:"20px 22px" }}>{children}</div>
  );
}

// ORGANISATION — the link that registration never created.
//
// Before this panel, every profile the application produced had
// organisation_id null and the `organisations` table had no writer, so an
// authenticated person could never become an accountable organisation. It
// collects the two facts the schema requires and nothing else: a name and a
// forge_role. Role is CHOSEN, never derived from the person's own profile role,
// because an engineer may work for a logistics partner and guessing would put a
// false role on a real company.
//
// Only organisation-kind roles are offered. 'engineer', 'nysc_volunteer' and
// 'diaspora_expert' describe people, and an organisation cannot be one.
function OrganisationPanel() {
  const { organisation, profile, ensureOrganisation, refresh } = useIdentity();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const orgRoles = ROLES.filter((r) => r.kind === "organisation");

  if (organisation) {
    const pilot = pilotOrganisationByName(organisation.name);
    const ver = organisation.verification ?? "unverified";
    return (
      <Panel accent={pilot ? AMBER : TEAL}>
        <div style={{ fontFamily:DISPLAY, fontWeight:900, fontSize:22, letterSpacing:"-0.02em" }}>
          {organisation.name}
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center", marginTop:10 }}>
          <span style={{ fontFamily:UI, fontWeight:700, fontSize:10.5, letterSpacing:"0.14em",
            textTransform:"uppercase", color:IVORY }}>
            {ROLES.find((r) => r.id === organisation.role)?.label ?? organisation.role}
          </span>
          <span style={{ width:1, height:12, background:BORDER }} />
          <span style={{ fontFamily:UI, fontWeight:700, fontSize:10, letterSpacing:"0.14em",
            textTransform:"uppercase", color:stateColor(ver), border:`1px solid ${stateColor(ver)}`,
            padding:"4px 9px", clipPath:FORGE_CLIPS.buttonSm }}>
            {VERIFICATION[ver]?.label ?? ver}
          </span>
          {/* Provenance, from the one provenance model. An organisation no
              registry knows reads UNKNOWN — it is never promoted to real. */}
          <span style={{ fontFamily:UI, fontWeight:700, fontSize:10, letterSpacing:"0.14em",
            textTransform:"uppercase", color:pilot ? AMBER : MUTED,
            border:`1px solid ${pilot ? AMBER : BORDER}`, padding:"4px 9px",
            clipPath:FORGE_CLIPS.buttonSm }}>
            {pilot ? pilot.provenance : "provenance unknown"}
          </span>
        </div>
        <div style={{ fontFamily:UI, fontSize:12, color:MUTED, marginTop:12, lineHeight:1.55 }}>
          {pilot
            ? "Admitted by pilot configuration. A real organisation, not a demonstration " +
              "identity — and not yet a verified member. Legal details, capacity and " +
              "capability are unknown and are not shown as anything else."
            : "This organisation holds no pilot assignment. It can hold an identity " +
              "without being admitted to record manufacturing facts."}
        </div>
      </Panel>
    );
  }

  const submit = async () => {
    setBusy(true); setErr(null);
    const { error } = await ensureOrganisation({ name, role, state: profile?.state ?? null });
    if (error) setErr(error); else { setName(""); setRole(""); refresh(); }
    setBusy(false);
  };

  return (
    <Panel accent={AMBER}>
      <div style={{ fontFamily:UI, fontSize:13, color:MUTED, lineHeight:1.6, marginBottom:14 }}>
        You are signed in as a person, but no organisation is linked to this
        account. Manufacturing is attributed to organisations, so nothing can be
        recorded until one exists.
      </div>
      <input value={name} onChange={(e) => setName(e.target.value)}
        placeholder="Organisation name" aria-label="Organisation name"
        style={{ width:"100%", boxSizing:"border-box", fontFamily:UI, fontSize:13,
          padding:"11px 13px", background:BLACK, color:IVORY,
          border:`1px solid ${BORDER}`, outline:"none", marginBottom:9 }} />
      <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Organisation role"
        style={{ width:"100%", boxSizing:"border-box", fontFamily:UI, fontSize:13,
          padding:"11px 13px", background:BLACK, color:role ? IVORY : MUTED,
          border:`1px solid ${BORDER}`, outline:"none" }}>
        <option value="">Select the organisation's role…</option>
        {orgRoles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
      </select>
      <button onClick={submit} disabled={busy || !name.trim() || !role}
        style={{ marginTop:14, fontFamily:UI, fontWeight:700, fontSize:11,
          letterSpacing:"0.14em", textTransform:"uppercase", padding:"12px 20px",
          border:"none", background: busy || !name.trim() || !role ? BORDER : AMBER,
          color: busy || !name.trim() || !role ? MUTED : BLACK,
          cursor: busy || !name.trim() || !role ? "not-allowed" : "pointer",
          clipPath:FORGE_CLIPS.button }}>
        {busy ? "Establishing…" : "Establish organisation"}
      </button>
      {err && (
        <div style={{ fontFamily:UI, fontSize:12.5, color:PINK, marginTop:12, lineHeight:1.55 }}>
          {err}
        </div>
      )}
      <div style={{ fontFamily:UI, fontSize:11, color:MUTED, marginTop:12, lineHeight:1.5 }}>
        Verification is not granted by registering. The organisation is created
        unverified and stays unverified until a reviewer says otherwise.
      </div>
    </Panel>
  );
}

export default function Workspace() {
  const nav = useNavigate();
  const {
    configured, loading, session, profile, roleMeta, verified,
    capabilities, gatedCapabilities, notifications, unreadCount,
    markRead, signOut,
  } = useIdentity();

  const shell = (inner) => (
    <div className="forge-brand" style={{ background:BLACK, color:IVORY, minHeight:"100vh",
      padding:"clamp(28px,5vw,60px)", fontFamily:UI }}>
      <div style={{ maxWidth:1180, margin:"0 auto" }}>{inner}</div>
    </div>
  );

  if (!configured) {
    return shell(
      <Panel accent={PINK}>
        <h1 style={{ fontFamily:DISPLAY, fontWeight:900, fontSize:28, letterSpacing:"-0.03em", margin:"0 0 10px" }}>
          Workspace unavailable
        </h1>
        <p style={{ color:"rgba(245,241,233,.75)", fontSize:14, lineHeight:1.6, margin:0 }}>
          This deployment has no database credentials, so there is no account to show.
          A workspace without a verified actor behind it would be a fiction.
        </p>
      </Panel>
    );
  }

  if (loading) return shell(<div style={{ color:MUTED, fontSize:13 }}>Resolving identity…</div>);

  if (!session) {
    return shell(
      <>
        <h1 style={{ fontFamily:DISPLAY, fontWeight:900, fontSize:"clamp(26px,3.6vw,40px)",
          letterSpacing:"-0.03em", margin:"0 0 12px" }}>Not signed in.</h1>
        <p style={{ color:"rgba(245,241,233,.72)", fontSize:15, maxWidth:560, lineHeight:1.6 }}>
          Forge OS attributes every manufacturing action to an accountable actor.
          Register or sign in to open your workspace.
        </p>
        <button onClick={() => nav("/access")} style={{ marginTop:20, fontFamily:UI, fontWeight:700,
          fontSize:12, letterSpacing:"0.12em", textTransform:"uppercase", padding:"13px 24px",
          border:"none", background:AMBER, color:BLACK, cursor:"pointer", clipPath:FORGE_CLIPS.button }}>
          Register or sign in →
        </button>
      </>
    );
  }

  const ver = profile?.verification ?? "unverified";
  const vc = stateColor(ver);

  return shell(
    <>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
        flexWrap:"wrap", gap:16, marginBottom:30 }}>
        <div>
          <div style={{ fontFamily:UI, fontWeight:600, fontSize:10, letterSpacing:"0.2em",
            textTransform:"uppercase", color:TEAL, borderLeft:`2px solid ${TEAL}`,
            paddingLeft:12, marginBottom:14 }}>
            Forge OS · Workspace
          </div>
          <h1 style={{ fontFamily:DISPLAY, fontWeight:900, fontSize:"clamp(26px,3.8vw,44px)",
            letterSpacing:"-0.03em", lineHeight:0.98, margin:0 }}>
            {profile?.display_name || session.user.email}
          </h1>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:12, flexWrap:"wrap" }}>
            <span style={{ fontSize:15, color:TEAL }}>{roleMeta?.glyph}</span>
            <span style={{ fontFamily:UI, fontWeight:700, fontSize:12, letterSpacing:"0.12em",
              textTransform:"uppercase", color:IVORY }}>{roleMeta?.label ?? profile?.role}</span>
            <span style={{ width:1, height:12, background:BORDER }} />
            <span style={{ fontFamily:UI, fontWeight:700, fontSize:10, letterSpacing:"0.14em",
              textTransform:"uppercase", color:vc, border:`1px solid ${vc}`,
              padding:"4px 9px", clipPath:FORGE_CLIPS.buttonSm }}>
              {VERIFICATION[ver]?.label ?? ver}
            </span>
            {profile?.state && (
              <span style={{ fontFamily:UI, fontSize:11, color:MUTED }}>{profile.state}</span>
            )}
          </div>
        </div>
        <button onClick={signOut} style={{ fontFamily:UI, fontWeight:700, fontSize:10.5,
          letterSpacing:"0.14em", textTransform:"uppercase", padding:"10px 18px", cursor:"pointer",
          background:"transparent", color:MUTED, border:`1px solid ${BORDER}`,
          clipPath:FORGE_CLIPS.button }}>Sign out</button>
      </div>

      {/* PILOT CHAIN — organisation identity, then one real manufacturing fact.
          Placed above the permission panels because it is the actual work: the
          rest of this screen describes the actor, this part is the actor doing
          something. Both panels resolve everything they show from the
          authenticated profile; neither accepts an organisation as input. */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",
        gap:18, marginBottom:18 }}>
        <div>
          <Label>Organisation</Label>
          <OrganisationPanel />
        </div>
        <div>
          <Label>Record a manufacturing fact</Label>
          <PilotEntry />
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:18 }}>

        <div>
          <Label>Standing</Label>
          <Panel accent={vc}>
            <div style={{ fontFamily:DISPLAY, fontWeight:900, fontSize:22, color:vc, letterSpacing:"-0.02em" }}>
              {VERIFICATION[ver]?.label}
            </div>
            <div style={{ fontFamily:UI, fontSize:13, color:"rgba(245,241,233,.78)",
              marginTop:8, lineHeight:1.55 }}>
              {VERIFICATION[ver]?.note}
            </div>
            {!verified && (
              <div style={{ fontFamily:UI, fontSize:12, color:AMBER, marginTop:12, lineHeight:1.5 }}>
                Verification is a manual review. Until it completes, the capabilities listed
                below as withheld remain closed.
              </div>
            )}
          </Panel>
        </div>

        <div>
          <Label>Permissions held</Label>
          <Panel>
            {capabilities.filter(c => !gatedCapabilities.includes(c)).length === 0 && (
              <div style={{ color:MUTED, fontSize:13, fontStyle:"italic" }}>
                No capabilities are currently active.
              </div>
            )}
            {capabilities.filter(c => !gatedCapabilities.includes(c)).map(c => (
              <div key={c} style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"7px 0",
                borderBottom:`1px solid ${BORDER}` }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:TEAL,
                  marginTop:6, flexShrink:0 }} />
                <div>
                  <div style={{ fontFamily:UI, fontWeight:700, fontSize:11.5, color:IVORY,
                    letterSpacing:"0.04em" }}>{c}</div>
                  <div style={{ fontFamily:UI, fontSize:11.5, color:MUTED }}>{CAPABILITIES[c]}</div>
                </div>
              </div>
            ))}
          </Panel>
        </div>

        <div>
          <Label>Withheld pending verification</Label>
          <Panel variant="panelTR" accent={gatedCapabilities.length ? AMBER : BORDER}>
            {gatedCapabilities.length === 0 ? (
              <div style={{ color:MUTED, fontSize:13 }}>
                Nothing withheld. Every capability for this role is active.
              </div>
            ) : gatedCapabilities.map(c => (
              <div key={c} style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"7px 0",
                borderBottom:`1px solid ${BORDER}`, opacity:.75 }}>
                <span style={{ width:7, height:7, background:AMBER, marginTop:6, flexShrink:0,
                  transform:"rotate(45deg)" }} />
                <div>
                  <div style={{ fontFamily:UI, fontWeight:700, fontSize:11.5, color:AMBER,
                    letterSpacing:"0.04em" }}>{c}</div>
                  <div style={{ fontFamily:UI, fontSize:11.5, color:MUTED }}>{CAPABILITIES[c]}</div>
                </div>
              </div>
            ))}
          </Panel>
        </div>

        <div>
          <Label>Notifications {unreadCount ? `· ${unreadCount} unread` : ""}</Label>
          <Panel accent={unreadCount ? PINK : TEAL}>
            {notifications.length === 0 && (
              <div style={{ color:MUTED, fontSize:13, fontStyle:"italic" }}>
                Nothing yet. Notifications arrive as the network acts on your account.
              </div>
            )}
            {notifications.map(n => (
              <div key={n.id} onClick={() => !n.read_at && markRead(n.id)}
                style={{ padding:"9px 0", borderBottom:`1px solid ${BORDER}`,
                  cursor:n.read_at ? "default" : "pointer", opacity:n.read_at ? .6 : 1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
                  <span style={{ fontFamily:UI, fontWeight:700, fontSize:12, color:IVORY }}>{n.subject}</span>
                  {!n.read_at && <span style={{ width:7, height:7, borderRadius:"50%",
                    background:PINK, flexShrink:0, marginTop:4 }} />}
                </div>
                {n.body && <div style={{ fontFamily:UI, fontSize:11.5, color:MUTED,
                  marginTop:4, lineHeight:1.5 }}>{n.body}</div>}
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </>
  );
}
