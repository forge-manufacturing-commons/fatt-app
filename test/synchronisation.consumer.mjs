// ============================================================
// FORGE OS — operating system synchronisation
// Run: node test/synchronisation.consumer.mjs
//
// One event. Every projection consumer reacts. No duplicate state.
//
// This is the architectural claim of ForgeOS stated as a test: because every
// room folds the SAME log through the SAME projection, a decision taken in
// one room is visible in all of them without shared component state, without
// a refresh, and without any room being told about it.
//
// It also proves the read-only guarantee: manufacturing state cannot be
// mutated by a consumer, only by an event.
// ============================================================
import { project } from "../src/os/projections.js";
import Events, { EVENT_TYPES, INSPECTION_RESULT } from "../src/os/events.js";
import { MISSIONS } from "../src/os/missions.js";

let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log(`  ok   ${n}`); }
  else { fail++; console.log(`  FAIL ${n}`); if (d) console.log(`       ${d}`); } };

// The bus keeps the log newest-first.
const bus = { log: [] };
const publish = (e) => { bus.log = [{ ...e, at: e.at ?? Date.now() }, ...bus.log]; return bus.log[0]; };

// Each "room" is nothing but a reader of the same fold. That is the point:
// no room holds manufacturing state, so none of them can disagree.
const engineeringBay  = () => project(bus.log, MISSIONS);
const nationalGrid    = () => project(bus.log, MISSIONS);
const operationsCentre = () => project(bus.log, MISSIONS);

console.log("\nFORGE OS — operating system synchronisation\n");

// ---------- one event, three rooms ----------
publish(Events.engineering({ specification: "FTT-CR-001",
  type: EVENT_TYPES.ENGINEERING.SPEC_DRAFTED, transition: "submitForReview", person: "Ngozi" }));

const beforeE = engineeringBay(), beforeG = nationalGrid(), beforeO = operationsCentre();
ok("three rooms agree before the decision",
   beforeE.specifications["FTT-CR-001"].state === beforeG.specifications["FTT-CR-001"].state &&
   beforeG.specifications["FTT-CR-001"].state === beforeO.specifications["FTT-CR-001"].state);
ok("the specification is awaiting review", beforeE.specifications["FTT-CR-001"].state === "review");
const gridReleasedBefore = Object.values(beforeG.specifications).filter((s) => s.state === "released").length;

// THE DECISION — taken in one room only.
publish(Events.engineering({ specification: "FTT-CR-001",
  type: EVENT_TYPES.ENGINEERING.SPEC_APPROVED, transition: "approve", person: "Folake" }));
publish(Events.engineering({ specification: "FTT-CR-001",
  type: EVENT_TYPES.ENGINEERING.SPEC_RELEASED, transition: "release", person: "Folake" }));

const afterE = engineeringBay(), afterG = nationalGrid(), afterO = operationsCentre();

ok("Engineering Bay sees the release", afterE.specifications["FTT-CR-001"].state === "released");
ok("the Grid sees it WITHOUT being told", afterG.specifications["FTT-CR-001"].state === "released");
ok("the Operations Centre sees it too", afterO.specifications["FTT-CR-001"].state === "released");
ok("the Grid's released-spec statistic changed",
   Object.values(afterG.specifications).filter((s) => s.state === "released").length === gridReleasedBefore + 1);
ok("recommendations changed across the OS",
   JSON.stringify(beforeO.recommendations) !== JSON.stringify(afterO.recommendations));
ok("the shared operations feed grew for every room",
   afterE.feed.length === afterG.feed.length && afterG.feed.length > beforeG.feed.length);
ok("no room disagrees with another",
   JSON.stringify(afterE.specifications) === JSON.stringify(afterG.specifications));

// ---------- production ripples to mission progress ----------
const missionBefore = afterG.missions.find((m) => m.id === "FORGE-ALPHA").progress;
publish(Events.production({ component: "COMP-001", specification: "FTT-CR-001",
  machine: "mill-03", person: "Adaeze" }));
publish(Events.inspection({ component: "COMP-001", specification: "FTT-CR-001",
  result: INSPECTION_RESULT.PASS, person: "Amina" }));
const rippled = nationalGrid();
const missionAfter = rippled.missions.find((m) => m.id === "FORGE-ALPHA").progress;
ok("mission progress recalculated from production", missionAfter > missionBefore,
   `${missionBefore}% -> ${missionAfter}%`);
ok("the component reached assembly", rippled.components["COMP-001"].state === "assembly");
ok("production unlocked an assembly recommendation",
   rippled.recommendations.some((r) => /cleared for assembly/.test(r.message)));
ok("one decision is observable in five places",
   [rippled.specifications["FTT-CR-001"].state === "released",
    rippled.components["COMP-001"].state === "assembly",
    missionAfter > missionBefore,
    rippled.feed.length >= 5,
    rippled.recommendations.length > 0].every(Boolean));

// ---------- the read-only guarantee ----------
{
  const v = nationalGrid();
  ok("the projection is frozen", Object.isFrozen(v));
  ok("missions are frozen", Object.isFrozen(v.missions));
  ok("a component cannot be mutated by a room", Object.isFrozen(v.components["COMP-001"]));
  let threw = false;
  try { v.components["COMP-001"].state = "installed"; } catch { threw = true; }
  ok("mutating manufacturing state throws, it does not silently succeed",
     threw || v.components["COMP-001"].state === "assembly");
  let threwM = false;
  try { v.missions[0].progress = 99; } catch { threwM = true; }
  ok("mission progress cannot be overwritten by a consumer",
     threwM || nationalGrid().missions[0].progress === missionAfter);
}

console.log(`\n${pass}/${pass + fail} assertions passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
