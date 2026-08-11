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
import { deriveConsequences } from "./causality/causalMap.js";

/**
 * Deep freeze. The projection is the ONLY description of manufacturing state,
 * and it is returned immutable so a room cannot own it.
 *
 * This turns a convention into a guarantee. Previously the audit asked "does
 * this room APPEAR to own manufacturing state?" — a syntactic question with
 * false negatives. Now a room that tries to mutate a mission, component or
 * specification fails at runtime under strict mode (every ES module is
 * strict), because the object refuses the write. Only events may change
 * manufacturing state.
 */
function deepFreeze(o) {
  if (o === null || typeof o !== "object" || Object.isFrozen(o)) return o;
  for (const v of Object.values(o)) deepFreeze(v);
  return Object.freeze(o);
}

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

  const consequences = [];   // derived facts, each carrying what caused it
  const specifications = {};
  const components = {};
  const anomalies = [];
  const feed = [];
  let produced = 0, passed = 0, failed = 0;

  const touchSpec = (id) => (specifications[id] ??= {
    id, state: specificationState.initial, revision: null, author: null, history: [],
  });
  const touchComp = (id) => (components[id] ??= {
    id, state: componentState.initial, specification: null, mission: null, history: [],
  });
  // MISSION LIFECYCLE — folded exactly like specifications and components.
  //
  // Previously mission state was a two-value heuristic: `planning`, or
  // `production` as soon as one component reached assembly. That bypassed the
  // nine-state graph in src/domains/mission/state.js entirely — no transition
  // validation, no history, no anomaly when the sequence was impossible. A
  // mission could not be wrong, which meant its state carried no information.
  //
  // Lifecycle now comes only from the graph. Progress stays counted separately:
  // a mission that has produced components is not thereby "in production", and
  // a mission in production is not thereby progressing. They are different
  // questions and the projection no longer conflates them.
  const missionLife = {};
  const declaredState = (id) => missions.find((m) => m.id === id)?.state;
  const touchMission = (id) => (missionLife[id] ??= {
    id, state: declaredState(id) ?? missionState.initial, history: [],
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
      // MISSION MEMBERSHIP — preserved from the producing event, never derived.
      //
      // Mission identity reached the lifecycle fold and the causal map but was
      // dropped here, so `accepted` had to reconstruct membership by matching
      // specifications. That guess is wrong in two demonstrable ways: two
      // missions sharing a specification both counted the same component, and a
      // mission needing a second specification counted neither — in both cases
      // while the event itself named the mission explicitly.
      //
      // First writer wins, exactly as `specification` above. A component's
      // membership is established when it is produced; a later event must not
      // silently reassign work that has already been counted elsewhere.
      if (e.mission) c.mission ??= e.mission;
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

    // ---- missions ----
    // ASSOCIATION IS BY e.mission AND NOTHING ELSE.
    //
    // That is the only field a producer actually sets (production and
    // engineering emitters both accept it). story.js threads a correlationId of
    // the form "mission-<ID>", but that is a convention inside one fixture, not
    // an enforced invariant, so promoting it to a correlation rule here would
    // manufacture an association the event never made. An event that does not
    // name its mission does not move one.
    if (e.mission) {
      const mi = touchMission(e.mission);
      let transition = null;
      // Only mappings the graph defines AND the event unambiguously means.
      if (e.type === "mission.authorised")                       transition = "authorise";
      else if (e.type === "engineering.specification.released")   transition = "completePackage";
      else if (e.type === "production.program.finished")          transition = "productionComplete";
      // mission.created carries no transition: `planning` IS the initial state,
      // so creation is an appearance, not a movement.
      //
      // inspection.passed is DELIBERATELY UNMAPPED. The graph defines
      // qualityAccepted (inspection -> delivery), but inspection.passed is a
      // per-COMPONENT result. Mapping it would let the first passing component
      // carry an entire mission into delivery. That is a scope error, not a
      // transition. Left unmapped and reported rather than guessed.
      //
      // mission.closed is DELIBERATELY UNMAPPED. The only edge into `closed` is
      // `delivered`, and no canonical event means delivered. Mapping closure
      // onto `delivered` would conflate two different facts.
      if (transition) {
        try {
          const to = missionState.next(mi.state, transition);
          mi.history.push({ at: e.at, from: mi.state, to, transition, by: e.person || e.human });
          mi.state = to;
        } catch (err) {
          anomalies.push({
            at: e.at, objectClass: "mission", id: mi.id,
            attempted: transition, held: mi.state, eventId: e.eventId,
            message: `${mi.id} cannot "${transition}" from "${mi.state}"`,
          });
        }
      }
    }

    // ---- causal provenance: what this event made TRUE ----
    // Derived, never published. The event log stays the only source of truth.
    for (const c of deriveConsequences(e)) consequences.push(c);

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
    // CORRELATION PRECEDENCE — explicit identity first, specification only as a
    // fallback for components whose events never named a mission.
    //
    // The order matters and must not be reversed. Specification matching is a
    // guess retained for uncorrelated data; it may never override an event that
    // stated its membership. A component belonging to FORGE-ALPHA does not
    // become FORGE-REPEAT's work because the two share a drawing.
    const accepted = Object.values(components)
      .filter((c) => (c.mission
        ? c.mission === m.id
        : (!m.specification || c.specification === m.specification)))
      .filter((c) => ["assembly", "completed", "installed"].includes(c.state)).length;
    const target = m.target || 0;
    const progress = target ? Math.min(100, Math.round((accepted / target) * 100)) : 0;
    // Lifecycle from the graph; metrics from the fold. Never one from the other.
    const life = missionLife[m.id];
    const state = life?.state ?? m.state ?? missionState.initial;
    return { ...m, accepted, target, progress, state, history: life?.history ?? [] };
  });

  // ---- decisions: what Forge OS recommends, derived from state held now ----
  const recommendations = [];
  for (const s of Object.values(specifications)) {
    if (s.state === "review")
      recommendations.push({ id:`rec-spec-${s.id}`, severity:"advisory",
        message:`${s.id} is awaiting review. Assign a level 3 engineer.`, subject:s.id,
        action:"Assign a reviewer", rule:"ENG-003",
        impact:"Production cannot be authorised until review completes.",
        // WHY. Forge OS explains itself: a recommendation with no stated
        // reasoning is indistinguishable from a guess.
        because:[
          `Specification ${s.id} holds state "review".`,
          `Rule ENG-003 requires a level 3 engineering competency to approve.`,
          `Rule ENG-001 prevents the author approving their own document.`,
        ]});
    if (s.state === "approved")
      recommendations.push({ id:`rec-spec-${s.id}`, severity:"warning",
        message:`${s.id} is approved but not released. Production cannot start until it is released.`, subject:s.id,
        action:"Release for production", rule:"SPC-001",
        impact:"Manufacture is blocked while the specification is unreleased.",
        because:[
          `Specification ${s.id} holds state "approved".`,
          `Rule SPC-001 refuses manufacture against a specification that is not released.`,
          `The state graph permits "release" from "approved".`,
        ]});
    if (s.state === "released")
      recommendations.push({ id:`rec-spec-${s.id}`, severity:"advisory",
        message:`Production may begin against ${s.id}.`, subject:s.id,
        action:"Authorise production", rule:"SPC-001",
        impact:"Missions depending on this specification are unlocked.",
        because:[
          `Specification ${s.id} has entered "released" state.`,
          `Engineering constraints satisfied — ENG-001 and ENG-003 passed at approval.`,
          `Rule SPC-001 is satisfied: the specification is released.`,
          `Missions depending on ${s.id} are unlocked for production.`,
        ]});
  }
  for (const c of Object.values(components)) {
    if (c.state === "rework")
      recommendations.push({ id:`rec-comp-${c.id}`, severity:"warning",
        message:`${c.id} failed inspection and is in rework. Re-submit once corrected.`, subject:c.id,
        action:"Complete rework and re-inspect", rule:"ASM-001",
        impact:"The component cannot enter assembly and does not count toward the mission.",
        because:[
          `Component ${c.id} holds state "rework" after a failed inspection.`,
          `The state graph allows only "submitForInspection" or "scrap" from here.`,
          `Rule ASM-001 refuses assembly until inspection passes.`,
        ]});
    if (c.state === "blocked")
      recommendations.push({ id:`rec-comp-${c.id}`, severity:"critical",
        message:`${c.id} is blocked and cannot proceed.`, subject:c.id,
        action:"Clear the block or scrap", rule:"MCH-002",
        impact:"Mission progress excludes blocked components.",
        because:[
          `Component ${c.id} holds state "blocked".`,
          `Only "resume" or "scrap" are permitted from this state.`,
          `Mission progress excludes blocked components.`,
        ]});
    if (c.state === "assembly")
      recommendations.push({ id:`rec-comp-${c.id}`, severity:"advisory",
        message:`${c.id} passed inspection and is cleared for assembly.`, subject:c.id,
        action:"Proceed to assembly", rule:"ASM-001",
        impact:"Counts toward mission progress.",
        because:[
          `Component ${c.id} holds state "assembly".`,
          `Rule ASM-001 is satisfied: inspection passed.`,
          `It now counts toward mission progress.`,
        ]});
  }
  for (const a of anomalies) {
    recommendations.push({ id:`rec-anom-${a.id}-${a.at}`, severity:"critical",
      message:`Impossible transition recorded: ${a.message}. This indicates data corruption, not a delay.`,
      subject:a.id, action:"Investigate data corruption",
      impact:"The claim was refused; state was not advanced.",
      because:[
        `An event claimed "${a.attempted}" while ${a.id} held "${a.held}".`,
        `The ${a.objectClass} state graph does not permit that transition.`,
        `State was NOT advanced. The event is recorded; the claim is refused.`,
      ]});
  }
  // NEXT is derived: taken from the consequence that explains the recommendation,
  // never authored in a room.
  for (const r of recommendations) {
    const hit = consequences.find((c) => c.subject === r.subject && c.next);
    if (hit) r.next = hit.next;
  }
  recommendations.sort((x, y) => (SEVERITY_RANK[y.severity] ?? 0) - (SEVERITY_RANK[x.severity] ?? 0));
  // Returned frozen: rooms READ manufacturing state, they never hold it.
  return deepFreeze({
    specifications, components, missions: missionRows, recommendations, anomalies,
    consequences: consequences.slice(-50).reverse(),   // bounded, newest first
    feed: feed.reverse(), counts: { produced, passed, failed },
  });
}

export default { project, feedTitle };
