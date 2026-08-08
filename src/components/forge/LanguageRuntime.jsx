// ============================================================
// FORGE OS — LANGUAGE RUNTIME
//
// Not a <select>. A system module: the languages appear as runtime
// options with a check indicator, and switching plays a brief boot
// transition ("Loading Hausa… ✓ Navigation ✓ Hero … Language Ready")
// in Forge geometry before the whole surface re-renders in the new
// language. BUILD-D001 palette; no decorative effects.
// ============================================================

import { useState, useRef } from "react";
import { T, stateColor } from "../../os/forge.js";
import { useLanguage } from "../../os/useLanguage.js";
import { FORGE_CLIPS } from "../../os/geometry.js";

// Palette is NOT declared here — canonical tokens only (src/os/forge.js).
const { black:BLACK, ivory:IVORY, teal:TEAL, amber:AMBER } = T;
const { surface:SURFACE, border:BORDER, grey:MUTED } = T;
const UI = "var(--forge-brand-font, 'Poppins', system-ui, sans-serif)";

export default function LanguageRuntime() {
  const { lang, setLang, t, languages } = useLanguage();
  const [phase, setPhase] = useState(null); // { label, done:[], ready:bool }
  const busy = useRef(false);

  const choose = (code) => {
    if (busy.current || code === lang) return;
    busy.current = true;
    setLang(code); // the whole surface switches immediately, behind the overlay
    const label = languages.find((l) => l.code === code)?.label || code;
    setPhase({ label, done: [], ready: false });
    [0, 1, 2, 3, 4].forEach((i) =>
      setTimeout(() => setPhase((p) => (p ? { ...p, done: [...p.done, i] } : p)), 55 * (i + 1))
    );
    setTimeout(() => setPhase((p) => (p ? { ...p, ready: true } : p)), 55 * 6);
    setTimeout(() => { setPhase(null); busy.current = false; }, 55 * 6 + 380);
  };

  const steps = [
    t("runtime.step.navigation"), t("runtime.step.hero"),
    t("runtime.step.labels"), t("runtime.step.activities"), t("runtime.step.studios"),
  ];

  return (
    <div>
      <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: TEAL, marginBottom: 10 }}>
        {t("runtime.title")}
      </div>

      <div style={{ clipPath: FORGE_CLIPS.panelBR, background: "rgba(245,241,233,0.03)", border: "1px solid rgba(10,127,115,0.30)", padding: 8, maxWidth: 460 }}>
        {languages.map((l) => {
          const active = l.code === lang;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => choose(l.code)}
              aria-pressed={active}
              style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
                cursor: "pointer", background: active ? "rgba(10,127,115,0.12)" : "transparent",
                border: "none", padding: "8px 10px", fontFamily: UI,
              }}
            >
              <span style={{
                width: 15, height: 15, display: "inline-flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${active ? TEAL : BORDER}`, color: TEAL, fontSize: 11, lineHeight: 1,
                clipPath: FORGE_CLIPS.buttonSm, flexShrink: 0,
              }}>{active ? "✓" : ""}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: active ? 600 : 400, color: active ? IVORY : "rgba(245,241,233,0.75)" }}>{l.label}</span>
              {l.note && <span style={{ fontSize: 10, color: MUTED, letterSpacing: "0.03em" }}>{l.note}</span>}
            </button>
          );
        })}
      </div>

      {/* boot transition */}
      {phase && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(13,13,15,0.82)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI }}>
          <div style={{ position: "relative", clipPath: FORGE_CLIPS.panelBR, background: SURFACE, border: `1px solid ${TEAL}`, padding: "28px 34px", minWidth: 300 }}>
            {/* geometry accents */}
            <span style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, background: AMBER, transform: "rotate(45deg)" }} />
            <div style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: TEAL, fontWeight: 600, marginBottom: 12 }}>{t("runtime.title")}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: IVORY, marginBottom: 18 }}>{t("runtime.loading")} {phase.label}…</div>
            {steps.map((s, i) => {
              const done = phase.done.includes(i);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0", opacity: done ? 1 : 0.35, transition: "opacity .15s" }}>
                  <span style={{ color: done ? TEAL : MUTED, fontSize: 13, width: 14 }}>{done ? "✓" : "·"}</span>
                  <span style={{ fontSize: 13, color: IVORY }}>{s}</span>
                </div>
              );
            })}
            {phase.ready && (
              <div style={{ marginTop: 16, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: AMBER }}>{t("runtime.ready")}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
