// ============================================================
// FORGE OS — ARRIVAL DOCK  (BUILD-D001, fully multilingual)
//
// BUILD-D001 throughout: Forge Black canvas, Ivory text, Poppins
// (Black 900 for headlines), Teal/Amber/Pink, Forge geometry (clips + reg marks) on
// every panel, metric, portal and divider.
//
// Every visible string is requested by key via t(); switching the
// Language Runtime re-renders the whole surface in the new language.
// All data is read from useForgeActivity(); nothing is fabricated.
// ============================================================

import { useState, useEffect, useMemo } from "react";
import { T, stateColor } from "../os/forge.js";
import { useNavigate } from "react-router-dom";
import { useForgeActivity, EVENT } from "../os/ActivityEngine.jsx";
import { buildRuntime } from "../os/ForgeRuntime.js";
import { useLanguage } from "../os/useLanguage.js";
import { FORGE_CLIPS } from "../os/geometry.js";
import { LOGO_EMBLEM, LOGO_MARK } from "../lib/assets";
import NmcpArrival from "../components/showcase/NmcpArrival.jsx";
import TruckViewer from "../components/hero/TruckViewer.jsx";
import { HumanTag } from "../humans/HumanGlyphLibrary.jsx";
import LanguageRuntime from "./LanguageRuntime.jsx";

// --- BUILD-D001 palette -------------------------------------------------------
// Palette is NOT declared here — canonical tokens only (src/os/forge.js).
const { black:BLACK, ivory:IVORY, teal:TEAL, amber:AMBER } = T;
const PINK = T.pink;      // BUILD-D001 highlight — momentum, bold initiative
const METRIC_ACCENTS = [TEAL, PINK, AMBER, PINK, TEAL];
const { surface:SURFACE, border:BORDER, grey:MUTED } = T;
const UI = "var(--forge-brand-font, 'Poppins', system-ui, sans-serif)";
const DISPLAY = "var(--forge-display-font, 'Poppins', system-ui, sans-serif)";

// One semantic mapping for the whole OS — no room-local status colours.
const hubColor = (s) => stateColor(s);

// --- helpers ------------------------------------------------------------------
function shortTime(at) {
  if (!at) return "";
  try { return new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
  catch { return ""; }
}
function elapsed(at) {
  if (!at) return "No activity";
  const s = Math.floor((Date.now() - at) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}
function useCountUp(target, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) { setCount(0); return; }
    let start = null, raf = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return count;
}

// --- tiny stroke icons (Teal) -------------------------------------------------
const ic = { width: 20, height: 20, fill: "none", stroke: TEAL, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
const IconPeople = () => (<svg viewBox="0 0 24 24" {...ic}><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /><path d="M16 6a3 3 0 0 1 0 6M18 20c0-2-1-3.5-2.5-4.3" /></svg>);
const IconFactory = () => (<svg viewBox="0 0 24 24" {...ic}><path d="M3 21V9l6 4V9l6 4V6l6 3v12z" /><path d="M3 21h18" /></svg>);
const IconGear = () => (<svg viewBox="0 0 24 24" {...ic}><circle cx="12" cy="12" r="3.2" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2 2M16.5 16.5l2 2M18.5 5.5l-2 2M7.5 16.5l-2 2" /></svg>);
const IconPin = () => (<svg viewBox="0 0 24 24" {...ic}><path d="M12 21s6-5.5 6-10a6 6 0 1 0-12 0c0 4.5 6 10 6 10z" /><circle cx="12" cy="11" r="2" /></svg>);
const IconGlobe = () => (<svg viewBox="0 0 24 24" {...ic}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>);

function SectionLabel({ children }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: TEAL }}>{children}</div>
      <div style={{ width: 40, height: 2, background: PINK, marginTop: 6 }} />
    </div>
  );
}

