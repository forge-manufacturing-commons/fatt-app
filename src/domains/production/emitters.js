// ============================================================
// FORGE OS — PRODUCTION EMITTER
// Domain commands, named as manufacturing rather than CRUD.
// ============================================================

import Events, { EVENT_TYPES } from "../../os/events.js";
import { emit, bridgeActor } from "../../os/pipeline.js";

export function createProductionEmitter({ publish, actor = null, hub = null, policy = null, correlationId = null }) {
  const common = { hub, correlationId, ...bridgeActor(actor) };

  return {
    produceComponent({ component, specification, machine, assembly, program, mission, summary, ...rest }) {
      return emit({ publish, policy, factory: Events.production, fields: {
        ...common, type: EVENT_TYPES.PRODUCTION.COMPONENT_PRODUCED,
        component, specification, machine, assembly, program, mission, summary, ...rest,
      }});
    },

    advanceStage({ component, stage, machine, specification, summary, ...rest }) {
      return emit({ publish, policy, factory: Events.production, fields: {
        ...common, type: EVENT_TYPES.PRODUCTION.STAGE_ADVANCED,
        component, stage, machine, specification,
        summary: summary ?? `${component} advanced to ${stage}`, ...rest,
      }});
    },

    joinAssembly({ assembly, component, machine, summary, ...rest }) {
      return emit({ publish, policy, factory: Events.production, fields: {
        ...common, type: EVENT_TYPES.PRODUCTION.ASSEMBLY_JOINED,
        assembly, component, machine,
        summary: summary ?? `${component} joined into ${assembly}`, ...rest,
      }});
    },

    /**
     * COORDINATION (E9.3). Direct another party to perform work on an artefact.
     *
     * Two parties, one fact: `actor` (via bridgeActor) is who directed, and
     * `directedTo` + `directedToClass` is who was directed. It drives no
     * lifecycle transition, so the component does not move; it confers no
     * responsibility, so `component.organisation` is untouched; and it is not a
     * knowledge act, so it does not become participation.
     *
     * Requires the `work.direct` capability at the policy gate, which is why
     * callers must pass a policy composed with requireCapability.
     */
    directWork({ component, directedTo, directedToClass, instruction, specification,
                 mission, summary, ...rest }) {
      return emit({ publish, policy, factory: Events.production, fields: {
        ...common, type: EVENT_TYPES.PRODUCTION.WORK_DIRECTED,
        component, directedTo, directedToClass, specification, mission,
        // The instruction IS the summary — the canonical human-readable line.
        // validateEvent refuses a production.* event with no summary, so an
        // empty directive cannot be published.
        summary: summary ?? instruction,
        ...rest,
      }});
    },

    /**
     * ACKNOWLEDGE OR REJECT a specific directive.  (E9.5)
     *
     * `inResponseTo` names the exact directive being answered — not a
     * correlationId, which groups a thread and cannot disambiguate two directives
     * about one component. `outcome` is accepted or rejected.
     *
     * Requires `work.acknowledge` AND that the actor is the party the directive
     * was addressed to, so callers must compose requireCapability with
     * requireDirectiveTarget. It drives no transition, confers no responsibility
     * and creates no participation: acknowledging work is not doing it.
     */
    acknowledgeWork({ component, inResponseTo, outcome, reason, summary, ...rest }) {
      return emit({ publish, policy, factory: Events.production, fields: {
        ...common, type: EVENT_TYPES.PRODUCTION.WORK_ACKNOWLEDGED,
        component, inResponseTo, outcome, reason,
        summary: summary ?? `directive ${inResponseTo} ${outcome}`,
        ...rest,
      }});
    },

    startMachine({ machine, summary, ...rest }) {
      return emit({ publish, policy, factory: Events.machine, fields: {
        ...common, type: EVENT_TYPES.MACHINE.START, machine, summary, ...rest,
      }});
    },

    reportFault({ machine, reason, summary, ...rest }) {
      return emit({ publish, policy, factory: Events.machine, fields: {
        ...common, type: EVENT_TYPES.MACHINE.FAULT, machine, reason,
        summary: summary ?? `${machine} fault${reason ? `: ${reason}` : ""}`, ...rest,
      }});
    },

    startProgram({ program, mission, summary, component, ...rest }) {
      return emit({ publish, policy, factory: Events.production, fields: {
        ...common, type: EVENT_TYPES.PRODUCTION.PROGRAM_STARTED,
        program, mission, component,
        summary: summary ?? `${program ?? mission} started`, ...rest,
      }});
    },

    finishProgram({ program, mission, summary, component, ...rest }) {
      return emit({ publish, policy, factory: Events.production, fields: {
        ...common, type: EVENT_TYPES.PRODUCTION.PROGRAM_FINISHED,
        program, mission, component,
        summary: summary ?? `${program ?? mission} finished`, ...rest,
      }});
    },
  };
}

export default createProductionEmitter;
