// ============================================================
// FORGE OS — ARRIVAL MASTHEAD  (BUILD-D001 compliant)
//
// The moment of entering Forge. A control surface, not a hero.
// It states the mission on a machined plate, shows live national
// activity from the Activity Engine, names the studios where
// people work, and offers the knowledge language.
//
// BUILD-D001 Part 2 applied:
//   Palette  — Forge Black / Ivory / Teal / Amber / Pink only.
//              No cyan, no gold, no neon. 60/25/10/3/2 usage.
//   Type     — Poppins (via the .forge-brand surface).
//   Geometry — existing geo-* primitives, coloured by the brand
//              via the .forge-brand variable mapping. No one-offs.
//   Language — a persisted preference (real infrastructure),
//              never a faked translation.
//
// Architecture, router, runtime and Showcase are untouched.
// Every number is real (Activity Engine) or a real enum
// (ForgeRuntime STUDIO / LANGUAGE).
// ============================================================

import { useState } from "react";
import { useForgeActivity } from "../../os/ActivityEngine.jsx";
import { STUDIO, LANGUAGE } from "../../os/ForgeRuntime.js";

const STUDIO_LABEL = {
  vehicle: "Vehicle", specification: "Specification", geometry: "Geometry",
  knowledge: "Knowledge", ai: "AI", workshop: "Workshop",
  document: "Documentation", training: "Academy",
};
const STUDIOS = Object.values(STUDIO);
const LANGUAGES = Object.values(LANGUAGE);
const LANG_KEY = "forge.knowledgeLanguage";

// Coordinate-grid field — the "manufactured surface" backdrop, drawn in the
// ivory foreground at low opacity (support tier), never an accent.
const FIELD = {
  position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.5,
  backgroundImage:
    "linear-gradient(var(--forge-ivory-12) 1px, transparent 1px)," +
    "linear-gradient(90deg, var(--forge-ivory-12) 1px, transparent 1px)",
  backgroundSize: "46px 46px",
  maskImage: "radial-gradient(120% 90% at 18% 0%, #000 42%, transparent 100%)",
  WebkitMaskImage: "radial-gradient(120% 90% at 18% 0%, #000 42%, transparent 100%)",
};

// The Forge signature: stacked pink / ivory / teal bars, echoing the wordmark.
// This is the only place pink appears — the 2% highlight.
function BrandBars() {
  return (
    <span aria-hidden="true" style={{ display: "inline-flex", flexDirection: "column", gap: 3, verticalAlign: "middle", marginRight: 14 }}>
      <i style={{ width: 26, height: 4, background: "var(--forge-pink)" }} />
      <i style={{ width: 26, height: 4, background: "var(--forge-ivory)" }} />
      <i style={{ width: 26, height: 4, background: "var(--forge-teal)" }} />
    </span>
  );
}

