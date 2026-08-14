// ============================================================
// FORGE OS — ARTEFACT PARTICIPATION RELATION  (E9.1)
//
// One question: can RESPONSIBILITY and PARTICIPATION be two different
// relationships to the same artefact?
//
// E9 was blocked because they were the same field. Every event carrying
// `organisation` was read as a responsibility claim, so a university naming its
// own institution on a legitimate CAD contribution was recorded as:
//
//   "HUB-E9-001 is already the responsibility of "SOLC" and cannot be claimed
//    by "UNI-KADUNA-001""
//
// A false conflict. The invariant was correct; the representation was too narrow.
//
// THE SIGNAL IS EXPLICIT AND NARROW. Only the `knowledge.*` family counts as a
// contribution: those three types mean someone produced, reviewed or translated
// knowledge, and a `component` field states which artefact it concerns. Nothing
// is inferred. "Any event mentioning a component" is deliberately NOT swept in —
// production and inspection are PERFORMANCE and already live in history[].by.
//
// Run: node test/participation.consumer.mjs
// ============================================================

import { project } from "../src/os/projections.js";
import Events, { EVENT_TYPES, validateEvent } from "../src/os/events.js";
import { PROVENANCE, SEED_ORGANISATIONS } from "../src/os/network.js";
import { pilotOrganisationById, assignmentFor, provenanceOfOrganisation } from "../src/os/pilot.js";
import { createProductionEmitter } from "../src/domains/production/emitters.js";
import { createInspectionEmitter } from "../src/domains/inspection/emitters.js";
import { createEngineeringEmitter } from "../src/domains/engineering/emitters.js";
import { createPolicy, requireActor, requireCapability, PolicyViolation } from "../src/os/policy.js";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log(`  ok   ${n}`); } else { fail++; console.log(`  FAIL ${n}`); } };

const SPEC = "FTT-HB-001";
const COMP = "HUB-E9-001";
const UNI  = "UNI-KADUNA-001";
const SOLC = pilotOrganisationById("SOLC");
const A    = assignmentFor("SOLC");
const MISSIONS = [{ id: "FORGE-HUB", title: "200 wheel hubs", target: 200, specification: SPEC }];

const bus = () => {
  const log = [];
  return { log, publish: (e) => { log.unshift(e); return e; },
           view: () => project(log, MISSIONS) };
};

/** SOLC manufactures. Performance — establishes responsibility. */
const produce = (b, person = "Adaeze Okoro") =>
  createProductionEmitter({ publish: b.publish, actor: person, hub: A.hub, policy: requireActor,
                            correlationId: `pilot-SOLC-${COMP}` })
    .produceComponent({ component: COMP, specification: SPEC, mission: A.mission,
                        organisation: SOLC.id });

/** A knowledge contribution naming the component. Participation — no authority. */
const contribute = (b, { person, organisation = undefined, type = EVENT_TYPES.KNOWLEDGE.PUBLISHED,
                         knowledge, summary }) => {
  const e = Events.knowledge({
    knowledge, component: COMP, specification: SPEC, type,
    person, human: person, ...(organisation === undefined ? {} : { organisation }),
    summary,
  });
  b.publish(e);
  return e;
};

const compOf = (b) => b.view().components[COMP];

console.log("\nFORGE OS — artefact participation relation (E9.1)\n");

// ============================================================
console.log("A — ONE CONTRIBUTOR");
// ============================================================
{
  const b = bus();
  produce(b);
  ok("A. SOLC is responsible after manufacturing", compOf(b).organisation === "SOLC");
  ok("A. no contributions yet — production is performance, not contribution",
     compOf(b).contributions.length === 0);
  ok("A. the performer is in history instead",
     compOf(b).history.some((h) => h.by === "Adaeze Okoro"));

  const e = contribute(b, { person: "Student A", organisation: UNI,
                            knowledge: `cad-${COMP}`, summary: "CAD revision for hub bore" });
  ok("A. the contribution event validates", validateEvent(e).valid === true);
  const c = compOf(b);
  ok("A. one contribution is recorded", c.contributions.length === 1);
  ok("A. it names the person", c.contributions[0].person === "Student A");
  ok("A. it names the contributor's own organisation", c.contributions[0].organisation === UNI);
  ok("A. it carries the event id", c.contributions[0].eventId === e.eventId);
  ok("A. it carries a timestamp", typeof c.contributions[0].at === "number");
  ok("A. it names the relationship type", c.contributions[0].type === EVENT_TYPES.KNOWLEDGE.PUBLISHED);
}

