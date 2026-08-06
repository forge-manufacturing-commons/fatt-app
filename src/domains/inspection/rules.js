// ============================================================
// INSPECTION DOMAIN — manufacturing rules
// A quality record is the most consequential record in the system. These
// rules protect its integrity: the right competency, an in-date instrument,
// and no self-verification.
// ============================================================
import { createRule, createRuleBook } from "../../os/rules.js";

export const requiresInspectorCompetency = createRule({
  id: "inspection.requiresInspectorCompetency",
  code: "QC-001",
  because: "Inspection must be recorded by a verified inspector competency.",
  appliesTo: (c) => Boolean(c.transition === "pass" || c.transition === "fail"),
  permits: (c) => (c.competencies || []).some((k) => String(k).startsWith("qc-inspector")),
});

export const criticalRequiresLevelThree = createRule({
  id: "inspection.criticalRequiresLevelThree",
  code: "QC-003",
  because: "Safety-critical components require a level 3 inspector.",
  appliesTo: (c) => Boolean(c.safetyCritical),
  permits: (c) => (c.competencies || []).includes("qc-inspector-level-3"),
});

export const noSelfInspection = createRule({
  id: "inspection.noSelfInspection",
  code: "QC-004",
  because: "The person who produced a component may not be the person who passes it.",
  appliesTo: (c) => Boolean(c.producedBy && c.inspectedBy),
  permits: (c) => c.producedBy !== c.inspectedBy,
});

export const calibratedInstrument = createRule({
  id: "inspection.calibratedInstrument",
  code: "QC-007",
  because: "Measurements must be taken with an instrument that is in calibration.",
  appliesTo: (c) => Boolean(c.instrument),
  permits: (c) => c.instrumentCalibrationValid === true,
});

export const inspectionRules = createRuleBook([
  requiresInspectorCompetency,
  criticalRequiresLevelThree,
  noSelfInspection,
  calibratedInstrument,
]);

export default inspectionRules;
