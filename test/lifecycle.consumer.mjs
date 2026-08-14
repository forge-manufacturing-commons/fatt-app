// ============================================================
// FORGE OS — COMPONENT ACCEPTANCE LIFECYCLE  (E7)
//
// One question: what does ForgeOS do after a component has been manufactured?
//
// THE LIFECYCLE, READ FROM THE REPOSITORY — not proposed, not assumed:
//
//   planned ──release──▶ manufacturing ──submitForInspection──▶ inspection
//                                                                 │
//                                            ┌────pass────────────┤
//                                            ▼                    ▼ fail
//                                        assembly              rework
//                                            │                    │
//                                       assemble             submitForInspection
//                                            ▼                    │
//                                        completed ◀──────────────┘ (back to inspection)
//
//   EVENT → TRANSITION (src/os/projections.js, the only writer):
//     production.component.produced | component.received  → release
//     inspection.passed | quality.verified                → pass
//     inspection.failed                                   → fail
//     inspection.reworked                                 → submitForInspection
//     production.assembly.joined                          → assemble
//
// THE CRITICAL CONTRACT FINDING. There is NO canonical event that moves a
// component from `manufacturing` into `inspection`. The graph has the transition;
// the only event mapped to it is `inspection.reworked`, which from `manufacturing`
// would be a false claim (E6.2). Instead the fold performs the intermediate
// submitForInspection ITSELF when a pass or fail arrives from `manufacturing`.
//
// So the system represents inspection as THE RESULT EVENT. "Send for inspection"
// is not a recordable fact in this architecture — being inspected is inferred
// from someone reporting what the inspection found. E7 preserves that rather
// than inventing an `inspection.submitted` event to make a button read nicely.
//
// CONSEQUENCE FOR MISSION PROGRESS: `accepted` counts components in
// assembly | completed | installed. `assembly` is reached by `pass`. So
// `inspection.passed` is the event that makes FORGE-HUB count HUB-014 — not
// production, which is why E6 correctly left the mission at 0.
//
// Run: node test/lifecycle.consumer.mjs
// ============================================================

import { readFileSync } from "node:fs";
import { project } from "../src/os/projections.js";
import Events, { EVENT_TYPES, INSPECTION_RESULT, validateEvent } from "../src/os/events.js";
import { PROVENANCE, SEED_ORGANISATIONS } from "../src/os/network.js";
import { pilotOrganisationById, assignmentFor, provenanceOfOrganisation } from "../src/os/pilot.js";
import { componentState } from "../src/domains/production/state.js";
import { MANUFACTURING_ACTIONS, availableActions, wouldAccept, isTruthfulFrom }
  from "../src/domains/production/entry.js";
import { createProductionEmitter } from "../src/domains/production/emitters.js";
import { createInspectionEmitter } from "../src/domains/inspection/emitters.js";
import { requireActor } from "../src/os/policy.js";
import { stripComments } from "./lib/source.mjs";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log(`  ok   ${n}`); } else { fail++; console.log(`  FAIL ${n}`); } };

// ---- the E6 pilot. Nothing new is created. ----
const SOLC = pilotOrganisationById("SOLC");
const A = assignmentFor("SOLC");
const OPERATOR = "Adaeze Okoro";
const MISSIONS = [{ id: "FORGE-HUB", title: "Manufacture 200 wheel hubs", target: 200, specification: "FTT-HB-001" }];
const asLog = (events) => [...events].reverse();

/** A live bus: newest-first, exactly as ActivityEngine keeps it. */
const bus = () => {
  const log = [];
  return {
    log,
    publish: (e) => { log.unshift(e); return e; },
    view: () => project(log, MISSIONS),
  };
};

/** Record a fact exactly as PilotEntry does — organisation from config, operator a human. */
const record = (b, actionId, component) => {
  const action = MANUFACTURING_ACTIONS.find((a) => a.id === actionId);
  const common = {
    publish: b.publish, actor: OPERATOR, hub: A.hub, policy: requireActor,
    correlationId: `pilot-SOLC-${component}`,
  };
  const emitter = action.domain === "inspection"
    ? createInspectionEmitter(common) : createProductionEmitter(common);
  return emitter[action.command]({
    component, specification: A.specification, mission: A.mission, organisation: SOLC.id,
  });
};

