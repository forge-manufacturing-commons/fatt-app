// ============================================================
// FORGE OS — state engine + manufacturing rules harness
// Run: node test/domains.consumer.mjs
// ============================================================
import { IllegalTransition } from "../src/os/state.js";
import { RuleViolation } from "../src/os/rules.js";
import {
  componentState, machineState, specificationState, missionState,
  stateRegistry, productionRules, inspectionRules, engineeringRules,
} from "../src/domains/index.js";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log(`  ok   ${n}`); } else { fail++; console.log(`  FAIL ${n}`); } };

console.log("\nFORGE OS — manufacturing state engine + rules\n");

// --- graph integrity: every graph must be well formed at boot ---
const all = stateRegistry.validateAll();
ok("every state graph is valid (targets exist, all states reachable)", all.valid);
if (!all.valid) console.log(JSON.stringify(all.byClass, null, 2));
ok("registry knows all four object classes", stateRegistry.classes().length === 4);

// --- component lifecycle ---
ok("a new component starts planned", componentState.initial === "planned");
ok("planned may be released", componentState.can("planned", "release"));
ok("release lands in manufacturing", componentState.next("planned", "release") === "manufacturing");
ok("manufacturing may NOT be assembled directly", !componentState.can("manufacturing", "assemble"));
ok("inspection pass routes to assembly", componentState.next("inspection", "pass") === "assembly");
ok("inspection fail routes to rework, not scrap", componentState.next("inspection", "fail") === "rework");
ok("rework can re-enter inspection", componentState.can("rework", "submitForInspection"));
ok("retired is terminal", componentState.isTerminal("retired"));
ok("a terminal state offers no transitions", componentState.transitions("retired").length === 0);
ok("state carries an operator-readable meaning", typeof componentState.means("blocked") === "string");

// THE corruption check the CTO named: inspection passing on a component
// that is still in manufacturing is not a delay, it is impossible.
ok("passing inspection while still manufacturing is impossible",
   componentState.impossible("manufacturing").includes("pass"));
try { componentState.next("manufacturing", "pass"); ok("illegal transition throws", false); }
catch (e) { ok("illegal transition throws IllegalTransition naming what IS allowed",
  e instanceof IllegalTransition && e.allowed.includes("submitForInspection")); }

// --- machine lifecycle ---
ok("machine starts offline", machineState.initial === "offline");
ok("running may fault", machineState.next("running", "fault") === "fault");
ok("a faulted machine cannot simply start", !machineState.can("fault", "start"));
ok("a faulted machine must go through maintenance",
   machineState.next("fault", "openMaintenance") === "maintenance");

// --- specification lifecycle ---
ok("specification starts draft", specificationState.initial === "draft");
ok("draft cannot be released without approval", !specificationState.can("draft", "release"));
ok("approved may be released", specificationState.next("approved", "release") === "released");
ok("released may be revised back to draft", specificationState.next("released", "revise") === "draft");
ok("deprecated is terminal", specificationState.isTerminal("deprecated"));

// --- mission lifecycle ---
ok("mission starts planning", missionState.initial === "planning");
ok("quality rejection returns a mission to production",
   missionState.next("inspection", "qualityRejected") === "production");
ok("closed is terminal", missionState.isTerminal("closed"));

// --- production rules: reality, not permission ---
{
  const r = productionRules.evaluate({ transition: "assemble", inspectionResult: "fail" });
  ok("assembly refused when inspection failed", !r.permitted);
  ok("refusal cites the rule id",
     r.violations.some((v) => v.id === "production.inspectionBeforeAssembly"));
  ok("refusal carries an operator-readable reason",
     r.violations.every((v) => typeof v.because === "string" && v.because.length > 10));
  ok("assembly permitted when inspection passed",
     productionRules.evaluate({ transition: "assemble", inspectionResult: "pass" }).permitted);
  ok("work refused on a faulted machine",
     !productionRules.evaluate({ machine: "press-01", machineState: "fault" }).permitted);
  ok("pressure vessel refused without ASME",
     !productionRules.evaluate({ componentClass: "pressure-vessel", workshopCertifications: ["ISO9001"] }).permitted);
  ok("pressure vessel permitted with ASME",
     productionRules.evaluate({ componentClass: "pressure-vessel", workshopCertifications: ["ASME"] }).permitted);
  ok("manufacture refused against an unreleased specification",
     !productionRules.evaluate({ transition: "release", specification: "S1", specificationState: "draft" }).permitted);
  ok("out-of-scope rules are not applied",
     productionRules.evaluate({ transition: "assemble", inspectionResult: "pass" }).applied
       .includes("production.inspectionBeforeAssembly"));
}

// --- inspection rules ---
{
  ok("inspection refused without inspector competency",
     !inspectionRules.evaluate({ transition: "pass", competencies: ["welding-level-1"] }).permitted);
  ok("inspection permitted with inspector competency",
     inspectionRules.evaluate({ transition: "pass", competencies: ["qc-inspector-level-1"] }).permitted);
  ok("safety-critical demands level 3",
     !inspectionRules.evaluate({ safetyCritical: true, transition: "pass",
       competencies: ["qc-inspector-level-1"] }).permitted);
  ok("self-inspection refused",
     !inspectionRules.evaluate({ producedBy: "p1", inspectedBy: "p1" }).permitted);
  ok("independent inspection permitted",
     inspectionRules.evaluate({ producedBy: "p1", inspectedBy: "p2" }).permitted);
  ok("out-of-calibration instrument refused",
     !inspectionRules.evaluate({ instrument: "cmm-01", instrumentCalibrationValid: false }).permitted);
}

// --- engineering rules ---
{
  ok("author may not approve their own specification",
     !engineeringRules.evaluate({ transition: "approve", author: "e1", approver: "e1",
       competencies: ["engineering-level-3"] }).permitted);
  ok("independent approver with competency permitted",
     engineeringRules.evaluate({ transition: "approve", author: "e1", approver: "e2",
       competencies: ["engineering-level-3"] }).permitted);
  ok("approval refused without level 3",
     !engineeringRules.evaluate({ transition: "approve", author: "e1", approver: "e2",
       competencies: ["engineering-level-2"] }).permitted);
  ok("revision refused without a superseded revision",
     !engineeringRules.evaluate({ transition: "revise" }).permitted);
  try { engineeringRules.assert({ transition: "revise" }); ok("assert throws", false); }
  catch (e) { ok("rule assert throws RuleViolation listing every refusal",
    e instanceof RuleViolation && e.violations.length > 0); }
}

// --- the three responsibilities stay separate ---
ok("rules ask about reality, never about identity — no actor field needed",
   productionRules.evaluate({ transition: "assemble", inspectionResult: "pass" }).permitted === true);
ok("state asks about the object, never about rules",
   componentState.can("inspection", "pass") === true);

console.log(`\n${pass}/${pass + fail} assertions passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
