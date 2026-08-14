// ============================================================
// FORGE OS — projections harness
// Proves the ripple: one published event changes what every room derives.
// Run: node test/projections.consumer.mjs
// ============================================================
import { project, feedTitle } from "../src/os/projections.js";
import Events, { EVENT_TYPES, INSPECTION_RESULT, MISSION_POLICY } from "../src/os/events.js";
import { CAPABILITIES } from "../src/os/Roles.js";
import NETWORK from "../src/os/network.js";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log(`  ok   ${n}`); } else { fail++; console.log(`  FAIL ${n}`); } };

// newest-first, exactly how the Activity Engine keeps the log
const asLog = (events) => [...events].reverse();
const MISSIONS = [{ id: "FORGE-ALPHA", title: "50 chassis rails", target: 50, specification: "FTT-CR-001" }];

console.log("\nFORGE OS — projections (the connected kernel)\n");

// --- specification lifecycle folds from events, not local state ---
{
  const evts = [
    Events.engineering({ specification: "FTT-CR-001", type: EVENT_TYPES.ENGINEERING.SPEC_DRAFTED,
      transition: "submitForReview", person: "Ngozi" }),
    Events.engineering({ specification: "FTT-CR-001", type: EVENT_TYPES.ENGINEERING.SPEC_APPROVED,
      transition: "approve", person: "Folake" }),
  ];
  const p = project(asLog(evts), MISSIONS);
  ok("specification state is derived from the log", p.specifications["FTT-CR-001"].state === "approved");
  ok("transition history is retained", p.specifications["FTT-CR-001"].history.length === 2);
  ok("history records who acted", p.specifications["FTT-CR-001"].history[1].by === "Folake");

  const released = project(asLog([...evts,
    Events.engineering({ specification: "FTT-CR-001", type: EVENT_TYPES.ENGINEERING.SPEC_RELEASED,
      transition: "release", person: "Folake" })]), MISSIONS);
  ok("one more event moves it to released", released.specifications["FTT-CR-001"].state === "released");
  ok("released produces a production recommendation",
     released.recommendations.some((r) => /Production may begin/.test(r.message)));
  ok("the recommendation explains WHY it was made",
     released.recommendations.filter((r) => /Production may begin/.test(r.message))
       .every((r) => Array.isArray(r.because) && r.because.length >= 3));
  ok("the reasoning cites the rule that was satisfied",
     released.recommendations.some((r) => (r.because || []).some((b) => /SPC-001/.test(b))));
  // Recommendation authority: an operating system issues instructions.
  const prod = released.recommendations.find((r) => /Production may begin/.test(r.message));
  ok("the recommendation carries an imperative action", prod.action === "Authorise production");
  ok("the recommendation cites its rule", prod.rule === "SPC-001");
  ok("the recommendation states its impact", typeof prod.impact === "string" && prod.impact.length > 10);
}

// --- THE RIPPLE: approving changes what another room would render ---
{
  const before = project(asLog([
    Events.engineering({ specification: "FTT-CR-001", type: EVENT_TYPES.ENGINEERING.SPEC_DRAFTED,
      transition: "submitForReview", person: "Ngozi" })]), MISSIONS);
  const after = project(asLog([
    Events.engineering({ specification: "FTT-CR-001", type: EVENT_TYPES.ENGINEERING.SPEC_DRAFTED,
      transition: "submitForReview", person: "Ngozi" }),
    Events.engineering({ specification: "FTT-CR-001", type: EVENT_TYPES.ENGINEERING.SPEC_APPROVED,
      transition: "approve", person: "Folake" })]), MISSIONS);
  ok("recommendation before approval asks for a reviewer",
     before.recommendations.some((r) => /Assign a level 3 engineer/.test(r.message)));
  ok("recommendation after approval asks for release",
     after.recommendations.some((r) => /not released/.test(r.message)));
  ok("the two rooms would render different pictures from the same fold",
     before.recommendations[0].message !== after.recommendations[0].message);
}

// --- component lifecycle + mission progress ---
{
  const evts = [
    Events.production({ component: "COMP-001", specification: "FTT-CR-001", machine: "mill-03", person: "Adaeze" }),
    Events.inspection({ component: "COMP-001", specification: "FTT-CR-001",
      result: INSPECTION_RESULT.PASS, person: "Amina" }),
  ];
  const p = project(asLog(evts), MISSIONS);
  ok("a produced then passed component reaches assembly", p.components["COMP-001"].state === "assembly");
  ok("the intermediate submit step is folded, not rejected",
     p.components["COMP-001"].history.some((h) => h.transition === "submitForInspection"));
  ok("mission progress is COUNTED from components", p.missions[0].accepted === 1);
  ok("progress is a percentage of target", p.missions[0].progress === 2);
  // REPLACES "mission moves itself into production".
  //
  // That assertion encoded the defect. Production is a LIFECYCLE state and the
  // nine-state graph is the only thing entitled to grant it; a component
  // reaching assembly is PROGRESS. The old projection promoted the mission on
  // the strength of a metric, so mission state could never be wrong and
  // therefore said nothing. Progress moving while lifecycle holds is now the
  // correct, asserted behaviour.
  ok("progress does NOT manufacture lifecycle state",
     p.missions[0].state === "planning");
  ok("cleared-for-assembly recommendation appears",
     p.recommendations.some((r) => /cleared for assembly/.test(r.message)));
}

