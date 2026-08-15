// ============================================================
// FORGE OS — DIRECTIVE ACKNOWLEDGEMENT  (E9.5 Part B)
//
// One question: can the party a directive was addressed to answer THAT directive
// — accepting or rejecting it — without the answer becoming responsibility,
// participation, or performance?
//
//   DIRECTIVE ISSUED  ≠  DIRECTIVE ACKNOWLEDGED  ≠  WORK PERFORMED
//
// TWO PRIMITIVES MADE IT POSSIBLE:
//
//   inResponseTo   the eventId of the exact directive being answered. NOT
//                  correlationId — a correlationId groups a conversation, so two
//                  directives about one component share it and it cannot say
//                  which one is being answered. That ambiguity is proved below.
//
//   production.work.acknowledged  one event with a canonical `outcome`
//                  (accepted | rejected), following the inspection.* precedent
//                  where `result` distinguishes outcomes rather than two
//                  unrelated event types.
//
// THE CAPABILITY DECISION. `work.acknowledge`, NOT `job.accept`. `job.accept`
// means "accept manufacturing work", is verification-gated, and SOLC is
// unverified — gating a reply on it would have stopped the pilot from answering
// its own directive. `job.accept` keeps its meaning and its gate untouched.
//
// Run: node test/acknowledgement.consumer.mjs
// ============================================================

import { project } from "../src/os/projections.js";
import Events, { EVENT_TYPES, EVENT_CAPABILITY, ACKNOWLEDGEMENT, REFERENCE_FIELDS,
                 capabilityFor, validateEvent, isEntityField, MISSION_POLICY }
  from "../src/os/events.js";
import { CAPABILITIES, VERIFICATION_GATED, capabilitiesFor, ROLES } from "../src/os/Roles.js";
import { PROVENANCE, SEED_ORGANISATIONS } from "../src/os/network.js";
import { pilotOrganisationById, assignmentFor, provenanceOfOrganisation } from "../src/os/pilot.js";
import { createProductionEmitter } from "../src/domains/production/emitters.js";
import { createInspectionEmitter } from "../src/domains/inspection/emitters.js";
import { createEngineeringEmitter } from "../src/domains/engineering/emitters.js";
import { createPolicy, requireActor, requireCapability, requireHubScope,
         requireDirectiveTarget, PolicyViolation } from "../src/os/policy.js";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log(`  ok   ${n}`); } else { fail++; console.log(`  FAIL ${n}`); } };

const SPEC = "FTT-HB-001";
const COMP = "HUB-E9-001";
const UNI  = "UNI-KADUNA-001";
const SOLC = pilotOrganisationById("SOLC");
const A    = assignmentFor("SOLC");
const WA   = EVENT_TYPES.PRODUCTION.WORK_ACKNOWLEDGED;
const WD   = EVENT_TYPES.PRODUCTION.WORK_DIRECTED;
const MISSIONS = [{ id: "FORGE-HUB", title: "200 wheel hubs", target: 200, specification: SPEC }];

// The coordinator operates at warri so it may direct work there.
const COORD   = { person: "Ibrahim Danladi", role: "manufacturer", verification: "unverified",
                  organisation: "SOLC" };
const RECIP   = { person: "Adaeze Okoro", role: "sme", verification: "unverified",
                  organisation: "SOLC" };
const OUTSIDE = { person: "Other Person", role: "sme", verification: "unverified",
                  organisation: "DEMO-ORG-002" };
const ENGINEER = { person: "Folake Adeyemi", role: "engineer", verification: "verified" };
const ADVISER  = { person: "Dr. Chinedu Okafor", role: "diaspora_expert", verification: "unverified" };

const bus = () => { const log = []; return { log, publish: (e) => { log.unshift(e); return e; },
                                            view: () => project(log, MISSIONS) }; };
const compOf = (b) => b.view().components[COMP];

const produce = (b) =>
  createProductionEmitter({ publish: b.publish, actor: RECIP.person, hub: A.hub, policy: requireActor })
    .produceComponent({ component: COMP, specification: SPEC, mission: A.mission,
                        organisation: SOLC.id });

const directTo = (b, { directedTo = "SOLC", directedToClass = "institution",
                       instruction = `Fabricate ${COMP}`, correlationId } = {}) =>
  createProductionEmitter({
    publish: b.publish, actor: COORD.person, hub: A.hub, correlationId,
    policy: createPolicy([requireActor, requireCapability(COORD), requireHubScope(COORD)]),
  }).directWork({ component: COMP, directedTo, directedToClass, specification: SPEC,
                  mission: A.mission, instruction });

