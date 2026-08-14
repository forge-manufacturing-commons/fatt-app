// ============================================================
// FORGE OS — SCOPED COORDINATION AUTHORITY  (E9.5 Part A)
//
// One question: is holding `work.direct` enough, or must the actor's
// organisation also operate at the hub where the work is being directed?
//
//   CAPABILITY  may this actor coordinate work at all?      requireCapability
//   SCOPE       may they coordinate it HERE?                requireHubScope
//
// Both must be true, and they fail for different reasons.
//
// WHAT THIS IS NOT. This is organisation-level hub scope, not a workshop
// position. It proves "this coordinator's organisation is authorised to
// coordinate work at this hub". It does NOT prove "this person is Head of this
// workshop" — `profiles` still has no hub column and no assignment names a
// person, so person-level workshop position remains unrepresentable. No role
// enum was added and the phrase Head of Workshop appears nowhere in the code.
//
// Run: node test/scope.consumer.mjs
// ============================================================

import { hubsOf, SEED_ORGANISATIONS, organisationById } from "../src/os/network.js";
import { PILOT_ORGANISATIONS, hubsOfOrganisation, pilotOrganisationById } from "../src/os/pilot.js";
import { EVENT_TYPES, isScopedType, SCOPED_CAPABILITIES, capabilityFor } from "../src/os/events.js";
import { createPolicy, requireActor, requireCapability, requireHubScope, PolicyViolation }
  from "../src/os/policy.js";
import { createProductionEmitter } from "../src/domains/production/emitters.js";
import { project } from "../src/os/projections.js";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log(`  ok   ${n}`); } else { fail++; console.log(`  FAIL ${n}`); } };

const COMP = "HUB-E9-001";
const SPEC = "FTT-HB-001";
const bus = () => { const log = []; return { log, publish: (e) => { log.unshift(e); return e; },
                                            view: () => project(log, []) }; };

/** Attempt a directive at a hub under an identity. */
const attempt = (b, identity, hub, fields = {}) => {
  const before = b.log.length;
  try {
    const event = createProductionEmitter({
      publish: b.publish, actor: identity?.person, hub,
      policy: createPolicy([requireActor, requireCapability(identity), requireHubScope(identity)]),
    }).directWork({ component: COMP, directedTo: "SOLC", directedToClass: "institution",
                    specification: SPEC, instruction: `Fabricate ${COMP}`, ...fields });
    return { published: true, event, delta: b.log.length - before, error: null };
  } catch (e) { return { published: false, event: null, delta: b.log.length - before, error: e }; }
};

console.log("\nFORGE OS — scoped coordination authority (E9.5 Part A)\n");

// ============================================================
console.log("A + B — HUB RESOLUTION ACROSS BOTH REGISTRIES");
// ============================================================
{
  ok("A. the pilot organisation's hub resolves", hubsOfOrganisation("SOLC").join() === "warri");
  ok("A. and it comes from the pilot configuration, not a copy",
     pilotOrganisationById("SOLC").hubs.join() === hubsOfOrganisation("SOLC").join());
  ok("B. seed organisations still resolve",
     hubsOfOrganisation("DEMO-ORG-001").join() === "kaduna,lagos");
  ok("B. every seed organisation still resolves its own hubs",
     SEED_ORGANISATIONS.every((o) => hubsOfOrganisation(o.id).join() === o.hubs.join()));
  ok("B. the seed-only reader is unchanged for seed ids",
     hubsOf("DEMO-ORG-003").join() === "warri");
  ok("an unknown organisation resolves to NO hubs, not all hubs",
     hubsOfOrganisation("NOT-A-MEMBER").length === 0);

  // The defect this fixed: the reader used to privilege SEED data.
  ok("the bare seed reader alone still cannot see the pilot", hubsOf("SOLC").length === 0);
  ok("but injecting the pilot registry resolves it",
     hubsOf("SOLC", PILOT_ORGANISATIONS).join() === "warri");
  ok("injected registries are searched FIRST, so a real org is never shadowed",
     hubsOf("DEMO-ORG-003", [{ id: "DEMO-ORG-003", hubs: ["override"] }]).join() === "override");
  ok("network.js still holds no pilot data — no second source of truth",
     organisationById("SOLC") === null);

  // Which capabilities are locationally scoped, declared as data.
  ok("scoped capabilities are declared, not hardcoded in policy",
     SCOPED_CAPABILITIES.join() === "work.direct,work.acknowledge");
  ok("a directive is a scoped act", isScopedType(EVENT_TYPES.PRODUCTION.WORK_DIRECTED));
  ok("an acknowledgement is a scoped act", isScopedType(EVENT_TYPES.PRODUCTION.WORK_ACKNOWLEDGED));
  ok("producing a component is NOT a scoped act",
     isScopedType(EVENT_TYPES.PRODUCTION.COMPONENT_PRODUCED) === false);
  ok("inspection is NOT a scoped act",
     Object.values(EVENT_TYPES.INSPECTION).every((t) => isScopedType(t) === false));
}

