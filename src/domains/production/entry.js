// ============================================================
// PRODUCTION DOMAIN — MANUFACTURING ENTRY
//
// The set of manufacturing facts a human operator may record by hand, and the
// rule for which of them a given component will actually accept.
//
// It is pure and React-free on purpose: the same predicate that decides which
// buttons a surface offers is the one the tests exercise, so "the UI offered an
// action the fold then refused" is a detectable defect rather than a surprise.
//
// EVERY ACTION MAPS TO AN EVENT TYPE THAT ALREADY EXISTS. No action was invented
// to round out the set, and two candidates were deliberately left out:
//
//   "Send for inspection" — the fold has no event that performs the
//   submitForInspection transition from `manufacturing`. It performs that step
//   itself when a result arrives. Offering a button with no event behind it
//   would be a fiction, so the operator records the RESULT and the projection
//   does the intermediate step, exactly as it does for the seed story.
//
//   "Joined into assembly" — production.assembly.joined exists, but it requires
//   an assembly identifier and no assembly is configured for the pilot. An
//   action that cannot be completed truthfully is not offered.
//
// OBSERVED TENSION, NOT FIXED HERE. `production.component.produced` drives the
// `release` transition, whose destination state is `manufacturing` ("Being
// made") — so the event says the part is finished while the state says it is
// still being made. That is pre-existing fold behaviour and changing it would
// alter the lifecycle thesis, which this pass is explicitly not authorised to
// do. It is handled by labelling each action with the event it records AND the
// state the graph will move to, so the surface never has to pretend the two
// agree. Recorded in TRANSITIONAL.md.
// ============================================================

import { componentState } from "./state.js";

/**
 * `domain`/`command` name the existing emitter method. Nothing here constructs
 * an event: construction stays in the emitters, which run the pipeline's four
 * gates. This table only decides what may be OFFERED.
 */
export const MANUFACTURING_ACTIONS = Object.freeze([
  Object.freeze({
    id: "produced",
    label: "Component produced",
    help: "The part has been made against its drawing.",
    transition: "release",
    domain: "production",
    command: "produceComponent",
  }),
  Object.freeze({
    id: "passed",
    label: "Inspection passed",
    help: "Measured and within tolerance.",
    transition: "pass",
    domain: "inspection",
    command: "pass",
  }),
  Object.freeze({
    id: "failed",
    label: "Inspection failed",
    help: "Measured and outside tolerance.",
    transition: "fail",
    domain: "inspection",
    command: "fail",
  }),
  Object.freeze({
    id: "reworked",
    label: "Reworked, back for inspection",
    help: "The fault has been corrected and the part resubmitted.",
    transition: "submitForInspection",
    domain: "inspection",
    command: "rework",
    // TRUTHFULNESS CONSTRAINT — narrower than the graph, on purpose.
    //
    // The component graph allows `submitForInspection` from BOTH `manufacturing`
    // and `rework`, and exactly one event drives it: `inspection.reworked`. So
    // offering this action from `manufacturing` did not merely mislabel a button
    // — clicking it published an event asserting the part had been REWORKED when
    // nothing had failed and nothing had been corrected. A false entry in the
    // log is worse than a missing button.
    //
    // From `manufacturing` the operator does not need it: the fold performs the
    // intermediate submitForInspection itself when a pass or fail arrives, which
    // is why `entry.js` never offered a bare "Send for inspection" either. There
    // is no `inspection.submitted` event, and this pass does not invent one to
    // make wording convenient.
    //
    // So the transition stays legal in the graph and the ACTION is restricted to
    // the one state where its event is true.
    truthfulFrom: Object.freeze(["rework"]),
  }),
]);

export const actionById = (id) => MANUFACTURING_ACTIONS.find((a) => a.id === id) ?? null;

const canStep = (from, transition) => {
  try { return Boolean(componentState.next(from, transition)); }
  catch { return false; }
};

/**
 * Would the fold accept this transition from this state?
 *
 * MIRRORS projections.js, including its one piece of tolerance: an inspection
 * result arriving straight from `manufacturing` is honest, so the fold performs
 * the missing submitForInspection first. This predicate has to allow the same
 * thing or the surface would withhold the most common action in the pilot.
 *
 * The duplication is real and is guarded rather than hidden — the pilot suite
 * asserts this function and the fold agree for every state × action pair, so
 * they cannot drift apart silently.
 */
export function wouldAccept(from, transition) {
  if (canStep(from, transition)) return true;
  if (transition !== "pass" && transition !== "fail") return false;
  if (from !== "manufacturing") return false;
  return canStep(componentState.next(from, "submitForInspection"), transition);
}

/** The state the graph will move to, or null when the transition is refused. */
export function resultingState(from, transition) {
  if (!wouldAccept(from, transition)) return null;
  if (canStep(from, transition)) return componentState.next(from, transition);
  return componentState.next(componentState.next(from, "submitForInspection"), transition);
}

/**
 * Would this action's EVENT be a true statement from this state?
 *
 * Separate from `wouldAccept`, which answers only whether the graph permits the
 * transition. Two different questions: the graph asks "is this move legal?", this
 * asks "would recording it be honest?". An action with no `truthfulFrom` is
 * unconstrained — its event says nothing beyond the transition itself.
 */
export const isTruthfulFrom = (action, from) =>
  !action.truthfulFrom || action.truthfulFrom.includes(from);

/**
 * Actions this component will accept right now, each carrying the state it
 * leads to. A component the log has never seen is at `componentState.initial`,
 * which is a fact about the graph rather than an assumption about the part.
 *
 * BOTH gates must pass: the graph must permit the transition AND the event must
 * be true from this state. The surface is therefore deliberately narrower than
 * the state machine, and `wouldAccept` is left as pure graph legality so the two
 * never get conflated.
 */
export function availableActions(from = componentState.initial) {
  return MANUFACTURING_ACTIONS
    .filter((a) => wouldAccept(from, a.transition) && isTruthfulFrom(a, from))
    .map((a) => ({ ...a, to: resultingState(from, a.transition) }));
}

export default {
  MANUFACTURING_ACTIONS, actionById, wouldAccept, resultingState,
  isTruthfulFrom, availableActions,
};
