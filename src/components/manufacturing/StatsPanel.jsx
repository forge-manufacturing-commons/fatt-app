import CountUp from "react-countup";
import { motion, useReducedMotion } from "framer-motion";
import { NETWORK_STATS, SEQUENCE } from "./nigeriaData";

export default function StatsPanel() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="cc-stats"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: SEQUENCE.stats, duration: 0.6 }}
    >
      {NETWORK_STATS.map(s => (
        <div className="cc-stat" key={s.label}>
          <div className="cc-stat-value">
            {reduce ? s.value : <CountUp end={s.value} duration={1.8} delay={SEQUENCE.stats} enableScrollSpy scrollSpyOnce />}
          </div>
          <div className="cc-stat-label">{s.label}</div>
        </div>
      ))}
      <div className="cc-stats-note">Alpha network model — these are the network numbers Forge is designed to coordinate, replaced by verified registrations as the network activates.</div>
    </motion.div>
  );
}
