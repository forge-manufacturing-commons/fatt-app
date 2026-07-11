import { motion, useReducedMotion } from "framer-motion";
import { useForgeActivity } from "../../lib/ForgeActivityEngine.jsx";

// ============================================================
// 02 / NETWORK — six contributors, one shared vehicle.
// Not a radial diagram. A structural hex-cell composition with
// visible contribution labels, driven by the activity engine.
// ============================================================
const ACTORS = [
  { id: "smes",     name: "SMEs",                       role: "FABRICATE COMPONENTS",       code: "SME", target: "chassis"     },
  { id: "uni",      name: "Universities & Polytechnics", role: "ENGINEERING & TESTING",     code: "UNI", target: "engineering" },
  { id: "youths",   name: "Youths",                     role: "BUILD PARTICIPATION",        code: "YTH", target: "chassis"     },
  { id: "diaspora", name: "Diaspora",                   role: "SPECIALIST TECHNICAL REVIEW", code: "DSP", target: "engineering"},
  { id: "industry", name: "Industry",                   role: "SUPPLY CHAIN & STANDARDS",   code: "IND", target: "energy"      },
  { id: "gov",      name: "Government",                 role: "ENABLING INFRASTRUCTURE",    code: "GOV", target: "chassis"     },
];

const ACTOR_TYPE_MAP = { SME: "smes", UNI: "uni", DIASPORA: "diaspora", INDUSTRY: "industry", SYSTEM: null };

export default function EcosystemSystem() {
  const reduce = useReducedMotion();
  const { event, phase, tone } = useForgeActivity();
  const activeId = phase !== "quiet" ? ACTOR_TYPE_MAP[event?.actorType] : null;

  return (
    <section className="forge-section eco-os" aria-label="Network">
      <div className="wrap">
        <div className="forge-section-id">
          <span className="num">02</span>
          <span className="slash">/</span>
          <span className="name">Network</span>
        </div>

        <motion.h2 className="forge-command" style={{ fontSize: "clamp(38px,5.5vw,80px)" }}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <span className="line stagger-1"><span>Different hands.</span></span>
          <span className="line stagger-2"><span className="cyan">Different places.</span></span>
          <span className="line stagger-3"><span className="gold">One shared vehicle.</span></span>
        </motion.h2>

        <p className="forge-human lead" style={{ marginTop: 24, maxWidth: "50ch" }}>
          Forge is not a factory. It is the network of people who together become a factory —
          each contributing what they already know how to do, connected around one vehicle.
        </p>

        <div className="eco-hex-composition">
          {/* Central shared build object */}
          <div className="eco-hex-center">
            <div className="geo-hex gold" style={{ width: 60, height: 66 }} aria-hidden="true" />
            <div className="forge-technical" style={{ marginTop: 12 }}>FORGE ALPHA / 001</div>
            <div className="forge-system gold no-brackets" style={{ marginTop: 6 }}>NAWEDOAM · SHARED BUILD</div>
          </div>

          {/* Six actor cells arranged as a structural network */}
          <div className="eco-hex-grid">
            {ACTORS.map((a, i) => {
              const isActive = activeId === a.id;
              return (
                <motion.div key={a.id}
                  className={"eco-hex-cell forge-panel" + (isActive ? " eco-hex-cell-active" : "")}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.09, duration: 0.5 }}>
                  <div className="eco-hex-header">
                    <div className={"geo-hex" + (isActive ? " on" : "")} aria-hidden="true" />
                    <span className="forge-technical">{a.code}</span>
                  </div>
                  <div className="forge-command eco-hex-name">{a.name}</div>
                  <div className="forge-system no-brackets eco-hex-role">{a.role}</div>
                  {isActive && (
                    <div style={{ marginTop: 10 }}>
                      <span className="forge-signal emerald">{event.action}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