/** Every integrity property required of an E7 event, in one place. */
const assertEventIntegrity = (label, e, component) => {
  const v = validateEvent(e);
  ok(`${label}: type is canonical`,
     Object.values(EVENT_TYPES).flatMap((d) => Object.values(d)).includes(e.type));
  ok(`${label}: validates with zero issues`, v.valid && v.issues.length === 0);
  ok(`${label}: organisation = SOLC`, e.organisation === "SOLC");
  ok(`${label}: operator = ${OPERATOR}`, e.person === OPERATOR && e.human === OPERATOR);
  ok(`${label}: operator is NOT the organisation`, e.person !== e.organisation);
  ok(`${label}: component = ${component}`, e.component === component);
  ok(`${label}: specification = FTT-HB-001`, e.specification === "FTT-HB-001");
  ok(`${label}: mission = FORGE-HUB`, e.mission === "FORGE-HUB");
  ok(`${label}: provenance resolves to PILOT`,
     provenanceOfOrganisation(e.organisation, SEED_ORGANISATIONS) === PROVENANCE.PILOT);
};

console.log("\nFORGE OS — component acceptance lifecycle (E7)\n");

// ============================================================
console.log("PART 1 — THE CONTRACT, ASSERTED FROM THE REPOSITORY");
// ============================================================
{
  ok("manufacturing's only forward transition is submitForInspection",
     componentState.transitions("manufacturing").sort().join() === "fault,submitForInspection");
  ok("inspection branches to exactly pass and fail",
     componentState.transitions("inspection").sort().join() === "fail,pass");
  ok("pass leads to assembly", componentState.next("inspection", "pass") === "assembly");
  ok("fail leads to rework", componentState.next("inspection", "fail") === "rework");
  ok("rework returns to inspection",
     componentState.next("rework", "submitForInspection") === "inspection");
  ok("rework can also be scrapped", componentState.next("rework", "scrap") === "scrapped");
  ok("assembly proceeds to completed", componentState.next("assembly", "assemble") === "completed");

  // The contract finding: no event submits for inspection from manufacturing.
  const all = Object.values(EVENT_TYPES).flatMap((d) => Object.values(d));
  ok("no inspection.submitted / sent event exists in the vocabulary",
     all.filter((t) => /submit|sent|dispatch/i.test(t)).length === 0);
  ok("inspection.reworked is the only event mapped to submitForInspection",
     stripComments(readFileSync(new URL("../src/os/projections.js", import.meta.url), "utf8"))
       .match(/transition = "submitForInspection"/g).length === 1);
  ok("the fold performs the intermediate submit itself for a result from manufacturing",
     /transition === "pass" \|\| transition === "fail"[\s\S]{0,120}submitForInspection/
       .test(stripComments(readFileSync(new URL("../src/os/projections.js", import.meta.url), "utf8"))));
  ok("mission acceptance counts assembly, completed and installed",
     ["assembly", "completed", "installed"].every((s) =>
       stripComments(readFileSync(new URL("../src/os/projections.js", import.meta.url), "utf8"))
         .includes(s)));
  ok("the vocabulary is 34 event types after E9.5", all.length === 34);
  ok("and no lifecycle-driving event was added — both additions drive no transition",
     all.filter((t) => t !== "production.work.directed" &&
                       t !== "production.work.acknowledged").length === 32);
}

// ============================================================
console.log("\nPART 11.1 — MANUFACTURING OFFERS ONLY TRUTHFUL ACTIONS");
// ============================================================
{
  const offered = availableActions("manufacturing").map((a) => a.id).sort();
  ok("manufacturing offers exactly the two inspection results", offered.join() === "failed,passed");
  ok("it does NOT offer 'reworked' — nothing has been reworked",
     !offered.includes("reworked"));
  ok("the graph nonetheless still permits submitForInspection from manufacturing",
     wouldAccept("manufacturing", "submitForInspection") === true);
  ok("so the restriction is truthfulness, not legality",
     isTruthfulFrom(MANUFACTURING_ACTIONS.find((a) => a.id === "reworked"), "manufacturing") === false);
  ok("'reworked' IS offered from rework",
     availableActions("rework").map((a) => a.id).join() === "reworked");
  ok("each offered action advertises the state it leads to",
     availableActions("manufacturing").every((a) => typeof a.to === "string" && a.to.length));
  ok("passed from manufacturing advertises assembly",
     availableActions("manufacturing").find((a) => a.id === "passed").to === "assembly");
  ok("failed from manufacturing advertises rework",
     availableActions("manufacturing").find((a) => a.id === "failed").to === "rework");
}

