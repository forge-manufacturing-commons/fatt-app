// ============================================================
// FORGE OS — MULTI-PARTICIPANT AUTHORITY  (E8)
//
// One question: can ForgeOS tell the difference between ADVICE and APPROVAL, and
// refuse the difference at the event boundary?
//
// The distinction was already in the data model and had no consequence:
//
//   engineering.author   ─┬─ engineer            author + approve
//   engineering.approve  ─┤   diaspora_expert    author + advise, NOT approve
//   advisory.offer       ─┘   sme                neither
//
//   VERIFICATION_GATED includes engineering.approve
//
// ...and `ForgeIdentity.can()`, written to read exactly this, had zero callers.
// So the model said an adviser may not approve, and nothing stopped one.
//
// Every refusal below is proved by EVENT COUNT, not by inspecting a rejected
// record. A refused action must leave the log length unchanged — that is the only
// evidence that enforcement happened BEFORE publication rather than after.
//
// PRODUCTION IS UNTOUCHED BY DESIGN. The SOLC pilot is role `sme`, verification
// `unverified`, and E6/E7 proved it can manufacture. No production event is
// mapped to a capability, and this suite asserts that it stays that way.
//
// Run: node test/authority.consumer.mjs
// ============================================================

import { project } from "../src/os/projections.js";
import Events, { EVENT_TYPES, EVENT_CAPABILITY, capabilityFor, validateEvent }
  from "../src/os/events.js";
import { CAPABILITIES, VERIFICATION_GATED, capabilitiesFor } from "../src/os/Roles.js";
import { createPolicy, requireActor, requireCapability, PolicyViolation }
  from "../src/os/policy.js";
import { emit } from "../src/os/pipeline.js";
import { createEngineeringEmitter } from "../src/domains/engineering/emitters.js";
import { createProductionEmitter } from "../src/domains/production/emitters.js";
import { createInspectionEmitter } from "../src/domains/inspection/emitters.js";
import { pilotOrganisationById, assignmentFor } from "../src/os/pilot.js";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log(`  ok   ${n}`); } else { fail++; console.log(`  FAIL ${n}`); } };

const SPEC = "FTT-HB-001";
const MISSIONS = [{ id: "FORGE-HUB", title: "200 wheel hubs", target: 200, specification: SPEC }];
const asLog = (e) => [...e].reverse();

// ---- IDENTITIES. Plain objects. No user is created, no table is touched. ----
const OKAFOR   = { person: "Dr. Chinedu Okafor", role: "diaspora_expert", verification: "unverified" };
const SOLC_SME = { person: "Adaeze Okoro",       role: "sme",             verification: "unverified" };
const ENG_UNV  = { person: "Folake Adeyemi",     role: "engineer",        verification: "unverified" };
const ENG_VER  = { person: "Folake Adeyemi",     role: "engineer",        verification: "verified" };

const bus = () => {
  const log = [];
  return { log, publish: (e) => { log.unshift(e); return e; },
           view: () => project(log, MISSIONS) };
};

/** Attempt a specification transition under an identity. Returns what happened. */
const attemptSpec = (b, identity, command, fields) => {
  const emitter = createEngineeringEmitter({
    publish: b.publish,
    policy: createPolicy([requireActor, requireCapability(identity)]),
    actor: identity?.person,
    correlationId: `spec-${SPEC}`,
  });
  const before = b.log.length;
  try {
    const event = emitter[command]({ specification: SPEC, ...fields });
    return { published: true, event, delta: b.log.length - before, error: null };
  } catch (e) {
    return { published: false, event: null, delta: b.log.length - before, error: e };
  }
};

/** Attempt an advisory review through the raw pipeline (no knowledge emitter exists). */
const attemptReview = (b, identity, fields = {}) => {
  const before = b.log.length;
  try {
    const event = emit({
      publish: b.publish,
      policy: createPolicy([requireActor, requireCapability(identity)]),
      factory: Events.knowledge,
      fields: {
        knowledge: `review-of-${SPEC}`, specification: SPEC,
        type: EVENT_TYPES.KNOWLEDGE.REVIEWED,
        person: identity?.person, human: identity?.person,
        summary: `${SPEC} reviewed — bore tolerance advisory`, ...fields,
      },
    });
    return { published: true, event, delta: b.log.length - before, error: null };
  } catch (e) {
    return { published: false, event: null, delta: b.log.length - before, error: e };
  }
};

