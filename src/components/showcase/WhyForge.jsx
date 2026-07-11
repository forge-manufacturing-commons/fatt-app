import { motion, useReducedMotion } from "framer-motion";

// ============================================================
// 01 / CAPABILITY  — Why Forge, in editorial-industrial hierarchy.
// Establish: the workshops are already here.
// Then:      they are scattered.
// Then:      Forge connects the work.
// Composition: large phase number, structural rail, asymmetric
// information panel, small system labels, human explanation,
// scan-friendly proof points.
// ============================================================
const PROOFS = [
  { code: "NNW", role: "SME",       action: "takes on a component" },
  { code: "ILR", role: "POLYTECHNIC", action: "checks a design" },
  { code: "DSP", role: "ENGINEER ABROAD", action: "reviews a drawing" },
  { code: "WAR", role: "FABRICATION",  action: "cuts steel" },
];

export default function WhyForge() {
  const reduce = useReducedMotion();
  return (
    <section className="forge-section why-os" aria-label="Capability">
      <div className="wrap why-os-grid">
        <div className="why-os-left">
          <div className="forge-section-id">
            <span className="num">01</span>
            <span className="slash">/</span>
            <span className="name">Capability</span>
          </div>
          <motion.h2 className="forge-command" style={{ fontSize: "clamp(38px,5.5vw,80px)" }}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <span className="line stagger-1"><span>The workshops</span></span>
            <span className="line stagger-2"><span className="gold">are already here.</span></span>
          </motion.h2>
        </div>

        <div className="why-os-right">
          <div className="forge-vrail" aria-hidden="true">
            <span className="forge-vrail-tick" style={{ top: "10%" }} />
            <span className="forge-vrail-tick" style={{ top: "48%" }} />
            <span className="forge-vrail-tick" style={{ top: "84%" }} />
          </div>

          <div className="why-os-block">
            <div className="forge-system gold" style={{ marginBottom: 10 }}>Human</div>
            <p className="forge-human">
              A vehicle should not depend on one giant factory before Nigerians can help
              build it. Forge breaks the work into real manufacturing tasks and connects
              each task to people and workshops with the right capability.
            </p>
          </div>

          <div className="why-os-block">
            <div className="forge-system gold" style={{ marginBottom: 10 }}>How it works</div>
            <p className="forge-human">
              An SME in Nnewi takes on a component. A polytechnic workshop checks a design.
              An engineer abroad reviews a drawing before fabrication begins. Different hands.
              Different places. One shared vehicle.
            </p>
          </div>

          <div className="why-os-block why-os-verdict forge-panel gold-rim">
            <div className="forge-system gold" style={{ marginBottom: 10 }}>The problem</div>
            <p className="forge-human lead">
              The capability is already here. <b>The problem is that it is scattered.</b>{" "}
              Forge brings the people, workshops and institutions into one build system.
            </p>
          </div>

          <div className="why-os-proofs">
            {PROOFS.map((p, i) => (
              <motion.div key={p.code} className="why-os-proof"
                initial={reduce ? false : { opacity: 0, x: -14 }}
                whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}>
                <span className="geo-chevron forge-technical">{p.code}</span>
                <span className="forge-human" style={{ fontSize: 13, opacity: .78 }}>
                  <b>{p.role}</b> — {p.action}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