// ============================================================
console.log("\nBRANCH A — HUB-014: manufactured, inspected, PASSED");
// ============================================================
const branchA = bus();
{
  const COMP = "HUB-014";

  // E6 baseline, reproduced so E7 starts from the real state.
  const produced = record(branchA, "produced", COMP);
  ok("A0. HUB-014 is manufacturing after production",
     branchA.view().components[COMP].state === "manufacturing");
  const mBefore = branchA.view().missions.find((m) => m.id === "FORGE-HUB");
  ok("A0. FORGE-HUB is still planning before acceptance", mBefore.state === "planning");
  ok("A0. FORGE-HUB has accepted nothing yet", mBefore.accepted === 0);
  ok("A0. FORGE-HUB progress is 0%", mBefore.progress === 0);

  // THE E7 ACTION.
  const passed = record(branchA, "passed", COMP);
  assertEventIntegrity("A1", passed, COMP);
  ok("A1. the event type is inspection.passed", passed.type === EVENT_TYPES.INSPECTION.PASSED);
  ok("A1. it carries a canonical inspection result", passed.result === INSPECTION_RESULT.PASS);

  const v = branchA.view();
  const c = v.components[COMP];
  ok("A2. the resulting state is assembly — from the graph, not assumed", c.state === "assembly");
  ok("A2. no anomaly was raised", v.anomalies.length === 0);
  ok("A2. the fold performed the intermediate submit",
     c.history.some((h) => h.transition === "submitForInspection" && h.from === "manufacturing"));
  ok("A2. then the pass", c.history.some((h) => h.transition === "pass" && h.to === "assembly"));
  ok("A2. history is ordered release -> submitForInspection -> pass",
     c.history.map((h) => h.transition).join() === "release,submitForInspection,pass");
  ok("A2. the pass is attributed to the human operator",
     c.history.find((h) => h.transition === "pass").by === OPERATOR);
  ok("A2. and never to the organisation",
     !c.history.some((h) => h.by === "SOLC"));

  ok("A3. organisation responsibility survived", c.organisation === "SOLC");
  ok("A3. component identity is stable", c.id === COMP);
  ok("A3. specification is stable", c.specification === "FTT-HB-001");
  ok("A3. mission membership is stable", c.mission === "FORGE-HUB");
  // E9.1 added `contributions`. The guard fired and is updated, not removed.
  // Canon P0-2 added `hub`. Same treatment: widened by exactly one field, with a
  // companion assertion below defending what the widening could have broken.
  ok("A3. the fold shape is exactly the authorised set",
     Object.keys(c).sort().join() ===
     ["contributions", "directives", "history", "hub", "id", "mission", "organisation",
      "specification", "state"].join());
  ok("A3. and an inspection pass is performance, not a contribution",
     c.contributions.length === 0);
  // P0-2 COMPANION. The four relationships must remain four DIFFERENT answers.
  // A hub is a place; it is not the responsible organisation, not the person who
  // performed the work, and not a participant.
  ok("A3. hub is a place, not any of the other three relationships",
     c.hub !== c.organisation &&
     c.hub !== OPERATOR &&
     !c.contributions.some((x) => x?.organisation === c.hub));

  // availableActions must be recomputed from the NEW state.
  const next = availableActions(c.state).map((a) => a.id);
  ok("A4. availableActions recomputes from assembly", next.length === 0);
  ok("A4. an accepted component is offered no manual inspection action",
     !next.includes("passed") && !next.includes("failed"));
}

// ============================================================
console.log("\nPART 7 — MISSION CORRELATION: what actually moves FORGE-HUB");
// ============================================================
{
  const m = branchA.view().missions.find((x) => x.id === "FORGE-HUB");
  ok("FORGE-HUB now counts HUB-014", m.accepted === 1);
  ok("progress is derived against the supplied target of 200", m.target === 200);
  ok("progress is 1/200 rounded — counted, never asserted",
     m.progress === Math.round((1 / 200) * 100));
  ok("the mission state is still planning — no lifecycle event authorised it",
     m.state === "planning");
  ok("acceptance is caused by reaching assembly, not by producing",
     branchA.view().components["HUB-014"].state === "assembly");

  // Prove the cause: the same component before the pass counted nothing.
  const only = bus();
  record(only, "produced", "HUB-014");
  ok("with production alone, FORGE-HUB accepts 0",
     only.view().missions.find((x) => x.id === "FORGE-HUB").accepted === 0);
}