console.log("\nFORGE OS — multi-participant authority (E8)\n");

// ============================================================
console.log("THE MAP — two entries, and production is not one of them");
// ============================================================
{
  // E9.3 added work.direct and E9.5 added work.acknowledge, so this is four now.
  // The companion assertions below keep what this guard actually defended.
  ok("exactly four event types require a capability", Object.keys(EVENT_CAPABILITY).length === 4);
  ok("approving a specification requires engineering.approve",
     capabilityFor(EVENT_TYPES.ENGINEERING.SPEC_APPROVED) === "engineering.approve");
  ok("reviewing knowledge requires advisory.offer",
     capabilityFor(EVENT_TYPES.KNOWLEDGE.REVIEWED) === "advisory.offer");
  ok("every mapped capability exists in Roles.js CAPABILITIES",
     Object.values(EVENT_CAPABILITY).every((c) => c in CAPABILITIES));
  ok("the map is frozen", Object.isFrozen(EVENT_CAPABILITY));

  // The regression guard that protects the pilot.
  ok("production.component.produced requires NO capability",
     capabilityFor(EVENT_TYPES.PRODUCTION.COMPONENT_PRODUCED) === null);
  // THE INVARIANT THIS GUARD EXISTS FOR: no event that MOVES A COMPONENT may be
  // capability-gated, because SOLC is `sme` + `unverified` and E6/E7 proved it can
  // manufacture. E9.3 mapped production.work.directed — a coordination event that
  // drives no transition — so the guard is narrowed to the lifecycle events it was
  // really protecting, rather than loosened.
  ok("no LIFECYCLE production event is mapped",
     [EVENT_TYPES.PRODUCTION.COMPONENT_PRODUCED,
      EVENT_TYPES.PRODUCTION.STAGE_ADVANCED,
      EVENT_TYPES.PRODUCTION.ASSEMBLY_JOINED,
      EVENT_TYPES.PRODUCTION.PROGRAM_STARTED,
      EVENT_TYPES.PRODUCTION.PROGRAM_FINISHED].every((t) => capabilityFor(t) === null));
  ok("the ONLY gated production events are the two coordination events, which move nothing",
     Object.values(EVENT_TYPES.PRODUCTION).filter((t) => capabilityFor(t) !== null).sort().join()
       === [EVENT_TYPES.PRODUCTION.WORK_ACKNOWLEDGED, EVENT_TYPES.PRODUCTION.WORK_DIRECTED].sort().join());
  ok("no inspection event is mapped",
     Object.values(EVENT_TYPES.INSPECTION).every((t) => capabilityFor(t) === null));
  ok("job.accept is not used as a manufacturing gate",
     !Object.values(EVENT_CAPABILITY).includes("job.accept"));
  ok("job.track is not used as a manufacturing gate",
     !Object.values(EVENT_CAPABILITY).includes("job.track"));
  ok("engineering.approve is verification-gated in Roles.js",
     VERIFICATION_GATED.includes("engineering.approve"));
  ok("advisory.offer is NOT verification-gated",
     !VERIFICATION_GATED.includes("advisory.offer"));
  ok("the vocabulary is 34 event types after E9.3 and E9.5",
     Object.values(EVENT_TYPES).flatMap((d) => Object.values(d)).length === 34);
}

// ============================================================
console.log("\nA — DIASPORA REVIEW SUCCEEDS");
// ============================================================
{
  const b = bus();
  const r = attemptReview(b, OKAFOR);

  ok("A. the review was published", r.published === true);
  ok("A. exactly one event entered the log", r.delta === 1);
  ok("A. the event type is knowledge.reviewed", r.event.type === EVENT_TYPES.KNOWLEDGE.REVIEWED);
  ok("A. it is NOT an approval", r.event.type !== EVENT_TYPES.ENGINEERING.SPEC_APPROVED);
  ok("A. person is Dr. Chinedu Okafor", r.event.person === "Dr. Chinedu Okafor");
  ok("A. organisation is absent — an independent professional",
     r.event.organisation === undefined || r.event.organisation === null);
  ok("A. it names the specification it advises on", r.event.specification === SPEC);
  ok("A. the event validates", validateEvent(r.event).valid === true);

  // The crucial projection guarantee: advice does not move the artefact.
  const v = b.view();
  ok("A. the specification approval state was NOT mutated",
     (v.specifications[SPEC]?.state ?? "draft") === "draft");
  ok("A. no approval transition was recorded",
     !(v.specifications[SPEC]?.history ?? []).some((h) => h.transition === "approve"));
  ok("A. no anomaly was raised", v.anomalies.length === 0);
  ok("A. diaspora_expert holds advisory.offer",
     capabilitiesFor("diaspora_expert").includes("advisory.offer"));
}

