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
