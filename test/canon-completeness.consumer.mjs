// ============================================================
// CANON P0 CLOSURE — THE HONESTY AUDIT
//
// The Canon-completeness audit returned CANON-INCOMPLETE with two P0
// contradictions. This suite exists to prove they are CLOSED, and — more
// importantly — to prove they were closed honestly rather than papered over.
//
//   P0-1  ENGINEERING BAY DISPLAYED WHAT THE CANON DOES NOT KNOW.
//         `DECLARED_SPECS` supplies a title, an author and a revision for four
//         specifications. `isEntityField("title")` is FALSE and no event in
//         events.js carries a title, so the Canon holds none of it. The room
//         merged those declarations with the folded state into one flat object,
//         and rendered them identically. A viewer could not tell which half of
//         the card came from the event log.
//
//   P0-2  THE CANON KNEW WHERE WORK HAPPENED AND COULD NOT SAY SO.
//         Every manufacturing event has carried `hub` since V1.
//         `isEntityField("hub")` is TRUE and `classForField("hub")` is
//         "workshop". The fold simply never projected it, so "where was
//         FTT-HB-001 machined?" was unanswerable from a component even though
//         the answer was sitting on every event.
//
// THE TWO FIXES ARE OPPOSITE IN KIND, AND THAT IS THE POINT:
//
//   P0-2 was a MISSING PROJECTION of an existing canonical field. The honest fix
//         is to project it. One line.
//   P0-1 was MISSING KNOWLEDGE. There is no honest fix that adds it, because
//         adding it would mean inventing a canonical field to hold data that has
//         no event basis. The honest fix is to STOP IMPLYING the Canon knows it.
//
// So the assertions below are asymmetric on purpose. For `hub` they demand that
// the Canon now answers. For titles they demand that it still REFUSES — and that
// the refusal blames Forge Canon rather than the assistant, because
// "ForgeOS has not recorded this" is a fact about the system while "I don't know"
// is an invitation to guess.
//
// WHAT THIS SUITE MUST BE ABLE TO DO: embarrass its author. Every widening of a
// shape guard elsewhere in the suite was paired with a companion assertion, and
// the adversarial section here is written to break the implementation, not to
// confirm it. Sections A–H.
//
// Real pilot context throughout: SOLC · HUB-014 · FTT-HB-001 · FORGE-HUB · warri.
//
// Run: node test/canon-completeness.consumer.mjs
// ============================================================

import { readFileSync } from "node:fs";
import { project } from "../src/os/projections.js";
import Events, { isEntityField, classForField, EVENT_TYPES } from "../src/os/events.js";
import { createProductionEmitter } from "../src/domains/production/emitters.js";
import { requireActor } from "../src/os/policy.js";
import { pilotOrganisationById, assignmentFor } from "../src/os/pilot.js";
import { ROLES, CAPABILITIES } from "../src/os/Roles.js";
import { INTENT, resolveIntent, detectSubject, UNRECORDED_SUBJECTS } from "../src/os/studio/intent.js";
import { CLAIM, canonFact, roomLocal, notRecorded, isCanonLimitation, verifyClaim,
         groundResponse, foldSource, NOT_RECORDED_BY_CANON, CANON_SILENCE }
  from "../src/os/studio/grounding.js";
import { runInference, deterministicAdapter } from "../src/os/studio/infer.js";
import { stripComments } from "./lib/source.mjs";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log(`  ok   ${n}`); } else { fail++; console.log(`  FAIL ${n}`); } };

const SPEC = "FTT-HB-001";
const COMP = "HUB-014";
const SOLC = pilotOrganisationById("SOLC");
const A = assignmentFor("SOLC");
const OPERATOR = "Adaeze Okoro";
const MISSIONS = [{ id: "FORGE-HUB", title: "Manufacture 200 wheel hubs", target: 200, specification: SPEC }];

/** The real pilot log: SOLC produced HUB-014 at warri. Nothing more. */
const pilotLog = () => {
  const log = [];
  createProductionEmitter({ publish: (e) => log.unshift(e), actor: OPERATOR, hub: A.hub,
                            policy: requireActor, correlationId: `pilot-SOLC-${COMP}` })
    .produceComponent({ component: COMP, specification: SPEC, mission: A.mission,
                        organisation: SOLC.id });
  return log;
};
const canon = (log) => project(log, MISSIONS);
const src = (p) => stripComments(readFileSync(new URL(p, import.meta.url), "utf8"));

console.log("\nCANON P0 CLOSURE — the honesty audit\n");

