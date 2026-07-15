import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useForgeActivity } from "../../lib/ForgeActivityEngine.jsx";
import FactoryAtmosphere from "../forge/FactoryAtmosphere";
import TruckViewer from "./TruckViewer";
import { STUDIO } from "../../lib/ForgeStudio";
import { HumanTag } from "../../humans/HumanGlyphLibrary.jsx";

// ============================================================
// HERO — ENTER THE FORGE
//
// Command typography (staggered), Forge geometry rails, human copy
// with Nigerian anchoring, activity engine driving the SIGNAL band
// and the truck subsystem registrations. The shared truck sits inside
// a fabrication bay defined by structural rails and registration marks,
// not a rectangle frame.
// ============================================================
const ACTORS = [
  { id: "smes",     name: "SMEs",                          role: "FABRICATE COMPONENTS",     x: 10, y: 26, target: "chassis"      },
  { id: "uni",      name: "Universities & Polytechnics",   role: "ENGINEERING & TESTING",    x: 24, y: 8,  target: "engineering"  },
  { id: "youths",   name: "Youths",                        role: "BUILD PARTICIPATION",      x: 76, y: 8,  target: "chassis"      },
  { id: "diaspora", name: "Diaspora",                      role: "SPECIALIST TECHNICAL REVIEW", x: 90, y: 26, target: "engineering" },
  { id: "industry", name: "Industry",                      role: "SUPPLY CHAIN & STANDARDS", x: 88, y: 72, target: "energy"       },
  { id: "gov",      name: "Government",                    role: "ENABLING INFRASTRUCTURE",  x: 12, y: 72, target: "chassis"      },
];
const TRUCK = { x: 50, y: 56 };
const truckUrl = "/renders/02-front-quarter.jpg";

