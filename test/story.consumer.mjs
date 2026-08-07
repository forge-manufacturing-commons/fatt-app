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
ok("no anomalies — the story is a legal sequence", v.anomalies.length === 0,
   JSON.stringify(v.anomalies));
ok("the feed carries every step", v.feed.length >= 13);
ok("recommendations were produced by the outcome", v.recommendations.length > 0);
ok("a recommendation explains itself",
   v.recommendations.every((r) => !r.because || Array.isArray(r.because)));

console.log(`\n${pass}/${pass+fail} assertions passed${fail?` — ${fail} FAILED`:""}\n`);
process.exit(fail?1:0);
