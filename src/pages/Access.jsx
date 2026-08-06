// ============================================================
// FORGE OS — ACCESS (Phase 1)
// Registration across the twelve actor types, and sign-in.
//
// Uses the existing shell: Forge Black canvas, Poppins (Black for the
// headline), BUILD-D001 palette, FORGE_CLIPS geometry. No new visual
// language is introduced here.
// ============================================================

import { useState } from "react";
import { T } from "../os/forge.js";
import { useNavigate } from "react-router-dom";
import { useIdentity } from "../os/ForgeIdentity.jsx";
import { ROLES } from "../os/Roles.js";
import { FORGE_CLIPS } from "../os/geometry.js";

// Palette is NOT declared here. Canonical tokens only — see src/os/forge.js.
const { black:BLACK, ivory:IVORY, teal:TEAL, amber:AMBER, pink:PINK,
        surface:SURFACE_T, border:BORDER_T, grey:GREY_T, green:GREEN_T } = T;
const SURFACE=SURFACE_T, BORDER=BORDER_T, MUTED=GREY_T, GREEN=GREEN_T;
const UI="var(--forge-brand-font, 'Poppins', system-ui, sans-serif)";
const DISPLAY="var(--forge-display-font, 'Poppins', system-ui, sans-serif)";
const NG_STATES=["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT Abuja","Gombe","Imo","Jigawa",
  "Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo",
  "Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara","Outside Nigeria"];

const label = { fontFamily:UI, fontWeight:600, fontSize:10, letterSpacing:"0.18em",
  textTransform:"uppercase", color:TEAL, display:"block", marginBottom:7 };
const field = { width:"100%", background:BLACK, border:`1px solid ${BORDER}`, color:IVORY,
  fontFamily:UI, fontSize:14, padding:"12px 14px", clipPath:FORGE_CLIPS.buttonSm, outline:"none" };

