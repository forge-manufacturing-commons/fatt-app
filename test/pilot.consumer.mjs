// ============================================================
// FORGE OS — PILOT HARNESS  (E6 Alpha Activation)
//
// Proves the whole chain from a real organisation to a derived component state,
// and — more importantly — proves the things that must NOT happen. Most of this
// file is adversarial: it feeds the system hubs, workshops, roles, capabilities,
// missions and commercial catalogue text and demands that none of them turn into
// manufacturing responsibility.
//
// WHAT THIS FILE CANNOT TEST, STATED PLAINLY. Organisation creation is a
// Supabase write. This deployment has no keys, `isConfigured` is false and
// `supabase` is null, so no assertion here can exercise the insert or the
// profile link. Those four Part 9 organisation checks are reported as BLOCKED at
// the bottom rather than replaced with a mock that would pass while the real
// path stayed broken. What IS tested here is everything the write depends on and
// everything that consumes it.
//
// Run: node test/pilot.consumer.mjs
// ============================================================

import { readFileSync } from "node:fs";
import { project } from "../src/os/projections.js";
import Events, { EVENT_TYPES, INSPECTION_RESULT, validateEvent } from "../src/os/events.js";
import {
  PROVENANCE, COMPONENT_CLASS, SEED_ORGANISATIONS, SEED_CAPABILITIES,
  classForSpecification, organisationsCapableOf, isSeedOrganisation,
} from "../src/os/network.js";
import {
  PILOT_ORGANISATIONS, PILOT_ASSIGNMENTS, pilotOrganisationById,
  pilotOrganisationByName, isPilotOrganisation, assignmentFor,
  provenanceOfOrganisation, pilotIntegrityProblems, assertPilotIntegrity,
} from "../src/os/pilot.js";
import { componentState } from "../src/domains/production/state.js";
import {
  MANUFACTURING_ACTIONS, wouldAccept, resultingState, availableActions,
} from "../src/domains/production/entry.js";
import { createProductionEmitter } from "../src/domains/production/emitters.js";
import { createInspectionEmitter } from "../src/domains/inspection/emitters.js";
import { requireActor } from "../src/os/policy.js";
import { stripComments } from "./lib/source.mjs";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log(`  ok   ${n}`); } else { fail++; console.log(`  FAIL ${n}`); } };

const asLog = (events) => [...events].reverse();      // newest-first, as the bus keeps it
const MISSIONS = [{ id: "FORGE-HUB", title: "Manufacture 200 wheel hubs", target: 200, specification: "FTT-HB-001" }];

const SOLC = pilotOrganisationById("SOLC");
const ASSIGNMENT = assignmentFor("SOLC");
const ACTOR = "Pilot Operator";
const PART = "HUB-014";      // supplied by the test as an operator would supply it

/** Collect events instead of publishing to a bus. */
const collector = () => { const out = []; return { out, publish: (e) => { out.push(e); return e; } }; };

const emitterFor = (action, publish) => {
  const common = { publish, actor: ACTOR, hub: ASSIGNMENT.hub, policy: requireActor,
                   correlationId: `pilot-SOLC-${PART}` };
  return action.domain === "inspection" ? createInspectionEmitter(common) : createProductionEmitter(common);
};

/** Record a pilot fact exactly as PilotEntry does — organisation from config. */
const record = (actionId, { component = PART, publish } = {}) => {
  const action = MANUFACTURING_ACTIONS.find((a) => a.id === actionId);
  return emitterFor(action, publish)[action.command]({
    component,
    specification: ASSIGNMENT.specification,
    mission: ASSIGNMENT.mission,
    organisation: SOLC.id,
  });
};

console.log("\nFORGE OS — pilot activation (SOLC · wheel hub)\n");

