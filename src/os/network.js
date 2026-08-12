// ============================================================
// FORGE OS — MANUFACTURING NETWORK  (E5)
//
// Answers three DIFFERENT questions, and never lets one answer the other:
//
//   CAPABILITY       "DEMO-ORG-001 CAN make a chassis rail at Kaduna"
//   RESPONSIBILITY   "DEMO-ORG-001 IS responsible for CHS-014"
//   HISTORY          "DEMO-ORG-001 DID produce CHS-014 at 14:02"
//
// This module owns the FIRST one only. Capability is master data — a standing
// statement about what an organisation is equipped to do. It is not event
// history, so it is not event-sourced; it lives here beside MISSIONS, ROLES,
// MACHINES and STUDIO_HUBS, which are the other authoritative static registries.
//
// RESPONSIBILITY is owned by the event fold: `component.organisation`, set only
// from an event that explicitly carried `organisation`. Capability must never
// imply it. An organisation that CAN make chassis rails is not thereby
// responsible for any particular rail, and this module deliberately exposes no
// function that would let a caller make that leap.
//
// HISTORY is owned by the event log, as it always was.
//
// WHY NOT A DATABASE TABLE. `organisations` exists in
// supabase/migrations/002_identity.sql with a uuid primary key, but no code path
// anywhere inserts into it — ForgeIdentity only ever SELECTs `organisation_id`,
// so every profile the application creates has none, and the registry is
// necessarily empty. Its deployed state is also unobservable behind
// `isConfigured`. Adding a schema relation would therefore have produced a
// second identity system that no running code could populate or verify. When
// real organisations exist, they belong in that table and this module is
// replaced by a read of it — see TRANSITIONAL.md D2.
//
// SEED, AND SAID SO. Every organisation below is a demonstration identity.
// `forge_verification` in the existing schema is ('unverified','pending',
// 'verified','rejected') — none of which means "not a real company", so
// provenance could not honestly be folded into it and is carried explicitly.
// Nothing here is a real Forge member, a real SME, a real manufacturer or a
// real commercial commitment.
// ============================================================

/**
 * Provenance is orthogonal to verification: it says whether the RECORD is real.
 *
 * PILOT sits between SEED and REAL deliberately. A pilot organisation is a real
 * organisation — it is not a demonstration identity, and calling it SEED would
 * be a lie about who is acting. But it is also not yet REAL in the sense this
 * module reserves that word for: a member the platform has verified and whose
 * details it holds. SOLC's role and hub were supplied by pilot configuration;
 * its legal identity, registration and capabilities are unknown, and PILOT is
 * how the system says exactly that instead of rounding up or down.
 *
 * Three values, three different claims, and no surface may substitute one for
 * another. An organisation absent from every registry is NOT real — it has no
 * provenance at all, which reads as UNKNOWN.
 */
export const PROVENANCE = Object.freeze({
  SEED:  "seed",   // a demonstration identity. Never a real network member.
  PILOT: "pilot",  // a real organisation, admitted by explicit pilot configuration.
  REAL:  "real",   // reserved. No record carries this yet.
});

// ---------- COMPONENT CLASS TAXONOMY ----------
// Derived from the four specifications that actually exist in this repository,
// and from nothing else. `component_jobs.category` (chassis|body|kitchen|gas|
// electrical|livery) was NOT copied: those are commercial recruitment
// categories at family granularity, which D1 forbids as manufacturing authority.
//
// Identifiers are hyphenated to match the one component-class value already
// present in executable source — `production/rules.js` PV-002 tests
// `c.componentClass === "pressure-vessel"`. Matching it means that rule becomes
// reachable rather than staying dormant.
export const COMPONENT_CLASS = Object.freeze({
  CHASSIS_RAIL:    "chassis-rail",      // FTT-CR-001 "Chassis rail, 2.0mm CR steel"
  WHEEL_HUB:       "wheel-hub",         // FTT-HB-001 "Wheel hub, machined billet"
  AXLE_BRACKET:    "axle-bracket",      // FTT-BR-007 "Axle bracket, folded plate"
  PRESSURE_VESSEL: "pressure-vessel",   // FTT-PV-002 "Air receiver, pressure vessel"
});

// A specification maps to at most one class. Anything unlisted is UNKNOWN —
// null, never a guess. A new drawing does not silently acquire a class.
const SPECIFICATION_CLASS = Object.freeze({
  "FTT-CR-001": COMPONENT_CLASS.CHASSIS_RAIL,
  "FTT-HB-001": COMPONENT_CLASS.WHEEL_HUB,
  "FTT-BR-007": COMPONENT_CLASS.AXLE_BRACKET,
  "FTT-PV-002": COMPONENT_CLASS.PRESSURE_VESSEL,
});

/** The class a specification belongs to, or null when it is genuinely unknown. */
export const classForSpecification = (specification) =>
  SPECIFICATION_CLASS[specification] ?? null;