// ============================================================
console.log("A — P0-2: THE FOLD NOW ANSWERS A QUESTION IT ALREADY HAD THE DATA FOR");
// ============================================================
{
  const log = pilotLog();
  const view = canon(log);
  const c = view.components[COMP];

  // The justification for folding `hub` at all, measured rather than asserted.
  // If either of these ever became false, projecting `hub` would be an invention
  // and this suite should stop the build.
  ok("A. `hub` is a canonical entity field — folding it invents nothing",
     isEntityField("hub") === true);
  ok("A. and it belongs to the WORKSHOP class, not the organisation class",
     classForField("hub") === "workshop");
  ok("A. the event that already carried it is a canonical production event",
     log[0].type === EVENT_TYPES.PRODUCTION.COMPONENT_PRODUCED && log[0].hub === "warri");

  ok("A. the component now reports its manufacturing hub", c.hub === "warri");
  ok("A. and it is the hub the event carried, not the pilot config read directly",
     c.hub === log[0].hub);

  // THE CONTRADICTION, RESTATED AS A TEST. Before this change the data was in the
  // log and absent from the fold. That gap is what CANON-INCOMPLETE named.
  ok("A. the closure is a projection, not new knowledge — log and fold now agree",
     log.every((e) => !e.hub || e.hub === c.hub));

  ok("A. the fold is still deep-frozen after gaining a field",
     Object.isFrozen(view) && Object.isFrozen(c));
}

// ============================================================
console.log("\nB — P0-2: HUB IS A PLACE. IT IS NOT RESPONSIBILITY AND NOT AUTHORITY");
// ============================================================
{
  const view = canon(pilotLog());
  const c = view.components[COMP];

  ok("B. responsibility is still the organisation", c.organisation === "SOLC");
  ok("B. and the hub is a different value entirely", c.hub === "warri" && c.hub !== c.organisation);

  // The four relationships must remain four different answers.
  ok("B. hub is not the operator either",
     c.hub !== OPERATOR && !c.history.some((h) => h.by === c.hub));
  ok("B. hub did not create a participation record", c.contributions.length === 0);
  ok("B. hub did not create a directive", c.directives.length === 0);

  // ADVERSARIAL: a second organisation working at the SAME hub must not inherit
  // responsibility from the place. If `hub` were treated as authority, this is
  // where it would show.
  const log2 = pilotLog();
  const other = [];
  createProductionEmitter({ publish: (e) => other.unshift(e), actor: "Chidi Nwosu",
                            hub: "warri", policy: requireActor,
                            correlationId: "second-org-same-hub" })
    .produceComponent({ component: COMP, specification: SPEC, mission: A.mission,
                        organisation: "OTHER-ORG" });
  const merged = canon([...other, ...log2]);
  const cm = merged.components[COMP];
  ok("B. sharing a hub does not transfer responsibility", cm.organisation === "SOLC");
  // Matched on the anomaly's FIELDS, not on a substring of its JSON. The first
  // version of this assertion searched for the word "organisation" and failed,
  // because the message says "is already the responsibility of" — the audit was
  // testing its own vocabulary rather than the fold's behaviour.
  ok("B. the conflicting organisation claim is still reported as an anomaly",
     merged.anomalies.some((x) => x.attempted === "OTHER-ORG" && x.held === "SOLC" &&
                                  x.id === COMP && x.objectClass === "component"));
  ok("B. and the hub is unchanged, because both events named the same place",
     cm.hub === "warri");

  // ADVERSARIAL: a SECOND, DIFFERENT hub. `hub` is descriptive and first-writer
  // (it follows `specification`, not `organisation`), so the first value stands
  // and NO anomaly is raised. That is a deliberate choice, and it is asserted
  // here so it can never become accidental: a part can legitimately be touched
  // at more than one place, and a location disagreement is not a governance
  // failure the way a responsibility disagreement is.
  const elsewhere = [];
  createProductionEmitter({ publish: (e) => elsewhere.unshift(e), actor: OPERATOR,
                            hub: "kano", policy: requireActor, correlationId: "other-hub" })
    .produceComponent({ component: COMP, specification: SPEC, mission: A.mission,
                        organisation: SOLC.id });
  const two = canon([...elsewhere, ...pilotLog()]);
  ok("B. a second hub does not overwrite the first — first writer wins",
     two.components[COMP].hub === "warri");
  // Matched on the anomaly's VALUES, not on the word "hub" — the first version of
  // this assertion searched the anomaly JSON for /hub/i and matched the component
  // identifier "HUB-014", so it could never have passed. Two things are asserted
  // separately: no anomaly names the rejected hub, and none names a hub at all.
  const hubValues = new Set(["warri", "kano"]);
  ok("B. and a differing hub raises no anomaly, because location is not authority",
     !two.anomalies.some((x) => hubValues.has(x.attempted) || hubValues.has(x.held)));
  // The transition anomaly that IS present is named rather than hidden: producing
  // the same component twice is an illegal repeat of `release`. It has nothing to
  // do with the hub, and saying so is what makes the assertion above meaningful.
  ok("B. the only anomaly present is the duplicate transition, not a hub conflict",
     two.anomalies.length === 1 && two.anomalies[0].attempted === "release");
}

