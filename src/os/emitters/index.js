// ============================================================
// DEPRECATED LOCATION — kept so no import breaks during migration.
// Emitters now live with their domains in src/domains/<domain>/emitters.js.
// ============================================================
export { createProductionEmitter } from "../../domains/production/emitters.js";
export { createInspectionEmitter } from "../../domains/inspection/emitters.js";
export { createEngineeringEmitter } from "../../domains/engineering/emitters.js";
export { emit, bridgeActor } from "../pipeline.js";
export {
  createPolicy, permissive, requireActor,
  requireCertifiedMachine, requireKnownHub, PolicyViolation,
} from "../policy.js";