// --- failure path ---
{
  const p = project(asLog([
    Events.production({ component: "COMP-002", specification: "FTT-CR-001", person: "Adaeze" }),
    Events.inspection({ component: "COMP-002", result: INSPECTION_RESULT.FAIL, person: "Amina" }),
  ]), MISSIONS);
  ok("a failed component goes to rework", p.components["COMP-002"].state === "rework");
  ok("rework does not count toward mission progress", p.missions[0].accepted === 0);
  ok("rework raises a warning", p.recommendations.some((r) => r.severity === "warning" && /rework/.test(r.message)));
}

// --- corruption detection ---
{
  const p = project(asLog([
    Events.engineering({ specification: "S9", type: EVENT_TYPES.ENGINEERING.SPEC_RELEASED,
      transition: "release", person: "X" }),   // release from draft is impossible
  ]), MISSIONS);
  ok("an impossible transition is recorded as an anomaly", p.anomalies.length === 1);
  ok("the anomaly names what was held and attempted",
     p.anomalies[0].held === "draft" && p.anomalies[0].attempted === "release");
  ok("state is NOT silently advanced", p.specifications["S9"].state === "draft");
  ok("corruption is raised as critical, not as a delay",
     p.recommendations.some((r) => r.severity === "critical" && /corruption/.test(r.message)));
}

// --- operations feed: human-readable, event type secondary ---
{
  const p = project(asLog([
    Events.inspection({ component: "COMP-001", result: INSPECTION_RESULT.PASS, person: "Utibe Okafor", hub: "lagos" }),
  ]), MISSIONS);
  const f = p.feed[0];
  ok("feed leads with the act, not the type", f.title === "Inspection passed");
  ok("feed names the subject", f.subject === "COMP-001");
  ok("feed names the actor", f.actor === "Utibe Okafor");
  ok("feed keeps the type as metadata", f.type === "inspection.passed");
  ok("legacy vocabulary is still readable", feedTitle("quality.verified") === "Quality verified");
  ok("an unmapped type degrades to something readable", feedTitle("foo.bar.baz") === "Baz");
}

// --- newest-first ordering preserved for display ---
{
  const p = project(asLog([
    Events.production({ component: "A", person: "p" }),
    Events.production({ component: "B", person: "p" }),
  ]), MISSIONS);
  ok("feed is returned newest first", p.feed[0].subject === "B");
}

