// ============================================================
// FORGE OS — MANUFACTURING COORDINATION  (E9.3)
//
// One question: can ForgeOS record WHO DIRECTED WHOM to do WHAT on WHICH
// artefact, without that directive becoming responsibility, participation,
// performance or approval?
//
// FOUR RELATIONS, FOUR PLACES, after this pass:
//
//   component.organisation      RESPONSIBLE   one value, first-writer
//   component.contributions[]   PARTICIPATION many, knowledge.* only   (E9.1)
//   component.directives[]      COORDINATION  many, two-party          (E9.3)
//   component.history[]         PERFORMANCE   state transitions only
//
// THE TWO-PARTY PROBLEM. E9.2 found that a directive is irreducibly two-party
// and the event shape carried only one person and one organisation. So
// `directedTo` was added as a POLYMORPHIC canonical field with its class
// declared in `directedToClass` — never guessed from the value — because a
// directive may be addressed to a PERSON or to an INSTITUTION.
//
// WHY `production.work.directed` NEEDED ITS OWN FOLD BRANCH. It is a
// production.* event, so without one its `organisation` would have been read as
// a responsibility claim: an external coordinator would either have hijacked
// responsibility or produced a false conflict — exactly the mistake E9.1 fixed
// for participation.
//
// Run: node test/coordination.consumer.mjs
// ============================================================

import { project } from "../src/os/projections.js";
import Events, { EVENT_TYPES, EVENT_CAPABILITY, DIRECTED_TO_CLASSES, declaredClassOf,
                 capabilityFor, validateEvent, MISSION_POLICY, isEntityField }
  from "../src/os/events.js";
import { CAPABILITIES, capabilitiesFor, VERIFICATION_GATED } from "../src/os/Roles.js";
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
const WD   = EVENT_TYPES.PRODUCTION.WORK_DIRECTED;
const MISSIONS = [{ id: "FORGE-HUB", title: "200 wheel hubs", target: 200, specification: SPEC }];

// ---- identities. Plain objects; no user, no table, no role enum added. ----
const COORD    = { person: "Ibrahim Danladi",     role: "manufacturer",    verification: "unverified" };
const SME      = { person: "Adaeze Okoro",        role: "sme",             verification: "unverified" };
const ADVISER  = { person: "Dr. Chinedu Okafor",  role: "diaspora_expert", verification: "unverified" };
const ENGINEER = { person: "Folake Adeyemi",      role: "engineer",        verification: "verified" };
const STUDENT  = { person: "Student A",           role: "nysc_volunteer",  verification: "unverified" };

const bus = () => {
  const log = [];
  return { log, publish: (e) => { log.unshift(e); return e; },
           view: () => project(log, MISSIONS) };
};
const compOf = (b) => b.view().components[COMP];

/** Issue a directive under an identity. Returns what actually happened. */
const direct = (b, identity, fields = {}) => {
  const before = b.log.length;
  const emitter = createProductionEmitter({
    publish: b.publish, actor: identity?.person, hub: A.hub,
    policy: createPolicy([requireActor, requireCapability(identity)]),
    correlationId: `pilot-SOLC-${COMP}`,
  });
  try {
    const event = emitter.directWork({
      component: COMP, directedTo: SOLC.id, directedToClass: "institution",
      specification: SPEC, mission: A.mission,
      instruction: `Fabricate ${COMP} to approved ${SPEC}`, ...fields,
    });
    return { published: true, event, delta: b.log.length - before, error: null };
  } catch (e) {
    return { published: false, event: null, delta: b.log.length - before, error: e };
  }
};

const produce = (b, person = "Adaeze Okoro") =>
  createProductionEmitter({ publish: b.publish, actor: person, hub: A.hub, policy: requireActor })
    .produceComponent({ component: COMP, specification: SPEC, mission: A.mission,
                        organisation: SOLC.id });

const contribute = (b, person, organisation) =>
  b.publish(Events.knowledge({ knowledge: `k-${person}`, component: COMP, specification: SPEC,
    type: EVENT_TYPES.KNOWLEDGE.PUBLISHED, person, human: person,
    ...(organisation ? { organisation } : {}), summary: `${person} contributed` }));

console.log("\nFORGE OS — manufacturing coordination (E9.3)\n");

