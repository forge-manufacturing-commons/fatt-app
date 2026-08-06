// ============================================================
// ENGINEERING DOMAIN — specification lifecycle
// A specification is a controlled document. Its state governs whether
// anything may legally be manufactured against it.
// ============================================================
import { createStateMachine } from "../../os/state.js";

export const specificationState = createStateMachine({
  id: "specification",
  initial: "draft",
  states: {
    draft:      { means: "Being authored",                   on: { submitForReview: "review", abandon: "withdrawn" } },
    review:     { means: "Under engineering review",         on: { approve: "approved", reject: "draft" } },
    approved:   { means: "Approved, not yet issued",         on: { release: "released", revise: "draft" } },
    released:   { means: "Issued for manufacture",           on: { revise: "draft", deprecate: "deprecated" } },
    deprecated: { means: "Superseded — do not manufacture",  terminal: true },
    withdrawn:  { means: "Abandoned before approval",        terminal: true },
  },
});

export default { specificationState };
