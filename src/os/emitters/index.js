// ============================================================
// FORGE OS — EMITTERS
// The seam where external reality enters the event system: PLC signals,
// QR scans, operator input, offline queue flushes. Inject a different
// `publish` and the same emitters serve a queue instead of the live bus.
// ============================================================

export { createProductionEmitter } from "./production.js";
export { createInspectionEmitter } from "./inspection.js";
export { createEngineeringEmitter } from "./engineering.js";
export { emit, bridgeActor } from "./base.js";
export {
  createPolicy, permissive, requireActor,
  requireCertifiedMachine, requireKnownHub, PolicyViolation,
} from "./policy.js";