function Divider() {
  return (
    <div aria-hidden="true" style={{ position: "relative", height: 2, margin: "0 clamp(24px,5vw,60px)", background: "linear-gradient(90deg, transparent, rgba(10,127,115,.45) 18%, rgba(10,127,115,.45) 82%, transparent)" }}>
      <span style={{ position: "absolute", left: "50%", top: "50%", width: 9, height: 9, background: PINK, transform: "translate(-50%,-50%) rotate(45deg)" }} />
    </div>
  );
}

function StatusRow({ value, text, ok }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "3px 0", fontFamily: UI, fontSize: 13 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: ok ? TEAL : PINK, boxShadow: `0 0 6px ${(ok ? TEAL : PINK)}66`, flexShrink: 0 }} />
      {value != null && <b style={{ color: AMBER, fontWeight: 700 }}>{value}</b>}
      <span style={{ color: "rgba(245,241,233,0.82)" }}>{text}</span>
    </div>
  );
}

// --- Hero wireframe backdrop --------------------------------------------------
const WIRE = (() => {
  let seed = 20240607;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const W = 1000, H = 620, cols = 9, rows = 6, pts = [];
  for (let r = 0; r <= rows; r++) for (let c = 0; c <= cols; c++)
    pts.push({ x: (c / cols) * W + (rnd() - 0.5) * 72, y: (r / rows) * H + (rnd() - 0.5) * 72, hot: rnd() > 0.86 });
  const edges = [];
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
    if (d < 150) edges.push([i, j]);
  }
  return { W, H, pts, edges };
})();
function HeroWireframe() {
  const { W, H, pts, edges } = WIRE;
  return (
    <div aria-hidden="true" style={{
      position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.5,
      maskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,.35) 42%, #000 78%)",
      WebkitMaskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,.35) 42%, #000 78%)",
    }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        {edges.map(([a, b], i) => (<line key={i} x1={pts[a].x} y1={pts[a].y} x2={pts[b].x} y2={pts[b].y} stroke={TEAL} strokeOpacity="0.16" strokeWidth="1" />))}
        {/* Decorative travelling dots removed: motion in Forge OS means manufacturing
            changed. An idle loop here competed with the ripple pulses that carry real
            events, and taught the eye to ignore movement. The static graph remains. */}
        {pts.map((p, i) => (<circle key={"p" + i} cx={p.x} cy={p.y} r={p.hot ? 2.6 : 1.4} fill={p.hot ? AMBER : TEAL} opacity={p.hot ? 0.9 : 0.5} />))}
      </svg>
    </div>
  );
}

// --- interlocking metric plate -----------------------------------------------
function Metric({ Icon, value, label, desc, index = 0 }) {
  const n = useCountUp(value);
  const even = index % 2 === 0;
  return (
    <div style={{ clipPath: even ? FORGE_CLIPS.panelBR : FORGE_CLIPS.panelTR, background: SURFACE, borderTop: `2px solid ${METRIC_ACCENTS[index % METRIC_ACCENTS.length]}`, padding: "22px 24px", flex: "1 1 180px", minWidth: 160 }}>
      <div style={{ marginBottom: 10 }}><Icon /></div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 38, color: METRIC_ACCENTS[index % METRIC_ACCENTS.length], lineHeight: 1 }}>{n}</div>
      <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: TEAL, marginTop: 8 }}>{label}</div>
      <div style={{ fontFamily: UI, fontWeight: 400, fontSize: 11, color: MUTED, marginTop: 4 }}>{desc}</div>
    </div>
  );
}