const acknowledge = (b, identity, { inResponseTo, outcome = ACKNOWLEDGEMENT.ACCEPTED,
                                    component = COMP, hub = A.hub, reason } = {}) => {
  const before = b.log.length;
  try {
    const event = createProductionEmitter({
      publish: b.publish, actor: identity?.person, hub,
      policy: createPolicy([requireActor, requireCapability(identity), requireHubScope(identity),
                            requireDirectiveTarget({ identity, log: b.log })]),
    }).acknowledgeWork({ component, inResponseTo, outcome, reason });
    return { published: true, event, delta: b.log.length - before, error: null };
  } catch (e) { return { published: false, event: null, delta: b.log.length - before, error: e }; }
};

console.log("\nFORGE OS — directive acknowledgement (E9.5 Part B)\n");

// ============================================================
console.log("THE PRIMITIVES");
// ============================================================
{
  const all = Object.values(EVENT_TYPES).flatMap((d) => Object.values(d));
  ok("the vocabulary is 34 types — 32 + directed + acknowledged", all.length === 34);
  ok("the addition is production.work.acknowledged", all.includes(WA));
  ok("only two coordination events exist in total",
     all.filter((t) => /work\./.test(t)).length === 2);
  ok("it carries a mission policy", WA in MISSION_POLICY);
  ok("mission is OPTIONAL", MISSION_POLICY[WA] === "MISSION_OPTIONAL");

  ok("outcome vocabulary is accepted | rejected",
     Object.values(ACKNOWLEDGEMENT).join() === "accepted,rejected");
  ok("rejection is an OUTCOME, not a separate event type",
     all.filter((t) => /reject|declin/i.test(t)).length === 0);

  ok("inResponseTo must reference a directive",
     REFERENCE_FIELDS.inResponseTo.mustReference.join() === WD);
  ok("inResponseTo is declared on the acknowledgement", REFERENCE_FIELDS.inResponseTo.on === WA);
  ok("inResponseTo is NOT an entity field — it references an EVENT",
     isEntityField("inResponseTo") === false);

  // ---- validateEvent's OWN inResponseTo GUARD, previously UNTESTED ----
  //
  // Found by mutation testing during Phase 2.3: deleting the requirement from
  // validateEvent broke NOTHING across the entire suite. The reason is worth
  // recording, because it is a general trap. This file exercises acknowledgements
  // through `acknowledge()`, which goes through the emitter — and the emitter
  // ALWAYS supplies inResponseTo. So the schema guard for its ABSENCE could never
  // fire, and the assertions above only checked the field's DECLARATION
  // (REFERENCE_FIELDS) rather than its ENFORCEMENT.
  //
  // A declaration is not a gate. These call validateEvent directly, with the field
  // missing, empty, and misplaced — the three ways it can actually be wrong.
  {
    // NO `directedTo` HERE. A target belongs on the DIRECTIVE; an acknowledgement
    // answers one. My first attempt at this fixture carried it and the positive
    // control failed with "directedTo is only meaningful on production.work.directed"
    // — the schema correcting the test, which is the right way round.
    const base = { component: "HUB-014", person: "Adaeze Okoro", organisation: "SOLC",
                   hub: "warri", outcome: ACKNOWLEDGEMENT.ACCEPTED };
    const withRef = (ref) => Events.production({ ...base, type: WA, inResponseTo: ref,
                                                 summary: "acknowledged" });

    const missing = validateEvent({ ...withRef("x"), inResponseTo: undefined });
    ok("an acknowledgement with NO inResponseTo is refused by validateEvent",
       missing.valid === false &&
       missing.issues.some((i) => /requires "inResponseTo"/.test(i.message)));

    const empty = validateEvent({ ...withRef("x"), inResponseTo: "" });
    ok("an acknowledgement with an EMPTY inResponseTo is refused",
       empty.valid === false &&
       empty.issues.some((i) => /requires "inResponseTo"/.test(i.message)));

    const nulled = validateEvent({ ...withRef("x"), inResponseTo: null });
    ok("an acknowledgement with a NULL inResponseTo is refused",
       nulled.valid === false &&
       nulled.issues.some((i) => /requires "inResponseTo"/.test(i.message)));

    // And the reciprocal rule: a reply reference outside an acknowledgement is
    // meaningless, so it is refused wherever else it appears.
    const misplaced = validateEvent(Events.production({
      component: "HUB-014", person: "Adaeze Okoro", organisation: "SOLC", hub: "warri",
      specification: "FTT-HB-001", inResponseTo: "00000000-0000-4000-8000-000000000000",
      summary: "produced" }));
    ok("inResponseTo on a NON-acknowledgement is refused",
       misplaced.valid === false &&
       misplaced.issues.some((i) => /only meaningful on/.test(i.message)));

    // The positive control, so none of the above passes for the wrong reason.
    const good = validateEvent(withRef("00000000-0000-4000-8000-000000000000"));
    ok("a well-formed acknowledgement with inResponseTo is accepted",
       good.valid === true && good.issues.length === 0);
  }

  // The capability decision, asserted so it cannot drift.
  ok("the required capability is work.acknowledge", capabilityFor(WA) === "work.acknowledge");
  ok("it exists in the capability vocabulary", "work.acknowledge" in CAPABILITIES);
  ok("it is deliberately NOT verification-gated",
     !VERIFICATION_GATED.includes("work.acknowledge"));
  ok("job.accept was NOT reused", capabilityFor(WA) !== "job.accept");
  ok("job.accept keeps its verification gate", VERIFICATION_GATED.includes("job.accept"));
  ok("so an UNVERIFIED sme can acknowledge — the pilot is not blocked",
     capabilitiesFor("sme").includes("work.acknowledge"));
  ok("granted to exactly the four roles that may take on manufacturing work",
     ROLES.filter((r) => (r.capabilities || []).includes("work.acknowledge")).map((r) => r.id).join()
       === "sme,manufacturer,component_supplier,logistics_partner");
  ok("and to exactly the holders of job.accept — the same parties",
     ROLES.filter((r) => (r.capabilities || []).includes("work.acknowledge")).map((r) => r.id).join()
       === ROLES.filter((r) => (r.capabilities || []).includes("job.accept")).map((r) => r.id).join());
  ok("NOT granted to engineer", !capabilitiesFor("engineer").includes("work.acknowledge"));
  ok("NOT granted to diaspora_expert", !capabilitiesFor("diaspora_expert").includes("work.acknowledge"));
  ok("NOT granted to nysc_volunteer", !capabilitiesFor("nysc_volunteer").includes("work.acknowledge"));
  ok("NOT granted to university or polytechnic",
     !capabilitiesFor("university").includes("work.acknowledge") &&
     !capabilitiesFor("polytechnic").includes("work.acknowledge"));
  ok("four event types are capability-gated in total", Object.keys(EVENT_CAPABILITY).length === 4);
}