// ============================================================
console.log("\nB + C — MULTIPLE CONTRIBUTORS, MULTIPLE ORGANISATIONS");
// ============================================================
{
  const b = bus();
  produce(b);
  contribute(b, { person: "Student A",     organisation: UNI,      knowledge: `cad-${COMP}`,   summary: "CAD revision" });
  contribute(b, { person: "Adaeze Okoro",  organisation: SOLC.id,  knowledge: `notes-${COMP}`, summary: "Fabrication notes" });
  contribute(b, { person: "NYSC Member B", organisation: undefined, knowledge: `meas-${COMP}`, summary: "Bore measured" });

  const c = compOf(b);
  ok("B. three contributions coexist", c.contributions.length === 3);
  ok("B. none replaced another",
     c.contributions.map((x) => x.person).join() === "Student A,Adaeze Okoro,NYSC Member B");
  ok("C. two different organisations appear as contributors",
     new Set(c.contributions.map((x) => x.organisation).filter(Boolean)).size === 2);
  ok("C. the university appears", c.contributions.some((x) => x.organisation === UNI));
  ok("C. SOLC appears as a CONTRIBUTOR as well as responsible",
     c.contributions.some((x) => x.organisation === "SOLC"));
  ok("C. a contributor with no organisation stays null — none is fabricated",
     c.contributions.find((x) => x.person === "NYSC Member B").organisation === null);
  ok("C. the relation is many-valued, not a single contributor field",
     Array.isArray(c.contributions));

  // The same person may be both performer and contributor — different relations.
  ok("C. Adaeze is a performer in history", c.history.some((h) => h.by === "Adaeze Okoro"));
  ok("C. and separately a contributor", c.contributions.some((x) => x.person === "Adaeze Okoro"));
}

// ============================================================
console.log("\nD + E + K — RESPONSIBILITY IS UNTOUCHED BY PARTICIPATION");
// ============================================================
{
  const b = bus();
  produce(b);
  contribute(b, { person: "Student A", organisation: UNI, knowledge: `cad-${COMP}`, summary: "CAD" });
  contribute(b, { person: "Prof Z", organisation: UNI, knowledge: `sup-${COMP}`, summary: "Supervision note" });

  const v = b.view(), c = v.components[COMP];
  ok("D. component.organisation is still SOLC", c.organisation === "SOLC");
  ok("E. the university did NOT replace SOLC", c.organisation !== UNI);
  ok("E. ZERO anomalies — the false conflict is gone", v.anomalies.length === 0);
  ok("E. no responsibility anomaly of any kind",
     !v.anomalies.some((a) => /responsibility/.test(a.message)));
  ok("K. contribution created no second responsible organisation",
     typeof c.organisation === "string");
  ok("K. participation and responsibility are separate fields",
     c.organisation === "SOLC" && c.contributions.every((x) => x.organisation === UNI));

  // The REAL conflict must still be detected — E7 depended on it.
  const b2 = bus();
  produce(b2);
  createInspectionEmitter({ publish: b2.publish, actor: "Someone Else", hub: "ilorin" })
    .pass({ component: COMP, specification: SPEC, organisation: "DEMO-ORG-002" });
  ok("E. a genuine responsibility claim by another org STILL anomalies",
     b2.view().anomalies.some((a) => a.attempted === "DEMO-ORG-002" && a.held === "SOLC"));
  ok("E. and responsibility is still not reassigned",
     b2.view().components[COMP].organisation === "SOLC");
}