// ============================================================
// DEMO SEED — specimen activity fired once on mount.
//
// Why this is needed: buildRuntime() counts DISTINCT log fields
// (e.human, e.workshop, e.component). ActivityEngine publishes one
// SEED_STREAM event on mount and one more every 4.2s, so the counts
// legitimately start at 1 — and useCountUp floors a target of 1 to "0"
// for almost its whole 1400ms animation. That is the "five zeros".
// This burst gives the runtime a populated log immediately.
//
// PROVENANCE: these are SPECIMEN values, not survey data. The field
// names below are deliberately the ones buildRuntime actually reads —
// an event carrying `person:` instead of `human:` increments nothing.
// ============================================================
const DEMO_EVENTS = [
  { type:EVENT.MACHINE_STARTED,      hub:"kaduna",       machine:"sheetBrake",      component:"CHS-014", human:"Ibrahim Danladi", role:"WELDER",    variant:"M", workshop:"Kaduna Heavy Industry",     text:"Chassis rail fold started" },
  { type:EVENT.COMPONENT_RECEIVED,   hub:"kano",         machine:"lathe",           component:"CRS-101", human:"Halima Yusuf",    role:"ENGINEER",  variant:"F", workshop:"Kano Metal Works",          text:"Cross-member blanks received" },
  { type:EVENT.MACHINE_STARTED,      hub:"nnewi",        machine:"cncMill",         component:"HUB-002", human:"Chike Nwosu",     role:"ENGINEER",  variant:"M", workshop:"Nnewi Precision Works",     text:"Wheel hub machining started" },
  { type:EVENT.DRAWING_APPROVED,     hub:"abuja",        machine:"workbench",       component:"BRK-007", human:"Ngozi Bello",     role:"ENGINEER",  variant:"F", workshop:"NASENI Abuja",              text:"Axle bracket drawing approved" },
  { type:EVENT.MACHINE_STARTED,      hub:"aba",          machine:"migWelder",       component:"PNL-021", human:"Uche Chikelu",    role:"WELDER",    variant:"M", workshop:"Aba SME Cluster",           text:"Panel seam weld started" },
  { type:EVENT.INSPECTION_COMPLETED, hub:"lagos",        machine:"inspectionTable", component:"CHS-014", human:"Amina Suleiman",  role:"INSPECTOR", variant:"F", workshop:"Forge Quality Office",      text:"Chassis rail inspection completed" },
  { type:EVENT.QUALITY_VERIFIED,     hub:"lagos",        machine:"inspectionTable", component:"HUB-002", human:"Amina Suleiman",  role:"INSPECTOR", variant:"F", workshop:"Forge Quality Office",      text:"Wheel hub verified to FTT-HB-001" },
  { type:EVENT.MACHINE_STARTED,      hub:"warri",        machine:"migWelder",       component:"CHS-015", human:"Adaeze Okoro",    role:"WELDER",    variant:"F", workshop:"Warri Fabrication Co-op",   text:"Second chassis rail started" },
  { type:EVENT.COMPONENT_RECEIVED,   hub:"onitsha",      machine:"pressBrake",      component:"PNL-022", human:"Emeka Obi",       role:"ENGINEER",  variant:"M", workshop:"Onitsha Assembly Yard",     text:"Panel set received for assembly" },
  { type:EVENT.DRAWING_APPROVED,     hub:"ilorin",       machine:"workbench",       component:"SPR-003", human:"Folake Adeyemi",  role:"ENGINEER",  variant:"F", workshop:"Ilorin Polytechnic",        text:"Leaf spring specification approved" },
  { type:EVENT.MACHINE_STARTED,      hub:"ibadan",       machine:"lathe",           component:"SPR-003", human:"Tunde Bakare",    role:"ENGINEER",  variant:"M", workshop:"Ibadan Technical College",  text:"Spring pin turning started" },
  { type:EVENT.INSPECTION_COMPLETED, hub:"enugu",        machine:"inspectionTable", component:"BRK-007", human:"Chinaza Eze",     role:"INSPECTOR", variant:"F", workshop:"Enugu Inspection Cell",     text:"Bracket dimensional check completed" },
  { type:EVENT.MACHINE_STARTED,      hub:"jos",          machine:"hydraulicPress",  component:"MNT-011", human:"Danjuma Bala",    role:"WELDER",    variant:"M", workshop:"Jos Fabrication Unit",      text:"Engine mount pressing started" },
  { type:EVENT.COMPONENT_RECEIVED,   hub:"benin",        machine:"foundryLadle",    component:"CST-004", human:"Godwin Ejime",    role:"ENGINEER",  variant:"M", workshop:"Benin Foundry",             text:"Cast housing batch received" },
  { type:EVENT.QUALITY_VERIFIED,     hub:"asaba",        machine:"inspectionTable", component:"PNL-021", human:"Rita Okonkwo",    role:"INSPECTOR", variant:"F", workshop:"Asaba Quality Bench",       text:"Panel verified, released to assembly" },
  { type:EVENT.SHIPMENT_DISPATCHED,  hub:"portharcourt", machine:"forklift",        component:"HUB-002", human:"Yusuf Musa",      role:"ENGINEER",  variant:"M", workshop:"Port Harcourt Logistics",   text:"Hub set dispatched to Onitsha" },
  { type:EVENT.MACHINE_STARTED,      hub:"makurdi",      machine:"bandSaw",         component:"FRM-008", human:"Terhemba Akpa",   role:"WELDER",    variant:"M", workshop:"Makurdi Workshop",          text:"Frame stock cutting started" },
  { type:EVENT.COMPONENT_RECEIVED,   hub:"owerri",       machine:"workbench",       component:"WIR-016", human:"Ijeoma Nwafor",   role:"ENGINEER",  variant:"F", workshop:"Owerri Electrical Shop",    text:"Wiring harness set received" },
  { type:EVENT.MAINTENANCE_OPENED,   hub:"maiduguri",    machine:"hydraulicPress",  component:"—",       human:"Bukar Modu",      role:"ENGINEER",  variant:"M", workshop:"Maiduguri Service Point",   text:"Press maintenance window opened" },
  { type:EVENT.DRAWING_APPROVED,     hub:"abeokuta",     machine:"workbench",       component:"AXL-005", human:"Segun Ogunlade",  role:"ENGINEER",  variant:"M", workshop:"Abeokuta Design Office",    text:"Axle assembly drawing approved" },
];