// ============================================================
console.log("THE PRIMITIVE");
// ============================================================
{
  const all = Object.values(EVENT_TYPES).flatMap((d) => Object.values(d));
  ok("the vocabulary is 34 after E9.5", all.length === 34);
  ok("the new type is production.work.directed", all.includes(WD));
  ok("coordination contributed exactly two types — direct and acknowledge",
     all.filter((t) => /direct|coordinat|assign|instruct|acknowledg/i.test(t)).length === 2);
  ok("it carries a mission policy like every other type", WD in MISSION_POLICY);
  ok("mission is OPTIONAL — a directive need not belong to a mission",
     MISSION_POLICY[WD] === "MISSION_OPTIONAL");
  ok("it requires the work.direct capability", capabilityFor(WD) === "work.direct");
  ok("work.direct exists in the capability vocabulary", "work.direct" in CAPABILITIES);
  ok("four event types are capability-gated in total",
     Object.keys(EVENT_CAPABILITY).length === 4);

  // directedTo is canonical, not an accident of compact()
  ok("directedTo is a canonical entity field", isEntityField("directedTo") === true);
  ok("it is polymorphic over PERSON and INSTITUTION",
     DIRECTED_TO_CLASSES.join() === "person,institution");
  ok("a target's class is declared, never guessed",
     declaredClassOf({ directedTo: "SOLC", directedToClass: "institution" }) === "institution");
  ok("an undeclared class resolves to null", declaredClassOf({ directedTo: "SOLC" }) === null);
  ok("an out-of-set class resolves to null",
     declaredClassOf({ directedTo: "X", directedToClass: "machine" }) === null);

  // capability grant, argued not assumed
  ok("manufacturer holds work.direct", capabilitiesFor("manufacturer").includes("work.direct"));
  ok("sme does NOT", !capabilitiesFor("sme").includes("work.direct"));
  ok("engineer does NOT", !capabilitiesFor("engineer").includes("work.direct"));
  ok("diaspora_expert does NOT", !capabilitiesFor("diaspora_expert").includes("work.direct"));
  ok("nysc_volunteer does NOT", !capabilitiesFor("nysc_volunteer").includes("work.direct"));
  ok("exactly one role holds it",
     ["sme","manufacturer","component_supplier","logistics_partner","university","polytechnic",
      "research_institute","government_agency","investor","engineer","nysc_volunteer",
      "diaspora_expert"].filter((r) => capabilitiesFor(r).includes("work.direct")).length === 1);
  ok("work.direct implies no canon authority — no canon capability exists",
     !Object.keys(CAPABILITIES).some((c) => /canon/i.test(c)));
}

// ============================================================
console.log("\nA–F — A VALID DIRECTIVE AND WHAT IT CARRIES");
// ============================================================
{
  const b = bus();
  produce(b);
  const r = direct(b, COORD);

  ok("A. an authorised coordinator's directive is ACCEPTED", r.published === true);
  ok("A. exactly one event was published", r.delta === 1);
  ok("A. the event validates with zero issues",
     validateEvent(r.event).valid && validateEvent(r.event).issues.length === 0);
  ok("A. the directing person is recorded", r.event.person === "Ibrahim Danladi");

  const d = compOf(b).directives;
  ok("D. the directive attached to the component", d.length === 1);
  ok("B. the target organisation is recorded", d[0].directedTo === "SOLC");
  ok("B. with its declared class", d[0].directedToClass === "institution");
  ok("A. who directed is recorded separately from who was directed",
     d[0].person === "Ibrahim Danladi" && d[0].directedTo === "SOLC");
  ok("E. the specification is attached", d[0].specification === SPEC);
  ok("F. the mission is attached", d[0].mission === "FORGE-HUB");
  ok("A. the instruction is preserved and non-empty",
     /Fabricate HUB-E9-001 to approved FTT-HB-001/.test(d[0].instruction));
  ok("A. the event id is retained", d[0].eventId === r.event.eventId);
  ok("A. the timestamp is retained", typeof d[0].at === "number");

  // C — a PERSON target is equally addressable
  const r2 = direct(b, COORD, { directedTo: "Adaeze Okoro", directedToClass: "person",
                                instruction: "Machine the bore to 45.00mm" });
  ok("C. a directive may target a PERSON", r2.published === true);
  ok("C. the person target is recorded with its class",
     compOf(b).directives[1].directedTo === "Adaeze Okoro" &&
     compOf(b).directives[1].directedToClass === "person");
  ok("T. two directives coexist without replacing each other",
     compOf(b).directives.length === 2);
}