export default function Access() {
  const { configured, register, signIn, session } = useIdentity();
  const navigate = useNavigate();
  const [mode, setMode] = useState("register");
  const [role, setRole] = useState("sme");
  const [form, setForm] = useState({ email:"", password:"", displayName:"", state:"", discipline:"" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const chosen = ROLES.find(r => r.id === role);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(null); setMsg(null);
    const res = mode === "register"
      ? await register({ ...form, role })
      : await signIn({ email: form.email, password: form.password });
    setBusy(false);
    if (res?.error) { setErr(res.error); return; }
    if (mode === "register") {
      setMsg("Registration submitted. Check your email to confirm the address, then sign in.");
      setMode("signin");
    } else {
      navigate("/workspace");
    }
  }

  return (
    <div className="forge-brand" style={{ background:BLACK, color:IVORY, minHeight:"100vh",
      padding:"clamp(28px,5vw,64px)", fontFamily:UI }}>
      <div style={{ maxWidth:1080, margin:"0 auto" }}>

        <div style={{ fontFamily:UI, fontWeight:600, fontSize:10, letterSpacing:"0.2em",
          textTransform:"uppercase", color:TEAL, borderLeft:`2px solid ${TEAL}`,
          paddingLeft:12, marginBottom:18 }}>Forge OS · Identity</div>

        <h1 style={{ fontFamily:DISPLAY, fontWeight:900, fontSize:"clamp(30px,4.6vw,50px)",
          letterSpacing:"-0.03em", lineHeight:0.95, margin:"0 0 12px" }}>
          Join the <span style={{ color:PINK }}>manufacturing network</span>.
        </h1>
        <p style={{ color:"rgba(245,241,233,0.70)", fontSize:15, maxWidth:620, lineHeight:1.6, margin:"0 0 12px" }}>
          Forge OS coordinates real manufacturing work. Registration establishes who is
          accountable for that work — the capability you declare here is what the network
          will hold you to.
        </p>
        <p style={{ fontFamily:UI, fontWeight:600, fontSize:11, letterSpacing:"0.06em",
          color:MUTED, maxWidth:620, lineHeight:1.6, margin:"0 0 26px" }}>
          Registration is self-declared and marked UNVERIFIED. Accepting work, approving
          designs, issuing invoices and committing funds stay closed until an administrator
          verifies your organisation.
        </p>

        {!configured && (
          <div style={{ clipPath:FORGE_CLIPS.panelBR, background:"rgba(255,46,99,0.08)",
            border:`1px solid ${PINK}`, padding:"14px 16px", marginBottom:24, maxWidth:720 }}>
            <b style={{ color:PINK, fontSize:12, letterSpacing:"0.1em" }}>DATABASE NOT REACHABLE</b>
            <div style={{ color:"rgba(245,241,233,.8)", fontSize:13, marginTop:6, lineHeight:1.55 }}>
              This deployment has no Supabase credentials, so accounts cannot be created here.
              The form is shown so the flow can be reviewed, but it will not submit.
            </div>
          </div>
        )}

        <div style={{ display:"flex", gap:8, marginBottom:26 }}>
          {["register","signin"].map(m => (
            <button key={m} type="button" onClick={() => { setMode(m); setErr(null); setMsg(null); }}
              style={{ fontFamily:UI, fontWeight:700, fontSize:11, letterSpacing:"0.14em",
                textTransform:"uppercase", padding:"11px 20px", cursor:"pointer",
                clipPath:FORGE_CLIPS.button, border:"none",
                background: mode===m ? AMBER : "transparent",
                color: mode===m ? BLACK : MUTED,
                boxShadow: mode===m ? "none" : `inset 0 0 0 1px ${BORDER}` }}>
              {m === "register" ? "Register" : "Sign in"}
            </button>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:28 }}>
          {mode === "register" && (
            <div>
              <span style={label}>1 · What kind of actor are you?</span>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:8 }}>
                {ROLES.map(r => {
                  const on = r.id === role;
                  return (
                    <button key={r.id} type="button" onClick={() => setRole(r.id)}
                      style={{ textAlign:"left", cursor:"pointer", padding:"12px 12px",
                        clipPath:FORGE_CLIPS.panelTL, border:"none",
                        background: on ? "rgba(10,127,115,0.14)" : SURFACE,
                        boxShadow:`inset 0 0 0 1px ${on ? TEAL : BORDER}`,
                        borderLeft:`3px solid ${on ? TEAL : "transparent"}` }}>
                      <div style={{ fontSize:16, color:on?TEAL:MUTED, lineHeight:1 }}>{r.glyph}</div>
                      <div style={{ fontFamily:UI, fontWeight:700, fontSize:12.5, color:IVORY, marginTop:8 }}>{r.label}</div>
                      <div style={{ fontFamily:UI, fontSize:9.5, letterSpacing:"0.1em",
                        textTransform:"uppercase", color:MUTED, marginTop:4 }}>{r.kind}</div>
                    </button>
                  );
                })}
              </div>
              {chosen && (
                <div style={{ clipPath:FORGE_CLIPS.panelBR, background:SURFACE,
                  borderTop:`2px solid ${TEAL}`, padding:"14px 16px", marginTop:12 }}>
                  <div style={{ fontFamily:UI, fontSize:13, color:"rgba(245,241,233,.82)", lineHeight:1.55 }}>
                    {chosen.purpose}
                  </div>
                  <div style={{ ...label, marginTop:14, marginBottom:6 }}>Permissions granted</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {chosen.capabilities.map(c => (
                      <span key={c} style={{ fontFamily:UI, fontWeight:600, fontSize:10,
                        letterSpacing:"0.06em", color:AMBER, background:"rgba(245,166,35,.10)",
                        padding:"4px 8px", clipPath:FORGE_CLIPS.buttonSm }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={submit}>
            <span style={label}>{mode === "register" ? "2 · Your details" : "Sign in"}</span>
            <div style={{ display:"grid", gap:14, maxWidth:420 }}>
              {mode === "register" && (
                <label>
                  <span style={label}>{chosen?.kind === "organisation" ? "Organisation name" : "Full name"}</span>
                  <input style={field} value={form.displayName} onChange={set("displayName")} required />
                </label>
              )}
              <label>
                <span style={label}>Email</span>
                <input style={field} type="email" value={form.email} onChange={set("email")} required />
              </label>
              <label>
                <span style={label}>Password</span>
                <input style={field} type="password" minLength={8} value={form.password}
                  onChange={set("password")} required />
              </label>
              {mode === "register" && (
                <>
                  <label>
                    <span style={label}>State</span>
                    <select style={field} value={form.state} onChange={set("state")} required>
                      <option value="">Select…</option>
                      {NG_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                  <label>
                    <span style={label}>Discipline or sector</span>
                    <input style={field} value={form.discipline} onChange={set("discipline")}
                      placeholder="e.g. sheet-metal fabrication, CNC machining" />
                  </label>
                </>
              )}

              {err && <div style={{ color:PINK, fontSize:12.5, fontFamily:UI }}>{err}</div>}
              {msg && <div style={{ color:TEAL, fontSize:12.5, fontFamily:UI }}>{msg}</div>}

              <button type="submit" disabled={busy || !configured}
                style={{ fontFamily:UI, fontWeight:700, fontSize:12.5, letterSpacing:"0.12em",
                  textTransform:"uppercase", padding:"14px 26px", border:"none",
                  clipPath:FORGE_CLIPS.button,
                  background: (busy || !configured) ? BORDER : AMBER,
                  color: (busy || !configured) ? MUTED : BLACK,
                  cursor: (busy || !configured) ? "not-allowed" : "pointer" }}>
                {busy ? "Working…" : mode === "register" ? "Register →" : "Sign in →"}
              </button>
              {session && (
                <button type="button" onClick={() => navigate("/workspace")}
                  style={{ fontFamily:UI, fontWeight:700, fontSize:11, letterSpacing:"0.12em",
                    textTransform:"uppercase", padding:"12px 22px", cursor:"pointer",
                    background:"transparent", color:TEAL, border:`1px solid ${TEAL}`,
                    clipPath:FORGE_CLIPS.button }}>
                  Go to my workspace →
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