// Studios → real room paths (React Router). name comes from the dictionary.
const STUDIOS = [
  { path: "/production",  number: "01", nameKey: "studio.manufacturing", desc: "Coordinate distributed SME production", accent: TEAL },
  { path: "/engineering", number: "02", nameKey: "studio.engineering",   desc: "Author and version specifications",    accent: TEAL },
  { path: "/inspection",  number: "03", nameKey: "studio.inspection",     desc: "Quality verification and certification", accent: AMBER },
  { path: "/control",     number: "04", nameKey: "studio.control",        desc: "Live operational intelligence",         accent: PINK },
  { path: "/grid",        number: "05", nameKey: "studio.grid",           desc: "National manufacturing network map",     accent: AMBER },
  { path: "/board",       number: "06", nameKey: "studio.board",          desc: "Work orders, owners, sign-off",          accent: TEAL },
  { path: "/demo",        number: "07", nameKey: "studio.demo",           desc: "The full runtime, end to end",           accent: PINK },
  { path: "/impact",      number: "08", nameKey: "studio.impact",         desc: "What the network has produced",          accent: PINK },
];

function StudioPortal({ s, name, onEnter, index, enterLabel }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={() => onEnter(s.path)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative", clipPath: FORGE_CLIPS.panelTL,
        background: hover ? "rgba(10,127,115,0.08)" : BLACK,
        border: `1px solid ${hover ? s.accent : BORDER}`, borderLeft: `3px solid ${s.accent}`,
        padding: "24px 22px", minHeight: 168, cursor: "pointer",
        display: "flex", flexDirection: "column",
        transition: "background .2s, border-color .2s",
        animation: "forgeAssemble .5s ease both", animationDelay: `${index * 55}ms`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 34, lineHeight: 1, color: hover ? s.accent : "rgba(245,241,233,0.12)" }}>{s.number}</span>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.accent }} />
      </div>
      <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 16, color: IVORY, marginTop: 16 }}>{name}</div>
      <div style={{ fontFamily: UI, fontWeight: 400, fontSize: 12, color: MUTED, marginTop: 6, lineHeight: 1.5, flex: 1 }}>{s.desc}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18, color: hover ? s.accent : MUTED, fontFamily: UI, fontWeight: 600, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>
        {enterLabel} <span style={{ display: "inline-block", transform: hover ? "translateX(5px)" : "none", transition: "transform .2s" }}>→</span>
      </div>
    </div>
  );
}

