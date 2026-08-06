// ============================================================
// FORGE OS — PROJECTIONS
//
// One decision must be observable across the whole operating system. That
// is only possible if object state is DERIVED FROM THE EVENT LOG rather
// than held inside whichever screen made the change. A room holding its
// own useState is a room nothing else can see.
//
// So: events are the only writer. Every room folds the same log through
// these projections and therefore sees the same reality. Approving a
// specification in the Engineering Bay changes what the Operations Centre
// reports, with no shared component state and no reload.
//
// Pure functions. No React, no bus, no I/O.
//
// This also makes corruption visible. A transition the state graph forbids
// is recorded as an ANOMALY rather than silently applied — an inspection
// passing on a component still in manufacturing is not a delay.
// ============================================================

import { specificationState } from "../domains/engineering/state.js";
import { componentState } from "../domains/production/state.js";
import { missionState } from "../domains/mission/state.js";

// Human-readable titles. The operator reads the act; the event type is metadata.
const FEED_TITLE = {
  "engineering.specification.drafted":  "Specification drafted",
  "engineering.specification.released": "Specification released",
  "engineering.specification.revised":  "Specification revised",
  "engineering.specification.approved": "Specification approved",
  "production.component.produced":      "Component produced",
  "production.stage.advanced":          "Stage advanced",
  "production.assembly.joined":         "Assembly joined",
  "production.program.started":         "Programme started",
  "production.program.finished":        "Programme finished",
  "inspection.recorded":                "Inspection recorded",
  "inspection.passed":                  "Inspection passed",
  "inspection.failed":                  "Inspection failed",
  "inspection.reworked":                "Component reworked",
  "machine.start":                      "Machine started",
  "machine.run":                        "Machine running",
  "machine.fault":                      "Machine fault",
  "machine.maintenance":                "Maintenance opened",
  "person.arrived":                     "Person arrived",
  "knowledge.published":                "Knowledge published",
  // legacy vocabulary still on the bus
  "machine.started":      "Machine started",
  "machine.stopped":      "Machine stopped",
  "component.received":   "Component received",
  "drawing.approved":     "Drawing approved",
  "inspection.completed": "Inspection completed",
  "quality.verified":     "Quality verified",
  "shipment.dispatched":  "Shipment dispatched",
  "maintenance.opened":   "Maintenance opened",
};

export const feedTitle = (type) =>
  FEED_TITLE[type] ??
  String(type || "event").split(".").pop().replace(/[-_]/g, " ")
    .replace(/^./, (c) => c.toUpperCase());

const SEVERITY_RANK = { critical: 3, warning: 2, advisory: 1 };

/**
 * Fold the log into the operating picture.
 * @param log       newest-first, as the Activity Engine keeps it
 * @param missions  declared objectives: [{ id, title, target, component }]
 */
