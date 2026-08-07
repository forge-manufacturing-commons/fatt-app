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
  ok("mission moves itself into production", p.missions[0].state === "production");
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

console.log(`\n${pass}/${pass + fail} assertions passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