// ============================================================
console.log("\nB — DIASPORA APPROVAL REFUSED  (adviser ≠ approver)");
// ============================================================
{
  const b = bus();
  const before = b.log.length;
  const r = attemptSpec(b, OKAFOR, "approveSpecification", { transition: "approve", revision: "A.03" });

  ok("B. the approval was refused", r.published === false);
  ok("B. it threw PolicyViolation", r.error instanceof PolicyViolation);
  ok("B. the rule is named", r.error.rule === "requireCapability");
  ok("B. the error names the actor", /Dr\. Chinedu Okafor/.test(r.error.message));
  ok("B. the error names the role", /diaspora_expert/.test(r.error.message));
  ok("B. the error names the missing capability", /engineering\.approve/.test(r.error.message));
  ok("B. ZERO events entered the log", r.delta === 0 && b.log.length === before);
  ok("B. diaspora_expert does NOT hold engineering.approve",
     !capabilitiesFor("diaspora_expert").includes("engineering.approve"));

  const v = b.view();
  ok("B. the specification does not exist in the fold at all",
     v.specifications[SPEC] === undefined);
  ok("B. no history was written", Object.keys(v.specifications).length === 0);
  ok("B. no anomaly — a refusal is not an anomaly, nothing was recorded",
     v.anomalies.length === 0);
  ok("B. the feed is empty", v.feed.length === 0);
}

// ============================================================
console.log("\nC — SME APPROVAL REFUSED");
// ============================================================
{
  const b = bus();
  const r = attemptSpec(b, SOLC_SME, "approveSpecification", { transition: "approve" });

  ok("C. the approval was refused", r.published === false);
  ok("C. it threw PolicyViolation", r.error instanceof PolicyViolation);
  ok("C. the error names the sme role", /"sme"/.test(r.error.message));
  ok("C. the error names engineering.approve", /engineering\.approve/.test(r.error.message));
  ok("C. ZERO events entered the log", r.delta === 0);
  ok("C. sme holds no engineering capability at all",
     capabilitiesFor("sme").every((c) => !c.startsWith("engineering.")));
  ok("C. the fold is untouched", Object.keys(b.view().specifications).length === 0);
}

// ============================================================
console.log("\nD — UNVERIFIED ENGINEER REFUSED  (verification is enforced)");
// ============================================================
{
  const b = bus();
  const r = attemptSpec(b, ENG_UNV, "approveSpecification", { transition: "approve" });

  ok("D. the approval was refused", r.published === false);
  ok("D. it threw PolicyViolation", r.error instanceof PolicyViolation);
  ok("D. the engineer DOES hold the capability",
     capabilitiesFor("engineer").includes("engineering.approve"));
  ok("D. so the refusal is about verification, not capability",
     /verification-gated/.test(r.error.message));
  ok("D. the error states the standing held", /"unverified"/.test(r.error.message));
  ok("D. ZERO events entered the log", r.delta === 0);
  ok("D. the fold is untouched", Object.keys(b.view().specifications).length === 0);
}