// ============================================================
// MISSION LIFECYCLE — transitioned, never inferred
//
// These assert the SEMANTICS (transition, history, anomaly, isolation), not
// merely a final state string. The rule under test throughout: lifecycle comes
// from the nine-state graph in src/domains/mission/state.js; `accepted` and
// `progress` are metrics and may never grant a state.
// ============================================================
{
  const M = [{ id: "M-1", title: "Mission one", target: 10, specification: "SPEC-1" },
             { id: "M-2", title: "Mission two", target: 10, specification: "SPEC-2" }];
  const row = (p, id) => p.missions.find((m) => m.id === id);
  const missionAnoms = (p, id) => p.anomalies.filter((a) => a.objectClass === "mission" && a.id === id);

  // A — created is an appearance, not a movement
  {
    const p = project(asLog([Events.mission({ mission: "M-1", person: "Director" })]), M);
    ok("A. mission.created holds the initial state", row(p, "M-1").state === "planning");
    ok("A. mission.created writes no transition history", row(p, "M-1").history.length === 0);
    ok("A. mission.created raises no anomaly", missionAnoms(p, "M-1").length === 0);
  }

  // B — authorise: planning -> engineering, and the history records the edge
  {
    const p = project(asLog([
      Events.mission({ mission: "M-1", person: "Director" }),
      Events.mission({ mission: "M-1", type: EVENT_TYPES.MISSION.AUTHORISED, person: "Director" }),
    ]), M);
    const r = row(p, "M-1");
    ok("B. mission.authorised drives planning -> engineering", r.state === "engineering");
    ok("B. the transition is recorded, not just the result",
       r.history.length === 1 && r.history[0].transition === "authorise" &&
       r.history[0].from === "planning" && r.history[0].to === "engineering");
    ok("B. history carries the actor", r.history[0].by === "Director");
  }

  // C — specification released: engineering -> procurement
  {
    const p = project(asLog([
      Events.mission({ mission: "M-1", type: EVENT_TYPES.MISSION.AUTHORISED, person: "D" }),
      Events.engineering({ mission: "M-1", specification: "SPEC-1",
        type: EVENT_TYPES.ENGINEERING.SPEC_RELEASED, person: "Ngozi" }),
    ]), M);
    const r = row(p, "M-1");
    ok("C. specification.released drives engineering -> procurement", r.state === "procurement");
    ok("C. both edges are in history",
       r.history.map((h) => h.transition).join(",") === "authorise,completePackage");
  }

  // D — program finished: legal only from `production`, which is currently
  // unreachable (no canonical event means materialsReady). So the honest
  // outcome is an ANOMALY that names the gap, not a silent jump.
  {
    const p = project(asLog([
      Events.mission({ mission: "M-1", type: EVENT_TYPES.MISSION.AUTHORISED, person: "D" }),
      Events.engineering({ mission: "M-1", specification: "SPEC-1",
        type: EVENT_TYPES.ENGINEERING.SPEC_RELEASED, person: "N" }),
      Events.production({ mission: "M-1", program: "PRG-1", component: "C1",
        type: EVENT_TYPES.PRODUCTION.PROGRAM_FINISHED, person: "A" }),
    ]), M);
    const r = row(p, "M-1");
    ok("D. program.finished cannot skip procurement -> production", r.state === "procurement");
    ok("D. the impossible sequence is reported as an anomaly",
       missionAnoms(p, "M-1").some((a) => a.attempted === "productionComplete" && a.held === "procurement"));
  }

  // E — inspection.passed is deliberately unmapped (per-component scope)
  {
    const p = project(asLog([
      Events.mission({ mission: "M-1", type: EVENT_TYPES.MISSION.AUTHORISED, person: "D" }),
      Events.inspection({ mission: "M-1", component: "C1",
        result: INSPECTION_RESULT.PASS, person: "Amina" }),
    ]), M);
    ok("E. one component passing does not carry the mission to delivery",
       row(p, "M-1").state === "engineering");
    ok("E. an unmapped event raises no anomaly either", missionAnoms(p, "M-1").length === 0);
  }

  // F — mission.closed is deliberately unmapped: the only edge into `closed`
  // is `delivered`, and no canonical event means that.
  {
    const p = project(asLog([
      Events.mission({ mission: "M-1", type: EVENT_TYPES.MISSION.CLOSED, person: "D" }),
    ]), M);
    ok("F. mission.closed does not close a mission that was never delivered",
       row(p, "M-1").state === "planning");
  }

  // G — illegal transition yields an anomaly and preserves state
  {
    const p = project(asLog([
      Events.mission({ mission: "M-1", type: EVENT_TYPES.MISSION.AUTHORISED, person: "D" }),
      Events.mission({ mission: "M-1", type: EVENT_TYPES.MISSION.AUTHORISED, person: "D" }),
    ]), M);
    const r = row(p, "M-1");
    ok("G. authorising twice does not double-advance", r.state === "engineering");
    ok("G. the second attempt is an anomaly",
       missionAnoms(p, "M-1").some((a) => a.attempted === "authorise" && a.held === "engineering"));
    ok("G. the anomaly names the object class", missionAnoms(p, "M-1")[0].objectClass === "mission");
    ok("G. state is preserved, not silently promoted", r.history.length === 1);
  }

  // I — progress and lifecycle are independent, in both directions
  {
    const p = project(asLog([
      Events.production({ component: "C1", specification: "SPEC-1", person: "A" }),
      Events.inspection({ component: "C1", specification: "SPEC-1", result: INSPECTION_RESULT.PASS, person: "B" }),
    ]), M);
    const r = row(p, "M-1");
    ok("I. progress advances without any lifecycle event", r.accepted === 1 && r.progress === 10);
    ok("I. lifecycle does not follow progress", r.state === "planning");
  }
  {
    const p = project(asLog([
      Events.mission({ mission: "M-1", type: EVENT_TYPES.MISSION.AUTHORISED, person: "D" }),
    ]), M);
    ok("I. lifecycle advances without any progress",
       row(p, "M-1").state === "engineering" && row(p, "M-1").accepted === 0);
  }

  // J — isolation
  {
    const p = project(asLog([
      Events.mission({ mission: "M-1", type: EVENT_TYPES.MISSION.AUTHORISED, person: "D" }),
    ]), M);
    ok("J. an event for one mission leaves the other untouched",
       row(p, "M-2").state === "planning" && row(p, "M-2").history.length === 0);
  }

  // ---------- ADVERSARIAL ----------
  // Each case is an attempt to make the projection manufacture lifecycle state.
  {
    const target1 = [{ id: "M-1", title: "one", target: 1, specification: "SPEC-1" }];
    const full = project(asLog([
      Events.production({ component: "C1", specification: "SPEC-1", person: "A" }),
      Events.inspection({ component: "C1", specification: "SPEC-1", result: INSPECTION_RESULT.PASS, person: "B" }),
    ]), target1);
    ok("adversarial: progress 100% still does not grant a lifecycle state",
       row(full, "M-1").progress === 100 && row(full, "M-1").state === "planning");

    const noId = project(asLog([
      Events.engineering({ specification: "SPEC-1", type: EVENT_TYPES.ENGINEERING.SPEC_RELEASED, person: "N" }),
    ]), M);
    ok("adversarial: an event with no mission identifier moves nothing",
       row(noId, "M-1").state === "planning" && row(noId, "M-1").history.length === 0);

    const otherMission = project(asLog([
      Events.mission({ mission: "M-9", type: EVENT_TYPES.MISSION.AUTHORISED, person: "D" }),
    ]), M);
    ok("adversarial: an undeclared mission's event does not leak into a declared one",
       row(otherMission, "M-1").state === "planning");

    const fixtureCid = project(asLog([
      Events.engineering({ specification: "SPEC-1", correlationId: "mission-M-1",
        type: EVENT_TYPES.ENGINEERING.SPEC_RELEASED, person: "N" }),
    ]), M);
    ok("adversarial: a correlationId convention is NOT treated as mission association",
       row(fixtureCid, "M-1").state === "planning");

    const zero = project(asLog([Events.mission({ mission: "M-1", person: "D" })]), M);
    ok("adversarial: a mission with zero progress reports zero, not a guess",
       row(zero, "M-1").accepted === 0 && row(zero, "M-1").progress === 0);

    ok("adversarial: mission rows remain deep-frozen", Object.isFrozen(zero.missions));
  }
}