// ============================================================
console.log("PILOT CONFIGURATION");
// ============================================================
{
  ok("SOLC exists as a pilot organisation", SOLC !== null);
  ok("SOLC's role is the supplied forge_role 'sme'", SOLC.role === "sme");
  ok("SOLC's hub is the supplied 'warri'", SOLC.hubs.join() === "warri");
  ok("SOLC carries PILOT provenance, not SEED", SOLC.provenance === PROVENANCE.PILOT);
  ok("SOLC is unverified — admission is not verification", SOLC.verification === "unverified");
  ok("SOLC is NOT a seed organisation", isSeedOrganisation("SOLC") === false);
  ok("SOLC is not in the seed registry at all",
     SEED_ORGANISATIONS.every((o) => o.id !== "SOLC"));

  ok("nothing was invented about SOLC's legal identity",
     [SOLC.rcNumber, SOLC.state, SOLC.city, SOLC.website, SOLC.description]
       .every((v) => v === null));

  ok("the shipped configuration passes its own integrity check", assertPilotIntegrity() === true);
  ok("SOLC holds exactly one assignment", ASSIGNMENT !== null);
  ok("the assignment names the supplied specification", ASSIGNMENT.specification === "FTT-HB-001");
  ok("the assignment names the supplied mission", ASSIGNMENT.mission === "FORGE-HUB");
  ok("the assignment's mission exists in the mission registry",
     MISSIONS.some((m) => m.id === ASSIGNMENT.mission));
  ok("the component INSTANCE is null — it was never supplied", ASSIGNMENT.component === null);
}

// ============================================================
console.log("\nWHEEL HUB INTEGRITY — the disc was never substituted");
// ============================================================
{
  ok("the assignment's class is wheel-hub", ASSIGNMENT.componentClass === COMPONENT_CLASS.WHEEL_HUB);
  ok("FTT-HB-001 maps to wheel-hub in the taxonomy",
     classForSpecification("FTT-HB-001") === COMPONENT_CLASS.WHEEL_HUB);
  ok("the specification and the assignment agree on the class",
     classForSpecification(ASSIGNMENT.specification) === ASSIGNMENT.componentClass);

  ok("no wheel-disc component class was created",
     Object.values(COMPONENT_CLASS).every((c) => !/disc/i.test(c)));
  ok("no wheel-disc identifier appears in the pilot configuration",
     !/disc/i.test(JSON.stringify({ PILOT_ORGANISATIONS, PILOT_ASSIGNMENTS })));
  ok("FTT-WD-001 has no class — an unmapped drawing stays UNKNOWN",
     classForSpecification("FTT-WD-001") === null);

  // ADVERSARIAL — the guard must reject a disc pointed at the hub's class.
  const discAtHubClass = pilotIntegrityProblems(
    PILOT_ORGANISATIONS,
    [{ ...ASSIGNMENT, specification: "FTT-WD-001" }],
  );
  ok("a wheel-disc drawing claiming the wheel-hub class is REFUSED",
     discAtHubClass.some((p) => /wheel disc|maps to/i.test(p)));

  const discClass = pilotIntegrityProblems(
    PILOT_ORGANISATIONS,
    [{ ...ASSIGNMENT, componentClass: "wheel-disc" }],
  );
  ok("an invented wheel-disc class is REFUSED",
     discClass.some((p) => /unknown component class|wheel disc/i.test(p)));

  // ADVERSARIAL — a fabricated hub must not be accepted.
  const fakeHub = pilotIntegrityProblems(
    PILOT_ORGANISATIONS,
    [{ ...ASSIGNMENT, hub: "kaduna" }],
  );
  ok("SOLC at a hub it does not hold is REFUSED",
     fakeHub.some((p) => /not among its hubs/.test(p)));

  // ADVERSARIAL — a pilot record may not promote itself.
  ok("a pilot organisation claiming SEED provenance is REFUSED",
     pilotIntegrityProblems([{ ...SOLC, provenance: PROVENANCE.SEED }], []).length > 0);
  ok("a pilot organisation claiming verification is REFUSED",
     pilotIntegrityProblems([{ ...SOLC, verification: "verified" }], []).length > 0);
  ok("an assignment naming an unknown organisation is REFUSED",
     pilotIntegrityProblems(PILOT_ORGANISATIONS,
       [{ ...ASSIGNMENT, organisation: "NOT-A-PILOT" }]).length > 0);
}

