import { motion, useReducedMotion } from "framer-motion";
import { useForgeActivity } from "../../lib/ForgeActivityEngine.jsx";

// ============================================================
// 03 / PRODUCTION — a production RAIL, not five columns.
// The active event enters the relevant stage.
// ============================================================
const STAGES = [
  { id: "design",     name: "Design",     code: "S01", note: "The vehicle is broken into systems and components." },
  { id: "distribute", name: "Distribute", code: "S02", note: "Forge finds the right hands for each piece of work." },
  { id: "fabricate",  name: "Fabricate",  code: "S03", note: "Components are made in different places using agreed drawings.", weld: true },
  { id: "verify",     name: "Verify",     code: "S04", note: "Drawings, measurements and finished work are checked before parts move forward.", inspect: true },
  { id: "assemble",   name: "Assemble",   code: "S05", note: "Approved parts come together as one vehicle." },
];

// map activity tone → active stage
const TONE_STAGE = { fabricate: "fabricate", review: "verify", evidence: "verify", accept: "assemble", supply: "distribute", quiet: null };

export default function HowItWorks() {
  const reduce = useReducedMotion();
  const { tone, event, phase } = useForgeActivity();
  const activeStage = TONE_STAGE[tone] || null;

  return (
    <section className="forge-section pipe-os" aria-label="Production">
      <div className="wrap">
        <div className="forge-section-id">
          <span className="num">03</span>
          <span className="slash">/</span>
          <span className="name">Production</span>
        </div>
        <motion.h2 className="forge-command" style={{ fontSize: "clamp(38px,5.5vw,80px)" }}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <span className="line stagger-1"><span>How the vehicle</span></span>
          <span className="line stagger-2"><span className="gold">gets built.</span></span>
        </motion.h2>
        <p className="forge-human lead" style={{ marginTop: 24 }}>
          Design becomes work packages. Forge finds the right hands. Components are made in
          different places. Each one is checked. Approved parts come together as one vehicle.
        </p>

        <div className="pipe-channel" role="list">
          <div className="pipe-rail" aria-hidden="true">
            {!reduce && (
              <svg viewBox="0 0 100 4" preserveAspectRatio="none" className="pipe-rail-svg">
                <path id="pipe-path" d="M 0 2 L 100 2" className="pipe-rail-line" />
                <circle className="pipe-pkg" r="1">
                  <animateMotion dur="9s" repeatCount="indefinite"><mpath href="#pipe-path" /></animateMotion>
                </circle>
                <circle className="pipe-pkg" r="1">
                  <animateMotion dur="9s" begin="3s" repeatCount="indefinite"><mpath href="#pipe-path" /></animateMotion>
                </circle>
              </svg>
            )}
          </div>
          {STAGES.map((s, i) => (
            <motion.div key={s.id} role="listitem"
              className={
                "pipe-stage" +
                (s.weld ? " pipe-weld" : "") +
                (s.inspect ? " pipe-inspect" : "") +
                (activeStage === s.id ? " pipe-active" : "")
              }
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.11, duration: 0.55 }}>
              <div className="pipe-gate" aria-hidden="true" />
              <div className="forge-technical pipe-code">{s.code}</div>
              <div className="pipe-name">{s.name}</div>
              <div className="pipe-note forge-human" style={{ fontSize: 13 }}>{s.note}</div>
              {activeStage === s.id && phase !== "quiet" && (
                <div className="pipe-stage-signal">
                  <span className="forge-signal emerald">Active — {event.action}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