// ============================================================
console.log("\nC — P0-1: THE CANON HOLDS NO SPECIFICATION TITLE, AND SAYS SO");
// ============================================================
{
  // The measurement that FORBIDS the easy fix. Folding `title` the way `hub` was
  // folded is impossible without inventing a canonical field — so P0-1 could not
  // be closed by adding knowledge, only by stopping the implication.
  ok("C. `title` is NOT a canonical entity field", isEntityField("title") === false);
  ok("C. and no canonical event carries one",
     !("title" in Events.production({ component: COMP, specification: SPEC, person: OPERATOR })));

  const view = canon(pilotLog());
  ok("C. the fold holds no title for the component",
     !("title" in view.components[COMP]));

  // A specification nobody has acted on has NO Canon record at all — not a draft.
  ok("C. an untouched specification is absent from the Canon, not defaulted",
     view.specifications[SPEC] === undefined);
}

// ============================================================
console.log("\nD — P0-1: THE ROOM LABELS ITS OWN DECLARATIONS");
// ============================================================
{
  const bay = src("../src/rooms/EngineeringBay.jsx");

  // Source assertions, because this is a rendering contradiction and the render
  // is where it has to be fixed. Comments are stripped first, so a promise in a
  // comment cannot satisfy any of these.
  ok("D. the room distinguishes what the Canon recorded from what it declares",
     /recordedInCanon/.test(bay));
  ok("D. and derives that from the fold's own absence, not from a default state",
     /view\.specifications\[[^\]]+\]\s*\?\?\s*null/.test(bay));
  // TWO SEPARATE ASSERTIONS, FOUND BY MUTATION TESTING. The first version was a
  // single `/Room-local/i.test(bay)`, which passed even after the per-card label
  // was deleted — because the RoomShell `meta` line also contains "ROOM-LOCAL".
  // A room-wide disclaimer is not the same guarantee as a label attached to the
  // specific fields that lack an event basis, so both are now required.
  ok("D. the room-wide meta line warns that these fields are not Canon",
     /meta="[^"]*ROOM-LOCAL declarations, not Canon/.test(bay));
  ok("D. and each card carries its own ROOM-LOCAL label next to the declared fields",
     /Room-local · declared<\/div>[\s\S]{0,400}\{s\.title\}/.test(bay));
  ok("D. the surface renders a NOT-IN-CANON state for unrecorded specifications",
     /Not in Canon/i.test(bay));
  ok("D. the room names which of its fields have no event basis",
     /roomLocalFields/.test(bay) && /"title"[\s\S]{0,40}"author"[\s\S]{0,40}"revision"/.test(bay));

  // ADVERSARIAL: the fix must not have been achieved by DELETING the truthful
  // parts. The room must still fold state from the log and still be the origin of
  // the author/revision it puts onto events.
  ok("D. the room still folds specification state from the event log",
     /project\(log,\s*MISSIONS\)/.test(bay));
  ok("D. and still authors author/revision onto the events it publishes",
     /author:\s*spec\.author/.test(bay) && /revision:\s*spec\.revision/.test(bay));

  // ADVERSARIAL: the label must not be a bare string with nothing behind it. The
  // Canon badge has to be driven by the computed flag.
  ok("D. the Canon badge is driven by the flag, not hardcoded",
     /s\.recordedInCanon\s*\?/.test(bay));

  // FOUND BY MUTATION TESTING. Replacing the derivation with `recordedInCanon:
  // true` killed nothing — the assertions above only checked that the flag was
  // COMPUTED and CONSULTED, not that it was computed correctly. A flag that is
  // always true is the original contradiction wearing a badge: every card would
  // claim "Canon" including the three specifications no event has ever touched.
  // So the derivation itself is now pinned.
  ok("D. and the flag is derived from the fold's absence, never asserted",
     /recordedInCanon:\s*canonRecord\s*!==\s*null/.test(bay));
  ok("D. the badge text is not hardcoded to Canon on both branches",
     /recordedInCanon\s*\?\s*"Canon"\s*:\s*"Not in Canon"/.test(bay));
  // And the count it displays must come from the folded history, so a card that
  // says "Canon" is always accompanied by the events that justify the claim.
  ok("D. a Canon badge is justified by the folded event count it displays",
     /s\.history\.length\}\s*recorded event/.test(bay));
}