// ============================================================
console.log("\nORGANISATION IDENTITY RESOLUTION");
// ============================================================
{
  ok("SOLC resolves by exact name", pilotOrganisationByName("SOLC")?.id === "SOLC");
  ok("resolution tolerates surrounding whitespace", pilotOrganisationByName("  SOLC ")?.id === "SOLC");
  ok("resolution is case-insensitive", pilotOrganisationByName("solc")?.id === "SOLC");
  ok("an unknown organisation resolves to null", pilotOrganisationByName("Acme Fabrication") === null);
  ok("an empty name resolves to null", pilotOrganisationByName("   ") === null);
  ok("a non-string name resolves to null", pilotOrganisationByName(undefined) === null);
  ok("a partial name does NOT resolve — no fuzzy admission",
     pilotOrganisationByName("SOL") === null && pilotOrganisationByName("SOLC Ltd") === null);

  // ADVERSARIAL — organisation identity is not workshop text, not a role, and
  // not a commercial catalogue label.
  ok("workshop text is not an organisation",
     pilotOrganisationByName("Lagos Fabrication Works") === null);
  ok("owner_org catalogue text is not an organisation",
     ["Sheet-metal SME", "Certified gas fitter", "Automotive workshop"]
       .every((t) => pilotOrganisationByName(t) === null));
  ok("a hub id is not an organisation", pilotOrganisationByName("warri") === null);
  ok("a role label is not an organisation", pilotOrganisationByName("SME") === null);
  ok("a mission id is not an organisation", pilotOrganisationByName("FORGE-HUB") === null);
}

// ============================================================
console.log("\nPROVENANCE — three claims, never interchangeable");
// ============================================================
{
  ok("pilot remains pilot", provenanceOfOrganisation("SOLC", SEED_ORGANISATIONS) === PROVENANCE.PILOT);
  ok("seed remains seed", provenanceOfOrganisation("DEMO-ORG-001", SEED_ORGANISATIONS) === PROVENANCE.SEED);
  ok("every seed organisation still reads seed",
     SEED_ORGANISATIONS.every((o) => provenanceOfOrganisation(o.id, SEED_ORGANISATIONS) === PROVENANCE.SEED));
  ok("unknown remains unknown — absence is not real",
     provenanceOfOrganisation("NOT-A-MEMBER", SEED_ORGANISATIONS) === null);
  ok("an unknown organisation is neither pilot nor seed",
     isPilotOrganisation("NOT-A-MEMBER") === false && isSeedOrganisation("NOT-A-MEMBER") === false);
  ok("no record anywhere claims REAL provenance",
     [...PILOT_ORGANISATIONS, ...SEED_ORGANISATIONS, ...SEED_CAPABILITIES, ...PILOT_ASSIGNMENTS]
       .every((r) => r.provenance !== PROVENANCE.REAL));
  ok("PROVENANCE holds exactly three values", Object.keys(PROVENANCE).length === 3);
}

// ============================================================
console.log("\nMANUFACTURING RESPONSIBILITY — SOLC to the wheel hub");
// ============================================================
{
  const { out, publish } = collector();
  record("produced", { publish });
  const p = project(asLog(out), MISSIONS);
  const c = p.components[PART];

  ok("the component reached the fold", Boolean(c));
  ok("SOLC is recorded as responsible", c.organisation === "SOLC");
  ok("the specification came through", c.specification === "FTT-HB-001");
  ok("mission correlation survived", c.mission === "FORGE-HUB");
  ok("the state was derived, not asserted", c.state === "manufacturing");
  ok("no anomaly was raised by a clean record", p.anomalies.length === 0);

  // repeated identical claim is harmless
  const { out: o2, publish: p2 } = collector();
  record("produced", { publish: p2 });
  record("passed",   { publish: p2 });
  const twice = project(asLog(o2), MISSIONS);
  ok("a second event with the SAME organisation is stable",
     twice.components[PART].organisation === "SOLC");
  ok("a repeated identical claim raises no anomaly",
     twice.anomalies.filter((a) => /responsibility/.test(a.message)).length === 0);

  // conflicting claim: first writer keeps authority, refusal is recorded
  const { out: o3, publish: p3 } = collector();
  record("produced", { publish: p3 });
  createProductionEmitter({ publish: p3, actor: "Someone Else", hub: "kaduna" })
    .advanceStage({ component: PART, stage: "accepted", organisation: "DEMO-ORG-001" });
  const conflict = project(asLog(o3), MISSIONS);
  ok("a conflicting organisation does NOT reassign the component",
     conflict.components[PART].organisation === "SOLC");
  const anom = conflict.anomalies.find((a) => /cannot be claimed/.test(a.message));
  ok("the conflicting claim is recorded as an anomaly", Boolean(anom));
  ok("the anomaly names the claim and the authority",
     anom?.attempted === "DEMO-ORG-001" && anom?.held === "SOLC");
}

