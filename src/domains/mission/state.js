// ============================================================
// MISSION DOMAIN — mission lifecycle
// A mission is a real manufacturing objective (convert 1,000 generators,
// build 1,000 tricycles). It sits above components and specifications and
// is the correlation spine: every event in its execution shares its id.
// ============================================================
import { createStateMachine } from "../../os/state.js";

export const missionState = createStateMachine({
  id: "mission",
  initial: "planning",
  states: {
    planning:    { means: "Objective being defined",      on: { authorise: "engineering", abandon: "abandoned" } },
    engineering: { means: "Package being authored",        on: { completePackage: "procurement", hold: "held" } },
    procurement: { means: "Materials being sourced",      on: { materialsReady: "production", hold: "held" } },
    production:  { means: "Being manufactured",           on: { productionComplete: "inspection", hold: "held" } },
    inspection:  { means: "Under quality verification",   on: { qualityAccepted: "delivery", qualityRejected: "production" } },
    delivery:    { means: "Being delivered",              on: { delivered: "closed", hold: "held" } },
    held:        { means: "Suspended",                     on: { resume: "production", abandon: "abandoned" } },
    closed:      { means: "Complete",                      terminal: true },
    abandoned:   { means: "Terminated before completion",  terminal: true },
  },
});

export default { missionState };