// ============================================================
console.log("\nG–J — WHAT A DIRECTIVE MUST NOT DO");
// ============================================================
{
  const b = bus();
  produce(b);
  const stateBefore   = compOf(b).state;
  const orgBefore     = compOf(b).organisation;
  const historyBefore = compOf(b).history.length;
  const contribBefore = compOf(b).contributions.length;

  direct(b, COORD);
  const c = compOf(b);

  ok("G. no lifecycle transition occurred", c.state === stateBefore);
  ok("G. the state is still manufacturing", c.state === "manufacturing");
  ok("H. responsibility is unchanged", c.organisation === orgBefore && c.organisation === "SOLC");
  ok("I. participation is unchanged", c.contributions.length === contribBefore);
  ok("I. the coordinator did NOT become a contributor",
     !c.contributions.some((x) => x.person === "Ibrahim Danladi"));
  ok("J. performance history is unchanged", c.history.length === historyBefore);
  ok("J. the coordinator did NOT become a performer",
     !c.history.some((h) => h.by === "Ibrahim Danladi"));
  ok("G. no anomaly was raised", b.view().anomalies.length === 0);

  // A directive on an unseen component must not invent a lifecycle either.
  const b2 = bus();
  direct(b2, COORD);
  ok("G. a directive alone leaves the component at the graph's initial state",
     b2.view().components[COMP].state === "planned");
  ok("H. and with NO responsibility — being directed confers none",
     b2.view().components[COMP].organisation === null);
  ok("G. and no transition history", b2.view().components[COMP].history.length === 0);
}

// ============================================================
console.log("\nH/Y — RESPONSIBILITY: EXTERNAL COORDINATOR, NO CONFLICT");
// ============================================================
{
  const b = bus();
  produce(b);
  // The coordinator belongs to a DIFFERENT organisation and says so.
  const r = direct(b, COORD, { organisation: "EXTERNAL-WORKS-002" });
  ok("H. an external coordinator may direct SOLC's component", r.published === true);
  ok("H. responsibility remains SOLC", compOf(b).organisation === "SOLC");
  ok("H. NO anomaly merely because someone else coordinated",
     b.view().anomalies.length === 0);
  ok("H. the coordinator's own organisation is recorded as context only",
     compOf(b).directives[0].organisation === "EXTERNAL-WORKS-002");
  ok("H. and never as the responsible organisation",
     compOf(b).organisation !== "EXTERNAL-WORKS-002");

  // The genuine first-writer conflict must STILL fire.
  createInspectionEmitter({ publish: b.publish, actor: "Someone Else", hub: "ilorin" })
    .pass({ component: COMP, specification: SPEC, organisation: "DEMO-ORG-002" });
  ok("Y. a real responsibility claim by another org STILL anomalies",
     b.view().anomalies.some((a) => a.attempted === "DEMO-ORG-002" && a.held === "SOLC"));
  ok("Y. responsibility is still not reassigned", compOf(b).organisation === "SOLC");
}

// ============================================================
console.log("\nK–M — ADVISER, APPROVER AND PERFORMER STAY THEMSELVES");
// ============================================================
{
  const b = bus();
  produce(b);                                                          // performer
  direct(b, COORD);                                                    // coordinator
  b.publish(Events.knowledge({ knowledge: "adv", component: COMP, specification: SPEC,
    type: EVENT_TYPES.KNOWLEDGE.REVIEWED, person: ADVISER.person, human: ADVISER.person,
    summary: "Increase wall thickness" }));                            // adviser
  const em = createEngineeringEmitter({ publish: b.publish, actor: ENGINEER.person,
    policy: createPolicy([requireActor, requireCapability(ENGINEER)]) });
  em.draftSpecification({ specification: SPEC, transition: "submitForReview" });
  em.approveSpecification({ specification: SPEC, transition: "approve" });   // approver

  const v = b.view(), c = v.components[COMP];
  ok("K. the adviser is a contributor",
     c.contributions.some((x) => x.person === ADVISER.person));
  ok("K. and NOT a director", !c.directives.some((x) => x.person === ADVISER.person));
  ok("L. the engineer approved the specification",
     v.specifications[SPEC].history.some((h) => h.transition === "approve" && h.by === ENGINEER.person));
  ok("L. approval created NO directive",
     !c.directives.some((x) => x.person === ENGINEER.person));
  ok("L. approval created NO contribution",
     !c.contributions.some((x) => x.person === ENGINEER.person));
  ok("M. the operator is the performer", c.history.some((h) => h.by === "Adaeze Okoro"));
  ok("M. and NOT a director", !c.directives.some((x) => x.person === "Adaeze Okoro"));
  ok("M. the director is not a performer",
     !c.history.some((h) => h.by === COORD.person));
  ok("all four relations are populated and distinct",
     c.organisation === "SOLC" && c.directives.length === 1 &&
     c.contributions.length === 1 && c.history.length === 1);
  ok("X. the specification approval state is untouched by the directive",
     v.specifications[SPEC].state === "approved");
  ok("X. the directive did not author the specification",
     v.specifications[SPEC].author === ENGINEER.person);
  ok("W. mission progress is unchanged by a directive", v.missions[0].accepted === 0);
  ok("W. mission state is unchanged by a directive", v.missions[0].state === "planning");
  ok("no anomalies across the whole picture", v.anomalies.length === 0);
}

