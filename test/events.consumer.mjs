// ============================================================
// FORGE OS — events.js consumer harness
// Run: node test/events.consumer.mjs
// Pure Node, no test framework, no build step. Exits non-zero on failure.
// ============================================================
import Events, {
  EVENT_TYPES, STATUS, INSPECTION_RESULT, createEvent, machineEvent,
  productionEvent, inspectionEvent, engineeringEvent, personEvent,
  knowledgeEvent, navigationEvent, validateEvent, assertEvent,
  classForField, isEntityField, intendedStatus, toLegacyType,
  assertVocabulary, EVENT_SCHEMA_VERSION,
  MISSION_POLICY, MISSION_POLICY_LEVEL, missionPolicyFor,
} from "../src/os/events.js";

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}`); } };
const throws = (name, fn) => { try { fn(); ok(name, false); } catch { ok(name, true); } };
const errs = (e) => validateEvent(e).issues.filter(i => i.severity === "error");
const warns = (e) => validateEvent(e).issues.filter(i => i.severity === "warning");

console.log("\nFORGE OS — canonical event schema\n");

// --- envelope ---
throws("createEvent rejects a missing type", () => createEvent({}));
ok("createEvent stamps at + schema", (() => { const e = createEvent({ type: "x.y" });
  return Number.isFinite(e.at) && e.schema === EVENT_SCHEMA_VERSION; })());
ok("schema version is exported", typeof EVENT_SCHEMA_VERSION === "string");

// --- required fields at the factory ---
throws("machineEvent requires machine",      () => machineEvent({ hub: "lagos" }));
throws("productionEvent requires component", () => productionEvent({ hub: "lagos" }));
throws("inspectionEvent requires component", () => inspectionEvent({ result: "pass" }));
throws("inspectionEvent requires result",    () => inspectionEvent({ component: "CHS-1" }));
throws("engineeringEvent requires specification", () => engineeringEvent({ hub: "lagos" }));
throws("personEvent requires person",        () => personEvent({ hub: "lagos" }));
throws("knowledgeEvent requires knowledge",  () => knowledgeEvent({ language: "ha" }));
throws("navigationEvent requires studio",    () => navigationEvent({}));

// --- C4: deterministic machine status ---
ok("machine.fault implies fault",   intendedStatus(EVENT_TYPES.MACHINE.FAULT) === STATUS.FAULT);
ok("machine.run implies running",   intendedStatus(EVENT_TYPES.MACHINE.RUN) === STATUS.RUNNING);
ok("factory stamps implied status", machineEvent({ machine: "welder-01",
     type: EVENT_TYPES.MACHINE.FAULT }).status === STATUS.FAULT);

// --- C22: inspection result vocabulary ---
ok("pass resolves to INSPECTION.PASSED", inspectionEvent({ component: "C1",
     result: INSPECTION_RESULT.PASS }).type === EVENT_TYPES.INSPECTION.PASSED);
ok("fail resolves to INSPECTION.FAILED", inspectionEvent({ component: "C1",
     result: INSPECTION_RESULT.FAIL }).type === EVENT_TYPES.INSPECTION.FAILED);
ok("non-canonical result warns", warns({ type: EVENT_TYPES.INSPECTION.RECORDED,
     component: "C1", result: "nok" }).length > 0);

// --- C21: validation ENFORCES domain completeness ---
ok("inspection without component is an ERROR",
   errs({ type: EVENT_TYPES.INSPECTION.PASSED, result: "pass" }).length > 0);
ok("machine event without machine is an ERROR",
   errs({ type: EVENT_TYPES.MACHINE.FAULT }).length > 0);
ok("production without component is an ERROR",
   errs({ type: EVENT_TYPES.PRODUCTION.COMPONENT_PRODUCED, hub: "lagos" }).length > 0);
ok("a complete production event is valid",
   validateEvent(productionEvent({ component: "CHS-014", specification: "FTT-CR-001",
     machine: "migWelder", hub: "warri", person: "Adaeze Okoro" })).valid === true);
ok("assertEvent throws on an incomplete record",
   (() => { try { assertEvent({ type: EVENT_TYPES.INSPECTION.PASSED }); return false; }
            catch { return true; } })());

// --- C20: no invented hub ---
ok("engineeringEvent does not fabricate a hub",
   engineeringEvent({ specification: "FTT-CR-001" }).hub === undefined);
ok("navigationEvent tolerates a null hub",
   validateEvent(navigationEvent({ studio: "engineering-bay", hub: null })).valid === true);

// --- field vocabulary ---
ok("human maps to PERSON",       classForField("human") === "person");
ok("specification maps to class", classForField("specification") === "specification");
ok("unknown field maps to null", classForField("nonsense") === null);
ok("isEntityField recognises hub", isEntityField("hub") === true);

// --- misc contracts ---
ok("compact preserves 0 and false",
   (() => { const e = createEvent({ type: "x.y", count: 0, flag: false });
     return e.count === 0 && e.flag === false; })());
ok("compact drops empty strings", createEvent({ type: "x.y", a: "" }).a === undefined);
ok("legacy bridge maps fault -> maintenance.opened",
   toLegacyType(EVENT_TYPES.MACHINE.FAULT) === "maintenance.opened");
ok("status/type mismatch warns", warns({ type: EVENT_TYPES.MACHINE.FAULT,
     machine: "m1", status: STATUS.RUNNING }).length > 0);
ok("C19 vocabulary drift is detectable",
   assertVocabulary(["person"]).producerOnly.length > 0);
ok("aggregate default export is wired", typeof Events.production === "function"
   && Events.TYPES === EVENT_TYPES);

// ============================================================
// MISSION CORRELATION POLICY (E3 Phase 6)
//
// The policy exists so that correlation is explicit rather than inferred, and
// so a NEW canonical event cannot arrive without stating whether it may belong
// to a mission. These assertions test executable behaviour, never comments.
// ============================================================
{
  const L = MISSION_POLICY_LEVEL;
  const allTypes = Object.values(EVENT_TYPES).flatMap((d) => Object.values(d));
  const accepts = (e) => validateEvent(e).valid === true;
  const rejects = (e) => errs(e).length > 0;

  // ---- REQUIRED (A–D) ----
  // missionEvent() throws before validation is reached, so the policy's required
  // half is asserted against a hand-built event to test the VALIDATOR, not the
  // constructor's own guard.
  ok("A. mission.created without mission is rejected",
     rejects({ type: EVENT_TYPES.MISSION.CREATED, summary: "x" }));
  ok("B. mission.created with mission is accepted",
     accepts({ type: EVENT_TYPES.MISSION.CREATED, mission: "FORGE-ALPHA", summary: "x" }));
  ok("C. mission.authorised without mission is rejected",
     rejects({ type: EVENT_TYPES.MISSION.AUTHORISED, summary: "x" }));
  ok("D. mission.closed without mission is rejected",
     rejects({ type: EVENT_TYPES.MISSION.CLOSED, summary: "x" }));

  // ---- OPTIONAL (E–H) — both presence and absence must pass ----
  ok("E. production without mission is accepted",
     accepts(productionEvent({ component: "C1", person: "A" })));
  ok("F. production with mission is accepted",
     accepts(productionEvent({ component: "C1", mission: "FORGE-ALPHA", person: "A" })));
  ok("G. machine without mission is accepted",
     accepts(machineEvent({ machine: "mill-03" })));
  ok("H. machine with mission is accepted — a fault may block a mission",
     accepts(machineEvent({ machine: "mill-03", mission: "FORGE-ALPHA" })));

  // ---- FORBIDDEN (I–L) — the case that had no enforcement before ----
  ok("I. system.booted without mission is accepted",
     accepts({ type: EVENT_TYPES.SYSTEM.BOOTED }));
  ok("J. system.booted WITH a mission is rejected",
     rejects({ type: EVENT_TYPES.SYSTEM.BOOTED, mission: "FORGE-ALPHA" }));
  ok("K. navigation.enter without mission is accepted",
     accepts(navigationEvent({ studio: "engineering-bay" })));
  ok("L. navigation.enter WITH a mission is rejected",
     rejects(navigationEvent({ studio: "engineering-bay", mission: "FORGE-ALPHA" })));
  ok("L. the forbidden error names the policy, not just the field",
     errs(navigationEvent({ studio: "engineering-bay", mission: "FORGE-ALPHA" }))
       .some((i) => /MISSION_FORBIDDEN/.test(i.message)));

  // ---- M. a type outside the vocabulary keeps its existing behaviour ----
  ok("M. an unclassified type is not silently made required or forbidden",
     missionPolicyFor("widget.frobnicated") === null &&
     accepts({ type: "widget.frobnicated", component: "C1", summary: "s" }) &&
     accepts({ type: "widget.frobnicated", component: "C1", mission: "M", summary: "s" }));

  // ---- N. exactly one classification per canonical event ----
  const unclassified = allTypes.filter((t) => !(t in MISSION_POLICY));
  ok(`N. every canonical event is classified (${allTypes.length} types)`,
     unclassified.length === 0);
  const levels = new Set(Object.values(L));
  const badLevel = Object.entries(MISSION_POLICY).filter(([, v]) => !levels.has(v));
  ok("N. every classification is one of the four levels — no fifth category",
     badLevel.length === 0);
  // A plain object cannot hold two values for one key, so duplication shows up
  // as a key count mismatch against the declaration rather than as two levels.
  ok("N. no canonical event carries zero or two classifications",
     Object.keys(MISSION_POLICY).length === allTypes.length);

  // ---- stale-policy detection ----
  const stale = Object.keys(MISSION_POLICY).filter((t) => !allTypes.includes(t));
  ok("no policy entry points at a nonexistent canonical event",
     stale.length === 0, stale.join(", "));

  // ---- O. drift protection actually fails on an unclassified new event ----
  // Simulates the vocabulary growing without the policy growing with it.
  {
    const synthetic = [...allTypes, "production.widget.frobnicated"];
    const wouldFail = synthetic.filter((t) => !(t in MISSION_POLICY)).length > 0;
    ok("O. a new canonical event with no classification fails the audit", wouldFail);
  }

  // ---- P. UNKNOWN must not harden into REQUIRED ----
  ok("P. UNKNOWN accepts both presence and absence of mission",
     accepts(personEvent({ person: "Amina" })) &&
     accepts(personEvent({ person: "Amina", mission: "FORGE-ALPHA" })));
  ok("P. person.* is recorded as UNKNOWN, not quietly OPTIONAL",
     [EVENT_TYPES.PERSON.ARRIVED, EVENT_TYPES.PERSON.COMPETENCY_CLAIMED,
      EVENT_TYPES.PERSON.COMPETENCY_VERIFIED].every((t) => MISSION_POLICY[t] === L.UNKNOWN));

  // ---- Q. mission:null keeps the existing absence semantics ----
  const nulled = productionEvent({ component: "C1", mission: null, person: "A" });
  ok("Q. mission:null is dropped by compact(), not stored",
     !("mission" in nulled) && accepts(nulled));
  ok("Q. mission:null on a FORBIDDEN type is still accepted — absence is absence",
     accepts({ type: EVENT_TYPES.SYSTEM.BOOTED, mission: null }));

  // ---- the policy must not diverge from the enforcement that already existed ----
  ok("REQUIRED types are still enforced by the required-fields mechanism",
     [EVENT_TYPES.MISSION.CREATED, EVENT_TYPES.MISSION.AUTHORISED, EVENT_TYPES.MISSION.CLOSED]
       .every((t) => MISSION_POLICY[t] === L.REQUIRED && rejects({ type: t, summary: "x" })));
  ok("no OPTIONAL, UNKNOWN or FORBIDDEN type requires a mission",
     allTypes.filter((t) => MISSION_POLICY[t] !== L.REQUIRED)
       .every((t) => !errs({ type: t, machine: "m", component: "c", specification: "s",
         person: "p", knowledge: "k", studio: "st", result: INSPECTION_RESULT.PASS, summary: "s" })
         .some((i) => /requires field "mission"/.test(i.message))));

  console.log(`\n  policy: ${allTypes.filter((t) => MISSION_POLICY[t] === L.REQUIRED).length} required · ` +
    `${allTypes.filter((t) => MISSION_POLICY[t] === L.OPTIONAL).length} optional · ` +
    `${allTypes.filter((t) => MISSION_POLICY[t] === L.FORBIDDEN).length} forbidden · ` +
    `${allTypes.filter((t) => MISSION_POLICY[t] === L.UNKNOWN).length} unknown`);
}

console.log(`\n${pass}/${pass + fail} assertions passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
