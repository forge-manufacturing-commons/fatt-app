// ============================================================
// FORGE OS — EMITTER BASE
//
// Shared plumbing for the domain emitters. Not a class hierarchy — one
// function that every emitter routes through, so validation, policy,
// attribution and the V1 compatibility bridge exist in exactly one place.
//
// No React. No useForgeActivity. `publish` is injected, which keeps emitters
// testable outside a component tree and lets an offline queue be inserted
// later by injecting a queueing publish instead of the live one.
// ============================================================

import Events from "../events.js";

/**
 * `human` mirrors `person` for V1 ONLY. ForgeRuntime.deriveManufacturing counts
 * distinct e.human, so a canonical event carrying person alone would increment
 * the people metric by zero. Remove once the runtime consumes canonical PERSON
 * fields — this is an anti-corruption bridge, not a schema opinion.
 */
export function bridgeActor(actor) {
  if (!actor) return {};
  return { person: actor, human: actor };
}

/**
 * Build -> validate -> policy -> publish. Refusals throw at the producer,
 * where the caller has the context to fix them, rather than surfacing later
 * as a malformed object in the registry.
 */
export function emit({ publish, policy, factory, fields }) {
  if (typeof publish !== "function") {
    throw new Error("emit: `publish` must be injected");
  }
  const event = factory(fields);
  Events.assert(event);            // schema-level completeness
  if (policy) policy(event);       // business-level permission
  const recorded = publish(event); // publish() now returns the stamped event
  return recorded ?? event;        // tolerate a bus that returns nothing
}

export default { emit, bridgeActor };
