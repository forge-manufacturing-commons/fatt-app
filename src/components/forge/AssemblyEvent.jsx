import { useEffect, useState } from "react";

import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
const truckUrl = "/renders/01-side-hero.jpg";

// ============================================================
// THE FORGE ASSEMBLY EVENT — signature moment.
// NAWEDOAM decomposes into manufacturable SYSTEM GROUPS, the groups
// become work packages routed toward the pipeline, then the systems
// reassemble and the build settles into a dark transition — out of
// which the Nigeria Manufacturing Command Center activates.
// Cinematic abstraction via clip-path slices of the real render.
// No fake mechanical precision. Reduced motion: static exploded view.
// ============================================================
const SYSTEMS = [
  { id: "chassis", name: "The chassis", clip: "inset(62% 0% 0% 0%)",  dx: -16, dy: 22 },
  { id: "body",    name: "The body",               clip: "inset(0% 0% 55% 28%)", dx: 18,  dy: -18 },
  { id: "energy",  name: "The power system",     clip: "inset(38% 55% 28% 0%)", dx: -22, dy: -6 },
  { id: "mobility",name: "The wheels & mobility",   clip: "inset(70% 8% 2% 8%)",  dx: 0,   dy: 30 },
  { id: "service", name: "The service module",       clip: "inset(12% 6% 40% 45%)", dx: 26,  dy: 8 },
];
const PHASES = ["objective", "decompose", "packages", "reassemble", "settle"];
const HOLD = { objective: 2200, decompose: 3200, packages: 3000, reassemble: 2600, settle: 2400 };

export default function AssemblyEvent() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState("objective");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (reduce || !started) return;
    const i = PHASES.indexOf(phase);
    const next = PHASES[(i + 1) % PHASES.length];
    const t = setTimeout(() => setPhase(next), HOLD[phase]);
    return () => clearTimeout(t);
  }, [phase, started, reduce]);

  const exploded = phase === "decompose" || phase === "packages";
  const dark = phase === "settle";

  if (reduce) {
    // static exploded diagram with labels — full meaning, no motion
    return (
      <div className="asm-stage asm-static">
        <div className="asm-plane">
          {SYSTEMS.map(s => (
            <div key={s.id} className="asm-slice" style={{ clipPath: s.clip, transform: `translate(${s.dx * 0.6}px, ${s.dy * 0.6}px)` }}>
              <img src={truckUrl} alt="" draggable="false" />
            </div>
          ))}
        </div>
        <ul className="asm-legend">
          {SYSTEMS.map(s => <li key={s.id}>{s.name}</li>)}
        </ul>
      </div>
    );
  }

  return (
    <motion.div
      className={"asm-stage" + (dark ? " asm-dark" : "")}
      onViewportEnter={() => setStarted(true)}
      viewport={{ amount: 0.4 }}
    >
      <div className="asm-plane">
        {SYSTEMS.map((s, i) => (
          <motion.div
            key={s.id}
            className="asm-slice"
            style={{ clipPath: s.clip }}
            animate={exploded
              ? { x: s.dx * 4, y: s.dy * 3.2, opacity: 1, filter: "brightness(1.05)" }
              : { x: 0, y: 0, opacity: dark ? 0.35 : 1, filter: dark ? "brightness(.5)" : "brightness(1)" }}
            transition={{ duration: 1.1, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src={truckUrl} alt="" draggable="false" />
          </motion.div>
        ))}

        {/* system labels during decomposition */}
        <AnimatePresence>
          {exploded && SYSTEMS.map((s, i) => (
            <motion.div
              key={s.id}
              className="asm-label"
              style={{ left: `calc(50% + ${s.dx * 4.6}px)`, top: `calc(50% + ${s.dy * 3.6}px)` }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <span className="asm-label-tick" aria-hidden="true" />{s.name}
              {phase === "packages" && <span className="asm-pkg" aria-hidden="true" />}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="asm-phasebar" role="status" aria-live="polite">
        {PHASES.map(p => (
          <span key={p} className={"asm-phase" + (phase === p ? " on" : "")}>
            {p === "objective" ? "Shared objective" : p === "decompose" ? "Decompose" : p === "packages" ? "Work packages" : p === "reassemble" ? "Reassemble" : "Into the network"}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