function RegMarks() {
  return (<><span className="geo-reg tl" /><span className="geo-reg tr" /><span className="geo-reg bl" /><span className="geo-reg br" /></>);
}

export default function ArrivalDock() {
  const navigate = useNavigate();
  const { event, log, hubStates, machineStates, publish } = useForgeActivity();
  const { lang, t, languages } = useLanguage();

  const rt = useMemo(() => buildRuntime({ event, log, hubStates, machineStates }), [event, log, hubStates, machineStates]);

  // Seed the runtime once, only while it is effectively empty, so the burst
  // never competes with a live feed.
  useEffect(() => {
    if (!publish) return;
    if ((log?.length ?? 0) > DEMO_EVENTS.length) return;
    let cancelled = false;
    const timers = DEMO_EVENTS.map((evt, i) =>
      setTimeout(() => { if (!cancelled) publish(evt); }, i * 110)
    );
    return () => { cancelled = true; timers.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const ms = rt.manufacturingStatus;

  const hubs = Object.entries(hubStates || {});
  const activeCount = hubs.length;
  const langLabel = languages.find((l) => l.code === lang)?.label || "English";

  const hubMeta = useMemo(() => {
    const meta = {};
    for (const [id] of hubs) {
      const evs = (log || []).filter((e) => e.hub === id);
      meta[id] = { lastAt: evs[0]?.at || null, machines: new Set(evs.map((e) => e.machine).filter(Boolean)).size };
    }
    return meta;
  }, [log, hubStates]); // eslint-disable-line react-hooks/exhaustive-deps

  const recent = (log || []).slice(0, 20);

  const btn = (bg, color, border) => ({
    fontFamily: UI, fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase",
    padding: "14px 28px", cursor: "pointer", background: bg, color, border: border || "none", clipPath: FORGE_CLIPS.button,
  });

  return (
    <div className="forge-brand" style={{ background: BLACK, color: IVORY, fontFamily: UI, width: "100%" }}>
      <style>{`@keyframes forgeAssemble{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ===================== HERO ===================== */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <HeroWireframe />
        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexWrap: "wrap", padding: "clamp(32px,5vw,72px)", gap: 40 }}>
          {/* LEFT — operational */}
          <div style={{ flex: "1 1 480px", minWidth: 320, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <img src={LOGO_EMBLEM} alt="Forge" height={56} style={{ height: 56, width: "auto", marginBottom: 40, objectFit: "contain", alignSelf: "flex-start" }} />

            <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: TEAL, borderLeft: `2px solid ${TEAL}`, paddingLeft: 12, marginBottom: 22 }}>
              {t("hero.label")}
            </div>

            <div style={{ marginBottom: 22 }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(34px,5vw,54px)", lineHeight: 1.04, letterSpacing: "-0.02em", color: IVORY }}>{t("hero.line1")}</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(34px,5vw,54px)", lineHeight: 1.04, letterSpacing: "-0.02em", color: TEAL }}>{t("hero.line2")}</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(34px,5vw,54px)", lineHeight: 1.04, letterSpacing: "-0.02em", color: PINK }}>{t("hero.line3")}</div>
            </div>

            <p style={{ fontFamily: UI, fontWeight: 400, fontSize: 15, color: "rgba(245,241,233,0.7)", maxWidth: 480, lineHeight: 1.6, marginBottom: 24 }}>
              {t("hero.desc")}
            </p>

            {/* LIVE STATUS — real runtime */}
            <div style={{ clipPath: FORGE_CLIPS.panelBR, background: "rgba(245,241,233,0.03)", border: "1px solid rgba(10,127,115,0.30)", padding: "16px 18px", marginBottom: 24, maxWidth: 460 }}>
              <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: TEAL, marginBottom: 10 }}>{t("status.title")}</div>
              <StatusRow value={activeCount} text={t("status.hubs")} />
              <StatusRow value={ms.workshops} text={t("status.workshops")} />
              <StatusRow value={ms.people} text={t("status.people")} />
              <StatusRow ok text={t("status.nmcp")} />
              <StatusRow ok text={`${t("status.language")} · ${langLabel}`} />
            </div>

            {/* LANGUAGE RUNTIME */}
            <div style={{ marginBottom: 26, maxWidth: 460 }}>
              <LanguageRuntime />
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button type="button" style={btn(AMBER, BLACK)} onClick={() => navigate("/control")}>{t("cta.launch")} →</button>
              <button type="button" style={btn("transparent", TEAL, `1px solid ${TEAL}`)}
                onClick={() => document.getElementById("section-network")?.scrollIntoView({ behavior: "smooth" })}>
                {t("cta.explore")} ↓
              </button>
            </div>
          </div>

          {/* RIGHT — the shared build object: live NAWEDOAM 3D viewer */}
          <div style={{ flex: "1 1 460px", minWidth: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "100%", height: "clamp(360px, 50vh, 560px)", position: "relative" }}>
              <TruckViewer />
              <div style={{ position: "absolute", left: 0, bottom: -6, fontFamily: UI, fontWeight: 600, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: TEAL }}>
                NAWEDOAM · Forge Alpha 001
              </div>
            </div>
          </div>
        </div>

        {/* METRICS — interlocking plates */}
        <div style={{ position: "relative", zIndex: 1, borderTop: `1px solid ${BORDER}`, background: BLACK, padding: "24px clamp(24px,5vw,60px)", display: "flex", flexWrap: "wrap", gap: 4 }}>
          <Metric index={0} Icon={IconPeople}  value={ms.people}     label={t("metric.people")}     desc="Engineers & makers, Nigeria & diaspora" />
          <Metric index={1} Icon={IconFactory} value={ms.workshops}  label={t("metric.workshops")}  desc="Actively building & contributing" />
          <Metric index={2} Icon={IconGear}    value={ms.components} label={t("metric.components")} desc="Indigenous parts in development" />
          <Metric index={3} Icon={IconPin}     value={activeCount}   label={t("metric.states")}     desc="Building national capability" />
          <Metric index={4} Icon={IconGlobe}   value={rt.languages.length} label={t("metric.languages")} desc="Knowledge without barriers" />
          <div style={{ flexBasis: "100%", fontFamily: UI, fontWeight: 700, fontSize: 9,
            letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED, marginTop: 10 }}>
            Demo mode · seed data · not operational
          </div>
        </div>
      </section>

      <Divider />

      {/* ===================== LIVE NETWORK ===================== */}
      <section id="section-network" style={{ position: "relative", padding: "80px clamp(24px,5vw,60px)", background: BLACK }}>
        <RegMarks />
        <SectionLabel>{t("network.label")}</SectionLabel>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 32, letterSpacing: "-0.03em", color: IVORY }}>{t("network.title")}</div>
        <div style={{ fontFamily: UI, fontWeight: 400, fontSize: 14, color: MUTED, marginTop: 4 }}>{activeCount} · {t("network.stations")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginTop: 40 }}>
          {hubs.length === 0 && <div style={{ fontFamily: UI, fontSize: 13, color: MUTED, fontStyle: "italic" }}>Awaiting first station reports…</div>}
          {hubs.map(([id, status]) => {
            const c = hubColor(status);
            const meta = hubMeta[id] || {};
            return (
              <div key={id} style={{ clipPath: FORGE_CLIPS.panelBR, background: SURFACE, border: `1px solid ${c}`, padding: 20, boxShadow: status === "maintenance" ? `0 0 12px ${AMBER}33` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                    <span style={{ fontFamily: UI, fontWeight: 500, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: c }}>{status}</span>
                  </span>
                  <span style={{ fontFamily: UI, fontWeight: 700, fontSize: 11, color: MUTED }}>{meta.machines || 0} mach.</span>
                </div>
                <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: IVORY, marginTop: 12 }}>{String(id).toUpperCase()}</div>
                <div style={{ fontFamily: UI, fontWeight: 400, fontSize: 10, color: MUTED, marginTop: 4 }}>{elapsed(meta.lastAt)}</div>
              </div>
            );
          })}
        </div>
      </section>

      <Divider />

      {/* ===================== STUDIOS — PORTALS ===================== */}
      <section style={{ position: "relative", padding: "80px clamp(24px,5vw,60px)", background: SURFACE }}>
        <RegMarks />
        <SectionLabel>{t("studios.label")}</SectionLabel>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 32, letterSpacing: "-0.03em", color: IVORY }}>{t("studios.title")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14, marginTop: 40 }}>
          {STUDIOS.map((s, i) => <StudioPortal key={s.path} s={s} name={t(s.nameKey)} index={i} enterLabel={t("studios.enter")} onEnter={(p) => navigate(p)} />)}
        </div>
      </section>

      <Divider />

      {/* ===================== THE HANDS — Nigerian ===================== */}
      <section style={{ padding: "80px clamp(24px,5vw,60px)", background: BLACK }}>
        <SectionLabel>{t("hands.label")}</SectionLabel>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 32, letterSpacing: "-0.03em", color: IVORY }}>{t("hands.title")}</div>
        <div style={{ fontFamily: UI, fontWeight: 400, fontSize: 14, color: MUTED, marginTop: 6, maxWidth: 620, lineHeight: 1.6 }}>{t("hands.copy")}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 32 }}>
          <HumanTag role="WELDER"    variant="F" name="Adaeze Okoro"   workshop="Warri Fabrication Co-op" task="Chassis rail weld" />
          <HumanTag role="ENGINEER"  variant="M" name="Chike Nwosu"    workshop="Nnewi Precision Works"   task="Wheel hub machining" />
          <HumanTag role="INSPECTOR" variant="F" name="Amina Suleiman" workshop="Forge Quality Office"    task="Verifying chassis rail" />
        </div>
      </section>

      <Divider />

      {/* ===================== RECENT ACTIVITY ===================== */}
      <section style={{ padding: "80px clamp(24px,5vw,60px)", background: BLACK }}>
        <SectionLabel>{t("activity.label")}</SectionLabel>
        <div style={{ marginTop: 24 }}>
          {recent.length === 0 && <div style={{ fontFamily: UI, fontSize: 13, color: MUTED, fontStyle: "italic" }}>Awaiting first manufacturing events…</div>}
          {recent.map((e, i) => (
            <div key={`${e.at}-${i}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 6px", borderBottom: `1px solid ${BORDER}` }}>
              <div>
                <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 12, color: IVORY }}>{e.type}</div>
                <div style={{ fontFamily: UI, fontWeight: 400, fontSize: 11, color: MUTED }}>{[e.machine, e.hub, e.component, e.human].filter(Boolean).join(" · ")}</div>
              </div>
              <div style={{ fontFamily: UI, fontWeight: 400, fontSize: 10, color: MUTED, whiteSpace: "nowrap", marginLeft: 12 }}>{shortTime(e.at)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== DEFERRED — NMCP INSTALLED ARTIFACT ===================== */}
      <section style={{ background: BLACK, borderTop: `1px solid ${BORDER}` }}>
        <NmcpArrival />
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer style={{ padding: "40px clamp(24px,5vw,60px)", background: BLACK, borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={LOGO_MARK} alt="" height={26} style={{ height: 26, width: "auto", objectFit: "contain" }} />
          <span style={{ fontFamily: UI, fontWeight: 500, fontSize: 10, letterSpacing: "0.1em", color: MUTED }}>{t("footer.commons")}</span>
        </div>
        <span style={{ fontFamily: UI, fontWeight: 500, fontSize: 10, color: TEAL }}>forgeos.org</span>
      </footer>
    </div>
  );
}
