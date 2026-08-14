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

import { capabilitiesFor, VERIFICATION_GATED } from "./Roles.js";
import { capabilityFor, isScopedType } from "./events.js";
import { hubsOfOrganisation } from "./pilot.js";

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

/**
 * Refuse an event the actor holds no authority to record.  (E8)
 *
 * THE ONE RULE THAT MAKES CAPABILITY MEAN SOMETHING. Roles.js has defined 16
 * capabilities and a verification gate since Phase 1; `ForgeIdentity.can()` was
 * written to read them and has never had a single caller. Capability was
 * displayed in the Workspace and consulted nowhere, so any actor could publish
 * any event in any capacity. This closes that at the event boundary.
 *
 * IT DERIVES THE REQUIREMENT FROM THE EVENT, not from the call site. The needed
 * capability comes from EVENT_CAPABILITY in events.js, so one instance of this
 * rule serves every mapped event type and a caller cannot accidentally enforce
 * the wrong capability. An unmapped event type is not this rule's business and
 * passes untouched — which is why production is unaffected.
 *
 * IDENTITY IS INJECTED, matching requireCertifiedMachine/requireKnownHub. The
 * event carries only a person's NAME (`person`/`human` are FORGE_OBJECT.PERSON
 * strings); it carries no role and no verification standing, and it must not —
 * an event that asserted its own author's authority would be self-certifying.
 * The authenticated profile supplies role and verification; the event supplies
 * what is being claimed. The two are kept apart on purpose.
 *
 * AN ABSENT IDENTITY IS A REFUSAL, not a bypass. Authority cannot be established
 * by failing to present any, so an anonymous caller cannot approve a design.
 *
 * @param identity { person?, role, verification } — from the authenticated profile
 */
export const requireCapability = (identity) => (event) => {
  const capability = capabilityFor(event?.type);
  if (!capability) return;                    // this event requires no authority

  if (!identity || typeof identity !== "object") {
    throw new PolicyViolation("requireCapability",
      `"${event?.type}" requires the "${capability}" capability, but no authenticated identity was presented`,
      event);
  }

  const who = identity.person || event?.person || event?.human || "an unidentified actor";
  const role = identity.role;

  if (!role) {
    throw new PolicyViolation("requireCapability",
      `${who} presented no Forge role, so the "${capability}" capability required by "${event.type}" cannot be established`,
      event);
  }

  const held = capabilitiesFor(role);
  if (!held.includes(capability)) {
    throw new PolicyViolation("requireCapability",
      `${who} acts as "${role}", which does not hold "${capability}" — required to record "${event.type}"`,
      event);
  }

  // Authority that carries real-world consequence stays shut until verified.
  // This list is Roles.js's, not a second copy of the same decision.
  if (VERIFICATION_GATED.includes(capability) && identity.verification !== "verified") {
    throw new PolicyViolation("requireCapability",
      `${who} holds "${capability}" as "${role}", but it is verification-gated and this identity is ` +
      `"${identity.verification ?? "unverified"}" — required to record "${event.type}"`,
      event);
  }
};

/**
 * Refuse a scoped act performed outside the actor's organisation's hubs.  (E9.5)
 *
 * CAPABILITY IS NOT SCOPE. `requireCapability` answers "may this actor coordinate
 * work at all?". This answers "may they coordinate it HERE?". Both must be true,
 * and they fail for different reasons — a manufacturer holding `work.direct` is
 * still refused at a hub its organisation does not operate.
 *
 * IT ONLY SPEAKS FOR SCOPED CAPABILITIES. `isScopedType` reads
 * SCOPED_CAPABILITIES from events.js, so the rule is data-driven: composing it
 * into a policy cannot accidentally start scope-checking production or
 * inspection, whose authority is not locational. Unscoped types pass untouched.
 *
 * THE ORGANISATION COMES FROM THE AUTHENTICATED IDENTITY, never from the event.
 * `event.organisation` describes affiliation and must not grant authority — a
 * client that could name its own organisation could grant itself any scope. An
 * identity with no organisation therefore has NO scope, not universal scope.
 *
 * @param identity { person?, organisation }
 * @param resolveHubs (organisationId) => string[] — injected, so this module
 *        stays free of the network/pilot registries and remains testable.
 */