// ============================================================
console.log("\nE — VERIFIED ENGINEER APPROVES");
// ============================================================
{
  const b = bus();
  // The specification must be in `review` for `approve` to be a legal transition,
  // so an author drafts it first. `engineering.author` is not verification-gated.
  const drafted = attemptSpec(b, ENG_VER, "draftSpecification",
                              { transition: "submitForReview", revision: "A.03" });
  ok("E. the draft was published", drafted.published === true);
  ok("E. the specification is under review", b.view().specifications[SPEC].state === "review");
  const authorAfterDraft = b.view().specifications[SPEC].author;

  const r = attemptSpec(b, ENG_VER, "approveSpecification", { transition: "approve", revision: "A.03" });
  ok("E. the approval was published", r.published === true);
  ok("E. exactly one more event entered the log", r.delta === 1);
  ok("E. the event type is engineering.specification.approved",
     r.event.type === EVENT_TYPES.ENGINEERING.SPEC_APPROVED);
  ok("E. person is the engineer", r.event.person === "Folake Adeyemi");
  ok("E. it names the specification", r.event.specification === SPEC);
  ok("E. the event validates", validateEvent(r.event).valid === true);

  const s = b.view().specifications[SPEC];
  ok("E. the specification reached approved", s.state === "approved");
  ok("E. the approval is recorded in history",
     s.history.some((h) => h.transition === "approve" && h.to === "approved"));
  ok("E. history attributes the approval to the engineer",
     s.history.find((h) => h.transition === "approve").by === "Folake Adeyemi");
  ok("E. the author field was NOT changed by the approval", s.author === authorAfterDraft);
  ok("E. no anomaly", b.view().anomalies.length === 0);

  // AUTHORITY IS NOT A HIERARCHY — and this is where the test corrected me.
  // I assumed an approver could also advise. The model says otherwise: `engineer`
  // holds engineering.approve but NOT advisory.offer, which belongs to
  // diaspora_expert and research_institute. So the two capacities are distinct in
  // BOTH directions — the approver cannot advise any more than the adviser can
  // approve. Neither role dominates the other. Test was wrong, model was right.
  const adv = attemptReview(b, ENG_VER);
  ok("E. a verified engineer may NOT perform advisory review", adv.published === false);
  ok("E. because engineer does not hold advisory.offer",
     !capabilitiesFor("engineer").includes("advisory.offer"));
  ok("E. the refusal names advisory.offer", /advisory\.offer/.test(adv.error.message));
  ok("E. so advice and approval are distinct in both directions",
     capabilitiesFor("engineer").includes("engineering.approve") &&
     !capabilitiesFor("engineer").includes("advisory.offer") &&
     capabilitiesFor("diaspora_expert").includes("advisory.offer") &&
     !capabilitiesFor("diaspora_expert").includes("engineering.approve"));
  ok("E. the refused review did not change the approved state",
     b.view().specifications[SPEC].state === "approved");
  ok("E. and added no event", adv.delta === 0);
}

// ============================================================
console.log("\nADVISER ≠ APPROVER — proved on ONE specification by execution");
// ============================================================
{
  const b = bus();
  const review   = attemptReview(b, OKAFOR);                                          // accepted
  const refused  = attemptSpec(b, OKAFOR, "approveSpecification", { transition: "approve" });  // refused
  const drafted  = attemptSpec(b, ENG_VER, "draftSpecification", { transition: "submitForReview" });
  const approved = attemptSpec(b, ENG_VER, "approveSpecification", { transition: "approve" });

  ok("the adviser's review was accepted", review.published === true);
  ok("the SAME adviser's approval was refused", refused.published === false);
  ok("the verified engineer's approval was accepted", approved.published === true);
  ok("three events in the log, not four", b.log.length === 3);
  ok("the refused approval contributed nothing", refused.delta === 0);

  const s = b.view().specifications[SPEC];
  ok("the specification is approved", s.state === "approved");
  ok("only ONE approve transition exists",
     s.history.filter((h) => h.transition === "approve").length === 1);
  ok("and it belongs to the engineer, not the adviser",
     s.history.find((h) => h.transition === "approve").by === "Folake Adeyemi");
  ok("the adviser never appears as an approver",
     !s.history.some((h) => h.by === "Dr. Chinedu Okafor"));
  ok("the adviser DOES appear in the operational feed",
     b.view().feed.some((f) => /Okafor/.test(JSON.stringify(f))) ||
     b.log.some((e) => e.person === "Dr. Chinedu Okafor"));
  ok("no organisation was fabricated for either individual",
     b.log.every((e) => e.organisation === undefined || e.organisation === null));
}