// ============================================================
console.log("\nH + I + J — VALID ACKNOWLEDGEMENT AND REJECTION");
// ============================================================
{
  const b = bus();
  produce(b);
  const d = directTo(b);
  ok("H. the directive begins OUTSTANDING — outcome null",
     compOf(b).directives[0].outcome === null);

  const r = acknowledge(b, RECIP, { inResponseTo: d.eventId });
  ok("H. the recipient's acknowledgement is ACCEPTED", r.published === true);
  ok("H. exactly one event was published", r.delta === 1);
  ok("H. the event validates with zero issues",
     validateEvent(r.event).valid && validateEvent(r.event).issues.length === 0);
  ok("H. the event type is production.work.acknowledged", r.event.type === WA);

  const dv = compOf(b).directives[0];
  ok("J. it resolved the EXACT directive referenced", dv.acknowledgementEventId === r.event.eventId);
  ok("J. inResponseTo names the directive", r.event.inResponseTo === d.eventId);
  ok("H. the outcome is accepted", dv.outcome === ACKNOWLEDGEMENT.ACCEPTED);
  ok("H. the acknowledging person is recorded", dv.acknowledgedBy === RECIP.person);
  ok("H. with a timestamp", typeof dv.acknowledgedAt === "number");
  ok("H. the ORIGINAL directive is preserved intact",
     dv.person === COORD.person && dv.directedTo === "SOLC" &&
     dv.directedToClass === "institution" && /Fabricate/.test(dv.instruction) &&
     dv.eventId === d.eventId);
  ok("H. no anomaly", b.view().anomalies.length === 0);

  // I — rejection is the same event with a different outcome.
  const b2 = bus();
  produce(b2);
  const d2 = directTo(b2);
  const rej = acknowledge(b2, RECIP, { inResponseTo: d2.eventId,
                                       outcome: ACKNOWLEDGEMENT.REJECTED,
                                       reason: "No 45mm reamer available this week" });
  ok("I. a rejection is ACCEPTED as a legitimate response", rej.published === true);
  ok("I. the outcome is rejected", compOf(b2).directives[0].outcome === ACKNOWLEDGEMENT.REJECTED);
  ok("I. the reason is carried", rej.event.reason === "No 45mm reamer available this week");
  ok("I. rejection used the same event type, not a new one", rej.event.type === WA);
  ok("I. a rejection does NOT change component state",
     compOf(b2).state === "manufacturing");
  ok("I. and does not change responsibility", compOf(b2).organisation === "SOLC");
}