// ============================================================
// MISSION MEMBERSHIP (E3 Phase 8)
//
// Mission identity now survives into the folded component, and `accepted` uses
// it as the authoritative correlation. Specification matching remains only as a
// fallback for components whose events never named a mission — it must never
// override an explicit one. Every case below is a Phase 7 failure turned into a
// regression test.
// ============================================================
{
  const ALPHA = { id: "FORGE-ALPHA",  title: "chassis rails", target: 50, specification: "FTT-CR-001", state: "planning" };
  const REPEAT = { id: "FORGE-REPEAT", title: "repeat batch",  target: 10, specification: "FTT-CR-001", state: "planning" };
  const acc = (p, id) => p.missions.find((m) => m.id === id).accepted;
  // produce + pass a component; `mission` is passed through untouched when given
  const made = (component, specification, mission) => [
    Events.production({ component, specification, ...(mission ? { mission } : {}), person: "Adaeze" }),
    Events.inspection({ component, specification, ...(mission ? { mission } : {}),
      result: INSPECTION_RESULT.PASS, person: "Amina" }),
  ];

  // ---- identity reaches the folded component ----
  {
    const p = project(asLog(made("C1", "FTT-CR-001", "FORGE-ALPHA")), [ALPHA]);
    ok("component retains the mission its event named",
       p.components["C1"].mission === "FORGE-ALPHA");
    ok("an uncorrelated component carries mission null, not a guess",
       project(asLog(made("C9", "FTT-CR-001")), [ALPHA]).components["C9"].mission === null);
  }

  // ---- CASE 1 — shared specification: explicit mission wins ----
  {
    const p = project(asLog(made("C1", "FTT-CR-001", "FORGE-ALPHA")), [ALPHA, REPEAT]);
    ok("CASE 1. shared specification: FORGE-ALPHA is credited",  acc(p, "FORGE-ALPHA") === 1);
    ok("CASE 1. shared specification: FORGE-REPEAT is NOT credited", acc(p, "FORGE-REPEAT") === 0);
  }

  // ---- CASE 2 — one mission, two specifications ----
  {
    const p = project(asLog([
      ...made("C1", "FTT-CR-001", "FORGE-ALPHA"),
      ...made("B1", "FTT-BR-007", "FORGE-ALPHA"),
    ]), [ALPHA]);
    ok("CASE 2. a mission aggregates across specifications", acc(p, "FORGE-ALPHA") === 2);
  }

  // ---- CASE 3 — legacy uncorrelated component keeps the fallback ----
  {
    const p = project(asLog(made("C1", "FTT-CR-001")), [ALPHA]);
    ok("CASE 3. no mission on the event: specification fallback still attributes it",
       acc(p, "FORGE-ALPHA") === 1);
  }

  // ---- CASE 4 — explicit mission overrides a foreign specification ----
  {
    const OTHER = { ...REPEAT, specification: "FTT-XX-999" };
    const p = project(asLog(made("C1", "FTT-XX-999", "FORGE-ALPHA")), [ALPHA, OTHER]);
    ok("CASE 4. explicit mission beats a matching foreign specification",
       acc(p, "FORGE-ALPHA") === 1);
    ok("CASE 4. the specification's own mission is NOT credited",
       acc(p, "FORGE-REPEAT") === 0);
  }

  // ---- CASE 5 — explicit mission with an unrelated specification ----
  {
    const p = project(asLog(made("C1", "FTT-ZZ-000", "FORGE-ALPHA")), [ALPHA]);
    ok("CASE 5. membership is the event's to declare, not the drawing's",
       acc(p, "FORGE-ALPHA") === 1);
  }

  // ---- ADVERSARIAL ----
  {
    // B — specification-only counting would fail CASE 1; prove the old rule is gone
    const oldRule = (p, m) => Object.values(p.components)
      .filter((c) => !m.specification || c.specification === m.specification)
      .filter((c) => ["assembly", "completed", "installed"].includes(c.state)).length;
    const p1 = project(asLog(made("C1", "FTT-CR-001", "FORGE-ALPHA")), [ALPHA, REPEAT]);
    ok("adversarial B. the retired specification-only rule WOULD have miscounted",
       oldRule(p1, REPEAT) === 1 && acc(p1, "FORGE-REPEAT") === 0);

    // C — cross-contamination is impossible for correlated components
    const p2 = project(asLog([
      ...made("C1", "FTT-CR-001", "FORGE-ALPHA"),
      ...made("C2", "FTT-CR-001", "FORGE-REPEAT"),
    ]), [ALPHA, REPEAT]);
    ok("adversarial C. two missions on one specification each keep their own work",
       acc(p2, "FORGE-ALPHA") === 1 && acc(p2, "FORGE-REPEAT") === 1);

    // D + mixed data — correlated and uncorrelated components coexist
    const p3 = project(asLog([
      ...made("C1", "FTT-CR-001", "FORGE-ALPHA"),
      ...made("C2", "FTT-CR-001"),
    ]), [ALPHA, REPEAT]);
    ok("adversarial D. an uncorrelated component still falls back to specification",
       acc(p3, "FORGE-ALPHA") === 2 && acc(p3, "FORGE-REPEAT") === 1);

    // membership is not reassignable by a later event
    const reassign = project(asLog([
      ...made("C1", "FTT-CR-001", "FORGE-ALPHA"),
      Events.production({ component: "C1", specification: "FTT-CR-001",
        mission: "FORGE-REPEAT", person: "x" }),
    ]), [ALPHA, REPEAT]);
    ok("adversarial. a later event cannot reassign a component's mission",
       reassign.components["C1"].mission === "FORGE-ALPHA");

    // F/G — lifecycle and anomalies untouched by correlation
    ok("adversarial F. lifecycle is still graph-driven, not progress-driven",
       p1.missions.find((m) => m.id === "FORGE-ALPHA").state === "planning");
    ok("adversarial G. correlating progress raises no mission anomaly",
       p1.anomalies.filter((a) => a.objectClass === "mission").length === 0);

    // the component stays read-only
    ok("adversarial. the folded component remains frozen",
       Object.isFrozen(p1.components["C1"]));
  }
}