export function project(log = [], missions = []) {
  const ordered = [...log].reverse();          // oldest first, so state folds forward

  const specifications = {};
  const components = {};
  const anomalies = [];
  const feed = [];
  let produced = 0, passed = 0, failed = 0;

  const touchSpec = (id) => (specifications[id] ??= {
    id, state: specificationState.initial, revision: null, author: null, history: [],
  });
  const touchComp = (id) => (components[id] ??= {
    id, state: componentState.initial, specification: null, history: [],
  });

  for (const e of ordered) {
    if (!e || typeof e.type !== "string") continue;

    // ---- specifications ----
    if (e.specification && e.type.startsWith("engineering.")) {
      const s = touchSpec(e.specification);
      if (e.revision) s.revision = e.revision;
      if (e.person || e.human) s.author ??= e.person || e.human;
      if (e.transition) {
        try {
          const to = specificationState.next(s.state, e.transition);
          s.history.push({ at: e.at, from: s.state, to, transition: e.transition, by: e.person || e.human });
          s.state = to;
        } catch (err) {
          anomalies.push({
            at: e.at, objectClass: "specification", id: s.id,
            attempted: e.transition, held: s.state, eventId: e.eventId,
            message: `${s.id} cannot "${e.transition}" from "${s.state}"`,
          });
        }
      }
    }

    // ---- components ----
    if (e.component) {
      const c = touchComp(e.component);
      if (e.specification) c.specification ??= e.specification;
      let transition = null;
      if (e.type === "production.component.produced" || e.type === "component.received") transition = "release";
      else if (e.type === "inspection.passed" || e.type === "quality.verified") transition = "pass";
      else if (e.type === "inspection.failed") transition = "fail";
      else if (e.type === "inspection.reworked") transition = "submitForInspection";
      else if (e.type === "production.assembly.joined") transition = "assemble";

      if (transition) {
        // Producing then inspecting requires the intermediate submit step. An
        // inspection result arriving straight from manufacturing is an honest
        // sequence, not corruption, so the projection performs the submit —
        // for BOTH outcomes, since a component can fail as easily as pass.
        if ((transition === "pass" || transition === "fail") && c.state === "manufacturing") {
          const mid = componentState.next(c.state, "submitForInspection");
          c.history.push({ at: e.at, from: c.state, to: mid, transition: "submitForInspection" });
          c.state = mid;
        }
        try {
          const to = componentState.next(c.state, transition);
          c.history.push({ at: e.at, from: c.state, to, transition, by: e.person || e.human });
          c.state = to;
        } catch (err) {
          anomalies.push({
            at: e.at, objectClass: "component", id: c.id,
            attempted: transition, held: c.state, eventId: e.eventId,
            message: `${c.id} cannot "${transition}" from "${c.state}"`,
          });
        }
      }
      if (e.type === "production.component.produced" || e.type === "component.received") produced++;
      if (e.type === "inspection.passed" || e.type === "quality.verified") passed++;
      if (e.type === "inspection.failed") failed++;
    }

    // ---- operations feed: what a person would say happened ----
    feed.push({
      at: e.at, eventId: e.eventId, type: e.type,
      title: feedTitle(e.type),
      subject: e.component || e.specification || e.machine || e.knowledge || e.studio || null,
      actor: e.person || e.human || null,
      hub: e.hub || null,
      detail: e.summary || e.text || null,
      result: e.result || e.status || null,
    });
  }

  // ---- missions: progress is counted, never asserted ----
  const missionRows = missions.map((m) => {
    const accepted = Object.values(components)
      .filter((c) => (!m.specification || c.specification === m.specification))
      .filter((c) => ["assembly", "completed", "installed"].includes(c.state)).length;
    const target = m.target || 0;
    const progress = target ? Math.min(100, Math.round((accepted / target) * 100)) : 0;
    let state = m.state ?? missionState.initial;
    if (accepted > 0 && state === missionState.initial) state = "production";
    return { ...m, accepted, target, progress, state };
  });

  // ---- decisions: what Forge OS recommends, derived from state held now ----
  const recommendations = [];
  for (const s of Object.values(specifications)) {
    if (s.state === "review")
      recommendations.push({ id:`rec-spec-${s.id}`, severity:"advisory",
        message:`${s.id} is awaiting review. Assign a level 3 engineer.`, subject:s.id });
    if (s.state === "approved")
      recommendations.push({ id:`rec-spec-${s.id}`, severity:"warning",
        message:`${s.id} is approved but not released. Production cannot start until it is released.`, subject:s.id });
    if (s.state === "released")
      recommendations.push({ id:`rec-spec-${s.id}`, severity:"advisory",
        message:`${s.id} is released. Production may be authorised — match a certified workshop.`, subject:s.id });
  }
  for (const c of Object.values(components)) {
    if (c.state === "rework")
      recommendations.push({ id:`rec-comp-${c.id}`, severity:"warning",
        message:`${c.id} failed inspection and is in rework. Re-submit once corrected.`, subject:c.id });
    if (c.state === "blocked")
      recommendations.push({ id:`rec-comp-${c.id}`, severity:"critical",
        message:`${c.id} is blocked and cannot proceed.`, subject:c.id });
    if (c.state === "assembly")
      recommendations.push({ id:`rec-comp-${c.id}`, severity:"advisory",
        message:`${c.id} passed inspection and is cleared for assembly.`, subject:c.id });
  }
  for (const a of anomalies) {
    recommendations.push({ id:`rec-anom-${a.id}-${a.at}`, severity:"critical",
      message:`Impossible transition recorded: ${a.message}. This indicates data corruption, not a delay.`,
      subject:a.id });
  }
  recommendations.sort((x, y) => (SEVERITY_RANK[y.severity] ?? 0) - (SEVERITY_RANK[x.severity] ?? 0));
  return { specifications, components, missions: missionRows, recommendations, anomalies, feed: feed.reverse(),
           counts: { produced, passed, failed } };
}

export default { project, feedTitle };