// ============================================================
console.log("\nC–G — THE SCOPE REFUSAL MATRIX");
// ============================================================
{
  // C. capability + correct hub -> accepted. DEMO-ORG-001 operates at kaduna/lagos.
  {
    const b = bus();
    const r = attempt(b, { person: "Ibrahim Danladi", role: "manufacturer",
                           verification: "unverified", organisation: "DEMO-ORG-001" }, "lagos");
    ok("C. manufacturer + work.direct + hub it operates at -> ACCEPTED", r.published === true);
    ok("C. the directive was recorded", b.view().components[COMP].directives.length === 1);
    ok("C. at the hub named on the event", r.event.hub === "lagos");
  }

  // D. capability but WRONG hub -> refused. This is the whole point.
  {
    const b = bus();
    const r = attempt(b, { person: "Ibrahim Danladi", role: "manufacturer",
                           verification: "unverified", organisation: "DEMO-ORG-001" }, "warri");
    ok("D. the SAME coordinator at a hub it does NOT operate -> REFUSED", r.published === false);
    ok("D. refused by the scope rule, not the capability rule",
       r.error.rule === "requireHubScope");
    ok("D. the error names the hubs actually held", /kaduna, lagos/.test(r.error.message));
    ok("D. and the hub that was attempted", /"warri"/.test(r.error.message));
    ok("D. zero events published", r.delta === 0);
    ok("D. no directive recorded",
       (b.view().components[COMP]?.directives ?? []).length === 0);
    ok("D. capability alone is therefore NOT sufficient",
       r.published === false);
  }

  // The converse: SOLC's own hub is warri, so a coordinator there would pass —
  // proving D failed on location and not on something else.
  {
    const b = bus();
    const r = attempt(b, { person: "Coordinator", role: "manufacturer",
                           verification: "unverified", organisation: "SOLC" }, "warri");
    ok("D2. an organisation that DOES operate at warri is accepted there",
       r.published === true);
  }

  // E. external organisation with no hubs at all.
  {
    const b = bus();
    const r = attempt(b, { person: "Outsider", role: "manufacturer",
                           verification: "unverified", organisation: "EXTERNAL-WORKS-002" }, "warri");
    ok("E. an organisation in no registry has NO scope", r.published === false);
    ok("E. and the error says so", /no recorded hub/.test(r.error.message));
    ok("E. absence of scope is never universal scope", r.delta === 0);
  }

  // F. capability missing -> refused before scope is even consulted.
  {
    const b = bus();
    const r = attempt(b, { person: "Adaeze Okoro", role: "sme",
                           verification: "unverified", organisation: "SOLC" }, "warri");
    ok("F. sme at its OWN hub is still refused — no work.direct", r.published === false);
    ok("F. refused by the capability rule, which runs first",
       r.error.rule === "requireCapability");
    ok("F. so scope does not rescue a missing capability", r.delta === 0);
  }

  // G. the actor picker / event payload cannot grant scope.
  {
    const b = bus();
    // The EVENT claims organisation SOLC (which does operate at warri); the
    // AUTHENTICATED identity belongs to an organisation that does not.
    const r = attempt(b, { person: "Impersonator", role: "manufacturer",
                           verification: "unverified", organisation: "DEMO-ORG-001" },
                      "warri", { organisation: "SOLC" });
    ok("G. an event naming SOLC does not grant SOLC's scope", r.published === false);
    ok("G. scope came from the authenticated identity", /DEMO-ORG-001/.test(r.error.message));
    ok("G. zero events published", r.delta === 0);
  }

  // Missing organisation on the identity.
  {
    const b = bus();
    const r = attempt(b, { person: "Nobody", role: "manufacturer", verification: "verified" }, "warri");
    ok("F2. an identity with no organisation has no scope", r.published === false);
    ok("F2. and the error says so", /presented no organisation/.test(r.error.message));
  }

  // A scoped event with no hub cannot be scope-checked, so it is refused.
  {
    const b = bus();
    const r = attempt(b, { person: "Coordinator", role: "manufacturer",
                           verification: "unverified", organisation: "SOLC" }, null);
    ok("F3. a scoped act carrying no hub is REFUSED, not waved through",
       r.published === false);
    ok("F3. the error explains scope cannot be checked",
       /carries no hub/.test(r.error.message));
  }
}

// ============================================================
console.log("\nTHE RULE ONLY SPEAKS FOR SCOPED ACTS");
// ============================================================
{
  // Composing requireHubScope must not start scope-checking manufacturing.
  const b = bus();
  const identity = { person: "Adaeze Okoro", role: "sme", verification: "unverified",
                     organisation: "SOLC" };
  let threw = null;
  try {
    createProductionEmitter({
      publish: b.publish, actor: identity.person, hub: "lagos",   // NOT SOLC's hub
      policy: createPolicy([requireActor, requireCapability(identity), requireHubScope(identity)]),
    }).produceComponent({ component: COMP, specification: SPEC, organisation: "SOLC" });
  } catch (e) { threw = e; }
  ok("production at a hub outside the organisation's scope is NOT refused",
     threw === null);
  ok("because manufacturing authority is not locational in this pass",
     capabilityFor(EVENT_TYPES.PRODUCTION.COMPONENT_PRODUCED) === null);
  ok("the component was produced normally",
     b.view().components[COMP].state === "manufacturing");
  ok("so E6/E7 cannot regress through the scope rule",
     b.view().components[COMP].organisation === "SOLC");
}

console.log(`\n${pass}/${pass + fail} assertions passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