// ============================================================
console.log("\nF — DIASPORA REVIEW REGRESSION  (which interpretation the contract supports)");
// ============================================================
{
  const b = bus();
  produce(b);
  const adv = contribute(b, { person: "Dr. Chinedu Okafor", type: EVENT_TYPES.KNOWLEDGE.REVIEWED,
                              knowledge: `advice-${COMP}`,
                              summary: "Increase hub wall thickness to 6mm" });
  const c = compOf(b);

  // THE INTERPRETATION, STATED: knowledge.reviewed IS explicitly a knowledge act
  // by a named party, and E8 already gates it on `advisory.offer`. It is therefore
  // classified as participation. It remains NOT an approval and NOT performance.
  ok("F. the diaspora review IS classified as participation",
     c.contributions.some((x) => x.person === "Dr. Chinedu Okafor"));
  ok("F. it is recorded as knowledge.reviewed, not as an approval",
     c.contributions.find((x) => x.person === "Dr. Chinedu Okafor").type
       === EVENT_TYPES.KNOWLEDGE.REVIEWED);
  ok("F. the adviser has no organisation and none was invented",
     c.contributions.find((x) => x.person === "Dr. Chinedu Okafor").organisation === null);
  ok("F. E9 regression: component state unchanged by advice", c.state === "manufacturing");
  ok("F. E9 regression: responsibility unchanged by advice", c.organisation === "SOLC");
  ok("F. the adviser is NOT in history — advice is not a transition",
     !c.history.some((h) => h.by === "Dr. Chinedu Okafor"));
  ok("F. no anomaly", b.view().anomalies.length === 0);
  ok("F. the advice is still visible in the feed",
     b.view().feed.some((f) => f.subject === COMP && f.actor === "Dr. Chinedu Okafor"));
  void adv;
}

// ============================================================
console.log("\nG + J — APPROVAL REGRESSION: approval is not participation");
// ============================================================
{
  const b = bus();
  produce(b);
  const eng = { person: "Folake Adeyemi", role: "engineer", verification: "verified" };
  const emitter = createEngineeringEmitter({
    publish: b.publish, actor: eng.person,
    policy: createPolicy([requireActor, requireCapability(eng)]),
  });
  emitter.draftSpecification({ specification: SPEC, transition: "submitForReview" });
  emitter.approveSpecification({ specification: SPEC, transition: "approve" });

  const v = b.view(), c = v.components[COMP];
  ok("G. the specification reached approved", v.specifications[SPEC].state === "approved");
  ok("G. approval did NOT change component.organisation", c.organisation === "SOLC");
  ok("G. approval did NOT become a component contribution",
     !c.contributions.some((x) => x.person === "Folake Adeyemi"));
  ok("G. because the approval event names a specification, not a component",
     c.contributions.length === 0);
  ok("G. approval did not change component state", c.state === "manufacturing");
  ok("J. a contribution never creates an approval",
     (() => { const b2 = bus(); produce(b2);
       contribute(b2, { person: "Student A", organisation: UNI, knowledge: "k", summary: "s" });
       return b2.view().specifications[SPEC] === undefined; })());
  ok("J. and never advances the specification state",
     (() => { const b2 = bus();
       contribute(b2, { person: "Student A", organisation: UNI, knowledge: "k", summary: "s" });
       const s = b2.view().specifications[SPEC];
       return s === undefined || s.state === "draft"; })());
}

// ============================================================
console.log("\nI — CONTRIBUTION DOES NOT MUTATE STATE");
// ============================================================
{
  const b = bus();
  contribute(b, { person: "Student A", organisation: UNI, knowledge: "k1", summary: "before production" });
  let c = compOf(b);
  ok("I. a contribution alone creates the component at the graph's initial state",
     c.state === "planned");
  ok("I. with no responsibility, because knowledge does not confer it",
     c.organisation === null);
  ok("I. the contribution is still recorded", c.contributions.length === 1);
  ok("I. no transition was written", c.history.length === 0);

  produce(b);
  c = compOf(b);
  ok("I. later production establishes responsibility normally", c.organisation === "SOLC");
  ok("I. and advances the state", c.state === "manufacturing");
  ok("I. the earlier contribution survived", c.contributions.length === 1);
}

