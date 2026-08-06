// ============================================================
// FORGE OS — LANGUAGE STUDIO
//
// Why this room exists: knowledge that cannot be read is not knowledge.
// A welder in Warri and a machinist in Kano must be able to read the same
// specification in the language they actually think in.
//
// WHAT WORK HAPPENS HERE: this room reports real translation coverage,
// computed from src/os/i18n.js at render time, and names the exact keys
// that are still missing per language. That list is the work queue — it
// tells you precisely which strings a native speaker needs to supply.
//
// PROVENANCE: every number on this screen is counted from the source
// dictionaries. Nothing is specimen. If a language is short, it says so.
// ============================================================

import { useMemo, useState } from "react";
import { T } from "../os/forge.js";
import { useForgeActivity } from "../os/ActivityEngine.jsx";
import { useLanguage } from "../os/useLanguage.js";
import { translations, SUPPORTED_LANGUAGES } from "../os/i18n.js";
import { FORGE_CLIPS } from "../os/geometry.js";

// Palette is NOT declared here. Canonical tokens only — see src/os/forge.js.
const { black:BLACK, ivory:IVORY, teal:TEAL, amber:AMBER, pink:PINK,
        surface:SURFACE_T, border:BORDER_T, grey:GREY_T, green:GREEN_T } = T;
const SURFACE=SURFACE_T, BORDER=BORDER_T, MUTED=GREY_T, GREEN=GREEN_T;
const UI="var(--forge-brand-font, 'Poppins', system-ui, sans-serif)";
const DISPLAY="var(--forge-display-font, 'Poppins', system-ui, sans-serif)";

// Coverage is measured against English, which is the source of truth.
const SOURCE = "en";

function coverageColor(pct) {
  if (pct >= 100) return GREEN;
  if (pct >= 60)  return TEAL;
  if (pct >= 30)  return AMBER;
  return PINK;
}

function Label({ children }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ fontFamily:UI, fontWeight:600, fontSize:10, letterSpacing:"0.2em",
        textTransform:"uppercase", color:TEAL }}>{children}</div>
      <div style={{ width:40, height:2, background:PINK, marginTop:6 }} />
    </div>
  );
}

