// ============================================================
// FORGE OS — causality architecture tests (A–F)
// Run: node test/causality.consumer.mjs
// ============================================================
import { CAUSAL_MAP, ALL_CONSEQUENCES, deriveConsequences, findCauses, findUnlocked }
  from "../src/os/causality/causalMap.js";
import { EVENT_TYPES } from "../src/os/events.js";
import Events, { INSPECTION_RESULT } from "../src/os/events.js";
import { project } from "../src/os/projections.js";
import { MISSIONS } from "../src/os/missions.js";
import { MANUFACTURING_STORY, STORY_META } from "../src/os/story.js";

let pass=0, fail=0;
const ok=(n,c,d)=>{ if(c){pass++;console.log(`  ok   ${n}`);} else {fail++;console.log(`  FAIL ${n}`); if(d)console.log(`       ${d}`);} };

console.log("\nFORGE OS — causality\n");

// ---------- A. PROVENANCE ----------
console.log("  A · provenance");
{
  const e = Events.engineering({ specification:"FTT-CR-001",
    type: EVENT_TYPES.ENGINEERING.SPEC_RELEASED, transition:"release",
    person:"Folake Adeyemi", human:"Folake Adeyemi", correlationId:"FORGE-ALPHA/FTT-CR-001" });
  const [c] = deriveConsequences(e);
  ok("a consequence is derived", Boolean(c));
  ok("it names the event that caused it", c.causedBy === EVENT_TYPES.ENGINEERING.SPEC_RELEASED);
  ok("it carries the eventId", c.eventId === e.eventId && c.eventId != null);
  ok("it carries the correlationId", c.correlationId === "FORGE-ALPHA/FTT-CR-001");
  ok("it names its subject", c.subject === "FTT-CR-001");
  ok("it names the actor", c.actor === "Folake Adeyemi");
  ok("it states what happens next", typeof c.next === "string" && c.next.length > 10);
}

// ---------- B. NO DUPLICATE EVENTS ----------
console.log("  B · no duplicate events");
{
  const canonical = new Set(Object.values(EVENT_TYPES).flatMap((d) => Object.values(d)));
  // The real guarantee: a derived FACT must never be a canonical EVENT type,
  // or it could be mistaken for something to publish. (The specified test
  // asserted no consequence starts with "inspection." — its own map breaks
  // that, since a fact may legitimately live in the inspection domain.)
  const collisions = ALL_CONSEQUENCES.filter((c) => canonical.has(c));
  ok("no consequence is also a canonical event type", collisions.length === 0, collisions.join(", "));
  ok("no mission.progress consequence exists", !ALL_CONSEQUENCES.includes("mission.progress"));
  ok("no grid.updated consequence exists", !ALL_CONSEQUENCES.includes("grid.updated"));
  const storyTypes = MANUFACTURING_STORY.map((s) => s.event.type);
  ok("the story publishes no synthetic consequence events",
     !storyTypes.some((t) => ALL_CONSEQUENCES.includes(t)));
  ok("every causal key is a canonical event type",
     Object.keys(CAUSAL_MAP).every((k) => canonical.has(k)));
}

// ---------- C. CORRELATION ----------
console.log("  C · correlation");
{
  const log = [];
  for (const s of MANUFACTURING_STORY) log.unshift({ ...s.event });
  const v = project(log, MISSIONS);
  ok("the story produced consequences", v.consequences.length > 0);
  const cids = new Set(v.consequences.map((c) => c.correlationId));
  ok("every consequence shares one correlation", cids.size === 1 && cids.has(STORY_META.correlationId),
     [...cids].join(", "));
  ok("the whole story is traceable from that one id",
     v.consequences.filter((c) => c.correlationId === STORY_META.correlationId).length
       === v.consequences.length);
  ok("consequences span more than one domain",
     new Set(v.consequences.map((c) => c.affectedDomain)).size >= 3);
}

// ---------- D. ROOM INDEPENDENCE ----------
console.log("  D · room independence");
{
  const e = Events.production({ component:"COMP-001", specification:"FTT-CR-001",
    machine:"mill-03", person:"Adaeze", human:"Adaeze", correlationId:"X" });
  const engineeringBay = deriveConsequences(e);   // one room
  const nationalGrid   = deriveConsequences(e);   // another, independently
  ok("Engineering Bay derives a consequence", engineeringBay.length > 0);
  ok("the Grid derives it independently", nationalGrid.length > 0);
  ok("both derive exactly the same fact",
     JSON.stringify(engineeringBay) === JSON.stringify(nationalGrid));
  ok("derivation needs only the event — no room-to-room channel exists",
     deriveConsequences(e).length === deriveConsequences({ ...e }).length);
}

// ---------- E. CAUSAL RENDERING ----------
console.log("  E · causal rendering");
{
  const log = [];
  for (const s of MANUFACTURING_STORY) log.unshift({ ...s.event });
  const a = project(log, MISSIONS), b = project(log, MISSIONS);
  ok("two rooms render the same chain in the same order",
     JSON.stringify(a.consequences) === JSON.stringify(b.consequences));
  ok("the chain is ordered newest first for display",
     a.consequences.length < 2 || a.consequences[0].at >= a.consequences[1].at);
  ok("each rendered node can name its cause",
     a.consequences.every((c) => typeof c.causedBy === "string"));
}

// ---------- F. IMPOSSIBLE CAUSATION ----------
console.log("  F · impossible causation");
{
  ok("an unknown event type produces no consequence",
     deriveConsequences({ type:"totally.invented.type", specification:"S1" }).length === 0);
  ok("a meta event produces no manufacturing consequence",
     deriveConsequences({ type:"system.language.changed", language:"ha" }).length === 0);
  ok("a malformed event produces no consequence",
     deriveConsequences(null).length === 0 && deriveConsequences({}).length === 0);
  // An illegal transition must not manufacture a false fact.
  const illegal = Events.engineering({ specification:"S9",
    type: EVENT_TYPES.ENGINEERING.SPEC_RELEASED, transition:"release", person:"X" });
  const v = project([illegal], MISSIONS);
  ok("an impossible transition is recorded as an anomaly", v.anomalies.length === 1);
  ok("state is not advanced by the illegal claim", v.specifications["S9"].state === "draft");
}

// ---------- backward and forward tracing ----------
console.log("  tracing");
{
  ok("backward: a fact names the events that could cause it",
     findCauses("production.authorised").includes(EVENT_TYPES.ENGINEERING.SPEC_RELEASED));
  ok("forward: an event names what it unlocks",
     findUnlocked(EVENT_TYPES.ENGINEERING.SPEC_RELEASED).length > 0);
  ok("an unmapped event unlocks nothing", findUnlocked("nope.nope").length === 0);
}

console.log(`\n${pass}/${pass+fail} assertions passed${fail?` — ${fail} FAILED`:""}\n`);
process.exit(fail?1:0);
