// ============================================================
// FORGE OS — CAUSAL MAP
//
// The kernel's knowledge of which events make which facts true. Rooms never
// define causality; they render what the kernel derived.
//
// THREE THINGS THAT MUST NEVER COLLAPSE INTO ONE:
//   EVENT       something happened            — canonical log, the only truth
//   CONSEQUENCE something is now true         — derived here, never stored
//   RECOMMENDATION what should happen next    — projections/rule engine
//
// A consequence is deliberately NOT phrased as an event type. `production.
// authorised` is a fact; `production.component.produced` is an event. Naming
// them apart is what stops a derived fact being mistaken for a new event and
// re-published, which would duplicate truth.
//
// Keys are CANONICAL event types only. The specified map used
// `lifecycle.reworked` and `engineering.specification.rejected`, neither of
// which exists in the vocabulary — rework is inspection.reworked, and a
// rejection is a revision carrying the state graph's "reject" transition.
// ============================================================
import { EVENT_TYPES } from "../events.js";

export const CAUSAL_MAP = Object.freeze({
  [EVENT_TYPES.ENGINEERING.SPEC_RELEASED]: [
    { consequence:"production.authorised", subjectField:"specification",
      affectedDomain:"production", unlocks:"component.production.start",
      missionImpact:"unlocked", next:"Production may begin against this specification." },
  ],
  [EVENT_TYPES.ENGINEERING.SPEC_APPROVED]: [
    { consequence:"release.permitted", subjectField:"specification",
      affectedDomain:"engineering", unlocks:EVENT_TYPES.ENGINEERING.SPEC_RELEASED,
      missionImpact:null, next:"The specification may be released for production." },
  ],
  [EVENT_TYPES.ENGINEERING.SPEC_REVISED]: [
    { consequence:"revision.required", subjectField:"specification",
      affectedDomain:"engineering", unlocks:null,
      missionImpact:"blocked", next:"The author must correct and resubmit." },
  ],
  [EVENT_TYPES.ENGINEERING.SPEC_DRAFTED]: [
    { consequence:"review.pending", subjectField:"specification",
      affectedDomain:"engineering", unlocks:EVENT_TYPES.ENGINEERING.SPEC_APPROVED,
      missionImpact:null, next:"A level 3 engineer must review it." },
  ],
  [EVENT_TYPES.PRODUCTION.COMPONENT_PRODUCED]: [
    { consequence:"verification.required", subjectField:"component",
      affectedDomain:"inspection", unlocks:EVENT_TYPES.INSPECTION.PASSED,
      missionImpact:null, next:"The component must be inspected before assembly." },
  ],
  [EVENT_TYPES.INSPECTION.PASSED]: [
    { consequence:"component.accepted", subjectField:"component",
      affectedDomain:"production", unlocks:"assembly.intake",
      missionImpact:"progressed", next:"The component counts toward mission progress." },
  ],
  [EVENT_TYPES.INSPECTION.FAILED]: [
    { consequence:"rework.required", subjectField:"component",
      affectedDomain:"production", unlocks:EVENT_TYPES.INSPECTION.REWORKED,
      missionImpact:null, next:"The component must be corrected and re-inspected." },
  ],
  [EVENT_TYPES.INSPECTION.REWORKED]: [
    { consequence:"reverification.required", subjectField:"component",
      affectedDomain:"inspection", unlocks:EVENT_TYPES.INSPECTION.PASSED,
      missionImpact:null, next:"The corrected component must be re-inspected." },
  ],
  [EVENT_TYPES.MACHINE.FAULT]: [
    { consequence:"production.halted", subjectField:"machine",
      affectedDomain:"operations", unlocks:null,
      missionImpact:"blocked", next:"The machine must be cleared before work resumes." },
  ],
  [EVENT_TYPES.MISSION.CREATED]: [
    { consequence:"mission.opened", subjectField:"mission",
      affectedDomain:"operations", unlocks:EVENT_TYPES.ENGINEERING.SPEC_DRAFTED,
      missionImpact:null, next:"An engineering package must be authored." },
  ],
});

/** Every consequence name in the map. Used by the architecture tests. */
export const ALL_CONSEQUENCES = Object.freeze(
  [...new Set(Object.values(CAUSAL_MAP).flat().map((t) => t.consequence))]
);

/**
 * Derive the facts an event makes true. Pure: takes only the event, so two
 * rooms calling it independently get identical results and never need to tell
 * each other anything.
 */
export function deriveConsequences(event, correlationId = null) {
  if (!event || typeof event.type !== "string") return [];
  const triggers = CAUSAL_MAP[event.type];
  if (!triggers?.length) return [];
  return triggers.map((t) => Object.freeze({
    consequence: t.consequence,
    subject: event[t.subjectField] ?? null,
    subjectField: t.subjectField,
    // provenance — the spine
    causedBy: event.type,
    eventId: event.eventId ?? null,
    correlationId: correlationId ?? event.correlationId ?? null,
    actor: event.person ?? event.human ?? null,
    at: event.at ?? Date.now(),
    affectedDomain: t.affectedDomain,
    unlocks: t.unlocks,
    missionImpact: t.missionImpact,
    affectedMission: event.mission ?? null,
    next: t.next,
  }));
}

/** Trace backward: which events could have made this fact true. */
export function findCauses(consequence) {
  return Object.entries(CAUSAL_MAP)
    .filter(([, ts]) => ts.some((t) => t.consequence === consequence))
    .map(([type]) => type);
}

/** Trace forward: what this event makes possible. */
export function findUnlocked(eventType) {
  return (CAUSAL_MAP[eventType] ?? []).map((t) => t.unlocks).filter(Boolean);
}

export default { CAUSAL_MAP, ALL_CONSEQUENCES, deriveConsequences, findCauses, findUnlocked };
