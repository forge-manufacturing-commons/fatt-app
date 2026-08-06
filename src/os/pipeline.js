// ============================================================
// FORGE OS — EMIT PIPELINE
//
//   Intent -> Schema -> Policy -> Rules -> State -> Event -> Bus
//
// Four gates, each answering one question and nothing else:
//   Schema  (events.js) is this record structurally complete?
//   Policy  (policy.js) may this ACTOR act?
//   Rules   (rules.js)  does the manufacturing DOMAIN permit it?
//   State   (state.js)  may this OBJECT make this transition?
//
// Order matters. Schema first because an incomplete record cannot be
// reasoned about. State LAST because it is the most expensive to answer
// and the most specific — there is no point asking whether a component
// may advance if the actor was never allowed to ask.
//
// No React. `publish` is injected, so an offline queue can be substituted
// without any emitter knowing.
// ============================================================

import Events from "./events.js";

/**
 * `human` mirrors `person` for V1 ONLY. ForgeRuntime.deriveManufacturing
 * counts distinct e.human, so an event carrying `person` alone increments
 * the people metric by zero. TRANSITIONAL — see TRANSITIONAL.md.
 */
export function bridgeActor(actor) {
  if (!actor) return {};
  return { person: actor, human: actor };
}

export function emit({ publish, policy, rules, state, factory, fields }) {
  if (typeof publish !== "function") throw new Error("emit: `publish` must be injected");

  const event = factory(fields);
  Events.assert(event);                       // 1. schema
  if (policy) policy(event);                  // 2. actor authorisation
  if (rules) rules.assert({ ...(state?.context ?? {}), ...event });  // 3. industrial constraint
  if (state?.machine && state?.from && state?.transition) {          // 4. object lifecycle
    event.toState = state.machine.next(state.from, state.transition);
    event.fromState = state.from;
  }
  const recorded = publish(event);
  return recorded ?? event;
}

export default { emit, bridgeActor };
