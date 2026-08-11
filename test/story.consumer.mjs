// ============================================================
// FORGE OS — manufacturing story harness
// Run: node test/story.consumer.mjs
// Proves the story's consequences are DERIVED, not asserted.
// ============================================================
import { MANUFACTURING_STORY, STORY_META } from "../src/os/story.js";
import { project } from "../src/os/projections.js";
import { MISSIONS } from "../src/os/missions.js";
import { validateEvent } from "../src/os/events.js";
import { RIPPLE_TRIGGERS } from "../src/os/ripple/triggers.js";

let pass=0, fail=0;
const ok=(n,c,d)=>{ if(c){pass++;console.log(`  ok   ${n}`);} else {fail++;console.log(`  FAIL ${n}`); if(d)console.log(`       ${d}`);} };

console.log("\nFORGE OS — one manufacturing story\n");

ok(`the story has ${STORY_META.steps} steps`, MANUFACTURING_STORY.length === 13);
const bad = MANUFACTURING_STORY.filter((s) => !validateEvent(s.event).valid);
ok("every event in the story is schema-valid", bad.length === 0,
   bad.map((b) => b.title + ": " + validateEvent(b.event).issues.map(i=>i.message).join("; ")).join(" | "));
ok("every step carries a title and description",
   MANUFACTURING_STORY.every((s) => s.title && s.description));
ok("one correlationId threads the entire story",
   new Set(MANUFACTURING_STORY.map((s) => s.event.correlationId)).size === 1);

// no derived quantity is ever published
const types = MANUFACTURING_STORY.map((s) => s.event.type);
ok("no mission.progress event is published (progress is derived)",
   !types.includes("mission.progress"));
ok("no grid.updated event is published (the grid derives)",
   !types.includes("grid.updated"));
ok("every type has a ripple trigger or is deliberately quiet",
   types.every((t) => RIPPLE_TRIGGERS[t] || t.startsWith("production.stage")));

// play it and check the derived outcome
const log = [];
for (const s of MANUFACTURING_STORY) log.unshift({ ...s.event });
const v = project(log, MISSIONS);

ok("the specification ends released", v.specifications["FTT-CR-001"].state === "released",
   v.specifications["FTT-CR-001"].state);
ok("the specification was rejected then re-approved (history proves the detour)",
   v.specifications["FTT-CR-001"].history.some((h) => h.transition === "reject"));
ok("the component ends accepted for assembly", v.components["COMP-CR-0001"].state === "assembly",
   v.components["COMP-CR-0001"].state);
ok("the failed inspection is in the component's history",
   v.components["COMP-CR-0001"].history.some((h) => h.to === "rework"));
ok("mission progress was COUNTED, not published",
   v.missions.find((m) => m.id === "FORGE-ALPHA").accepted === 1);
// REPLACES a blanket `anomalies.length === 0`.
//
// That assertion was true only while mission identity was being dropped. Now
// that the story preserves it, the mission graph can finally judge the sequence
// — and it correctly refuses `completePackage` from `planning`, because the
// story never authorises the mission. Silencing that would be reintroducing the
// heuristic Phase 3 removed. The guarantee is therefore split rather than
// loosened: the object graphs must still be spotless, and the one mission
// anomaly must be exactly the expected one.
const objectAnoms = v.anomalies.filter((a) => a.objectClass !== "mission");
const missionAnoms = v.anomalies.filter((a) => a.objectClass === "mission");
ok("the specification and component sequence is legal — no object anomalies",
   objectAnoms.length === 0, JSON.stringify(objectAnoms));
ok("exactly one mission anomaly: the story never authorises the mission",
   missionAnoms.length === 1 &&
   missionAnoms[0].id === "FORGE-ALPHA" &&
   missionAnoms[0].attempted === "completePackage" &&
   missionAnoms[0].held === "planning",
   JSON.stringify(missionAnoms));
ok("the feed carries every step", v.feed.length >= 13);
ok("recommendations were produced by the outcome", v.recommendations.length > 0);
ok("a recommendation explains itself",
   v.recommendations.every((r) => !r.because || Array.isArray(r.because)));

// ============================================================
// MISSION CORRELATION CONTRACT (E3 Phase 4)
//
// Identity is preserved, never inferred. These assertions exist so a future
// change cannot quietly either drop the identity again or over-claim it by
// attaching a mission to events that only happen to sit nearby in the script.
// ============================================================
{
  const withMission = MANUFACTURING_STORY.filter((s) => s.event.mission);
  const machineSteps = MANUFACTURING_STORY.filter((s) => s.event.type.startsWith("machine."));

  ok("the story is still 13 steps — correlation added no events",
     MANUFACTURING_STORY.length === 13);
  ok("eleven steps carry explicit mission identity",
     withMission.length === 11, `${withMission.length}`);
  ok("every mission-bearing step names THIS mission",
     withMission.every((s) => s.event.mission === STORY_META.mission));

  // B — identity must not be inferred from a machine
  ok("machine steps remain deliberately uncorrelated",
     machineSteps.length === 2 && machineSteps.every((s) => !s.event.mission));
  // C — identity must not be inferred from a component
  ok("mission is carried explicitly, not derived from the component",
     MANUFACTURING_STORY.every((s) => !s.event.component || s.event.mission === undefined ||
        s.event.mission === STORY_META.mission));
  // F — an absent mission stays absent
  ok("an uncorrelated event carries no mission key at all",
     machineSteps.every((s) => !("mission" in s.event)));

  // The payoff: the causal machinery can now attribute its own impact.
  ok("every consequence is attributable to a mission",
     v.consequences.length > 0 && v.consequences.every((c) => c.affectedMission === STORY_META.mission),
     `${v.consequences.filter((c) => !c.affectedMission).length} unattributed`);
  ok("missionImpact is now attributed, not orphaned",
     v.consequences.filter((c) => c.missionImpact)
      .every((c) => c.affectedMission === STORY_META.mission));

  // Phase 3 must survive Phase 4.
  const alpha = v.missions.find((m) => m.id === "FORGE-ALPHA");
  const hub   = v.missions.find((m) => m.id === "FORGE-HUB");
  ok("lifecycle did NOT advance — no canonical event authorised the mission",
     alpha.state === "planning" && alpha.history.length === 0);
  ok("progress remains independent of lifecycle",
     alpha.accepted === 1 && alpha.progress === 2 && alpha.state === "planning");
  // A + J — isolation
  ok("FORGE-HUB acquired none of FORGE-ALPHA's identity",
     hub.state === "planning" && hub.accepted === 0 && hub.history.length === 0);

  // G — business meaning unchanged
  ok("the story still tells the same thing: a failure then an acceptance",
     MANUFACTURING_STORY.some((s) => s.event.type === "inspection.failed") &&
     MANUFACTURING_STORY.some((s) => s.event.type === "inspection.passed"));
}

console.log(`\n${pass}/${pass+fail} assertions passed${fail?` — ${fail} FAILED`:""}\n`);
process.exit(fail?1:0);