export const requireHubScope = (identity, resolveHubs = hubsOfOrganisation) => (event) => {
  if (!isScopedType(event?.type)) return;          // not a locational act

  const who = identity?.person || event?.person || event?.human || "an unidentified actor";
  const organisation = identity?.organisation;

  if (!organisation) {
    throw new PolicyViolation("requireHubScope",
      `${who} presented no organisation, so scope to act at any hub cannot be established`,
      event);
  }
  const hub = event?.hub;
  if (!hub) {
    throw new PolicyViolation("requireHubScope",
      `"${event?.type}" is locationally scoped and carries no hub, so scope cannot be checked`,
      event);
  }
  const hubs = resolveHubs(organisation) || [];
  if (!hubs.includes(hub)) {
    throw new PolicyViolation("requireHubScope",
      `${who} acts for "${organisation}", which operates at ${hubs.length ? hubs.join(", ") : "no recorded hub"} ` +
      `— not "${hub}", required to record "${event.type}"`,
      event);
  }
};

/**
 * Refuse an acknowledgement that does not answer a real directive addressed to
 * this actor.  (E9.5)
 *
 * `validateEvent` sees one event and cannot know whether the referenced directive
 * exists, so the reference is verified here — before publication — with the log
 * injected. Four things must hold:
 *
 *   1. the referenced event EXISTS in the log
 *   2. it is a `production.work.directed`, not an acknowledgement or anything else
 *   3. it concerns the SAME component as the acknowledgement
 *   4. the acknowledging party IS the party the directive was addressed to
 *
 * (4) is the one that matters most: without it any holder of `work.acknowledge`
 * could answer a directive addressed to somebody else. The recipient is matched
 * against the authenticated identity's organisation or person — never against a
 * value supplied on the acknowledging event, which would be self-certifying.
 *
 * @param identity { person?, organisation }
 * @param log      the event stream to resolve the reference against
 */
export const requireDirectiveTarget = ({ identity, log = [] }) => (event) => {
  if (event?.type !== "production.work.acknowledged") return;

  const who = identity?.person || event?.person || "an unidentified actor";
  const ref = event?.inResponseTo;
  const directive = log.find((e) => e?.eventId === ref);

  if (!directive) {
    throw new PolicyViolation("requireDirectiveTarget",
      `${who} acknowledged directive "${ref}", which does not exist in this event stream`, event);
  }
  if (directive.type !== "production.work.directed") {
    throw new PolicyViolation("requireDirectiveTarget",
      `"inResponseTo" must reference a directive; "${ref}" is a "${directive.type}"`, event);
  }
  if (directive.component !== event.component) {
    throw new PolicyViolation("requireDirectiveTarget",
      `the directive "${ref}" concerns "${directive.component}" but the acknowledgement names ` +
      `"${event.component}"`, event);
  }

  // WHO WAS ADDRESSED — matched against the authenticated identity only.
  const target = directive.directedTo;
  const asOrganisation = directive.directedToClass === "institution";
  const claimant = asOrganisation ? identity?.organisation : identity?.person;

  if (!claimant) {
    throw new PolicyViolation("requireDirectiveTarget",
      `${who} presented no ${asOrganisation ? "organisation" : "person"} identity, so it cannot be ` +
      `established that the directive "${ref}" was addressed to them`, event);
  }
  if (claimant !== target) {
    throw new PolicyViolation("requireDirectiveTarget",
      `directive "${ref}" was addressed to ${asOrganisation ? "organisation" : "person"} "${target}", ` +
      `not to "${claimant}" — a directive may only be answered by the party it names`, event);
  }
};

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

export default {
  createPolicy, permissive, requireActor, requireCapability,
  requireHubScope, requireDirectiveTarget,
  requireCertifiedMachine, requireKnownHub, PolicyViolation,
};