// ---------- ORGANISATIONS (SEED) ----------
// Small on purpose: enough to exercise the architecture, not a fabricated
// national ecosystem. `hubs` references STUDIO_HUBS ids — no second hub
// registry. A hub association here is a SEED association: it does not assert
// that any real organisation operates at that place.
export const SEED_ORGANISATIONS = Object.freeze([
  Object.freeze({
    id: "DEMO-ORG-001", name: "Forge Fabrication Demo 01",
    provenance: PROVENANCE.SEED, verification: "unverified",
    hubs: Object.freeze(["kaduna", "lagos"]),
  }),
  Object.freeze({
    id: "DEMO-ORG-002", name: "Forge Machining Demo 02",
    provenance: PROVENANCE.SEED, verification: "unverified",
    hubs: Object.freeze(["nnewi", "ilorin"]),
  }),
  Object.freeze({
    id: "DEMO-ORG-003", name: "Forge Pressure Demo 03",
    provenance: PROVENANCE.SEED, verification: "unverified",
    hubs: Object.freeze(["warri"]),
  }),
]);

// ---------- CAPABILITY ----------
// "CAN make CLASS at HUB". Hub-scoped because equipment sits somewhere: the
// same organisation may fabricate rails at one hub and not another.
//
// Deliberately absent: price, capacity, lead time, SLA, ranking, contract terms.
// This is capability, not commerce, and no authoritative source for any of those
// exists.
export const SEED_CAPABILITIES = Object.freeze([
  // multiple capabilities for one organisation
  Object.freeze({ organisation: "DEMO-ORG-001", componentClass: COMPONENT_CLASS.CHASSIS_RAIL,    hub: "kaduna", provenance: PROVENANCE.SEED }),
  Object.freeze({ organisation: "DEMO-ORG-001", componentClass: COMPONENT_CLASS.CHASSIS_RAIL,    hub: "lagos",  provenance: PROVENANCE.SEED }),
  Object.freeze({ organisation: "DEMO-ORG-001", componentClass: COMPONENT_CLASS.AXLE_BRACKET,    hub: "kaduna", provenance: PROVENANCE.SEED }),
  // a capability shared by two organisations — capability is not exclusive
  Object.freeze({ organisation: "DEMO-ORG-002", componentClass: COMPONENT_CLASS.CHASSIS_RAIL,    hub: "nnewi",  provenance: PROVENANCE.SEED }),
  Object.freeze({ organisation: "DEMO-ORG-002", componentClass: COMPONENT_CLASS.WHEEL_HUB,       hub: "ilorin", provenance: PROVENANCE.SEED }),
  Object.freeze({ organisation: "DEMO-ORG-003", componentClass: COMPONENT_CLASS.PRESSURE_VESSEL, hub: "warri",  provenance: PROVENANCE.SEED }),
]);

// ---------- READERS ----------
export const organisationById = (id) =>
  SEED_ORGANISATIONS.find((o) => o.id === id) ?? null;

/** True only for a record this module marks as seed. Absent org is not "real". */
export const isSeedOrganisation = (id) =>
  organisationById(id)?.provenance === PROVENANCE.SEED;

/** What this organisation CAN make. Says nothing about what it is doing. */
export const capabilitiesOf = (organisationId) =>
  SEED_CAPABILITIES.filter((c) => c.organisation === organisationId);

/** Who CAN make this class. NOT who is responsible — see the note below. */
export const organisationsCapableOf = (componentClass) =>
  SEED_CAPABILITIES.filter((c) => c.componentClass === componentClass)
    .map((c) => c.organisation)
    .filter((id, i, all) => all.indexOf(id) === i);

/** Hubs an organisation is seed-associated with. */
export const hubsOf = (organisationId) => organisationById(organisationId)?.hubs ?? [];

/**
 * Does this organisation hold a capability matching a component's specification?
 *
 * Answers a question about CAPABILITY ALIGNMENT and nothing more. It exists so a
 * surface can say "the responsible organisation is not recorded as capable of
 * this class" — an observation worth making. It must never be used to DERIVE
 * responsibility: a true result means "allowed to be plausible", not "is doing
 * it". There is deliberately no function here that returns a responsible
 * organisation, because this module cannot know one.
 */
export const isCapableOfSpecification = (organisationId, specification) => {
  const cls = classForSpecification(specification);
  if (!cls) return false;                       // unknown class: no claim either way
  return capabilitiesOf(organisationId).some((c) => c.componentClass === cls);
};

export default {
  PROVENANCE, COMPONENT_CLASS, SEED_ORGANISATIONS, SEED_CAPABILITIES,
  classForSpecification, organisationById, isSeedOrganisation,
  capabilitiesOf, organisationsCapableOf, hubsOf, isCapableOfSpecification,
};