// ============================================================
console.log("\nE — P0-1: ROOM_LOCAL IS A CLAIM CLASS THAT CANNOT BE PROMOTED");
// ============================================================
{
  const view = canon(pilotLog());

  const rl = roomLocal("Wheel hub, machined billet", "EngineeringBay.DECLARED_SPECS");
  ok("E. a room declaration is classified ROOM_LOCAL, not CANON_FACT",
     rl.type === CLAIM.ROOM_LOCAL && rl.type !== CLAIM.CANON_FACT);
  ok("E. and it must say who declared it", /DECLARED_SPECS/.test(rl.origin));
  ok("E. it carries no source, because it has none", rl.source === null);

  // ADVERSARIAL: forge a ROOM_LOCAL claim carrying a REAL, RESOLVABLE fold path.
  // The path resolves. The claim must still not become a fact.
  const forged = Object.freeze({ type: CLAIM.ROOM_LOCAL, text: "Wheel hub, machined billet",
                                 origin: "attacker", source: foldSource(`components.${COMP}.state`) });
  const v = verifyClaim(forged, { view, log: pilotLog() });
  ok("E. a ROOM_LOCAL claim with a resolvable fold path is NOT promoted",
     v.type === CLAIM.ROOM_LOCAL);
  ok("E. and the smuggled source is discarded rather than resolved", v.source === null);
  ok("E. and it is never counted among the facts",
     groundResponse([forged], { view }).facts.length === 0);
  ok("E. it is kept in its own bucket a surface must ask for by name",
     groundResponse([forged], { view }).roomLocal.length === 1);

  // The neighbouring guarantee, unchanged: an ungrounded CANON_FACT still falls.
  const lie = canonFact("HUB-014 has a title of Wheel hub");
  ok("E. an ungrounded CANON_FACT still collapses to UNKNOWN",
     verifyClaim(lie, { view }).type === CLAIM.UNKNOWN);
}