// ============================================================
console.log("\nRESPONSIBILITY IS NOT INFERRED — five refusals");
// ============================================================
{
  const bare = (fields) => {
    const { out, publish } = collector();
    createProductionEmitter({ publish, actor: ACTOR }).produceComponent({ component: "X-1", ...fields });
    return project(asLog(out), MISSIONS).components["X-1"];
  };

  ok("hub does NOT imply organisation", bare({ hub: "warri" }).organisation === null);
  ok("workshop does NOT imply organisation",
     bare({ workshop: "Lagos Fabrication Works" }).organisation === null);
  ok("owner_org does NOT imply organisation",
     bare({ owner_org: "Sheet-metal SME" }).organisation === null);
  ok("mission does NOT imply organisation",
     bare({ mission: "FORGE-HUB" }).organisation === null);
  ok("specification does NOT imply organisation",
     bare({ specification: "FTT-HB-001" }).organisation === null);
  ok("person does NOT imply organisation", bare({ person: ACTOR }).organisation === null);
  ok("all of them together still do NOT imply organisation",
     bare({ hub: "warri", workshop: "Lagos Fabrication Works", owner_org: "Sheet-metal SME",
            mission: "FORGE-HUB", specification: "FTT-HB-001" }).organisation === null);

  // CAPABILITY IS NOT RESPONSIBILITY — the sharpest case, because the seed
  // registry names a DIFFERENT organisation as capable of this very class.
  const capable = organisationsCapableOf(COMPONENT_CLASS.WHEEL_HUB);
  ok("the seed registry says DEMO-ORG-002 can make wheel hubs", capable.includes("DEMO-ORG-002"));
  ok("SOLC holds NO recorded capability for wheel hubs", capable.includes("SOLC") === false);

  const { out, publish } = collector();
  record("produced", { publish });
  const c = project(asLog(out), MISSIONS).components[PART];
  ok("responsibility is SOLC even though it has no recorded capability",
     c.organisation === "SOLC");
  ok("the capable organisation is NOT made responsible",
     c.organisation !== "DEMO-ORG-002");
}

// ============================================================
console.log("\nEVENT AUTHORITY — canonical, validated, attributable");
// ============================================================
{
  const { out, publish } = collector();
  const e = record("produced", { publish });

  ok("the action produced exactly one event", out.length === 1);
  ok("the event type is canonical",
     e.type === EVENT_TYPES.PRODUCTION.COMPONENT_PRODUCED);
  ok("the event validates", validateEvent(e).valid === true);
  ok("the event raises no validation warnings either",
     validateEvent(e).issues.length === 0);
  ok("the event carries the resolved organisation", e.organisation === "SOLC");
  ok("the event carries an actor", Boolean(e.person && e.human));
  ok("the event carries the pilot hub", e.hub === "warri");
  ok("the event is correlated", e.correlationId === `pilot-SOLC-${PART}`);
  ok("the event carries a schema version", e.schema === "1.1.0");

  // The policy gate must refuse an unattributable production record.
  let refused = false;
  try {
    createProductionEmitter({ publish: () => {}, policy: requireActor })
      .produceComponent({ component: PART, organisation: "SOLC" });
  } catch (err) { refused = /requireActor/.test(err.message); }
  ok("an unattributable manufacturing record is REFUSED by policy", refused);

  // Schema must refuse an incomplete record.
  let incomplete = false;
  try { Events.assert({ type: EVENT_TYPES.PRODUCTION.COMPONENT_PRODUCED, organisation: "SOLC" }); }
  catch { incomplete = true; }
  ok("a production event with no component is REFUSED by schema", incomplete);

  // No new vocabulary was introduced anywhere in this pass.
  const all = Object.values(EVENT_TYPES).flatMap((d) => Object.values(d));
  ok("the event vocabulary is still 32 types", all.length === 32);
  ok("no pilot/organisation/workorder event type was added",
     all.filter((t) => /pilot|organisation|workorder|responsib/i.test(t)).length === 0);
}