// ============================================================
console.log("\nK + L + M + wrong directive — REFUSALS BEFORE PUBLICATION");
// ============================================================
{
  // K. nonexistent directive
  {
    const b = bus(); produce(b); directTo(b);
    const r = acknowledge(b, RECIP, { inResponseTo: "00000000-0000-4000-8000-000000000000" });
    ok("K. acknowledging a nonexistent directive is REFUSED", r.published === false);
    ok("K. refused by requireDirectiveTarget", r.error.rule === "requireDirectiveTarget");
    ok("K. the error says it does not exist", /does not exist/.test(r.error.message));
    ok("K. zero events", r.delta === 0);
    ok("K. the real directive is still outstanding", compOf(b).directives[0].outcome === null);
  }

  // L. referencing the wrong KIND of event
  {
    const b = bus();
    const produced = produce(b);
    directTo(b);
    const r = acknowledge(b, RECIP, { inResponseTo: produced.eventId });
    ok("L. referencing a non-directive event is REFUSED", r.published === false);
    ok("L. the error names the wrong type",
       /must reference a directive/.test(r.error.message));
    ok("L. zero events", r.delta === 0);
  }

  // An acknowledgement cannot reference another acknowledgement.
  {
    const b = bus(); produce(b);
    const d = directTo(b);
    const first = acknowledge(b, RECIP, { inResponseTo: d.eventId });
    const r = acknowledge(b, RECIP, { inResponseTo: first.event.eventId });
    ok("L2. an acknowledgement cannot answer another acknowledgement",
       r.published === false && /must reference a directive/.test(r.error.message));
  }

  // M. wrong recipient — a different organisation attempts to answer.
  {
    const b = bus(); produce(b);
    const d = directTo(b);
    const r = acknowledge(b, OUTSIDE, { inResponseTo: d.eventId, hub: "ilorin" });
    ok("M. a different organisation cannot acknowledge SOLC's directive",
       r.published === false);
    ok("M. the error names who it was addressed to",
       /addressed to organisation "SOLC"/.test(r.error.message));
    ok("M. and who tried", /"DEMO-ORG-002"/.test(r.error.message));
    ok("M. zero events", r.delta === 0);
    ok("M. the directive remains outstanding", compOf(b).directives[0].outcome === null);
    ok("M. responsibility is untouched", compOf(b).organisation === "SOLC");
    ok("M. no contribution was created", compOf(b).contributions.length === 0);
    ok("M. no performance history was created", compOf(b).history.length === 1);
  }

  // The recipient must be matched from the authenticated identity, not the event.
  {
    const b = bus(); produce(b);
    const d = directTo(b);
    // The identity belongs elsewhere but the EVENT claims organisation SOLC.
    const before = b.log.length;
    let err = null;
    try {
      createProductionEmitter({
        publish: b.publish, actor: OUTSIDE.person, hub: A.hub,
        policy: createPolicy([requireActor, requireCapability(OUTSIDE),
                              requireDirectiveTarget({ identity: OUTSIDE, log: b.log })]),
      }).acknowledgeWork({ component: COMP, inResponseTo: d.eventId,
                           outcome: ACKNOWLEDGEMENT.ACCEPTED, organisation: "SOLC" });
    } catch (e) { err = e; }
    ok("M2. naming SOLC on the event does not make you the recipient",
       err?.rule === "requireDirectiveTarget");
    ok("M2. zero events", b.log.length === before);
  }

  // A person-addressed directive must be answered by that person.
  {
    const b = bus(); produce(b);
    const d = directTo(b, { directedTo: "Adaeze Okoro", directedToClass: "person" });
    const wrong = acknowledge(b, { ...RECIP, person: "Someone Else" },
                              { inResponseTo: d.eventId });
    ok("M3. a person-addressed directive refuses a different person",
       wrong.published === false && /addressed to person "Adaeze Okoro"/.test(wrong.error.message));
    const right = acknowledge(b, RECIP, { inResponseTo: d.eventId });
    ok("M3. and accepts the named person", right.published === true);
  }

  // Component mismatch.
  {
    const b = bus(); produce(b);
    const d = directTo(b);
    const r = acknowledge(b, RECIP, { inResponseTo: d.eventId, component: "HUB-OTHER" });
    ok("acknowledging with a mismatched component is REFUSED",
       r.published === false && /concerns/.test(r.error.message));
  }

  // Capability refusals.
  for (const [label, identity] of [
    ["engineer", { ...ENGINEER, organisation: "SOLC" }],
    ["diaspora_expert", { ...ADVISER, organisation: "SOLC" }],
    ["nysc_volunteer", { person: "Student A", role: "nysc_volunteer",
                         verification: "unverified", organisation: "SOLC" }],
  ]) {
    const b = bus(); produce(b);
    const d = directTo(b);
    const r = acknowledge(b, identity, { inResponseTo: d.eventId });
    ok(`${label} cannot acknowledge — lacks work.acknowledge`, r.published === false);
    ok(`${label} refused by requireCapability`, r.error.rule === "requireCapability");
    ok(`${label} produced zero events`, r.delta === 0);
  }
}