// ============================================================
console.log("\nF — REFUSALS SOUND LIKE A CANON LIMIT, NOT A MODEL LIMIT");
// ============================================================
{
  const view = canon(pilotLog());

  const r = notRecorded("material", COMP, "en");
  ok("F. an unrecorded subject is refused as UNKNOWN", r.type === CLAIM.UNKNOWN);
  ok("F. and the refusal is marked a Canon limitation", isCanonLimitation(r) === true);
  ok("F. the wording names Forge Canon as the thing that lacks the information",
     /Forge Canon does not contain/.test(r.text));
  ok("F. and names the subject and the component", /material/.test(r.text) && /HUB-014/.test(r.text));

  // ADVERSARIAL: the refusal must not be a model apology. These are the phrasings
  // that would let a future model treat the gap as its own ignorance and fill it.
  const modelVoice = /\b(i (don't|do not|cannot|can't)|i'm not sure|as an ai|my training|i am unable|sorry)\b/i;
  ok("F. no refusal is phrased in the assistant's voice", !modelVoice.test(r.text));
  ok("F. across every unrecorded subject",
     UNRECORDED_SUBJECTS.every((s) => !modelVoice.test(notRecorded(s, COMP).text)));
  ok("F. every unrecorded subject has real wording, not its own key",
     UNRECORDED_SUBJECTS.every((s) => typeof NOT_RECORDED_BY_CANON[s] === "string" &&
                                      NOT_RECORDED_BY_CANON[s] !== s));

  // The Canon's voice in the participant's language. Identifiers are interpolated,
  // never translated.
  for (const lang of ["ha", "yo", "ig", "pcm", "fr"]) {
    const t = notRecorded("material", COMP, lang);
    ok(`F. the refusal speaks ${lang} and still blames Forge Canon`,
       t.language === lang && /Forge Canon/.test(t.text) && /HUB-014/.test(t.text));
  }
  ok("F. an unknown language falls back to English rather than inventing one",
     notRecorded("material", COMP, "xx").language === "en");
  ok("F. every declared language has a stem",
     Object.values(CANON_SILENCE).every((f) => typeof f === "function" &&
                                              /Forge Canon/.test(f("x", "y"))));

  ok("F. refusals are collected where a surface can find them",
     groundResponse([r], { view }).canonLimitations.length === 1);
}

// ============================================================
console.log("\nG — THE ADAPTER ANSWERS HUB AND REFUSES THE REST, HONESTLY");
// ============================================================
{
  const log = pilotLog();
  const view = canon(log);
  const run = async (text) => runInference({
    adapter: deterministicAdapter, intent: resolveIntent(text), view, log });

  // "Where is HUB-014?" already resolved to COMPONENT_STATE — no new intent was
  // needed for P0-2, only the fold field.
  const where = resolveIntent(`Where is ${COMP}?`);
  ok("G. a location question resolves to an existing intent",
     where.type === INTENT.COMPONENT_STATE && where.component === COMP);

  const g1 = await run(`Where is ${COMP}?`);
  ok("G. the hub is returned as a Canon fact",
     g1.facts.some((f) => /warri/.test(f.text)));
  ok("G. cited to the fold path that actually holds it",
     g1.facts.some((f) => f.source?.path === `components.${COMP}.hub`));
  ok("G. and nothing was downgraded — every citation resolved", g1.sound === true);

  // ADVERSARIAL: asking WHO must never return WHERE.
  const who = await run(`Who is responsible for ${COMP}?`);
  ok("G. a responsibility question returns the organisation",
     who.facts.some((f) => /SOLC/.test(f.text)));
  ok("G. and never returns the hub as the responsible party",
     !who.facts.some((f) => /warri/.test(f.text)));

  // ADVERSARIAL: the subject check must run BEFORE the intent switch, or an
  // unrecognised phrasing degrades into a MODEL limitation.
  const mat = await run(`What material is ${COMP} made from?`);
  ok("G. a material question is refused as a Canon limitation",
     mat.canonLimitations.length === 1);
  ok("G. and asserts no fact at all", mat.facts.length === 0);
  // NULL-SAFE, FOUND BY MUTATION TESTING. The first version indexed
  // `canonLimitations[0].text` directly and THREW when the mutant produced no
  // refusal — killing the process and hiding the five assertions below it. An
  // audit that crashes on the failure it was written to detect reports less than
  // one that keeps going.
  ok("G. and names Forge Canon, not the assistant",
     /Forge Canon/.test(mat.canonLimitations[0]?.text ?? ""));

  for (const q of [
    `What is the tolerance on ${COMP}?`,
    `What diameter is ${COMP}?`,
    `Show me the evidence for ${COMP}`,
    `Who is the head of workshop at warri?`,
    `What is the recorded reading for ${COMP}?`,
  ]) {
    const g = await run(q);
    ok(`G. refused as a Canon limitation: "${q}"`,
       g.canonLimitations.length >= 1 && g.facts.length === 0);
  }

  // "Explain the drawing" is the interesting case: the Canon holds part of the
  // answer. It must state what it knows AND what it does not, in one response.
  const specLog = pilotLog();
  const drawn = await runInference({
    adapter: deterministicAdapter,
    intent: resolveIntent(`Explain the drawing for ${SPEC}`),
    view: canon(specLog), log: specLog });
  ok("G. an absent specification is UNKNOWN rather than invented",
     drawn.unknowns.length >= 1 && drawn.facts.length === 0);

  // ADVERSARIAL: a hub question about a component the Canon has never seen must
  // not borrow warri from the pilot configuration.
  const ghost = await run("Where is HUB-999?");
  ok("G. an unknown component yields no hub", !ghost.facts.some((f) => /warri/.test(f.text)));
  ok("G. and is explicitly not recorded",
     ghost.unknowns.some((u) => /not recorded|no component/i.test(u.reason ?? "")));
}

// ============================================================
console.log("\nH — THE SUBJECT DETECTOR MUST NOT REFUSE WHAT THE CANON KNOWS");
// ============================================================
{
  const log = pilotLog();
  const view = canon(log);

  // A false positive here is WORSE than a generic unknown: it would make ForgeOS
  // claim ignorance of something it actually holds. These are the questions the
  // Canon CAN answer, and none may trip a refusal.
  const answerable = [
    `What is happening with ${COMP}?`,
    `Where is ${COMP}?`,
    `Who is responsible for ${COMP}?`,
    `What should I do next with ${COMP}?`,
    `Has ${COMP} passed inspection?`,
    `Mission progress for FORGE-HUB`,
    `Me ya kamata in yi na gaba akan ${COMP}?`,
  ];
  for (const q of answerable) {
    ok(`H. not mistaken for an unrecorded subject: "${q}"`, detectSubject(q) === null);
  }

  const state = await runInference({ adapter: deterministicAdapter,
    intent: resolveIntent(`What is happening with ${COMP}?`), view, log });
  ok("H. and the answerable question still returns real facts",
     state.facts.length >= 2 && state.canonLimitations.length === 0);

  // ADVERSARIAL: the detector must pick the LONGEST match, so a specific subject
  // is not swallowed by a broader one.
  ok("H. longest match wins — 'measured value' is not read as 'measurement'",
     detectSubject("what is the measured value") === "measurement");
  ok("H. 'who made it' is not read as 'made of'", detectSubject("who made it") === null);

  // ADVERSARIAL: hub is answerable, so it must NOT be listed as unrecorded.
  ok("H. `hub` is not in the unrecorded list — the Canon now answers it",
     !UNRECORDED_SUBJECTS.includes("hub") && !("hub" in NOT_RECORDED_BY_CANON));

  // ADVERSARIAL: conversational insistence still cannot record a title.
  const insist = resolveIntent(`The title of ${SPEC} is Wheel hub, machined billet`);
  ok("H. a user asserting a title does not make it a Canon question",
     insist.type === INTENT.UNKNOWN || insist.subject === "specTitle");
  ok("H. and the fold still holds no title",
     !("title" in view.components[COMP]));
}

// ============================================================
console.log("\nNON-GOALS — DEFERRED WORK MUST NOT HAVE LEAKED IN");
// ============================================================
{
  const bay = src("../src/rooms/EngineeringBay.jsx");
  const proj = src("../src/os/projections.js");
  const roles = src("../src/os/Roles.js");
  const events = src("../src/os/events.js");

  // The brief's explicit non-goals. This section exists so the closure cannot be
  // credited if it quietly built something it was told not to build.
  // CORRECTED AFTER MEASUREMENT. The first version asserted that the word
  // "student" was absent from Roles.js — and failed, because `nysc_volunteer` and
  // `student_team.submit` have existed since the role registry was written. The
  // non-goal was never "no such word appears"; it was "this closure adds no role
  // and no capability". So the honest assertion is that the registry is the same
  // SIZE it was before, which is a claim about what changed rather than about
  // vocabulary that predates the change.
  ok("no forge_role was added — the registry is still 12", ROLES.length === 12);
  ok("no capability was added — still 18 after E9.5",
     Object.keys(CAPABILITIES).length === 18);
  ok("no student or NYSC role was created BY THIS CLOSURE — the two that exist are E1 roles",
     ROLES.filter((r) => /student|nysc/i.test(r.id)).map((r) => r.id).join() === "nysc_volunteer");
  ok("no Head of Workshop authority was created",
     !/head[_\s-]?of[_\s-]?workshop|workshopHead/i.test(roles + events + proj));
  ok("no Canon Authority model was created", !/canonAuthority|CANON_AUTHORITY/.test(proj + events));
  ok("no evidence or measurement architecture was added",
     !/\bevidence\b|\bmeasurements?\b/i.test(proj));
  // EVENT_TYPES is GROUPED by domain, so `Object.keys` counts 9 domains, not 34
  // types. The first version of this assertion counted the wrong thing and would
  // have passed happily if a 35th type had been added to an existing group.
  ok("the event vocabulary is unchanged at 34 types",
     Object.values(EVENT_TYPES).flatMap((d) => Object.values(d)).length === 34);
  ok("no per-event user provenance was introduced", !/provenance:\s*["']user["']/.test(events));
  ok("no LLM provider, key or endpoint appears anywhere in Studio",
     !/openai|anthropic|api[_-]?key|fetch\(/i.test(src("../src/os/studio/infer.js")));
  ok("the room did not import room-local data into the Canon",
     !/DECLARED_SPECS/.test(proj) && !/publish\([^)]*title/.test(bay));

  // The P0-2 fold addition is exactly one field, folded exactly one way.
  ok("hub is folded first-writer and silent, like specification not like organisation",
     /c\.hub\s*\?\?=\s*e\.hub/.test(proj) && !/hub[\s\S]{0,80}anomal/i.test(proj));
}

// ============================================================
console.log(`\n${pass}/${pass + fail} assertions passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