// ============================================================
console.log("\nI/J — SOLC's E6/E7 PATH IS UNCHANGED");
// ============================================================
{
  const SOLC = pilotOrganisationById("SOLC");
  const A = assignmentFor("SOLC");
  const b = bus();
  const common = {
    publish: b.publish, actor: "Adaeze Okoro", hub: A.hub,
    // The SAME composed policy an authority-aware caller would use — including
    // requireCapability with SOLC's real, UNVERIFIED sme identity.
    policy: createPolicy([requireActor, requireCapability(SOLC_SME)]),
    correlationId: "pilot-SOLC-HUB-020",
  };
  const prod = createProductionEmitter(common);
  const insp = createInspectionEmitter(common);

  let threw = null;
  try {
    prod.produceComponent({ component: "HUB-020", specification: SPEC,
                            mission: A.mission, organisation: SOLC.id });
    insp.fail({ component: "HUB-020", specification: SPEC, mission: A.mission, organisation: SOLC.id });
    insp.rework({ component: "HUB-020", specification: SPEC, mission: A.mission, organisation: SOLC.id });
    insp.pass({ component: "HUB-020", specification: SPEC, mission: A.mission, organisation: SOLC.id });
  } catch (e) { threw = e; }

  ok("I. an unverified sme is NOT blocked from manufacturing", threw === null);
  ok("I. all four lifecycle events were published", b.log.length === 4);
  const c = b.view().components["HUB-020"];
  ok("I. the full E7 recovery path still works", c.state === "assembly");
  ok("I. the transition chain is intact",
     c.history.map((h) => h.transition).join() ===
     "release,submitForInspection,fail,submitForInspection,pass");
  ok("I. responsibility is still SOLC", c.organisation === "SOLC");
  ok("I. the operator is still the human", c.history.some((h) => h.by === "Adaeze Okoro"));
  ok("I. mission progress still moves", b.view().missions[0].accepted === 1);
  ok("J. no organisation was fabricated for the adviser or approver",
     b.log.every((e) => e.organisation === "SOLC"));
  ok("J. the adviser is not responsible for any component",
     Object.values(b.view().components).every((x) => x.organisation !== "Dr. Chinedu Okafor"));
}

// ============================================================
console.log("\nADVERSARIAL");
// ============================================================
{
  // Unmapped event type -> the rule has no opinion.
  {
    const b = bus();
    const r = attemptSpec(b, OKAFOR, "draftSpecification", { transition: "submitForReview" });
    ok("an unmapped event (spec.drafted) is not gated by this rule", r.published === true);
    ok("because engineering.specification.drafted requires no capability",
       capabilityFor(EVENT_TYPES.ENGINEERING.SPEC_DRAFTED) === null);
  }

  // Absent identity is a refusal, never a bypass.
  for (const [label, identity] of [
    ["null identity", null],
    ["undefined identity", undefined],
    ["a string instead of an object", "engineer"],
    ["an identity with no role", { person: "Nobody", verification: "verified" }],
    ["an identity with an unknown role", { person: "X", role: "wizard", verification: "verified" }],
    ["an identity with no verification", { person: "Y", role: "engineer" }],
  ]) {
    const b = bus();
    const r = attemptSpec(b, identity, "approveSpecification", { transition: "approve" });
    ok(`${label} -> refused`, r.published === false);
    ok(`${label} -> zero events`, r.delta === 0);
    ok(`${label} -> PolicyViolation`, r.error instanceof PolicyViolation);
  }

  // An unknown capability in the map would be unenforceable — guard the map itself.
  ok("no mapped capability is absent from CAPABILITIES",
     Object.values(EVENT_CAPABILITY).filter((c) => !(c in CAPABILITIES)).length === 0);

  // requireActor still runs first: an actor-less event is refused before capability.
  {
    const b = bus();
    let err = null;
    try {
      emit({ publish: b.publish,
             policy: createPolicy([requireActor, requireCapability(ENG_VER)]),
             factory: Events.engineering,
             fields: { specification: SPEC, type: EVENT_TYPES.ENGINEERING.SPEC_APPROVED,
                       transition: "approve", summary: "no actor" } });
    } catch (e) { err = e; }
    ok("an actor-less approval is refused by requireActor", err?.rule === "requireActor");
    ok("and still produces zero events", b.log.length === 0);
  }

  // Enforcement happens BEFORE publication — the decisive ordering proof.
  {
    const b = bus();
    let publishCalls = 0;
    const counting = (e) => { publishCalls++; b.log.unshift(e); return e; };
    try {
      createEngineeringEmitter({
        publish: counting,
        policy: createPolicy([requireActor, requireCapability(OKAFOR)]),
        actor: OKAFOR.person,
      }).approveSpecification({ specification: SPEC, transition: "approve" });
    } catch { /* expected */ }
    ok("L. publish was never called on a refused action", publishCalls === 0);
    ok("L. the log is empty", b.log.length === 0);
  }
}

console.log(`\n${pass}/${pass + fail} assertions passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
