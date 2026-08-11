// ============================================================
// FORGE OS — ONE MANUFACTURING STORY
//
// Thirteen real events, published to the real bus, through the real
// factories. Nothing here is a mock: every step is an event the system
// would receive from a workshop, and every consequence is DERIVED.
//
// Two deliberate departures from the brief, both architectural:
//
// 1. There is no `mission.progress` event and no `grid.updated` event.
//    Progress and grid figures are derived from the projection by counting
//    components that reached assembly. Publishing them would reintroduce the
//    duplicate state we just removed — and would let the two disagree.
//    They move because the story causes them to, which is the entire point.
//
// 2. Every type is canonical, so the kernel audit passes. The brief used
//    `lifecycle.reworked`, `engineering.specification.rejected` and
//    `system.notice`, none of which exist. Rework is inspection.reworked; a
//    rejection is the state graph's "reject" transition back to draft.
//
// The failure is intentional. A story where everything succeeds teaches
// nothing about a quality system.
// ============================================================
import Events, { EVENT_TYPES, INSPECTION_RESULT } from "./events.js";

const SPEC = "FTT-CR-001";
const COMP = "COMP-CR-0001";
const MISSION = "FORGE-ALPHA";
const CID = `mission-${MISSION}`;          // correlationId threads the whole story

// MISSION IDENTITY — preserved, not inferred.
//
// `mission: MISSION` is carried on the ten steps that operate on this mission's
// own specification (SPEC) or its own component (COMP). Those steps already
// declared the association through CID; the field simply stops the identity
// being dropped, so `affectedMission` resolves instead of reading null. It is
// preservation of an authored fact, not a new claim.
//
// The two machine steps (mill-03 start / complete) are DELIBERATELY LEFT
// UNCORRELATED. A machine run is not intrinsically mission-scoped: the same
// mill serves any mission, and the only thing tying these two events to
// FORGE-ALPHA is their position in this narrative. Asserting mission on them
// would be inference dressed as identity. The projection therefore attributes
// nothing to them — which is the honest result, even though it means the
// causal map's machine-fault "blocked" impact stays unattributed.
//
// No lifecycle event was added. The story still never authorises the mission,
// so `engineering.specification.released` legitimately fails to
// `completePackage` from `planning`, and that anomaly is a correct reading of
// this sequence rather than a defect to be silenced.

const step = (title, description, event) => ({ title, description, event });

