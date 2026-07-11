import { motion, AnimatePresence } from "framer-motion";

// Hub intelligence surface — updates from the active hub.
// Reveals the hub's status truthfully (fabricating / verifying /
// standby / expanding / sleeping / active / coordinating) and the
// last human-attributed activity as evidence layer (Lock 05, 08).

const STATUS_LABEL = {
  fabricating: "FABRICATION ACTIVE",
  active:      "ONLINE · READY",
  verifying:   "VERIFICATION IN PROGRESS",
  standby:     "STANDBY · READY TO CONTRIBUTE",
  expanding:   "EXPANDING · ONBOARDING",
  coordinating:"COORDINATION HUB",
  sleeping:    "DORMANT · JOINING NEXT CYCLE",
};

export default function HubPanel({ hub }) {
  if (!hub) return null;
  const statusLabel = STATUS_LABEL[hub.status] || "READY TO CONTRIBUTE";
  return (
    <AnimatePresence mode="wait">
      <motion.aside
        key={hub.id}
        className={"cc-panel" + (hub.featured ? " cc-panel-featured" : "") + " cc-panel-status-" + hub.status}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        aria-live="polite"
      >
        <div className="cc-panel-name">{hub.name}</div>
        <div className="cc-panel-role">{hub.featured ? "FORGE ALPHA FABRICATION HUB" : hub.specialty}</div>

        <div className="cc-panel-kicker">What this city brings</div>
        <ul className="cc-panel-list">
          {hub.capabilities.map(c => <li key={c}>{c}</li>)}
        </ul>

        <div className="cc-panel-kicker">Contributing to this build</div>
        <ul className="cc-panel-list">
          {hub.projects.map(p => <li key={p}>{p}</li>)}
        </ul>

        {hub.lastActivity && (
          <>
            <div className="cc-panel-kicker">Last recorded activity</div>
            <div className="cc-panel-evidence">{hub.lastActivity}</div>
          </>
        )}

        <div className="cc-panel-status">
          <span className="cc-dot" aria-hidden="true" /> {statusLabel}
        </div>
        <div className="cc-panel-seed">Alpha network model — hub status and evidence are illustrative until verified registration data is connected.</div>
      </motion.aside>
    </AnimatePresence>
  );
}
