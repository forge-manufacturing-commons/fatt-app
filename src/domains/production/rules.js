// ============================================================
// PRODUCTION DOMAIN — manufacturing rules
// Industrial constraint, not permission and not lifecycle. These are the
// facts an experienced production engineer would refuse on, written so
// they can be audited without reading application code.
// ============================================================
import { createRule, createRuleBook } from "../../os/rules.js";

export const inspectionBeforeAssembly = createRule({
  id: "production.inspectionBeforeAssembly",
  because: "A component may not enter assembly until inspection has passed.",
  appliesTo: (c) => c.transition === "assemble",
  permits: (c) => c.inspectionResult === "pass",
});

export const noProductionOnFaultedMachine = createRule({
  id: "production.noProductionOnFaultedMachine",
  because: "Work may not be booked to a machine that is in fault or under maintenance.",
  appliesTo: (c) => Boolean(c.machine),
  permits: (c) => !["fault", "maintenance"].includes(c.machineState),
});

export const certifiedWorkshopForPressure = createRule({
  id: "production.certifiedWorkshopForPressure",
  because: "Pressure-retaining components require an ASME-certified workshop.",
  appliesTo: (c) => c.componentClass === "pressure-vessel",
  permits: (c) => (c.workshopCertifications || []).includes("ASME"),
});

export const specificationMustBeReleased = createRule({
  id: "production.specificationMustBeReleased",
  because: "A component may not be manufactured against a specification that is not released.",
  appliesTo: (c) => c.transition === "release" && Boolean(c.specification),
  permits: (c) => ["released", "approved"].includes(c.specificationState),
});

export const productionRules = createRuleBook([
  inspectionBeforeAssembly,
  noProductionOnFaultedMachine,
  certifiedWorkshopForPressure,
  specificationMustBeReleased,
]);

export default productionRules;
