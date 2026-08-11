// ============================================================
// FORGE OS — projections harness
// Proves the ripple: one published event changes what every room derives.
// Run: node test/projections.consumer.mjs
// ============================================================
import { project, feedTitle } from "../src/os/projections.js";
import Events, { EVENT_TYPES, INSPECTION_RESULT } from "../src/os/events.js";

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

console.log(`\n${pass}/${pass + fail} assertions passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