// ============================================================
console.log("\nN–R — REFUSAL MATRIX (authority at the event boundary)");
// ============================================================
{
  for (const [label, identity, why] of [
    ["N. sme",             SME,      /work\.direct/],
    ["O. diaspora_expert", ADVISER,  /work\.direct/],
    ["P. engineer",        ENGINEER, /work\.direct/],
    ["Q. nysc_volunteer",  STUDENT,  /work\.direct/],
    // A null identity means no actor either, so requireActor — which runs FIRST
    // in the composed policy — refuses before capability is ever consulted. My
    // first version expected the capability message here; the ordering is right
    // and the expectation was wrong. The gates are isolated separately below.
    ["F2. no identity",    null,     /requireActor|no actor/],
    ["F3. unknown role",   { person: "X", role: "wizard", verification: "verified" }, /work\.direct/],
    ["F4. no role",        { person: "Y", verification: "verified" }, /no Forge role/],
  ]) {
    const b = bus();
    produce(b);
    const before = b.log.length;
    const r = direct(b, identity);
    ok(`${label} is REFUSED`, r.published === false);
    ok(`${label} threw PolicyViolation`, r.error instanceof PolicyViolation);
    ok(`${label} error explains why`, why.test(r.error.message));
    ok(`${label} published ZERO events`, r.delta === 0 && b.log.length === before);
    ok(`${label} left no directive`, compOf(b).directives.length === 0);
    ok(`${label} left responsibility intact`, compOf(b).organisation === "SOLC");
  }

  // The two gates, isolated: an event that HAS an actor but presents no
  // identity reaches requireCapability, which refuses rather than waving it
  // through. An absent identity is never a bypass.
  {
    const b = bus();
    produce(b);
    let err = null;
    try {
      createProductionEmitter({
        publish: b.publish, actor: "Someone Plausible", hub: A.hub,
        policy: createPolicy([requireActor, requireCapability(null)]),
      }).directWork({ component: COMP, directedTo: SOLC.id, directedToClass: "institution",
                      instruction: "do it" });
    } catch (e) { err = e; }
    ok("F2b. an actor with no presented identity is refused by requireCapability",
       err?.rule === "requireCapability");
    ok("F2b. and the error says no authenticated identity was presented",
       /no authenticated identity/.test(err.message));
    ok("F2b. zero events", b.log.length === 1);   // the produce() only
  }

  // R — the actor picker cannot grant authority. Same principle as E8.
  {
    const b = bus();
    produce(b);
    // The NAME claims to be the authorised coordinator; the authenticated
    // identity is an unverified sme. Authority must come from the profile.
    const r = direct(b, { ...SME, person: "Ibrahim Danladi (Head of Workshop)" });
    ok("R. a person NAMED as head of workshop is still refused", r.published === false);
    ok("R. because authority comes from the authenticated role, not the label",
       /"sme"/.test(r.error.message) && /work\.direct/.test(r.error.message));
    ok("R. and produced no directive", compOf(b).directives.length === 0);
  }
}

// ============================================================
console.log("\nMALFORMED TARGETS ARE REJECTED");
// ============================================================
{
  const bad = (fields) => validateEvent(Events.production({
    component: COMP, type: WD, person: COORD.person, human: COORD.person,
    summary: "do the thing", ...fields }));

  ok("a directive with NO target is invalid", bad({}).valid === false);
  ok("the error names directedTo",
     bad({}).issues.some((i) => /directedTo/.test(i.message)));
  ok("an empty target is invalid", bad({ directedTo: "" }).valid === false);
  ok("a target with NO declared class is invalid",
     bad({ directedTo: "SOLC" }).valid === false);
  ok("a target with an out-of-set class is invalid",
     bad({ directedTo: "SOLC", directedToClass: "machine" }).valid === false);
  ok("a valid PERSON target passes",
     bad({ directedTo: "Adaeze Okoro", directedToClass: "person" }).valid === true);
  ok("a valid INSTITUTION target passes",
     bad({ directedTo: "SOLC", directedToClass: "institution" }).valid === true);
  ok("a directive with no instruction is invalid — production requires a summary",
     validateEvent(Events.production({ component: COMP, type: WD, person: "P", human: "P",
       directedTo: "SOLC", directedToClass: "institution", summary: "" })).valid === false);

  // directedTo may not leak onto other event types.
  ok("directedTo on a non-directive event is refused",
     validateEvent(Events.production({ component: COMP, person: "P", human: "P",
       summary: "produced", directedTo: "SOLC", directedToClass: "institution" })).valid === false);
  ok("a declared class with no target is refused",
     validateEvent(Events.production({ component: COMP, type: WD, person: "P", human: "P",
       summary: "s", directedToClass: "person" })).valid === false);
}