// ============================================================
console.log("\nN + O — inResponseTo DOES WHAT correlationId CANNOT");
// ============================================================
{
  const b = bus();
  produce(b);
  const CID = "thread-HUB-E9-001";
  const dA = directTo(b, { instruction: "Machine the bore to 45.00mm", correlationId: CID });
  const dB = directTo(b, { instruction: "Also deburr the flange",      correlationId: CID });

  ok("N. two directives share one correlationId", dA.correlationId === dB.correlationId);
  ok("N. but have distinct event ids", dA.eventId !== dB.eventId);
  ok("N. both are recorded", compOf(b).directives.length === 2);

  // Acknowledge ONLY directive A.
  const r = acknowledge(b, RECIP, { inResponseTo: dA.eventId });
  ok("O. the acknowledgement was accepted", r.published === true);

  const dvA = compOf(b).directives.find((x) => x.eventId === dA.eventId);
  const dvB = compOf(b).directives.find((x) => x.eventId === dB.eventId);
  ok("O. directive A is acknowledged", dvA.outcome === ACKNOWLEDGEMENT.ACCEPTED);
  ok("O. directive B remains OUTSTANDING", dvB.outcome === null);
  ok("O. B has no acknowledging party", dvB.acknowledgedBy === null);
  ok("O. B's instruction is untouched", /deburr/.test(dvB.instruction));
  ok("O. => correlationId alone could not have distinguished them",
     dA.correlationId === dB.correlationId && dvA.outcome !== dvB.outcome);
}

// ============================================================
console.log("\nP + Q — REPLAY AND A SECOND RESPONSE");
// ============================================================
{
  const b = bus();
  produce(b);
  const d = directTo(b);
  const r = acknowledge(b, RECIP, { inResponseTo: d.eventId });
  ok("P. one acknowledgement recorded", compOf(b).directives[0].outcome === "accepted");

  b.publish(r.event);                       // exact replay
  ok("P. replaying the identical event changes nothing",
     compOf(b).directives[0].acknowledgementEventId === r.event.eventId);
  ok("P. and creates no anomaly", b.view().anomalies.length === 0);
  ok("P. still exactly one directive", compOf(b).directives.length === 1);
  ok("P. the fold is deterministic",
     JSON.stringify(project(b.log, MISSIONS).components[COMP]) ===
     JSON.stringify(project(b.log, MISSIONS).components[COMP]));

  // Q — a SECOND, DIFFERENT response to the same directive.
  // CONTRACT: first response wins, matching the first-writer rule already used
  // for responsibility and mission membership. The disagreement is recorded as an
  // anomaly rather than silently overwriting history.
  const second = acknowledge(b, RECIP, { inResponseTo: d.eventId,
                                         outcome: ACKNOWLEDGEMENT.REJECTED });
  ok("Q. a second distinct response is published — policy permits it",
     second.published === true);
  ok("Q. but the FIRST outcome stands", compOf(b).directives[0].outcome === "accepted");
  ok("Q. and the acknowledging party is still the first",
     compOf(b).directives[0].acknowledgementEventId === r.event.eventId);
  ok("Q. the disagreement is recorded as an anomaly",
     b.view().anomalies.some((a) => /already "accepted" and cannot be re-answered/.test(a.message)));
  ok("Q. the anomaly names both outcomes",
     b.view().anomalies.some((a) => a.held === "accepted" && a.attempted === "rejected"));
  ok("Q. history was NOT rewritten", compOf(b).directives.length === 1);
}