// ============================================================
// MISSION CLOSURE (E3 final convergence)
//
// `mission.closed` used to vanish: unmapped, so no transition and no anomaly.
// An event that cannot advance the graph is still a fact about the sequence.
//
// The closing edge is resolved FROM the graph, not hardcoded. Today only
// `delivery` can close (via `delivered`), so closure is legal there and refused
// everywhere else — and a refusal is recorded through the existing anomaly
// mechanism. Delivery is never fabricated.
// ============================================================
{
  const MC = (declared) => [{ id: "M-1", title: "m", target: 10, specification: "S-1", state: declared }];
  const closeFrom = (declared, pre = []) => {
    const p = project(asLog([...pre,
      Events.mission({ mission: "M-1", type: EVENT_TYPES.MISSION.CLOSED, person: "Director" })]), MC(declared));
    return { p, m: p.missions[0], anoms: p.anomalies.filter((a) => a.objectClass === "mission") };
  };

  // A — the event can never silently disappear
  for (const st of ["planning", "engineering", "procurement", "production", "inspection", "held"]) {
    const { m, anoms } = closeFrom(st);
    ok(`closure from ${st} is refused and RECORDED`,
       m.state === st && anoms.length === 1 &&
       anoms[0].attempted === "close" && anoms[0].held === st,
       JSON.stringify(anoms));
  }

  // B — the one state the graph authorises
  {
    const { m, anoms } = closeFrom("delivery");
    ok("closure from delivery is LEGAL — the graph's only closing edge",
       m.state === "closed" && anoms.length === 0);
    ok("the legal closure is recorded in history as the graph's own edge",
       m.history.length === 1 && m.history[0].transition === "delivered" &&
       m.history[0].from === "delivery" && m.history[0].to === "closed");
  }

  // anomaly shape must match the existing mission anomalies exactly
  {
    const { anoms } = closeFrom("planning");
    const a = anoms[0];
    ok("closure anomaly keeps the established mission anomaly shape",
       a.objectClass === "mission" && a.id === "M-1" &&
       typeof a.at === "number" && "eventId" in a &&
       /^M-1 cannot "close" from "planning"$/.test(a.message));
  }

  // C + D — closure fabricates neither progress nor delivery
  {
    const pre = [
      Events.production({ component: "C1", specification: "S-1", mission: "M-1", person: "a" }),
      Events.inspection({ component: "C1", specification: "S-1", mission: "M-1",
        result: INSPECTION_RESULT.PASS, person: "b" }),
    ];
    const { p, m } = closeFrom("planning", pre);
    ok("C. closure does not manufacture progress",
       m.accepted === 1 && m.progress === 10);
    ok("C. closure does not alter component state",
       p.components["C1"].state === "assembly");
    ok("D. closure does not fabricate delivery — no state reached delivery",
       m.state === "planning" && !m.history.some((h) => h.to === "delivery"));
  }

  // the three outcomes stay distinguishable
  {
    const legal   = closeFrom("delivery");
    const refused = closeFrom("planning");
    ok("valid transition, invalid transition and no-op remain distinguishable",
       legal.m.state === "closed" && legal.anoms.length === 0 &&
       refused.m.state === "planning" && refused.anoms.length === 1);
  }
}