// ============================================================
console.log("\nS — IDEMPOTENCY / REPLAY");
// ============================================================
{
  const b = bus();
  produce(b);
  const r = direct(b, COORD);
  ok("S. one directive after one event", compOf(b).directives.length === 1);
  b.publish(r.event);
  ok("S. replaying the identical event does NOT duplicate the directive",
     compOf(b).directives.length === 1);
  ok("S. deduplication is by eventId", compOf(b).directives[0].eventId === r.event.eventId);
  direct(b, COORD, { instruction: "Also deburr the flange" });
  ok("S. a genuinely different directive IS recorded", compOf(b).directives.length === 2);
  ok("S. the fold is deterministic",
     JSON.stringify(project(b.log, MISSIONS).components[COMP]) ===
     JSON.stringify(project(b.log, MISSIONS).components[COMP]));
}

// ============================================================
console.log("\nU + V — MULTI-ORGANISATION COEXISTENCE AND PROVENANCE");
// ============================================================
{
  const b = bus();
  produce(b);                                        // SOLC responsible, Adaeze performs
  direct(b, COORD, { organisation: "EXTERNAL-WORKS-002" });  // external coordinator
  contribute(b, "Student A", UNI);                   // university contributor
  contribute(b, "NYSC Member B", undefined);         // no organisation
  b.publish(Events.knowledge({ knowledge: "adv", component: COMP, specification: SPEC,
    type: EVENT_TYPES.KNOWLEDGE.REVIEWED, person: ADVISER.person, human: ADVISER.person,
    summary: "advice" }));                           // diaspora adviser

  const v = b.view(), c = v.components[COMP];
  ok("U. responsibility is SOLC and only SOLC", c.organisation === "SOLC");
  ok("U. three contributors coexist", c.contributions.length === 3);
  ok("U. one directive coexists with them", c.directives.length === 1);
  ok("U. one performer coexists with them", c.history.length === 1);
  ok("U. the university did not trigger a responsibility conflict",
     v.anomalies.length === 0);
  ok("U. four distinct organisations appear across the relations without conflict",
     new Set([c.organisation, c.directives[0].organisation,
              ...c.contributions.map((x) => x.organisation)].filter(Boolean)).size === 3);
  ok("V. the responsible organisation still resolves to PILOT",
     provenanceOfOrganisation(c.organisation, SEED_ORGANISATIONS) === PROVENANCE.PILOT);
  ok("V. an unregistered coordinating organisation resolves to null, not SEED",
     provenanceOfOrganisation("EXTERNAL-WORKS-002", SEED_ORGANISATIONS) === null);
  ok("V. no provenance value was invented — still three",
     Object.keys(PROVENANCE).length === 3);
  ok("V. directing did not fabricate an organisation for the target",
     c.directives[0].directedTo === "SOLC");
}

// ============================================================
console.log("\nZ — E6 / E7 / E8 REGRESSION");
// ============================================================
{
  const b = bus();
  const common = { publish: b.publish, actor: "Adaeze Okoro", hub: A.hub,
                   policy: createPolicy([requireActor, requireCapability(SME)]),
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
  ok("Z/E8. an unverified sme is still not blocked from manufacturing", threw === null);
  ok("Z/E7. the full recovery path still reaches assembly", c.state === "assembly");
  ok("Z/E7. the transition chain is intact",
     c.history.map((h) => h.transition).join() ===
     "release,submitForInspection,fail,submitForInspection,pass");
  ok("Z/E6. responsibility is still SOLC", c.organisation === "SOLC");
  ok("Z/E6. mission progress still moves", b.view().missions[0].accepted === 1);
  ok("Z. no lifecycle event was misread as a directive", c.directives.length === 0);
  ok("Z. no lifecycle event was misread as a contribution", c.contributions.length === 0);
  ok("Z/E8. engineering approval is still capability-gated",
     capabilityFor(EVENT_TYPES.ENGINEERING.SPEC_APPROVED) === "engineering.approve");
  ok("Z/E8. engineering.approve is still verification-gated",
     VERIFICATION_GATED.includes("engineering.approve"));
  ok("Z. work.direct was NOT added to the verification gate in this pass",
     !VERIFICATION_GATED.includes("work.direct"));
}

console.log(`\n${pass}/${pass + fail} assertions passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