function Readout({ label, value, accent }) {
  return (
    <div style={{ minWidth: 118 }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", color: "var(--forge-ivory-55)" }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.05, color: accent || "var(--forge-ivory)" }}>{value}</div>
    </div>
  );
}

export default function ArrivalMasthead() {
  const { event, hubStates, machineStates } = useForgeActivity();
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem(LANG_KEY) || LANGUAGES[0]; } catch { return LANGUAGES[0]; }
  });
  const chooseLang = (l) => {
    setLang(l);
    try { localStorage.setItem(LANG_KEY, l); } catch { /* preference persistence is best-effort */ }
  };

  const hubsReporting = Object.keys(hubStates || {}).length;
  const machinesActive = Object.values(machineStates || {}).filter((s) => s === "active").length;

  return (
    <section
      className="forge-brand"
      aria-label="Arrival — entering Forge"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "clamp(28px, 6vw, 72px) clamp(20px, 6vw, 80px)",
        background: "var(--forge-black)",
        borderBottom: "1px solid rgba(10,127,115,0.35)",
      }}
    >
      <div style={FIELD} aria-hidden="true" />
      <span className="geo-reg tl" /><span className="geo-reg tr" />
      <span className="geo-reg bl" /><span className="geo-reg br" />

      <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto" }}>
        {/* Eyebrow */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 22 }}>
          <BrandBars />
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--forge-teal)" }}>
            Forge OS · Room 01 · Arrival Dock
          </span>
        </div>

        {/* Mission plate — the machined declaration */}
        <div
          className="geo-diamond-cut-lg"
          style={{
            position: "relative",
            background: "linear-gradient(155deg, rgba(245,241,233,0.04), rgba(13,13,15,0.9))",
            border: "1px solid rgba(10,127,115,0.45)",
            borderLeft: "3px solid var(--forge-teal)",
            padding: "clamp(22px, 4vw, 40px)",
            maxWidth: 880,
          }}
        >
          <h1 style={{ fontSize: "clamp(34px, 6vw, 76px)", lineHeight: 1.02, margin: 0, color: "var(--forge-ivory)" }}>
            You are entering <span style={{ color: "var(--forge-teal)" }}>Forge.</span>
          </h1>
          <p style={{ marginTop: 18, maxWidth: "60ch", color: "var(--forge-ivory-70)", fontSize: "clamp(14px, 1.4vw, 18px)", fontWeight: 400, lineHeight: 1.55 }}>
            The coordination layer for distributed manufacturing. One shared vehicle, built by a
            network of workshops, universities, corps members and diaspora engineers — connecting
            people, knowledge and workshops to build real capability across generations.
          </p>
        </div>

        {/* Live national activity — from the Activity Engine */}
        <div
          className="geo-diamond-cut"
          style={{
            marginTop: 22,
            display: "flex", flexWrap: "wrap", gap: "clamp(18px, 3vw, 44px)", alignItems: "center",
            background: "rgba(245,241,233,0.03)",
            border: "1px solid var(--forge-ivory-12)",
            padding: "18px clamp(18px, 3vw, 30px)",
          }}
        >
          <Readout label="HUBS REPORTING" value={hubsReporting} accent="var(--forge-teal)" />
          <Readout label="MACHINES ACTIVE" value={machinesActive} accent="var(--forge-amber)" />
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", color: "var(--forge-ivory-55)" }}>
              LATEST NATIONAL ACTIVITY
            </div>
            {event ? (
              <div style={{ marginTop: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", color: "var(--forge-teal)" }}>{event.type}</span>
                <div style={{ fontSize: 14, marginTop: 2, color: "var(--forge-ivory)" }}>
                  {event.text}{event.hub ? <span style={{ color: "var(--forge-ivory-55)" }}> · {String(event.hub).toUpperCase()}</span> : null}
                </div>
              </div>
            ) : (
              <div style={{ color: "var(--forge-ivory-55)", marginTop: 6, fontSize: 13 }}>system online · awaiting activity</div>
            )}
          </div>
        </div>

        {/* Studios — the places people work */}
        <div style={{ marginTop: 30 }}>
          <div className="geo-notch" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--forge-ivory-55)", marginBottom: 12 }}>
            Studios
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {STUDIOS.map((s) => (
              <div
                key={s}
                className="geo-diamond-cut"
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "9px 16px",
                  background: "rgba(245,241,233,0.03)",
                  border: "1px solid rgba(245,241,233,0.14)",
                }}
              >
                <span className="geo-hex" style={{ width: 14, height: 15, background: "var(--forge-teal)", boxShadow: "none" }} aria-hidden="true" />
                <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.03em", color: "var(--forge-ivory)" }}>
                  {STUDIO_LABEL[s] || s} Studio
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge language — infrastructure, not decoration. A persisted
            preference; it fakes no translation. */}
        <div style={{ marginTop: 30 }}>
          <div className="geo-notch" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--forge-ivory-55)", marginBottom: 12 }}>
            Knowledge language
          </div>
          <div role="group" aria-label="Knowledge language" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {LANGUAGES.map((l) => {
              const active = l === lang;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => chooseLang(l)}
                  aria-pressed={active}
                  style={{
                    cursor: "pointer",
                    padding: "6px 14px",
                    fontSize: 12,
                    fontWeight: active ? 600 : 500,
                    fontFamily: "var(--forge-display-font, 'Poppins', system-ui, sans-serif)",
                    color: active ? "var(--forge-black)" : "var(--forge-ivory)",
                    background: active ? "var(--forge-amber)" : "transparent",
                    border: "1px solid " + (active ? "var(--forge-amber)" : "rgba(245,241,233,0.28)"),
                    clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                  }}
                >
                  {l}
                </button>
              );
            })}
          </div>
          <p style={{ marginTop: 10, fontSize: 11, color: "var(--forge-ivory-55)" }}>
            No manufacturing knowledge shall be trapped in one language. Article XVII.
          </p>
        </div>
      </div>
    </section>
  );
}
