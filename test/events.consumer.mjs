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

console.log(`\n${pass}/${pass + fail} assertions passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
