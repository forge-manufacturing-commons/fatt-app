// ============================================================
// FORGE OS — INSPECTION EMITTER
// A quality record is refused unless it is complete. events.js enforces
// component + result + summary as errors, so a fraudulent record cannot
// be published through this emitter.
// ============================================================

import Events, { EVENT_TYPES, INSPECTION_RESULT } from "../events.js";
import { emit, bridgeActor } from "./base.js";

export function createInspectionEmitter({ publish, actor = null, hub = null, policy = null, correlationId = null }) {
  const common = { hub, correlationId, ...bridgeActor(actor) };

  const record = ({ component, result, specification, machine, summary, ...rest }) =>
    emit({ publish, policy, factory: Events.inspection, fields: {
      ...common, component, result, specification, machine, summary, ...rest,
    }});

  return {
    record,

    pass({ component, specification, machine, summary, ...rest }) {
      return record({ component, specification, machine,
        result: INSPECTION_RESULT.PASS,
        summary: summary ?? `${component} passed inspection`, ...rest });
    },

    fail({ component, specification, machine, reason, summary, ...rest }) {
      return record({ component, specification, machine, reason,
        result: INSPECTION_RESULT.FAIL,
        summary: summary ?? `${component} failed inspection${reason ? `: ${reason}` : ""}`, ...rest });
    },

    rework({ component, specification, machine, summary, ...rest }) {
      return emit({ publish, policy, factory: Events.inspection, fields: {
        ...common, type: EVENT_TYPES.INSPECTION.REWORKED,
        component, specification, machine, result: INSPECTION_RESULT.PENDING,
        summary: summary ?? `${component} reworked, awaiting re-inspection`, ...rest,
      }});
    },
  };
}

export default createInspectionEmitter;
