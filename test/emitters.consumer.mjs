// ============================================================
// FORGE OS — emitter consumer harness
// Run: node test/emitters.consumer.mjs
// Verifies the emitters against the fields the CURRENT runtime reads,
// not the fields the architecture documents assume.
// ============================================================
import {
  createProductionEmitter, createInspectionEmitter, createEngineeringEmitter,
  createPolicy, requireActor, requireCertifiedMachine, requireKnownHub, PolicyViolation,
} from "../src/os/emitters/index.js";
import { EVENT_TYPES, INSPECTION_RESULT } from "../src/os/events.js";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log(`  ok   ${n}`); } else { fail++; console.log(`  FAIL ${n}`); } };
const throws = (n, fn) => { try { fn(); ok(n, false); } catch { ok(n, true); } };

// A fake bus that behaves like the real one: returns the stamped event.
const makeBus = () => { const sent = [];
  return { sent, publish: (e) => { const s = { ...e, at: e.at ?? Date.now(), seq: sent.length + 1 }; sent.push(s); return s; } }; };

console.log("\nFORGE OS — domain emitters\n");

// --- production ---
{
  const bus = makeBus();
  const p = createProductionEmitter({ publish: bus.publish, actor: "Adaeze Okoro", hub: "warri" });
  const e = p.produceComponent({ component: "CHS-014", specification: "FTT-CR-001", machine: "migWelder" });
  ok("produceComponent publishes", bus.sent.length === 1);
  ok("returns the stamped event (publish no longer returns undefined)", e && e.eventId != null);
  ok("carries canonical person", e.person === "Adaeze Okoro");
  ok("carries human bridge for buildRuntime", e.human === "Adaeze Okoro");
  ok("carries summary", typeof e.summary === "string" && e.summary.includes("CHS-014"));
  ok("carries text bridge for deriveRecommendations", e.text === e.summary);
  ok("has an eventId", /^[0-9a-f-]{36}$/i.test(e.eventId));
  ok("correlationId present (null when uncorrelated)", "correlationId" in e);
  ok("canonical type", e.type === EVENT_TYPES.PRODUCTION.COMPONENT_PRODUCED);
  ok("hub injected once at construction", e.hub === "warri");
  const f = p.reportFault({ machine: "hydraulicPress", reason: "seal failure" });
  ok("reportFault sets fault status", f.status === "fault");
  ok("fault summary names the reason", f.summary.includes("seal failure"));
  ok("advanceStage narrates the stage", p.advanceStage({ component: "CHS-014", stage: "welded" }).summary.includes("welded"));
  ok("joinAssembly narrates both parts", p.joinAssembly({ assembly: "FRAME-01", component: "CHS-014" }).summary.includes("FRAME-01"));
}

// --- correlation threading ---
{
  const bus = makeBus();
  const cid = "mission-tricycle-001";
  const p = createProductionEmitter({ publish: bus.publish, actor: "a", hub: "aba", correlationId: cid });
  const i = createInspectionEmitter({ publish: bus.publish, actor: "b", hub: "lagos", correlationId: cid });
  p.produceComponent({ component: "AX-102" });
  i.pass({ component: "AX-102" });
  ok("correlationId threads across domains", bus.sent.every((e) => e.correlationId === cid));
  ok("a story can be reconstructed from one id", bus.sent.filter((e) => e.correlationId === cid).length === 2);
}

// --- inspection ---
{
  const bus = makeBus();
  const i = createInspectionEmitter({ publish: bus.publish, actor: "Amina Suleiman", hub: "lagos" });
  ok("pass -> INSPECTION.PASSED", i.pass({ component: "C1" }).type === EVENT_TYPES.INSPECTION.PASSED);
  ok("fail -> INSPECTION.FAILED", i.fail({ component: "C1", reason: "porosity" }).type === EVENT_TYPES.INSPECTION.FAILED);
  ok("fail summary carries the reason", i.fail({ component: "C1", reason: "porosity" }).summary.includes("porosity"));
  ok("rework is pending, not a pass", i.rework({ component: "C1" }).result === INSPECTION_RESULT.PENDING);
  throws("a quality record without a component is refused", () => i.pass({}));
}

// --- engineering ---
{
  const bus = makeBus();
  const g = createEngineeringEmitter({ publish: bus.publish, actor: "Ngozi Bello" });
  const a = g.approveSpecification({ specification: "FTT-CR-001" });
  ok("approveSpecification uses canonical type", a.type === EVENT_TYPES.ENGINEERING.SPEC_APPROVED);
  ok("engineering emitter invents no hub", a.hub === undefined || a.hub === null);
  ok("revise narrates the revision", g.reviseSpecification({ specification: "S1", revision: "B.02" }).summary.includes("B.02"));
  throws("spec event without specification is refused", () => g.releaseSpecification({}));
}

// --- policy layer ---
{
  const bus = makeBus();
  const strict = createPolicy([requireActor]);
  const anon = createProductionEmitter({ publish: bus.publish, actor: null, hub: "kano", policy: strict });
  throws("policy refuses unattributed production", () => anon.produceComponent({ component: "X1" }));

  const named = createProductionEmitter({ publish: bus.publish, actor: "Chike", hub: "kano", policy: strict });
  ok("policy admits attributed production", named.produceComponent({ component: "X1" }).person === "Chike");

  const certified = createPolicy([requireCertifiedMachine(["migWelder"])]);
  const c = createProductionEmitter({ publish: bus.publish, actor: "Chike", hub: "kano", policy: certified });
  ok("certified machine admitted", c.produceComponent({ component: "X2", machine: "migWelder" }).machine === "migWelder");
  throws("uncertified machine refused", () => c.produceComponent({ component: "X3", machine: "rogueLathe" }));

  const hubs = createPolicy([requireKnownHub(["lagos", "kano"])]);
  const h = createProductionEmitter({ publish: bus.publish, actor: "Chike", hub: "atlantis", policy: hubs });
  throws("unknown hub refused", () => h.produceComponent({ component: "X4" }));

  try { anon.produceComponent({ component: "X5" }); }
  catch (err) { ok("refusal is a PolicyViolation naming the rule",
    err instanceof PolicyViolation && err.rule === "requireActor"); }
}

// --- provenance: supplied timestamps must survive ---
{
  const bus = makeBus();
  const backdated = Date.now() - 3600_000;
  const p = createProductionEmitter({ publish: bus.publish, actor: "a", hub: "aba" });
  ok("a supplied `at` is preserved for replay/offline flush",
     p.produceComponent({ component: "Q1", at: backdated }).at === backdated);
}

// --- runtime compatibility: the metrics must actually move ---
{
  const bus = makeBus();
  const p = createProductionEmitter({ publish: bus.publish, actor: "Adaeze", hub: "warri" });
  p.produceComponent({ component: "C1", machine: "m1" });
  p.produceComponent({ component: "C2", machine: "m2" });
  const log = bus.sent;
  ok("buildRuntime would count people via e.human", new Set(log.map((e) => e.human)).size === 1);
  ok("buildRuntime would count components via e.component", new Set(log.map((e) => e.component)).size === 2);
  ok("deriveRecommendations would find e.text", typeof log[0].text === "string");
}

console.log(`\n${pass}/${pass + fail} assertions passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
