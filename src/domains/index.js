// ============================================================
// FORGE OS — DOMAIN PACKAGES
// ForgeOS grows by ADDING DOMAINS, not by scattering files across layers.
// Each domain owns its state graph, its manufacturing rules and its
// emitters. The canonical event schema stays shared in src/os/events.js,
// because one vocabulary across all domains is the whole point of it.
// ============================================================
import { createStateRegistry } from "../os/state.js";
import { componentState, machineState } from "./production/state.js";
import { specificationState } from "./engineering/state.js";
import { missionState } from "./mission/state.js";
import { productionRules } from "./production/rules.js";
import { inspectionRules } from "./inspection/rules.js";
import { engineeringRules } from "./engineering/rules.js";

export { componentState, machineState, specificationState, missionState };
export { productionRules, inspectionRules, engineeringRules };

/** Every manufacturing object class that has a lifecycle. */
export const stateRegistry = createStateRegistry({
  component:     componentState,
  machine:       machineState,
  specification: specificationState,
  mission:       missionState,
});

/** All industrial constraints, composed. */
export const allRules = productionRules.concat(inspectionRules.rules()).concat(engineeringRules.rules());

export default { stateRegistry, allRules };
