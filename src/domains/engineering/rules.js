// ============================================================
// ENGINEERING DOMAIN — manufacturing rules
// ============================================================
import { createRule, createRuleBook } from "../../os/rules.js";

export const approverIsNotAuthor = createRule({
  id: "engineering.approverIsNotAuthor",
  because: "A specification may not be approved by the engineer who authored it.",
  appliesTo: (c) => c.transition === "approve" && Boolean(c.author && c.approver),
  permits: (c) => c.author !== c.approver,
});

export const approvalRequiresCompetency = createRule({
  id: "engineering.approvalRequiresCompetency",
  because: "Approval for manufacture requires a level 3 engineering competency.",
  appliesTo: (c) => c.transition === "approve",
  permits: (c) => (c.competencies || []).includes("engineering-level-3"),
});

export const revisionMustBeTraceable = createRule({
  id: "engineering.revisionMustBeTraceable",
  because: "A revision must state which revision it supersedes.",
  appliesTo: (c) => c.transition === "revise",
  permits: (c) => Boolean(c.supersedes),
});

export const engineeringRules = createRuleBook([
  approverIsNotAuthor,
  approvalRequiresCompetency,
  revisionMustBeTraceable,
]);

export default engineeringRules;
