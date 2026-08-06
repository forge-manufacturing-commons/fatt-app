// ============================================================
// FORGE OS — ENGINEERING EMITTER
// hub is never defaulted: hubs in this deployment are geographic
// (lagos, kaduna, nnewi), so inventing a functional 'engineering' hub
// would create a workshop that does not exist.
// ============================================================

import Events, { EVENT_TYPES } from "../../os/events.js";
import { emit, bridgeActor } from "../../os/pipeline.js";

export function createEngineeringEmitter({ publish, actor = null, hub = null, policy = null, correlationId = null }) {
  const common = { hub, correlationId, ...bridgeActor(actor) };

  const spec = (type) => ({ specification, program, mission, knowledge, revision, summary, ...rest }) =>
    emit({ publish, policy, factory: Events.engineering, fields: {
      ...common, type, specification, program, mission, knowledge, revision, summary, ...rest,
    }});

  return {
    draftSpecification:   spec(EVENT_TYPES.ENGINEERING.SPEC_DRAFTED),
    releaseSpecification: spec(EVENT_TYPES.ENGINEERING.SPEC_RELEASED),
    approveSpecification: spec(EVENT_TYPES.ENGINEERING.SPEC_APPROVED),

    reviseSpecification({ specification, revision, reason, summary, ...rest }) {
      return emit({ publish, policy, factory: Events.engineering, fields: {
        ...common, type: EVENT_TYPES.ENGINEERING.SPEC_REVISED,
        specification, revision, reason,
        summary: summary ?? `${specification} revised${revision ? ` to ${revision}` : ""}`, ...rest,
      }});
    },
  };
}

export default createEngineeringEmitter;