// ============================================================
console.log("\nL — REPLAY / IDEMPOTENCY BY EVENT IDENTITY");
// ============================================================
{
  const b = bus();
  produce(b);
  const e = contribute(b, { person: "Student A", organisation: UNI, knowledge: "k", summary: "CAD" });
  ok("L. one contribution after one event", compOf(b).contributions.length === 1);

  // The same event, published again — a replay, not a new fact.
  b.publish(e);
  ok("L. replaying the identical event does NOT duplicate the contribution",
     compOf(b).contributions.length === 1);
  ok("L. deduplication is by eventId", compOf(b).contributions[0].eventId === e.eventId);

  // A genuinely different event by the same person IS a second contribution.
  contribute(b, { person: "Student A", organisation: UNI, knowledge: "k2", summary: "second CAD" });
  ok("L. a distinct event from the same person IS a second contribution",
     compOf(b).contributions.length === 2);
  ok("L. the fold is deterministic — projecting the same log twice agrees",
     JSON.stringify(project(b.log, MISSIONS).components[COMP]) ===
     JSON.stringify(project(b.log, MISSIONS).components[COMP]));
}

// ============================================================
console.log("\nM + N + O — PROVENANCE AND NO FABRICATION");
// ============================================================
{
  const b = bus();
  produce(b);
  contribute(b, { person: "Student A", organisation: UNI, knowledge: "k", summary: "CAD" });
  contribute(b, { person: "Dr. Chinedu Okafor", type: EVENT_TYPES.KNOWLEDGE.REVIEWED,
                  knowledge: "a", summary: "advice" });
  const c = compOf(b);

  ok("M. the responsible organisation still resolves to PILOT provenance",
     provenanceOfOrganisation(c.organisation, SEED_ORGANISATIONS) === PROVENANCE.PILOT);
  ok("M. an unregistered contributing organisation resolves to null, not SEED and not REAL",
     provenanceOfOrganisation(UNI, SEED_ORGANISATIONS) === null);
  ok("M. contributing does not make a university a seed identity",
     provenanceOfOrganisation(UNI, SEED_ORGANISATIONS) !== PROVENANCE.SEED);
  ok("N. no organisation was fabricated for the adviser",
     c.contributions.find((x) => x.person === "Dr. Chinedu Okafor").organisation === null);
  ok("N. no organisation was fabricated for the component",
     c.organisation === "SOLC");
  ok("O. no person was fabricated — every contribution names its own person",
     c.contributions.every((x) => typeof x.person === "string" && x.person.length > 0));
  ok("O. a contribution with no person records null rather than a guess",
     (() => { const b2 = bus();
       b2.publish(Events.knowledge({ knowledge: "anon", component: COMP,
         type: EVENT_TYPES.KNOWLEDGE.PUBLISHED, summary: "no author" }));
       return b2.view().components[COMP].contributions[0].person === null; })());
  ok("O. the fold never derives a person from an organisation",
     (() => { const b2 = bus();
       b2.publish(Events.knowledge({ knowledge: "orgonly", component: COMP, organisation: UNI,
         type: EVENT_TYPES.KNOWLEDGE.PUBLISHED, summary: "org only" }));
       const x = b2.view().components[COMP].contributions[0];
       return x.person === null && x.organisation === UNI; })());
}

