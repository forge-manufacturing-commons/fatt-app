import { motion, AnimatePresence } from "framer-motion";
import { HumanGlyph } from "../../humans/HumanGlyphLibrary.jsx";

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

// Illustrative human roster per hub — mirrors ForgeActivityEngine
// naming so an activity event at Warri visibly corresponds to a person
// already visible on the Warri hub panel. Named human presence is
// integral, not decorative.
const PEOPLE_BY_HUB = {
  warri:  [{ role:"WELDER",    variant:"F", name:"Adaeze Okoro" }, { role:"WELDER",    variant:"M", name:"Godwin Ejime" }, { role:"INSPECTOR", variant:"F", name:"Blessing Otu" }],
  nnewi:  [{ role:"WELDER",    variant:"M", name:"Chike Nwosu" },  { role:"ENGINEER",  variant:"F", name:"Chidinma Eze" }],
  ilorin: [{ role:"ENGINEER",  variant:"F", name:"Ngozi Bello" },  { role:"ENGINEER",  variant:"M", name:"Dr. Adekunle" }],
  aba:    [{ role:"INSPECTOR", variant:"M", name:"Uche Chikelu" }, { role:"WELDER",    variant:"F", name:"Ifeoma Nnamdi" }],
  ph:     [{ role:"ENGINEER",  variant:"M", name:"Tamuno George" },{ role:"INSPECTOR", variant:"F", name:"Ebi Preye" }],
  lagos:  [{ role:"ENGINEER",  variant:"M", name:"Ibrahim Danladi"},{ role:"ENGINEER", variant:"F", name:"Kemi Ade" }],
  abuja:  [{ role:"INSPECTOR", variant:"F", name:"Fatima Bala" }],
  kaduna: [{ role:"WELDER",    variant:"M", name:"Musa Ibrahim" }, { role:"ENGINEER",  variant:"M", name:"Sani Abubakar" }],
  kano:   [{ role:"WELDER",    variant:"M", name:"Aminu Sule" }],
  benin:  [], // dormant — no active people
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
        {(() => {
          const people = PEOPLE_BY_HUB[hub.id] || [];
          if (people.length === 0) return null;
          return (
            <>
              <div className="cc-panel-kicker">People here</div>
              <div className="cc-panel-people">
                {people.map((p, i) => (
                  <div key={i} className="cc-panel-person" title={p.name}>
                    <HumanGlyph role={p.role} variant={p.variant} size={30} animate metadata={{ name: p.name }} />
                    <div className="cc-panel-person-name">{p.name.split(" ")[0]}</div>
                  </div>
                ))}
              </div>
            </>
          );
        })()}

        <div className="cc-panel-seed">Alpha network model — hub status, evidence and people are illustrative until verified registration data is connected.</div>
      </motion.aside>
    </AnimatePresence>
  );
}