// ============================================================
// MISSION MEMBERSHIP CONFLICT (E4)
//
// First-writer authority is preserved, but a conflicting claim is now RECORDED
// rather than discarded. `attempted` is the claim, `held` is the authority —
// the same reading as every state-graph anomaly. No new event type.
// ============================================================
{
  const A = { id: "M-A", title: "a", target: 10, specification: "S-1", state: "planning" };
  const B = { id: "M-B", title: "b", target: 10, specification: "S-2", state: "planning" };
  const acc = (p, id) => p.missions.find((m) => m.id === id).accepted;
  const conflicts = (p) => p.anomalies.filter(
    (x) => x.objectClass === "component" && /already belongs to/.test(x.message));
  const made = (c, s, m) => [
    Events.production({ component: c, specification: s, ...(m ? { mission: m } : {}), person: "a" }),
    Events.inspection({ component: c, specification: s, ...(m ? { mission: m } : {}),
      result: INSPECTION_RESULT.PASS, person: "b" }),
  ];

  // A + D — first writer wins and stays authoritative
  {
    const p = project(asLog([...made("C1", "S-1", "M-A"),
      Events.production({ component: "C1", specification: "S-1", mission: "M-B", person: "x" })]), [A, B]);
    ok("A. the first mission wins", p.components["C1"].mission === "M-A");
    ok("D. the original mission remains authoritative after a conflict",
       p.components["C1"].mission === "M-A" && p.components["C1"].state === "assembly");
  }

  // B — the same mission repeated is not a conflict
  {
    const p = project(asLog(made("C1", "S-1", "M-A")), [A]);
    ok("B. repeating the same mission raises nothing", conflicts(p).length === 0);
  }

  // C — a conflicting claim is recorded, in the established shape
  {
    const p = project(asLog([...made("C1", "S-1", "M-A"),
      Events.production({ component: "C1", specification: "S-1", mission: "M-B", person: "x" })]), [A, B]);
    const c = conflicts(p);
    ok("C. a conflicting mission claim produces exactly one anomaly", c.length === 1);
    ok("C. the anomaly names the claim, the authority and the event",
       c[0].attempted === "M-B" && c[0].held === "M-A" &&
       c[0].id === "C1" && c[0].objectClass === "component" && "eventId" in c[0],
       JSON.stringify(c[0]));
  }

  // E — a rejected claim cannot move progress
  {
    const p = project(asLog([...made("C1", "S-1", "M-A"),
      ...made("C1", "S-1", "M-B")]), [A, B]);
    ok("E. a conflicting claim cannot credit the claiming mission",
       acc(p, "M-A") === 1 && acc(p, "M-B") === 0);
  }

  // F — an uncorrelated component still accepts its first mission
  {
    const p = project(asLog([
      Events.production({ component: "C1", specification: "S-1", person: "a" }),
      Events.inspection({ component: "C1", specification: "S-1", mission: "M-A",
        result: INSPECTION_RESULT.PASS, person: "b" }),
    ]), [A]);
    ok("F. an uncorrelated component accepts the first mission that names it",
       p.components["C1"].mission === "M-A" && conflicts(p).length === 0);
  }

  // G — legacy specification fallback survives
  {
    const p = project(asLog(made("C9", "S-1")), [A]);
    ok("G. specification fallback still attributes uncorrelated components",
       p.components["C9"].mission === null && acc(p, "M-A") === 1);
  }
}

// ============================================================
// SAFETY-CRITICAL DEAD PATH (E4)
//
// The guard for a capability the system deliberately does NOT have. Nothing can
// truthfully populate safetyCritical — 0 of 32 events and 0 vocabulary fields
// mention safety — so criticalRequiresLevelThree cannot fire from the fold.
// These assertions exist to stop a future change claiming otherwise by
// inference from the family-level commercial catalogue.
// ============================================================
{
  const p = project(asLog([
    Events.production({ component: "C1", specification: "S-1", person: "a" }),
    Events.inspection({ component: "C1", specification: "S-1",
      result: INSPECTION_RESULT.PASS, person: "b" }),
  ]), []);
  ok("H. the fold does not claim a safety-critical fact it cannot source",
     !("safetyCritical" in p.components["C1"]));
  // Shape guard, updated once in E5 rather than deleted. It fired correctly when
  // `organisation` was added — that is the guard working, not failing. The point
  // it defends is unchanged: the fold carries only fields an event can prove, so
  // `safetyCritical` still has no place here.
  // Fired again in E9.1 when `contributions` was added — the guard working twice.
  // What it defends is still the same: every field must be something an event can
  // prove. `contributions` qualifies (it is folded only from knowledge.* events
  // that name the component); `safetyCritical` still does not.
  // Fired a third time in E9.3 for `directives` — the guard working again.
  // Fired a FOURTH time in Canon P0-2 for `hub`. Same test, same reason to exist:
  // `hub` is admitted because `isEntityField("hub")` is true and every
  // manufacturing event has carried it since V1, so an event CAN prove it. It was
  // never projected, which is precisely the gap P0-2 closed. `safetyCritical`
  // still cannot be proved by any event and therefore still has no place here.
  ok("H. the folded component shape stays exactly what the events can prove",
     Object.keys(p.components["C1"]).sort().join(",") ===
     ["contributions", "directives", "history", "hub", "id", "mission", "organisation",
      "specification", "state"].join(","));
  // COMPANION TO THE WIDENING. The guard above got looser by one field, so this
  // asserts the thing that widening could have broken: these events carry NO hub,
  // so the new field must be null. A fold field that appears populated without an
  // event to source it is the exact failure `safetyCritical` guards against.
  ok("H. and the new `hub` field is null when no event carried a hub",
     p.components["C1"].hub === null);
}