// ============================================================
console.log("\nTHE FULL PICTURE — one artefact, four relationships");
// ============================================================
{
  const b = bus();
  produce(b);                                                                    // performer + responsible
  contribute(b, { person: "Student A", organisation: UNI, knowledge: "cad", summary: "CAD revision" });
  contribute(b, { person: "NYSC Member B", knowledge: "meas", summary: "Bore measured at 45.02mm" });
  contribute(b, { person: "Dr. Chinedu Okafor", type: EVENT_TYPES.KNOWLEDGE.REVIEWED,
                  knowledge: "adv", summary: "Increase wall thickness" });        // adviser
  const eng = { person: "Folake Adeyemi", role: "engineer", verification: "verified" };
  const em = createEngineeringEmitter({ publish: b.publish, actor: eng.person,
    policy: createPolicy([requireActor, requireCapability(eng)]) });
  em.draftSpecification({ specification: SPEC, transition: "submitForReview" });
  em.approveSpecification({ specification: SPEC, transition: "approve" });        // approver

  const v = b.view(), c = v.components[COMP];
  ok("responsible organisation is SOLC and only SOLC", c.organisation === "SOLC");
  ok("performer is the operator, in history", c.history.some((h) => h.by === "Adaeze Okoro"));
  ok("three contributors are recorded", c.contributions.length === 3);
  ok("the approver is NOT a component contributor",
     !c.contributions.some((x) => x.person === "Folake Adeyemi"));
  ok("the approver IS in the specification history",
     v.specifications[SPEC].history.some((h) => h.transition === "approve" && h.by === "Folake Adeyemi"));
  ok("no relationship collapsed into another",
     c.organisation === "SOLC" &&
     c.contributions.length === 3 &&
     c.history.length === 1 &&
     v.specifications[SPEC].state === "approved");
  ok("zero anomalies across the whole picture", v.anomalies.length === 0);
}

// ============================================================
console.log("\nP + Q + R — E6 / E7 / E8 REGRESSION");
// ============================================================
{
  const b = bus();
  const common = { publish: b.publish, actor: "Adaeze Okoro", hub: A.hub,
                   policy: createPolicy([requireActor,
                     requireCapability({ person: "Adaeze Okoro", role: "sme", verification: "unverified" })]),
                   correlationId: `pilot-SOLC-${COMP}` };
  const prod = createProductionEmitter(common), insp = createInspectionEmitter(common);
  let threw = null;
  try {
    prod.produceComponent({ component: COMP, specification: SPEC, mission: A.mission, organisation: SOLC.id });
    insp.fail({ component: COMP, specification: SPEC, mission: A.mission, organisation: SOLC.id });
    insp.rework({ component: COMP, specification: SPEC, mission: A.mission, organisation: SOLC.id });
    insp.pass({ component: COMP, specification: SPEC, mission: A.mission, organisation: SOLC.id });
  } catch (e) { threw = e; }

  const c = compOf(b);
  ok("R. an unverified sme is still not blocked from manufacturing", threw === null);
  ok("Q. the full E7 recovery path still reaches assembly", c.state === "assembly");
  ok("Q. the transition chain is intact",
     c.history.map((h) => h.transition).join() ===
     "release,submitForInspection,fail,submitForInspection,pass");
  ok("P. responsibility is still SOLC", c.organisation === "SOLC");
  ok("P. mission progress still moves", b.view().missions[0].accepted === 1);
  ok("P. contributions stayed empty — no lifecycle event was misread as a contribution",
     c.contributions.length === 0);

  // E8: the refusals still refuse, and produce nothing.
  const b2 = bus();
  const before = b2.log.length;
  let refused = null;
  try {
    createEngineeringEmitter({ publish: b2.publish, actor: "Student A",
      policy: createPolicy([requireActor,
        requireCapability({ person: "Student A", role: "nysc_volunteer", verification: "unverified" })]) })
      .approveSpecification({ specification: SPEC, transition: "approve" });
  } catch (e) { refused = e; }
  ok("R. a contributor cannot approve an engineering specification",
     refused instanceof PolicyViolation);
  ok("R. the refusal names the missing capability", /engineering\.approve/.test(refused.message));
  ok("R. and produced zero events", b2.log.length === before);
}

console.log(`\n${pass}/${pass + fail} assertions passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
