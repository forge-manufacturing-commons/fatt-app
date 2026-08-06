// ============================================================
// FORGE OS — EMITTER POLICY
//
// Emitter -> Policy -> publish.
//
// Business rules live here, not in the emitters. An emitter's job is to
// describe reality truthfully in canonical form; a policy decides whether
// that reality is permitted to be recorded. Keeping them apart stops every
// producer from growing its own copy of the rulebook.
//
// A policy is a pure function (event) => void that throws to refuse.
// Compose several with createPolicy([...]).
// ============================================================

export class PolicyViolation extends Error {
  constructor(rule, message, event) {
    super(`[${rule}] ${message}`);
    this.name = "PolicyViolation";
    this.rule = rule;
    this.event = event;
  }
}

/** Compose rules into one policy. Rules run in order; the first refusal wins. */
export function createPolicy(rules = []) {
  return function policy(event) {
    for (const rule of rules) rule(event);
    return event;
  };
}

/** Permits everything. The V1 default — rules arrive as the registry can answer them. */
export const permissive = createPolicy([]);

// ---------- REUSABLE RULES ----------

/** Refuse events attributed to nobody. Closes the unattributed-injection gap. */
export const requireActor = (event) => {
  if (!event.person && !event.human) {
    throw new PolicyViolation("requireActor", "event carries no actor; production must be attributable", event);
  }
};

/**
 * Refuse work claimed for a machine the caller has not declared certified.
 * `certifiedMachines` is injected rather than looked up, so the policy stays
 * pure and testable — and so it can later be fed from the registry without
 * changing this signature.
 */
export const requireCertifiedMachine = (certifiedMachines = []) => (event) => {
  if (!event.machine) return;
  const set = certifiedMachines instanceof Set ? certifiedMachines : new Set(certifiedMachines);
  if (set.size === 0) return; // nothing declared: not this rule's business
  if (!set.has(event.machine)) {
    throw new PolicyViolation("requireCertifiedMachine",
      `machine "${event.machine}" is not certified for this operation`, event);
  }
};

/** Refuse events for a hub that is not in the active topology. */
export const requireKnownHub = (knownHubs = []) => (event) => {
  if (!event.hub) return;
  const set = knownHubs instanceof Set ? knownHubs : new Set(knownHubs);
  if (set.size === 0) return;
  if (!set.has(event.hub)) {
    throw new PolicyViolation("requireKnownHub", `hub "${event.hub}" is not in the topology`, event);
  }
};

export default { createPolicy, permissive, requireActor, requireCertifiedMachine, requireKnownHub, PolicyViolation };