export default function HeroSection() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { event, phase, tone } = useForgeActivity();
  const [connected, setConnected] = useState(reduce ? ACTORS.length : 0);

  // Actor wake-up sequence — one wakes on activity, staged
  useEffect(() => {
    if (reduce) return;
    if (connected >= ACTORS.length) return;
    const t = setTimeout(() => setConnected(c => c + 1), connected === 0 ? 1400 : 720);
    return () => clearTimeout(t);
  }, [connected, reduce]);

  const energy = connected / ACTORS.length;
  const online = connected >= ACTORS.length;
  // subsystem the current activity targets, for restrained truck-zone glow
  const activeTarget = phase !== "quiet" ? event?.target : null;

  return (
    <section className="hero-os" aria-label="Enter the Forge">
      <FactoryAtmosphere />
      <div className="hero-os-geometry" aria-hidden="true" />
      {/* ForgeStudio hero environment — floor plate + steel beam + crane + window,
          per Hero_Environment_Spec.md §A/B */}
      <div className="fs-hero-environment" aria-hidden="true">
        <img className="fs-bg floor"      src={STUDIO.wksReflectiveFloor}  alt="" />
        <img className="fs-bg subtle"     src={STUDIO.wksSteelBeam}        alt="" style={{opacity:.14,mixBlendMode:"screen"}}/>
        <img className="fs-bg subtle fs-mot-conveyor" src={STUDIO.wksCraneSilhouette} alt="" style={{opacity:.10,left:"58%",right:"auto",width:"38%",top:"6%",height:"auto"}}/>
        <img className="fs-bg subtle"     src={STUDIO.wksFactoryWindow}    alt="" style={{opacity:.18,mixBlendMode:"screen",left:"auto",right:"4%",width:"32%",top:"12%",height:"46%"}}/>
      </div>

      <div className="wrap hero-os-grid">
        {/* ------- LEFT: command typography column ------- */}
        <div className="hero-os-copy">
          <div className="forge-section-id" aria-hidden="true">
            <span className="num">00</span>
            <span className="slash">/</span>
            <span className="name">Enter the Forge</span>
          </div>

          <div className="forge-system" style={{ marginBottom: 20 }}>Africa's distributed vehicle manufacturing platform</div>

          <h1 className="forge-command hero-heading">
            <span className="line stagger-1">
              <span className="rail" aria-hidden="true" />
              <motion.span initial={reduce ? false : { y: "110%" }} animate={{ y: 0 }} transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                Build
                <span className="tick">/</span>
              </motion.span>
            </span>
            <span className="line stagger-2">
              <motion.span className="cyan" initial={reduce ? false : { y: "110%" }} animate={{ y: 0 }} transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                vehicles.
                <span className="tick">/</span>
              </motion.span>
            </span>
            <span className="line stagger-3">
              <motion.span className="gold" initial={reduce ? false : { y: "110%" }} animate={{ y: 0 }} transition={{ delay: 0.55, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                Together.
              </motion.span>
            </span>
          </h1>

          <motion.p className="forge-human lead" style={{ marginTop: 30 }}
            initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            Nigeria has the people who can build. The workshops are already here. The engineers
            are here. The ideas are here. Forge connects them around real vehicle manufacturing work.
          </motion.p>

          <motion.div className="hero-cta-row" style={{ marginTop: 26 }}
            initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
            <button className="forge-button" onClick={() => navigate("/join")}>Join the build</button>
            <button className="forge-button secondary" onClick={() => {
              const el = document.querySelector(".pipe-os");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}>See how Forge works</button>
          </motion.div>

          <div className="hero-proof-row" style={{ marginTop: 26 }}>
            <span className="forge-technical">FORGE ALPHA <span className="slash">/</span> 001</span>
            <span className="hero-proof-sep" />
            <span className="forge-human" style={{ fontSize: 12.5, opacity: .7 }}>
              <b>NAWEDOAM</b> — the first vehicle Nigerian SMEs, students &amp; engineers are building together.
            </span>
          </div>

          {/* ------- LIVE ACTIVITY SIGNAL BAND ------- */}
          <div className="hero-activity" aria-live="polite">
            <span className="forge-signal" data-tone={tone}>
              {phase === "quiet" ? "SEED BUILD ACTIVITY" : event?.locationCode}
            </span>
            <div className="hero-activity-body">
              <div className="forge-technical">
                {event?.componentCode} <span className="slash">/</span> {event?.component}
                <span className="rev"> · REV.{event ? String((event.index ?? 0) + 1).padStart(2, "0") : "01"}</span>
              </div>
              <div className="hero-activity-line">
                {phase === "quiet" ? "Watching for the next build signal…" : `${event.location} — ${event.action}`}
              </div>
              {phase !== "quiet" && event?.humanRole && (
                <div className="hero-activity-human">
                  <HumanTag
                    role={event.humanRole}
                    variant={event.humanVariant}
                    name={event.humanName}
                    workshop={event.workshop}
                    task={event.action}
                    size={34}
                  />
                </div>
              )}
            </div>
            <span className="forge-system no-brackets" style={{ opacity: .6 }}>ALPHA SIMULATION</span>
          </div>
        </div>

        {/* ------- RIGHT: fabrication bay stage ------- */}
        <div className={"hero-os-system" + (online ? " online" : "")} aria-hidden="true">
          <span className="geo-reg tl" /><span className="geo-reg tr" />
          <span className="geo-reg bl" /><span className="geo-reg br" />
          <div className="chamber-floor" />
          <div className="datum-cross" aria-hidden="true"><span /></div>
          <div className="chamber-beam" />

          <svg className="hero-net" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            {ACTORS.map((a, i) => (
              <g key={a.id}>
                <motion.line x1={a.x} y1={a.y} x2={TRUCK.x} y2={TRUCK.y}
                  className={"hero-route" + (i < connected ? " live" : "")}
                  initial={false}
                  animate={{ opacity: i < connected ? 0.85 : 0.14 }}
                  transition={{ duration: 0.5 }} />
                {i < connected && !reduce && (
                  <circle className="hero-signal" r="0.65">
                    <animateMotion dur={(2.4 + i * 0.35) + "s"} repeatCount="indefinite"
                      path={`M ${a.x} ${a.y} L ${TRUCK.x} ${TRUCK.y}`} />
                  </circle>
                )}
              </g>
            ))}
          </svg>

          {ACTORS.map((a, i) => (
            <div key={a.id}
              className={"hero-actor" + (i < connected ? " on" : "")}
              style={{ left: a.x + "%", top: a.y + "%" }}>
              <span className="hero-actor-core" />
              <span className="hero-actor-name">{a.name}</span>
              <span className="hero-actor-role forge-system no-brackets">{a.role}</span>
            </div>
          ))}

          <motion.div className={"hero-truck" + (online ? " ignited" : "")}
            style={{ left: TRUCK.x + "%", top: TRUCK.y + "%" }}
            animate={{ filter: `brightness(${0.4 + energy * 0.65}) saturate(${0.55 + energy * 0.55}) contrast(${1 + energy * 0.08})` }}
            transition={{ duration: 0.7 }}>
            {/* live 3D body-locked truck; falls back to {truckUrl} if GLB absent */}
            <TruckViewer poster={truckUrl} />
            {/* Subsystem zones — light up only when activity engine points at them */}
            <span className={"tzone tzone-chassis"       + (activeTarget === "chassis" ? " active" : "")} />
            <span className={"tzone tzone-body"          + (activeTarget === "body" ? " active" : "")} />
            <span className={"tzone tzone-energy"        + (activeTarget === "energy" ? " active" : "")} />
            <span className={"tzone tzone-engineering"   + (activeTarget === "engineering" ? " active" : "")} />
            <span className="hero-truck-scan" />
            <div className="hero-truck-tag forge-system emerald no-brackets">
              {online ? "FORGE SYSTEM ONLINE" : "NAWEDOAM · SHARED BUILD OBJECT"}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