// ============================================================
// MANUFACTURING NETWORK (E5)
//
// Three facts that must never substitute for one another:
//   CAPABILITY      CAN make a class            src/os/network.js (master data)
//   RESPONSIBILITY  IS responsible for an instance  component.organisation (fold)
//   HISTORY         DID it                      the event log
// ============================================================
{
  const N = NETWORK;
  const A = { id: "M-A", title: "a", target: 10, specification: "FTT-CR-001", state: "planning" };
  const conflicts = (p) => p.anomalies.filter(
    (x) => x.objectClass === "component" && /is already the responsibility of/.test(x.message));
  const produce = (component, extra = {}) =>
    Events.production({ component, specification: "FTT-CR-001", person: "a", ...extra });

  // A + B — seed is explicit, and never dressed as verified
  ok("A. every seeded organisation is explicitly marked seed",
     N.SEED_ORGANISATIONS.length === 3 &&
     N.SEED_ORGANISATIONS.every((o) => o.provenance === N.PROVENANCE.SEED));
  ok("B. no seeded organisation claims to be verified",
     N.SEED_ORGANISATIONS.every((o) => o.verification !== "verified"));
  ok("B. an unknown organisation is not treated as real",
     N.isSeedOrganisation("DEMO-ORG-001") === true &&
     N.isSeedOrganisation("SOME-REAL-CO") === false &&
     N.organisationById("SOME-REAL-CO") === null);
  ok("S. no capability carries commercial terms",
     N.SEED_CAPABILITIES.every((c) =>
       !("price" in c) && !("capacity" in c) && !("sla" in c) && !("stake" in c)));

  // C — capability is not permission
  ok("C. manufacturing capability is disjoint from the permission vocabulary",
     Object.values(N.COMPONENT_CLASS).every((cls) => !(cls in CAPABILITIES)) &&
     !Object.keys(CAPABILITIES).some((p) => Object.values(N.COMPONENT_CLASS).includes(p)));

  // D — capability does not create responsibility
  {
    const p = project(asLog([produce("C1")]), [A]);
    ok("D. a capable organisation does not become responsible",
       N.organisationsCapableOf(N.COMPONENT_CLASS.CHASSIS_RAIL).length === 2 &&
       p.components["C1"].organisation === null);
    ok("N. no organisation claim leaves responsibility UNKNOWN",
       p.components["C1"].organisation === null);
  }

  // E — responsibility does not create capability
  {
    const p = project(asLog([produce("C1", { organisation: "DEMO-ORG-003" })]), [A]);
    ok("E. being responsible does not grant a capability record",
       p.components["C1"].organisation === "DEMO-ORG-003" &&
       N.isCapableOfSpecification("DEMO-ORG-003", "FTT-CR-001") === false);
  }

  // F + G — WHERE and commercial owner never become WHO
  {
    const p = project(asLog([produce("C1", { workshop: "Lagos Fabrication Works", hub: "lagos" })]), [A]);
    ok("F. workshop does not become organisation", p.components["C1"].organisation === null);
    const q = project(asLog([produce("C2", { owner_org: "Sheet-metal SME" })]), [A]);
    ok("G. owner_org does not become organisation", q.components["C2"].organisation === null);
  }

  // H + I + J — capability cardinality
  ok("H. one organisation can hold multiple capabilities",
     N.capabilitiesOf("DEMO-ORG-001").length === 3);
  ok("I. two organisations can share a capability",
     N.organisationsCapableOf(N.COMPONENT_CLASS.CHASSIS_RAIL).sort().join(",") ===
     "DEMO-ORG-001,DEMO-ORG-002");
  ok("J. one organisation can operate at multiple hubs",
     N.hubsOf("DEMO-ORG-001").length === 2 && N.hubsOf("DEMO-ORG-003").length === 1);

  // K + L + M — one authority, conflicts recorded
  {
    const p = project(asLog([
      produce("C1", { organisation: "DEMO-ORG-001" }),
      produce("C1", { organisation: "DEMO-ORG-002" }),
    ]), [A]);
    ok("K. a component has exactly one authoritative organisation",
       p.components["C1"].organisation === "DEMO-ORG-001");
    ok("M. the first authoritative organisation is preserved",
       p.components["C1"].organisation === "DEMO-ORG-001");
    const c = conflicts(p);
    ok("L. a conflicting organisation claim is recorded, not discarded",
       c.length === 1 && c[0].attempted === "DEMO-ORG-002" && c[0].held === "DEMO-ORG-001" &&
       c[0].objectClass === "component" && c[0].id === "C1", JSON.stringify(c));
    ok("L. repeating the same organisation is not a conflict",
       conflicts(project(asLog([
         produce("C1", { organisation: "DEMO-ORG-001" }),
         produce("C1", { organisation: "DEMO-ORG-001" }),
       ]), [A])).length === 0);
  }

  // component class taxonomy — mapped, or honestly unknown
  ok("taxonomy maps only the specifications that exist",
     N.classForSpecification("FTT-CR-001") === "chassis-rail" &&
     N.classForSpecification("FTT-PV-002") === "pressure-vessel" &&
     N.classForSpecification("FTT-ZZ-999") === null);
  ok("taxonomy reuses the identifier production/rules.js already expects",
     N.COMPONENT_CLASS.PRESSURE_VESSEL === "pressure-vessel");
  ok("taxonomy did not adopt component_jobs commercial categories",
     !Object.values(N.COMPONENT_CLASS).some((c) =>
       ["chassis", "body", "kitchen", "gas", "electrical", "livery"].includes(c)));

  // O + P + Q — E1–E4 intact alongside the new fact
  {
    const p = project(asLog([
      produce("C1", { mission: "M-A", organisation: "DEMO-ORG-001" }),
      Events.inspection({ component: "C1", specification: "FTT-CR-001", mission: "M-A",
        result: INSPECTION_RESULT.PASS, person: "b" }),
    ]), [A]);
    const m = p.missions[0];
    ok("O. mission correlation is unaffected by responsibility",
       p.components["C1"].mission === "M-A" && m.accepted === 1);
    ok("P. mission lifecycle stays graph-driven, not organisation-driven",
       m.state === "planning" && m.history.length === 0);
    ok("Q. component lifecycle remains authoritative",
       p.components["C1"].state === "assembly");
    ok("R. the fold shape is exactly the authorised set across E5, E9.1, E9.3 and P0-2",
       Object.keys(p.components["C1"]).sort().join(",") ===
       ["contributions", "directives", "history", "hub", "id", "mission", "organisation",
        "specification", "state"].join(","));
    ok("R. and `directives` is empty here — no lifecycle event is a directive",
       p.components["C1"].directives.length === 0);
    ok("R. and `contributions` is empty here — no lifecycle event is a contribution",
       p.components["C1"].contributions.length === 0);
    // COMPANION TO THE P0-2 WIDENING, in the room where the confusion would be
    // most damaging: this component HAS a responsible organisation. Adding `hub`
    // must not have made location and responsibility the same fact.
    ok("R. and `hub` did not become a second copy of `organisation`",
       p.components["C1"].organisation === "DEMO-ORG-001" &&
       p.components["C1"].hub !== "DEMO-ORG-001");
  }

  // T + U + V — nothing frozen moved
  {
    const all = Object.values(EVENT_TYPES).flatMap((d) => Object.values(d));
    // E9.3 authorised exactly ONE new type. The guard is updated to 33 and a
    // companion assertion below protects what it originally defended: that
    // nothing OTHER than the coordination event was slipped in.
    // E9.5 authorised one more: the acknowledgement. The companion assertion
    // still protects what this guard originally defended — that nothing OTHER
    // than the two coordination events was slipped into the vocabulary.
    ok("T. the vocabulary is exactly 34 types", all.length === 34);
    ok("T. and the only additions are the two coordination events",
       all.filter((t) => t !== "production.work.directed" &&
                         t !== "production.work.acknowledged").length === 32);
    // Proved by execution rather than by reading the source: publish both
    // coordination events against a component and assert the lifecycle is untouched.
    {
      const d = Events.production({ component: "CX", type: EVENT_TYPES.PRODUCTION.WORK_DIRECTED,
        directedTo: "ORG-X", directedToClass: "institution", person: "P", human: "P",
        summary: "do it" });
      const a = Events.production({ component: "CX", type: EVENT_TYPES.PRODUCTION.WORK_ACKNOWLEDGED,
        inResponseTo: d.eventId, outcome: "accepted", person: "Q", human: "Q", summary: "ok" });
      const cx = project(asLog([d, a]), MISSIONS).components["CX"];
      ok("T. neither coordination event drives a component transition",
         cx.state === "planned" && cx.history.length === 0);
      ok("T. nor confers responsibility, nor creates participation",
         cx.organisation === null && cx.contributions.length === 0);
      ok("T. the directive is recorded and resolved instead",
         cx.directives.length === 1 && cx.directives[0].outcome === "accepted");
    }
    ok("T. no organisation/capability/responsibility event exists",
       all.filter((t) => /organisation|capabilit|responsib|workorder/i.test(t)).length === 0);
    ok("U. every canonical event still carries a mission policy",
       all.every((t) => t in MISSION_POLICY));
  }
}

console.log(`\n${pass}/${pass + fail} assertions passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