// ============================================================
console.log("\nBRANCH B — HUB-015: FAILED, reworked, re-inspected, PASSED");
// ============================================================
const branchB = bus();
{
  const COMP = "HUB-015";   // a second operator-supplied identifier, per Part 4

  record(branchB, "produced", COMP);
  ok("B0. HUB-015 is manufacturing", branchB.view().components[COMP].state === "manufacturing");

  // --- FAIL ---
  const failed = record(branchB, "failed", COMP);
  assertEventIntegrity("B1", failed, COMP);
  ok("B1. the event type is inspection.failed", failed.type === EVENT_TYPES.INSPECTION.FAILED);
  ok("B1. it carries the canonical FAIL result", failed.result === INSPECTION_RESULT.FAIL);
  let c = branchB.view().components[COMP];
  ok("B2. the resulting state is rework", c.state === "rework");
  ok("B2. the fold submitted for inspection first, then failed",
     c.history.map((h) => h.transition).join() === "release,submitForInspection,fail");
  ok("B2. no anomaly — failure is an honest sequence", branchB.view().anomalies.length === 0);
  ok("B2. organisation survived the failure", c.organisation === "SOLC");

  // --- REWORK, now truthful ---
  ok("B3. 'reworked' is offered from rework and nothing else is",
     availableActions("rework").map((a) => a.id).join() === "reworked");
  const reworked = record(branchB, "reworked", COMP);
  assertEventIntegrity("B3", reworked, COMP);
  ok("B3. the event type is inspection.reworked", reworked.type === EVENT_TYPES.INSPECTION.REWORKED);
  ok("B3. it carries PENDING, not a verdict", reworked.result === INSPECTION_RESULT.PENDING);
  c = branchB.view().components[COMP];
  ok("B4. the resulting state is inspection", c.state === "inspection");
  ok("B4. the transition recorded is submitForInspection",
     c.history[c.history.length - 1].transition === "submitForInspection");

  // --- RE-INSPECTION PASSES ---
  const passed2 = record(branchB, "passed", COMP);
  assertEventIntegrity("B5", passed2, COMP);
  c = branchB.view().components[COMP];
  ok("B6. the recovered component reaches assembly", c.state === "assembly");
  ok("B6. the full causal chain is preserved in order",
     c.history.map((h) => h.transition).join() ===
     "release,submitForInspection,fail,submitForInspection,pass");
  ok("B6. five transitions, none lost", c.history.length === 5);
  ok("B6. no anomaly across the whole failure-and-recovery path",
     branchB.view().anomalies.length === 0);

  // --- PART 8: nothing was corrupted ---
  ok("B7. organisation preserved through failure and recovery", c.organisation === "SOLC");
  ok("B7. operator preserved on every attributed transition",
     c.history.filter((h) => h.by).every((h) => h.by === OPERATOR));
  ok("B7. component identity preserved", c.id === COMP);
  ok("B7. specification preserved", c.specification === "FTT-HB-001");
  ok("B7. mission preserved", c.mission === "FORGE-HUB");
  ok("B7. provenance still resolves to PILOT",
     provenanceOfOrganisation(c.organisation, SEED_ORGANISATIONS) === PROVENANCE.PILOT);
  ok("B7. FORGE-HUB counts the recovered component",
     branchB.view().missions.find((x) => x.id === "FORGE-HUB").accepted === 1);
  ok("B7. only ONE organisation is involved throughout",
     new Set(branchB.log.map((e) => e.organisation).filter(Boolean)).size === 1);
}