// ============================================================
console.log("\nR–W — WHAT AN ACKNOWLEDGEMENT MUST NOT DO");
// ============================================================
{
  const b = bus();
  produce(b);
  const stateBefore = compOf(b).state;
  const orgBefore = compOf(b).organisation;
  const histBefore = compOf(b).history.length;
  const contribBefore = compOf(b).contributions.length;

  const d = directTo(b);
  acknowledge(b, RECIP, { inResponseTo: d.eventId });
  const v = b.view(), c = v.components[COMP];

  ok("R. no lifecycle transition occurred", c.state === stateBefore && c.state === "manufacturing");
  ok("S. responsibility unchanged", c.organisation === orgBefore && c.organisation === "SOLC");
  ok("T. participation unchanged", c.contributions.length === contribBefore);
  ok("T. the acknowledging party did NOT become a contributor",
     !c.contributions.some((x) => x.person === RECIP.person));
  ok("U. performance history unchanged", c.history.length === histBefore);
  ok("U. acknowledging is not performing — no new history entry",
     c.history.length === 1);
  ok("V. the specification is untouched", v.specifications[SPEC] === undefined);
  ok("W. mission progress unchanged", v.missions[0].accepted === 0);
  ok("W. mission state unchanged", v.missions[0].state === "planning");
  ok("no anomalies", v.anomalies.length === 0);

  // 16 — an outstanding directive must never self-resolve.
  const b2 = bus();
  produce(b2);
  directTo(b2);
  ok("an unacknowledged directive stays OUTSTANDING",
     compOf(b2).directives[0].outcome === null);
  ok("it does not become accepted by default",
     compOf(b2).directives[0].acknowledgedBy === null);
  ok("and the component lifecycle is unaffected",
     compOf(b2).state === "manufacturing");
}

// ============================================================
console.log("\nX — PROVENANCE");
// ============================================================
{
  const b = bus();
  produce(b);
  const d = directTo(b);
  acknowledge(b, RECIP, { inResponseTo: d.eventId });
  const c = compOf(b);
  ok("X. the responsible organisation still resolves to PILOT",
     provenanceOfOrganisation(c.organisation, SEED_ORGANISATIONS) === PROVENANCE.PILOT);
  ok("X. acknowledging did not change provenance",
     provenanceOfOrganisation("SOLC", SEED_ORGANISATIONS) === PROVENANCE.PILOT);
  ok("X. no provenance value was invented", Object.keys(PROVENANCE).length === 3);
}