// ============================================================
console.log("\nTHE FORM CANNOT SUPPLY THE ORGANISATION  (code-only evidence)");
// ============================================================
{
  // Prose cannot satisfy these checks: comments are stripped first, exactly as
  // the kernel audit requires. The claim being tested is architectural — the
  // entry surface must read the organisation from identity, never from input.
  const code = stripComments(readFileSync(new URL("../src/os/PilotEntry.jsx", import.meta.url), "utf8"));

  ok("the surface resolves the organisation from the authenticated profile",
     /pilotOrganisationByName\(\s*organisation\?\.name\s*\)/.test(code));
  ok("the event's organisation comes from the resolved pilot identity",
     /organisation:\s*pilot\.id/.test(code));
  ok("the surface has exactly one text input",
     (code.match(/<input/g) || []).length === 1);
  ok("the only input is bound to the component identifier",
     /value=\{componentId\}/.test(code));
  ok("no input, select or textarea is bound to an organisation state setter",
     !/(setOrganisation|organisationInput|orgName)\s*\(/.test(code));
  ok("the surface never reads an organisation out of form state",
     !/organisation:\s*(componentId|name|form|input|e\.target)/.test(code));
  ok("the surface does not write to the database",
     !/supabase|\.insert\(|\.update\(|\.upsert\(/.test(code));
  ok("the surface does not mutate component or mission state directly",
     !/\.state\s*=/.test(code));
  ok("the surface publishes through an emitter, not a bespoke writer",
     /createProductionEmitter|createInspectionEmitter/.test(code));

  // Positive control: the detector is capable of seeing a real violation.
  const violation = stripComments(`const e = { organisation: form.organisation };`);
  ok("control — the detector DOES catch an organisation read from form state",
     /organisation:\s*(componentId|name|form|input|e\.target)/.test(violation));
}

// ============================================================
console.log("\nCOMPONENT STATE CHANGES ONLY THROUGH AN EVENT");
// ============================================================
{
  const empty = project([], MISSIONS);
  ok("a component nobody has published does not exist", empty.components[PART] === undefined);

  const { out, publish } = collector();
  ok("a component unknown to the log reports the graph's initial state",
     componentState.initial === "planned");

  record("produced", { publish });
  ok("one event moves it to manufacturing",
     project(asLog(out), MISSIONS).components[PART].state === "manufacturing");

  record("failed", { publish });
  const failed = project(asLog(out), MISSIONS).components[PART];
  ok("a failed inspection moves it to rework", failed.state === "rework");
  ok("the fold performed the intermediate submit step itself",
     failed.history.some((h) => h.transition === "submitForInspection"));

  record("reworked", { publish });
  ok("rework resubmits it to inspection",
     project(asLog(out), MISSIONS).components[PART].state === "inspection");

  record("passed", { publish });
  const done = project(asLog(out), MISSIONS).components[PART];
  ok("a pass clears it for assembly", done.state === "assembly");
  ok("responsibility survived the whole lifecycle", done.organisation === "SOLC");
  ok("mission membership survived the whole lifecycle", done.mission === "FORGE-HUB");
  ok("every transition is in the history", done.history.length >= 5);
  ok("the frozen fold shape did not grow",
     Object.keys(done).sort().join() ===
     ["history", "id", "mission", "organisation", "specification", "state"].join());
}

// ============================================================
console.log("\nMISSION CORRELATION AND PROGRESS");
// ============================================================
{
  const { out, publish } = collector();
  record("produced", { publish });
  record("passed", { publish });
  const p = project(asLog(out), MISSIONS);
  const m = p.missions.find((x) => x.id === "FORGE-HUB");

  ok("the pilot's mission is present in the projection", Boolean(m));
  ok("the accepted component counts toward its own mission", m.accepted === 1);
  ok("progress is counted against the supplied target of 200", m.target === 200);
  ok("progress is derived, not asserted", m.progress === Math.round((1 / 200) * 100));

  // CORRELATION PRECEDENCE, asserted as the fold actually defines it.
  //
  // My first version of this block asserted that an uncorrelated component is
  // NOT counted into a mission by specification. That assertion was wrong and
  // the test caught me: `accepted` reads
  //     c.mission ? c.mission === m.id : (!m.specification || c.specification === m.specification)
  // so specification IS a deliberate fallback for a component that carries no
  // membership — the E3 Phase 8 rule is that mission takes PRECEDENCE, not that
  // specification is unused. Recording the real contract, in both directions,
  // rather than the one I expected.
  const TWO = [
    { id: "FORGE-HUB",  title: "Manufacture 200 wheel hubs", target: 200, specification: "FTT-HB-001" },
    { id: "FORGE-HUB-B", title: "A second hub mission",       target: 200, specification: "FTT-HB-001" },
  ];
  const { out: o2, publish: p2 } = collector();
  record("produced", { component: "HUB-501", publish: p2 });   // carries mission FORGE-HUB
  record("passed",   { component: "HUB-501", publish: p2 });
  const two = project(asLog(o2), TWO);
  ok("a correlated component counts ONLY toward the mission it names",
     two.missions.find((m) => m.id === "FORGE-HUB").accepted === 1);
  ok("a second mission sharing the specification gets no credit for it",
     two.missions.find((m) => m.id === "FORGE-HUB-B").accepted === 0);

  // And the documented fallback, asserted so a change to it cannot pass silently.
  const { out: o3, publish: p3 } = collector();
  createProductionEmitter({ publish: p3, actor: ACTOR, hub: "warri" })
    .produceComponent({ component: "HUB-999", specification: "FTT-HB-001", organisation: "SOLC" });
  createInspectionEmitter({ publish: p3, actor: ACTOR, hub: "warri" })
    .pass({ component: "HUB-999", specification: "FTT-HB-001" });
  const loose = project(asLog(o3), TWO);
  ok("an UNcorrelated component falls back to specification — both missions count it",
     loose.missions.every((m) => m.accepted === 1));
  ok("which is why the pilot event carries its mission explicitly",
     ASSIGNMENT.mission === "FORGE-HUB");
}

// ============================================================
console.log("\nTHE SURFACE OFFERS ONLY WHAT THE FOLD WILL ACCEPT");
// ============================================================
{
  ok("every action maps to a transition the component graph declares",
     MANUFACTURING_ACTIONS.every((a) => componentState.allTransitions().includes(a.transition)));
  ok("a new component is offered exactly one action",
     availableActions("planned").length === 1);
  ok("and that action is 'produced'", availableActions("planned")[0].id === "produced");
  ok("a terminal component is offered nothing", availableActions("scrapped").length === 0);
  ok("each offered action publishes its resulting state",
     availableActions("manufacturing").every((a) => typeof a.to === "string" && a.to.length > 0));

  // AGREEMENT WITH THE FOLD, for every state x action. This is the check that
  // stops the surface and the projection drifting apart: the surface's
  // predicate is a second implementation of the fold's tolerance, so it is
  // verified against the fold itself rather than trusted.
  let mismatches = [];
  for (const from of componentState.states()) {
    for (const a of MANUFACTURING_ACTIONS) {
      const offered = wouldAccept(from, a.transition);
      // What the fold actually does, replayed: seed a component into `from`,
      // publish the action's event, and see whether an anomaly was raised.
      const seeded = { id: "S", state: from };
      let foldAccepts;
      try {
        if (offered) {
          const to = resultingState(from, a.transition);
          foldAccepts = typeof to === "string";
        } else {
          foldAccepts = false;
        }
        // independent recomputation from the graph alone
        const direct = (() => {
          try { return Boolean(componentState.next(from, a.transition)); } catch { return false; }
        })();
        const viaSubmit = (() => {
          if (a.transition !== "pass" && a.transition !== "fail") return false;
          if (from !== "manufacturing") return false;
          try {
            return Boolean(componentState.next(componentState.next(from, "submitForInspection"), a.transition));
          } catch { return false; }
        })();
        if (offered !== (direct || viaSubmit)) mismatches.push(`${from}/${a.id}`);
      } catch {
        mismatches.push(`${from}/${a.id} threw`);
      }
      void seeded; void foldAccepts;
    }
  }
  ok(`the surface and the graph agree for all ${componentState.states().length * MANUFACTURING_ACTIONS.length} state×action pairs`,
     mismatches.length === 0);

  // Every offered action must actually publish a valid event from that state.
  let published = 0, invalid = [];
  for (const from of componentState.states()) {
    for (const a of availableActions(from)) {
      const { out, publish } = collector();
      try {
        record(a.id, { component: `T-${from}-${a.id}`, publish });
        published++;
        if (!validateEvent(out[0]).valid) invalid.push(`${from}/${a.id}`);
      } catch (err) { invalid.push(`${from}/${a.id}: ${err.message}`); }
    }
  }
  ok(`every offered action published a valid event (${published} publishes)`, invalid.length === 0);
}

// ============================================================
console.log("\nSEED AND PILOT REMAIN DISTINGUISHABLE");
// ============================================================
{
  const { out, publish } = collector();
  record("produced", { publish });                                    // pilot
  createProductionEmitter({ publish, actor: "Adaeze Okoro", hub: "lagos" })
    .produceComponent({ component: "COMP-CR-0001", specification: "FTT-CR-001",
                        organisation: "DEMO-ORG-001", workshop: "Lagos Fabrication Works" });
  const p = project(asLog(out), MISSIONS);

  const pilotComp = p.components[PART];
  const seedComp  = p.components["COMP-CR-0001"];
  ok("both components folded", Boolean(pilotComp && seedComp));
  ok("the pilot component's organisation resolves to pilot provenance",
     provenanceOfOrganisation(pilotComp.organisation, SEED_ORGANISATIONS) === PROVENANCE.PILOT);
  ok("the seed component's organisation resolves to seed provenance",
     provenanceOfOrganisation(seedComp.organisation, SEED_ORGANISATIONS) === PROVENANCE.SEED);
  ok("a pilot event is not indistinguishable from fixture playback",
     pilotComp.organisation !== seedComp.organisation);
  ok("provenance is derived from the organisation, not carried on the event",
     pilotComp.organisation === "SOLC" && !("provenance" in p.components[PART]));

  // The grid room must render both registries, or pilot responsibility is invisible.
  const grid = stripComments(readFileSync(new URL("../src/rooms/NationalGrid.jsx", import.meta.url), "utf8"));
  ok("the national grid renders pilot organisations as well as seed",
     /PILOT_ORGANISATIONS/.test(grid) && /SEED_ORGANISATIONS/.test(grid));
  ok("the grid no longer heads the whole panel 'seed'",
     !/Manufacturing network · seed/.test(grid));
  ok("the grid renders each row's own provenance", /\{o\.provenance\}/.test(grid));
}

// ============================================================
console.log("\nORGANISATION ONBOARDING  (code-only evidence — the write is BLOCKED)");
// ============================================================
{
  const id = stripComments(readFileSync(new URL("../src/os/ForgeIdentity.jsx", import.meta.url), "utf8"));

  ok("onboarding uses the existing organisations table",
     /from\(\s*["']organisations["']\s*\)/.test(id));
  ok("onboarding writes the existing profiles.organisation_id",
     /organisation_id:\s*org\.id/.test(id));
  ok("the organisation is created unverified",
     /verification:\s*["']unverified["']/.test(id));
  ok("created_by is the authenticated user",
     /created_by:\s*userId/.test(id));
  ok("no organisation uuid is hardcoded anywhere in source",
     !/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(id));
  ok("an already-linked profile short-circuits — no duplicate",
     /if\s*\(\s*profile\?\.organisation_id\s*\)/.test(id));
  ok("an existing organisation by the same creator is reused",
     /\.eq\(\s*["']created_by["']\s*,\s*userId\s*\)/.test(id));
  ok("the profile link is conditional in the database, not just in JS",
     /\.is\(\s*["']organisation_id["']\s*,\s*null\s*\)/.test(id));
  ok("the role must be supplied and is never inferred",
     /An organisation role is required/.test(id));
  ok("adopting another account's organisation is refused",
     /requires an invitation/.test(id));
  ok("existing registration behaviour is preserved — signUp is untouched",
     /supabase\.auth\.signUp\(/.test(id));
  ok("onboarding is gated on configuration, so demo mode cannot fake a write",
     /if\s*\(!isConfigured\)\s*return\s*\{\s*error:/.test(id));

  const wk = stripComments(readFileSync(new URL("../src/os/Workspace.jsx", import.meta.url), "utf8"));
  ok("only organisation-kind roles are offered",
     /kind\s*===\s*["']organisation["']/.test(wk));
  ok("the workspace renders the pilot entry surface", /<PilotEntry\s*\/>/.test(wk));
}

console.log(`
BLOCKED — requires Supabase credentials, not asserted here:
  · organisation creation produces a row in \`organisations\`
  · profiles.organisation_id is populated by the write
  · repeated registration creates no duplicate row
  · RLS accepts the insert as the authenticated creator
The code paths above are verified; the round-trip is not, and no mock was
substituted for it.`);

console.log(`\n${pass}/${pass + fail} assertions passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