// ============================================================
console.log("\nPART 8 — ILLEGAL AND UNTRUTHFUL CLAIMS ARE REFUSED");
// ============================================================
{
  // manufacturing -> assembly must NOT be reachable directly.
  ok("the graph forbids assemble from manufacturing",
     wouldAccept("manufacturing", "assemble") === false);
  const b = bus();
  record(b, "produced", "HUB-016");
  createProductionEmitter({ publish: b.publish, actor: OPERATOR, hub: A.hub })
    .joinAssembly({ assembly: "AS-1", component: "HUB-016", organisation: SOLC.id });
  const v = b.view();
  ok("a direct jump to assembly is refused and the state is NOT advanced",
     v.components["HUB-016"].state === "manufacturing");
  ok("the refusal is recorded as an anomaly",
     v.anomalies.some((a) => /cannot "assemble" from "manufacturing"/.test(a.message)));
  ok("the anomaly names the attempt and the held state",
     v.anomalies.some((a) => a.attempted === "assemble" && a.held === "manufacturing"));

  // A rework claim from a state where it is untrue.
  const b2 = bus();
  record(b2, "produced", "HUB-017");
  record(b2, "passed", "HUB-017");            // now assembly
  ok("HUB-017 is in assembly", b2.view().components["HUB-017"].state === "assembly");
  record(b2, "reworked", "HUB-017");          // an untruthful claim
  ok("a rework claim from assembly does NOT move the component",
     b2.view().components["HUB-017"].state === "assembly");
  ok("and it is recorded as an anomaly rather than silently dropped",
     b2.view().anomalies.some((a) => /cannot "submitForInspection" from "assembly"/.test(a.message)));
  ok("the surface would never have offered it from assembly",
     availableActions("assembly").length === 0);

  // Terminal states accept nothing.
  ok("scrapped offers no actions", availableActions("scrapped").length === 0);
  ok("cancelled offers no actions", availableActions("cancelled").length === 0);
}

// ============================================================
console.log("\nPART 5 — RESPONSIBILITY IS NEVER INFERRED, FIRST WRITER WINS");
// ============================================================
{
  const b = bus();
  record(b, "produced", "HUB-018");
  // A different organisation attempts to claim the same component mid-lifecycle.
  createInspectionEmitter({ publish: b.publish, actor: "Someone Else", hub: "ilorin" })
    .pass({ component: "HUB-018", specification: "FTT-HB-001", organisation: "DEMO-ORG-002" });
  const v = b.view();
  ok("the first authoritative writer keeps responsibility",
     v.components["HUB-018"].organisation === "SOLC");
  ok("the conflicting claim is recorded as an anomaly",
     v.anomalies.some((a) => a.attempted === "DEMO-ORG-002" && a.held === "SOLC"));
  ok("the lifecycle still advanced on the valid transition",
     v.components["HUB-018"].state === "assembly");

  // Nothing else may imply responsibility.
  const bare = (fields) => {
    const c = bus();
    createInspectionEmitter({ publish: c.publish, actor: OPERATOR })
      .pass({ component: "X-9", ...fields });
    return c.view().components["X-9"];
  };
  ok("hub does not imply responsibility", bare({ hub: "warri" }).organisation === null);
  ok("machine does not imply responsibility", bare({ machine: "cmm-01" }).organisation === null);
  ok("workshop does not imply responsibility",
     bare({ workshop: "Forge Quality Office" }).organisation === null);
  ok("mission does not imply responsibility", bare({ mission: "FORGE-HUB" }).organisation === null);
  ok("specification does not imply responsibility",
     bare({ specification: "FTT-HB-001" }).organisation === null);
  ok("the operator does not imply responsibility", bare({}).organisation === null);
}

// ============================================================
console.log("\nPART 6 + 11.14 — STATE IS DERIVED, THE UI ONLY RECORDS FACTS");
// ============================================================
{
  const ui = stripComments(readFileSync(new URL("../src/os/PilotEntry.jsx", import.meta.url), "utf8"));
  ok("the surface never assigns a component state", !/\.state\s*=[^=]/.test(ui));
  ok("the surface never assigns a mission state", !/mission\.state\s*=/.test(ui));
  ok("the surface reads state from the projection", /view\.components\[/.test(ui));
  ok("the surface derives the action list from the fold's state",
     /availableActions\(current\)/.test(ui));
  ok("the surface publishes through emitters, never a bespoke writer",
     /createProductionEmitter|createInspectionEmitter/.test(ui));
  ok("the surface performs no database write",
     !/supabase|\.insert\(|\.update\(|\.upsert\(/.test(ui));
  ok("there is no organisation input on the surface",
     !/value=\{(organisation|org|orgName|company)[^}]*\}/.test(ui));
  ok("the organisation on the event comes from the resolved pilot identity",
     /organisation:\s*pilot\.id/.test(ui));
  ok("the operator is a separate, human-supplied field", /value=\{operator\}/.test(ui));
  ok("no second organisation can be created from this surface",
     !/from\(\s*["']organisations["']\s*\)/.test(ui));
}

console.log(`\n${pass}/${pass + fail} assertions passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