export const MANUFACTURING_STORY = [
  step("Mission created", "NAWEDOAM chassis production mission opened",
    Events.mission({ mission: MISSION, hub: "abuja", person: "Programme Director",
      human: "Programme Director", correlationId: CID,
      summary: `${MISSION} opened — manufacture 50 chassis rails` })),

  step("Specification drafted", `${SPEC} chassis rail drawing authored`,
    Events.engineering({ specification: SPEC, type: EVENT_TYPES.ENGINEERING.SPEC_DRAFTED,
      transition: "submitForReview", hub: "abuja", person: "Ngozi Bello", human: "Ngozi Bello",
      mission: MISSION, correlationId: CID, summary: `${SPEC} submitted for engineering review` })),

  step("Rejected to draft", "Missing ASME certification reference — returned to author",
    Events.engineering({ specification: SPEC, type: EVENT_TYPES.ENGINEERING.SPEC_REVISED,
      transition: "reject", hub: "abuja", person: "Folake Adeyemi", human: "Folake Adeyemi",
      supersedes: "A.01", mission: MISSION, correlationId: CID,
      summary: `${SPEC} rejected — ASME certification reference absent` })),

  step("Revised and resubmitted", "Rev B.01 adds the certification reference",
    Events.engineering({ specification: SPEC, type: EVENT_TYPES.ENGINEERING.SPEC_DRAFTED,
      transition: "submitForReview", hub: "abuja", person: "Ngozi Bello", human: "Ngozi Bello",
      revision: "B.01", mission: MISSION, correlationId: CID, summary: `${SPEC} rev B.01 submitted for review` })),

  step("Approved for manufacture", "Rule ENG-001 and ENG-003 satisfied",
    Events.engineering({ specification: SPEC, type: EVENT_TYPES.ENGINEERING.SPEC_APPROVED,
      transition: "approve", hub: "abuja", person: "Folake Adeyemi", human: "Folake Adeyemi",
      revision: "B.01", mission: MISSION, correlationId: CID,
      summary: `${SPEC} rev B.01 approved for manufacture` })),

  step("Released for production", "Manufacturing unlocked — Rule SPC-001 satisfied",
    Events.engineering({ specification: SPEC, type: EVENT_TYPES.ENGINEERING.SPEC_RELEASED,
      transition: "release", hub: "abuja", person: "Folake Adeyemi", human: "Folake Adeyemi",
      revision: "B.01", mission: MISSION, correlationId: CID, summary: `${SPEC} released — production authorised` })),

  step("Machine started", "Mill-03 begins fabrication at Lagos",
    Events.machine({ machine: "mill-03", type: EVENT_TYPES.MACHINE.START, hub: "lagos",
      person: "Adaeze Okoro", human: "Adaeze Okoro", workshop: "Lagos Fabrication Works",
      correlationId: CID, summary: "Mill-03 started — chassis rail fabrication" })),

  step("Component produced", `${COMP} fabricated against ${SPEC}`,
    Events.production({ component: COMP, specification: SPEC, machine: "mill-03", hub: "lagos",
      person: "Adaeze Okoro", human: "Adaeze Okoro", workshop: "Lagos Fabrication Works",
      mission: MISSION, correlationId: CID, summary: `${COMP} produced — awaiting inspection` })),

  step("Inspection failed", "Bore diameter outside tolerance — component returned",
    Events.inspection({ component: COMP, specification: SPEC, machine: "cmm-01", hub: "lagos",
      result: INSPECTION_RESULT.FAIL, person: "Amina Suleiman", human: "Amina Suleiman",
      workshop: "Forge Quality Office", mission: MISSION, correlationId: CID,
      summary: `${COMP} failed inspection — bore diameter out of tolerance` })),

  step("Component reworked", "Bore corrected, resubmitted for inspection",
    Events.inspection({ component: COMP, specification: SPEC, machine: "mill-03", hub: "lagos",
      type: EVENT_TYPES.INSPECTION.REWORKED, result: INSPECTION_RESULT.PENDING,
      person: "Adaeze Okoro", human: "Adaeze Okoro", workshop: "Lagos Fabrication Works",
      mission: MISSION, correlationId: CID, summary: `${COMP} reworked — awaiting re-inspection` })),

  step("Inspection passed", "All dimensions within tolerance — component accepted",
    Events.inspection({ component: COMP, specification: SPEC, machine: "cmm-01", hub: "lagos",
      result: INSPECTION_RESULT.PASS, person: "Amina Suleiman", human: "Amina Suleiman",
      workshop: "Forge Quality Office", mission: MISSION, correlationId: CID,
      summary: `${COMP} passed inspection — accepted` })),

  step("Machine released", "Mill-03 available for the next component",
    Events.machine({ machine: "mill-03", type: EVENT_TYPES.MACHINE.COMPLETE, hub: "lagos",
      person: "Adaeze Okoro", human: "Adaeze Okoro", workshop: "Lagos Fabrication Works",
      correlationId: CID, summary: "Mill-03 complete — available" })),

  step("Mission progress", "1 of 50 chassis rails accepted — counted, not asserted",
    Events.production({ component: COMP, specification: SPEC, type: EVENT_TYPES.PRODUCTION.STAGE_ADVANCED,
      stage: "accepted", hub: "lagos", person: "Amina Suleiman", human: "Amina Suleiman",
      mission: MISSION, correlationId: CID, summary: `${COMP} advanced to accepted — mission progress recalculated` })),
];

export const STORY_META = Object.freeze({
  mission: MISSION, specification: SPEC, component: COMP,
  correlationId: CID, steps: MANUFACTURING_STORY.length, stepMs: 2600,
});
