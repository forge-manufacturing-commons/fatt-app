// ============================================================
// FORGE OS — MANUFACTURING RULES
//
// The third responsibility, distinct from the other two:
//
//   policy.js  — "may this ACTOR act?"        (authorization)
//   state.js   — "what TRANSITION may occur?" (object lifecycle)
//   rules.js   — "does the DOMAIN permit it?" (industrial constraint)
//
// A rule encodes manufacturing knowledge, not permission and not
// lifecycle: a pressure vessel needs an ASME-certified workshop; a
// component may not enter assembly until inspection passed. None of
// that is about identity, and none of it is a state transition — it is
// what the physical world requires.
//
// Rules are declarative and pure so they can be authored by engineers
// rather than programmers, audited without running the app, and later
// sourced from a database without changing this interface.
// ============================================================

export class RuleViolation extends Error {
  constructor(violations, context) {
    // Industrial phrasing. An operator should read a manufacturing constraint
    // and a rule number, not "validation failed".
    super(
      `Manufacturing constraint: ` +
      violations.map((v) => `${v.because} (Rule ${v.code ?? v.id})`).join(" | ")
    );
    this.name = "RuleViolation";
    this.violations = violations;
    this.context = context;
  }
}

/**
 * @param id        stable identifier, cited in refusals and audits
 * @param code       short industrial rule number an operator can quote (e.g. PV-002)
 * @param because   why the domain refuses — written for the operator, not the developer
 * @param appliesTo (context) => boolean   narrow the rule to the cases it governs
 * @param permits   (context) => boolean   whether the domain allows it
 */
export function createRule({ id, code, because, appliesTo = () => true, permits }) {
  if (!id) throw new Error("createRule: `id` is required");
  if (typeof permits !== "function") throw new Error(`createRule(${id}): "permits" must be a function`);
  if (!because) throw new Error(`createRule(${id}): "because" is required — a refusal with no reason is not auditable`);
  return Object.freeze({ id, code: code ?? id, because, appliesTo, permits });
}

export function createRuleBook(rules = []) {
  const book = Object.freeze([...rules]);
  const api = Object.freeze({
    rules: () => book,
    ids: () => book.map((r) => r.id),
    codes: () => book.map((r) => r.code),

    /** Never throws. Returns the full picture, including which rules were in scope. */
    evaluate(context = {}) {
      const applied = [];
      const violations = [];
      for (const rule of book) {
        let inScope = false;
        try { inScope = Boolean(rule.appliesTo(context)); } catch { inScope = false; }
        if (!inScope) continue;
        applied.push(rule.id);
        let allowed = false;
        try { allowed = Boolean(rule.permits(context)); } catch { allowed = false; }
        if (!allowed) violations.push({ id: rule.id, code: rule.code, because: rule.because });
      }
      return { permitted: violations.length === 0, applied, violations };
    },

    /** Enforcement. Throws a RuleViolation naming every rule that refused. */
    assert(context = {}) {
      const result = api.evaluate(context);
      if (!result.permitted) throw new RuleViolation(result.violations, context);
      return context;
    },

    concat: (more = []) => createRuleBook([...book, ...more]),
  });
  return api;
}

export default { createRule, createRuleBook, RuleViolation };
