import { motion, useReducedMotion } from "framer-motion";
import { SEQUENCE } from "./nigeriaData";

// EMBEDDED INDUSTRIAL HUB INDICATOR — machined recess seated IN the
// billet: dark bezel, concentric ring, luminous core. The indicator
// mechanically seats before its core activates (micro-wow).
// Southern-corridor legibility solved at the LABEL layer only:
// per-hub offset metadata + leader lines. Coordinates are untouched.
export default function NetworkNode({ hub, index, active, onSelect }) {
  const reduce = useReducedMotion();
  const isActive = active?.id === hub.id;
  const delay = SEQUENCE.hubStart + index * SEQUENCE.hubStep;
  return (
    <>
      {hub.leader && (
        <svg className="cc-leader" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1={hub.x} y1={hub.y}
            x2={hub.x + hub.labelDx * 0.13} y2={hub.y + hub.labelDy * 0.13}
            className="cc-leader-line" />
        </svg>
      )}
      <motion.button
        type="button"
        className={
          "cc-node" +
          (hub.featured ? " cc-node-featured" : "") +
          (isActive ? " cc-node-active" : "") +
          " cc-status-" + (hub.status || "active")
        }
        style={{ left: hub.x + "%", top: hub.y + "%" }}
        aria-label={hub.name + " — " + hub.specialty}
        aria-pressed={isActive}
        onClick={() => onSelect(hub)}
        onMouseEnter={() => onSelect(hub)}
        onFocus={() => onSelect(hub)}
        initial={reduce ? false : { opacity: 0, scale: 1.35 }}
        whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5, ease: [0.34, 1.4, 0.44, 1] }}
      >
        <span className="cc-node-recess" aria-hidden="true" />
        <span className="cc-node-bezel" aria-hidden="true" />
        <motion.span className="cc-node-core" aria-hidden="true"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={reduce ? undefined : { opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: delay + 0.32, duration: 0.35 }} />
        <span className="cc-node-ring" aria-hidden="true" />
        <span
          className="cc-node-label"
          aria-hidden="true"
          style={{
            transform: `translate(calc(${hub.labelDx || 0}px + ${hub.labelAnchor === "end" ? "-100%" : hub.labelAnchor === "middle" ? "-50%" : "0%"}), ${hub.labelDy || 0}px)`,
          }}
        >{hub.shortName}</span>
      </motion.button>
    </>
  );
}