function LanguageCard({ meta, covered, total, active, onSelect, selected }) {
  const pct = total ? Math.round((covered / total) * 100) : 0;
  const c = coverageColor(pct);
  return (
    <button type="button" onClick={() => onSelect(meta.code)}
      style={{ textAlign:"left", cursor:"pointer", border:"none",
        clipPath:FORGE_CLIPS.panelTL, background: selected ? "rgba(10,127,115,0.12)" : SURFACE,
        boxShadow:`inset 0 0 0 1px ${selected ? TEAL : BORDER}`,
        borderLeft:`3px solid ${c}`, padding:"16px 18px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:10 }}>
        <span style={{ fontFamily:UI, fontWeight:700, fontSize:14, color:IVORY }}>{meta.label}</span>
        <span style={{ fontFamily:UI, fontWeight:600, fontSize:9.5, letterSpacing:"0.14em",
          textTransform:"uppercase", color:MUTED }}>{meta.code}</span>
      </div>
      <div style={{ fontFamily:DISPLAY, fontWeight:900, fontSize:30, color:c,
        letterSpacing:"-0.02em", lineHeight:1, marginTop:12 }}>{pct}<span style={{ fontSize:15 }}>%</span></div>
      <div style={{ fontFamily:UI, fontSize:11, color:MUTED, marginTop:6 }}>
        {covered} of {total} strings
      </div>
      {/* coverage bar — real proportion, not decoration */}
      <div style={{ height:3, background:BORDER, marginTop:10 }}>
        <div style={{ width:`${pct}%`, height:"100%", background:c }} />
      </div>
      {active && (
        <div style={{ fontFamily:UI, fontWeight:700, fontSize:9, letterSpacing:"0.16em",
          textTransform:"uppercase", color:TEAL, marginTop:10 }}>Active runtime language</div>
      )}
      {meta.note && (
        <div style={{ fontFamily:UI, fontSize:10, color:MUTED, marginTop:6 }}>{meta.note}</div>
      )}
    </button>
  );
}

export default function LanguageStudio() {
  const { log } = useForgeActivity();
  const { lang, setLang } = useLanguage();
  const [selected, setSelected] = useState("urh");

  // Real coverage, counted from the dictionaries themselves.
  const stats = useMemo(() => {
    const sourceKeys = Object.keys(translations[SOURCE] || {});
    return SUPPORTED_LANGUAGES.map((meta) => {
      const dict = translations[meta.code] || {};
      const present = sourceKeys.filter((k) => {
        const v = dict[k];
        return typeof v === "string" && v.trim() !== "";
      });
      return {
        meta,
        covered: meta.code === SOURCE ? sourceKeys.length : present.length,
        total: sourceKeys.length,
        missing: meta.code === SOURCE ? [] : sourceKeys.filter((k) => !present.includes(k)),
      };
    });
  }, []);

  const sel = stats.find((s) => s.meta.code === selected) || stats[0];
  const totalKeys = stats[0]?.total ?? 0;
  const fullyCovered = stats.filter((s) => s.covered === s.total).length;
  const outstanding = stats.reduce((n, s) => n + s.missing.length, 0);

  // Real language events off the bus. useLanguage publishes
  // system.language.changed, so this stream is genuine.
  const languageEvents = useMemo(
    () => (log || []).filter((e) => typeof e.type === "string" &&
      (e.type.startsWith("language.") || e.type.includes("language"))).slice(0, 10),
    [log]
  );

  return (
    <div className="forge-brand" style={{ background:BLACK, color:IVORY, minHeight:"100%",
      padding:"clamp(24px,4vw,48px)", fontFamily:UI, boxSizing:"border-box" }}>

      <div style={{ fontFamily:UI, fontWeight:600, fontSize:10, letterSpacing:"0.2em",
        textTransform:"uppercase", color:TEAL, borderLeft:`2px solid ${TEAL}`,
        paddingLeft:12, marginBottom:16 }}>Forge OS · Language Studio</div>

      <h1 style={{ fontFamily:DISPLAY, fontWeight:900, fontSize:"clamp(26px,3.6vw,40px)",
        letterSpacing:"-0.03em", lineHeight:0.98, margin:"0 0 12px" }}>
        Knowledge without a <span style={{ color:PINK }}>language barrier</span>.
      </h1>
      <p style={{ color:"rgba(245,241,233,0.72)", fontSize:14.5, maxWidth:660,
        lineHeight:1.6, margin:"0 0 8px" }}>
        Coverage below is counted from the runtime dictionaries at render time.
        A specification a machinist cannot read is not a specification.
      </p>
      <p style={{ fontFamily:UI, fontWeight:600, fontSize:11, color:MUTED,
        letterSpacing:"0.04em", margin:"0 0 30px" }}>
        {totalKeys} interface strings · {fullyCovered} of {stats.length} languages complete ·{" "}
        <span style={{ color: outstanding ? AMBER : GREEN }}>{outstanding} translations outstanding</span>
      </p>

      <Label>Runtime languages</Label>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",
        gap:10, marginBottom:34 }}>
        {stats.map((s) => (
          <LanguageCard key={s.meta.code} meta={s.meta} covered={s.covered} total={s.total}
            active={s.meta.code === lang} selected={s.meta.code === selected}
            onSelect={setSelected} />
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:20 }}>

        {/* THE WORK QUEUE — the actual point of this room */}
        <div>
          <Label>Outstanding strings · {sel?.meta.label}</Label>
          <div style={{ clipPath:FORGE_CLIPS.panelBR, background:SURFACE,
            borderTop:`2px solid ${sel?.missing.length ? AMBER : GREEN}`, padding:"18px 20px" }}>
            {!sel?.missing.length ? (
              <div style={{ fontFamily:UI, fontSize:13, color:GREEN }}>
                Complete. Every interface string exists in {sel?.meta.label}.
              </div>
            ) : (
              <>
                <div style={{ fontFamily:UI, fontSize:12.5, color:"rgba(245,241,233,.8)",
                  lineHeight:1.55, marginBottom:14 }}>
                  {sel.missing.length} keys fall back to English. These are the exact strings a
                  native speaker needs to supply — hand this list over and they drop straight in.
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {sel.missing.map((k) => (
                    <span key={k} style={{ fontFamily:"var(--forge-mono, ui-monospace, monospace)",
                      fontSize:10.5, color:AMBER, background:"rgba(245,166,35,.10)",
                      padding:"4px 8px", clipPath:FORGE_CLIPS.buttonSm }}>{k}</span>
                  ))}
                </div>
                <div style={{ fontFamily:UI, fontWeight:600, fontSize:10,
                  letterSpacing:"0.14em", textTransform:"uppercase", color:MUTED, marginTop:16 }}>
                  Falling back to English · not machine-translated
                </div>
              </>
            )}
          </div>
        </div>

        <div>
          <Label>Switch the runtime</Label>
          <div style={{ clipPath:FORGE_CLIPS.panelTR, background:SURFACE,
            borderTop:`2px solid ${TEAL}`, padding:"18px 20px" }}>
            <div style={{ fontFamily:UI, fontSize:12.5, color:"rgba(245,241,233,.78)",
              lineHeight:1.55, marginBottom:14 }}>
              Changing this switches every surface in Forge OS and publishes a real event
              onto the bus. It is a system preference, not a page setting.
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {SUPPORTED_LANGUAGES.map((l) => (
                <button key={l.code} type="button" onClick={() => setLang(l.code)}
                  style={{ fontFamily:UI, fontWeight:700, fontSize:10.5, letterSpacing:"0.12em",
                    textTransform:"uppercase", padding:"9px 14px", cursor:"pointer", border:"none",
                    clipPath:FORGE_CLIPS.buttonSm,
                    background: l.code === lang ? TEAL : "transparent",
                    color: l.code === lang ? BLACK : MUTED,
                    boxShadow: l.code === lang ? "none" : `inset 0 0 0 1px ${BORDER}` }}>
                  {l.label}
                </button>
              ))}
            </div>

            <div style={{ ...{}, marginTop:22 }}>
              <div style={{ fontFamily:UI, fontWeight:600, fontSize:10, letterSpacing:"0.18em",
                textTransform:"uppercase", color:TEAL, marginBottom:8 }}>Language events</div>
              {languageEvents.length === 0 ? (
                <div style={{ fontFamily:UI, fontSize:12, color:MUTED, fontStyle:"italic" }}>
                  No language events on the bus yet. Switching language above emits one.
                </div>
              ) : languageEvents.map((e, i) => (
                <div key={`${e.at}-${i}`} style={{ display:"flex", justifyContent:"space-between",
                  gap:10, padding:"7px 0", borderBottom:`1px solid ${BORDER}` }}>
                  <span style={{ fontFamily:UI, fontSize:11.5, color:IVORY }}>{e.type}</span>
                  <span style={{ fontFamily:UI, fontSize:11, color:MUTED }}>{e.language || e.hub || ""}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
