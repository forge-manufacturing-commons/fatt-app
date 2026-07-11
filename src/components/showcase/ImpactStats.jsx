import CountUp from "react-countup";
import { motion, useReducedMotion } from "framer-motion";

// ============================================================
// 05 / IMPACT  — Alpha Network Model, not vanity counters.
// The story is not the number. The story is: what happens when
// scattered capability becomes visible.
// Typography separates: model figure · category · explanation · credibility.
// ============================================================
const MODEL = [
  { value: 500,  suffix: "+", label: "Target SME capacity",         note: "One workshop may only build one bracket." },
  { value: 2500, suffix: "+", label: "Builder network capacity",    note: "Another may cut one frame member." },
  { value: 120,  suffix: "+", label: "Institutional participation", note: "A university team may review one design." },
  { value: 36,   suffix: "",  label: "States Forge can reach",      note: "Contribution becomes visible where it happens." },
];

export default function ImpactStats() {
  const reduce = useReducedMotion();
  return (
    <section className="forge-section impact-os" aria-label="Alpha network model">
      <div className="wrap">
        <div className="forge-section-id">
          <span className="num">05</span>
          <span className="slash">/</span>
          <span className="name">Impact</span>
        </div>

        <motion.h2 className="forge-command" style={{ fontSize: "clamp(38px,5.5vw,80px)" }}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <span className="line stagger-1"><span>The scale Forge is</span></span>
          <span className="line stagger-2"><span className="gold">designed for.</span></span>
        </motion.h2>

        <p className="forge-human lead" style={{ marginTop: 24 }}>
          The story is not the number itself. The story is what happens when scattered
          capability becomes visible: one workshop may only build one bracket, another may
          cut one frame member, a university team may review one design — and Forge makes
          each of those separate contributions count toward one build.
        </p>

        <div className="impact-instr" style={{ marginTop: 44 }}>
          {MODEL.map(m => (
            <div className="impact-cell forge-panel" key={m.label}>
              <div className="forge-system gold no-brackets" style={{ marginBottom: 12 }}>MODEL FIGURE</div>
              <div className="impact-cell-value">
                {reduce ? m.value : <CountUp end={m.value} duration={1.8} enableScrollSpy scrollSpyOnce />}
                <span className="impact-cell-suffix">{m.suffix}</span>
              </div>
              <div className="forge-technical" style={{ marginTop: 12 }}>{m.label}</div>
              <div className="forge-human" style={{ fontSize: 12.5, marginTop: 10, opacity: .68 }}>{m.note}</div>
            </div>
          ))}
        </div>

        <div className="impact-credibility">
          <span className="forge-signal gold">ALPHA NETWORK MODEL</span>
          <span className="forge-human" style={{ fontSize: 12.5, opacity: .55 }}>
            Model figures show the scale Forge is designed to coordinate. They are not verified
            current membership. Real numbers replace these as Nigerian SMEs, universities,
            engineers and diaspora contributors register.
          </span>
        </div>
      </div>
    </section>
  );
}