// ============================================================
console.log("\nTHE FULL DISTRIBUTED CHAIN — one artefact, eight relationships");
// ============================================================
{
  const b = bus();
  // 1. verified engineer APPROVES the specification
  const em = createEngineeringEmitter({ publish: b.publish, actor: ENGINEER.person,
    policy: createPolicy([requireActor, requireCapability(ENGINEER)]) });
  em.draftSpecification({ specification: SPEC, transition: "submitForReview" });
  em.approveSpecification({ specification: SPEC, transition: "approve" });
  // 2. authorised coordinator DIRECTS SOLC, in scope
  produce(b);
  const d = directTo(b);
  // 3. SOLC ACKNOWLEDGES
  acknowledge(b, RECIP, { inResponseTo: d.eventId });
  // 4. university CONTRIBUTES
  b.publish(Events.knowledge({ knowledge: "cad", component: COMP, specification: SPEC,
    type: EVENT_TYPES.KNOWLEDGE.PUBLISHED, person: "Student A", human: "Student A",
    organisation: UNI, summary: "CAD revision" }));
  // 5. diaspora expert ADVISES
  b.publish(Events.knowledge({ knowledge: "adv", component: COMP, specification: SPEC,
    type: EVENT_TYPES.KNOWLEDGE.REVIEWED, person: ADVISER.person, human: ADVISER.person,
    summary: "Increase wall thickness" }));
  // 6. operator PERFORMS through to acceptance
  const insp = createInspectionEmitter({ publish: b.publish, actor: RECIP.person, hub: A.hub,
                                         policy: requireActor });
  insp.pass({ component: COMP, specification: SPEC, mission: A.mission, organisation: SOLC.id });

  const v = b.view(), c = v.components[COMP];
  ok("APPROVAL   engineer approved the specification",
     v.specifications[SPEC].history.some((h) => h.transition === "approve" && h.by === ENGINEER.person));
  ok("COORDINATION  the coordinator directed SOLC", c.directives[0].person === COORD.person);
  ok("ACKNOWLEDGEMENT  SOLC accepted that directive",
     c.directives[0].outcome === "accepted" && c.directives[0].acknowledgedBy === RECIP.person);
  ok("PARTICIPATION  two contributors recorded", c.contributions.length === 2);
  ok("PARTICIPATION  the university is one of them",
     c.contributions.some((x) => x.organisation === UNI));
  ok("ADVICE     the diaspora expert advised",
     c.contributions.some((x) => x.person === ADVISER.person &&
                                 x.type === EVENT_TYPES.KNOWLEDGE.REVIEWED));
  ok("PERFORMANCE  the operator moved the part", c.history.some((h) => h.by === RECIP.person));
  ok("RESPONSIBILITY  SOLC alone is responsible", c.organisation === "SOLC");
  ok("ACCEPTANCE  the component reached assembly", c.state === "assembly");
  ok("MISSION    progress counted it", v.missions[0].accepted === 1);
  // history is 3, not 2: release, then the fold's own submitForInspection, then
  // pass. My first count forgot the intermediate step the projection performs
  // when a result arrives straight from manufacturing (E7).
  ok("no relationship overwrote another",
     c.organisation === "SOLC" && c.directives.length === 1 &&
     c.contributions.length === 2 && c.history.length === 3 &&
     v.specifications[SPEC].state === "approved");
  ok("and the fold performed the intermediate submit itself",
     c.history.map((h) => h.transition).join() === "release,submitForInspection,pass");
  ok("the coordinator is not a performer, contributor or responsible party",
     !c.history.some((h) => h.by === COORD.person) &&
     !c.contributions.some((x) => x.person === COORD.person) &&
     c.organisation !== COORD.person);
  ok("the approver is not a contributor or a director",
     !c.contributions.some((x) => x.person === ENGINEER.person) &&
     !c.directives.some((x) => x.person === ENGINEER.person));
  ok("the adviser did not acknowledge anything",
     c.directives[0].acknowledgedBy !== ADVISER.person);
  ok("CANON AUTHORITY  still absent — no canon capability exists",
     !Object.keys(CAPABILITIES).some((x) => /canon/i.test(x)));
  ok("zero anomalies across the entire chain", v.anomalies.length === 0);
}

// ============================================================
console.log("\nY + Z + AA + AB + AC — REGRESSION");
// ============================================================
{
  const b = bus();
  const common = { publish: b.publish, actor: RECIP.person, hub: A.hub,
                   policy: createPolicy([requireActor, requireCapability(RECIP),
                                         requireHubScope(RECIP)]),
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
  ok("AA. an unverified sme is still not blocked from manufacturing", threw === null);
  ok("AA. even with the scope rule composed in", threw === null);
  ok("Z. the full E7 recovery path still reaches assembly", c.state === "assembly");
  ok("Z. the transition chain is intact",
     c.history.map((h) => h.transition).join() ===
     "release,submitForInspection,fail,submitForInspection,pass");
  ok("Y. responsibility is still SOLC", c.organisation === "SOLC");
  ok("Y. mission progress still moves", b.view().missions[0].accepted === 1);
  ok("AB. no lifecycle event was misread as a contribution", c.contributions.length === 0);
  ok("AC. no lifecycle event was misread as a directive", c.directives.length === 0);
  ok("AA. engineering approval is still capability- and verification-gated",
     capabilityFor(EVENT_TYPES.ENGINEERING.SPEC_APPROVED) === "engineering.approve" &&
     VERIFICATION_GATED.includes("engineering.approve"));
  ok("AC. work.direct is still held by manufacturer alone",
     ROLES.filter((r) => (r.capabilities || []).includes("work.direct")).map((r) => r.id).join()
       === "manufacturer");
}

console.log(`\n${pass}/${pass + fail} assertions passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
