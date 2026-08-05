// ============================================================
// FORGE OS — CANONICAL EVENT SCHEMA
//
// This is the AUTHORING layer for manufacturing events. The Activity
// Engine (bus) and any downstream registry are the CONSUMERS; this
// module is the PRODUCER contract. Direction of dependency is one way.
//
// Why it exists: a producer that writes `spec:` instead of
// `specification:` publishes successfully and creates nothing. The
// event is accepted, the object never appears, and the failure is
// silent. This module removes the guesswork — canonical field names,
// canonical types, canonical statuses, and validation that REFUSES
// malformed domain records rather than warning about them.
//
// SELF-CONTAINED BY DESIGN. It imports only FORGE_OBJECT from
// ForgeRuntime.js. It deliberately does NOT import a registry or a
// studio topology, so it cannot be broken by modules that do not
// exist yet, and it will not need rewriting when they arrive.
// ============================================================

import { FORGE_OBJECT } from "./ForgeRuntime.js";

export const EVENT_SCHEMA_VERSION = "1.0.0";

// ---------- STATUS VOCABULARY ----------
export const STATUS = Object.freeze({
  RUNNING:     "running",
  IDLE:        "idle",
  FAULT:       "fault",
  MAINTENANCE: "maintenance",
  BLOCKED:     "blocked",
  COMPLETE:    "complete",
  PENDING:     "pending",
  UNKNOWN:     "unknown",
});
const STATUS_VALUES = new Set(Object.values(STATUS));

// ---------- INSPECTION RESULT VOCABULARY (closes C22) ----------
// Previously the factory accepted 'fail'/'failed'/'pass'/'passed' as
// synonyms, so 'reject', 'nok' or 'no-pass' silently resolved to a
// RECORDED event — the wrong type, with no warning. Canonical values
// are defined here, the factory uses them, the validator checks them.
export const INSPECTION_RESULT = Object.freeze({
  PASS:    "pass",
  FAIL:    "fail",
  PENDING: "pending",
});
const RESULT_VALUES = new Set(Object.values(INSPECTION_RESULT));

// ---------- EVENT TYPES ----------
export const EVENT_TYPES = Object.freeze({
  MACHINE: Object.freeze({
    START:       "machine.start",
    RUN:         "machine.run",
    COMPLETE:    "machine.complete",
    STOP:        "machine.stop",
    IDLE:        "machine.idle",
    FAULT:       "machine.fault",
    MAINTENANCE: "machine.maintenance",
  }),
  PRODUCTION: Object.freeze({
    COMPONENT_PRODUCED: "production.component.produced",
    STAGE_ADVANCED:     "production.stage.advanced",
    ASSEMBLY_JOINED:    "production.assembly.joined",
    PROGRAM_STARTED:    "production.program.started",
    PROGRAM_FINISHED:   "production.program.finished",
  }),
  INSPECTION: Object.freeze({
    RECORDED: "inspection.recorded",
    PASSED:   "inspection.passed",
    FAILED:   "inspection.failed",
    REWORKED: "inspection.reworked",
  }),
  ENGINEERING: Object.freeze({
    SPEC_DRAFTED:  "engineering.specification.drafted",
    SPEC_RELEASED: "engineering.specification.released",
    SPEC_REVISED:  "engineering.specification.revised",
    SPEC_APPROVED: "engineering.specification.approved",
  }),
  PERSON: Object.freeze({
    ARRIVED:            "person.arrived",
    COMPETENCY_CLAIMED:  "person.competency.claimed",
    COMPETENCY_VERIFIED: "person.competency.verified",
  }),
  KNOWLEDGE: Object.freeze({
    PUBLISHED:  "knowledge.published",
    TRANSLATED: "knowledge.translated",
    REVIEWED:   "knowledge.reviewed",
  }),
  NAVIGATION: Object.freeze({ ENTER: "navigation.enter" }),
  SYSTEM: Object.freeze({
    LANGUAGE_CHANGED: "system.language.changed",
    BOOTED:           "system.booted",
  }),
});

// ---------- LEGACY BRIDGE ----------
// The live bus in ActivityEngine.jsx derives machine and hub state from
// its own eight event strings. Canonical events do not appear in those
// maps, so a factory event would publish without moving hub state.
// Rather than silently diverge, the equivalence is declared here and
// callers can bridge explicitly via toLegacyType().
export const LEGACY_EVENT = Object.freeze({
  DRAWING_APPROVED:     "drawing.approved",
  COMPONENT_RECEIVED:   "component.received",
  INSPECTION_COMPLETED: "inspection.completed",
  MACHINE_STARTED:      "machine.started",
  MACHINE_STOPPED:      "machine.stopped",
  QUALITY_VERIFIED:     "quality.verified",
  SHIPMENT_DISPATCHED:  "shipment.dispatched",
  MAINTENANCE_OPENED:   "maintenance.opened",
});

const CANONICAL_TO_LEGACY = Object.freeze({
  [EVENT_TYPES.MACHINE.START]:              LEGACY_EVENT.MACHINE_STARTED,
  [EVENT_TYPES.MACHINE.RUN]:                LEGACY_EVENT.MACHINE_STARTED,
  [EVENT_TYPES.MACHINE.STOP]:               LEGACY_EVENT.MACHINE_STOPPED,
  [EVENT_TYPES.MACHINE.IDLE]:               LEGACY_EVENT.MACHINE_STOPPED,
  [EVENT_TYPES.MACHINE.COMPLETE]:           LEGACY_EVENT.MACHINE_STOPPED,
  [EVENT_TYPES.MACHINE.MAINTENANCE]:        LEGACY_EVENT.MAINTENANCE_OPENED,
  [EVENT_TYPES.MACHINE.FAULT]:              LEGACY_EVENT.MAINTENANCE_OPENED,
  [EVENT_TYPES.PRODUCTION.COMPONENT_PRODUCED]: LEGACY_EVENT.COMPONENT_RECEIVED,
  [EVENT_TYPES.INSPECTION.RECORDED]:        LEGACY_EVENT.INSPECTION_COMPLETED,
  [EVENT_TYPES.INSPECTION.PASSED]:          LEGACY_EVENT.QUALITY_VERIFIED,
  [EVENT_TYPES.INSPECTION.FAILED]:          LEGACY_EVENT.INSPECTION_COMPLETED,
  [EVENT_TYPES.ENGINEERING.SPEC_RELEASED]:  LEGACY_EVENT.DRAWING_APPROVED,
  [EVENT_TYPES.ENGINEERING.SPEC_APPROVED]:  LEGACY_EVENT.DRAWING_APPROVED,
});

/** Legacy equivalent of a canonical type, or null when there is none. */
export function toLegacyType(type) {
  return CANONICAL_TO_LEGACY[type] ?? null;
}

// ---------- MACHINE STATUS, DETERMINISTIC (closes C4) ----------
const MACHINE_STATUS_BY_TYPE = Object.freeze({
  [EVENT_TYPES.MACHINE.START]:       STATUS.RUNNING,
  [EVENT_TYPES.MACHINE.RUN]:         STATUS.RUNNING,
  [EVENT_TYPES.MACHINE.COMPLETE]:    STATUS.IDLE,
  [EVENT_TYPES.MACHINE.STOP]:        STATUS.IDLE,
  [EVENT_TYPES.MACHINE.IDLE]:        STATUS.IDLE,
  [EVENT_TYPES.MACHINE.FAULT]:       STATUS.FAULT,
  [EVENT_TYPES.MACHINE.MAINTENANCE]: STATUS.MAINTENANCE,
});

/** The status a type implies, without keyword or regex guessing. */
export function intendedStatus(type) {
  return MACHINE_STATUS_BY_TYPE[type] ?? null;
}

// ---------- FIELD VOCABULARY ----------
// The public producer contract. A consumer registry keeps its own
// internal field list; these are the same vocabulary from the two
// sides of the bus and MUST stay synchronised — see assertVocabulary.
export const CLASS_FIELDS = Object.freeze({
  [FORGE_OBJECT.PERSON]:        ["person", "human", "actor", "operator", "user"],
  [FORGE_OBJECT.WORKSHOP]:      ["workshop", "hub", "room", "studio", "cell"],
  [FORGE_OBJECT.MACHINE]:       ["machine"],
  [FORGE_OBJECT.SPECIFICATION]: ["specification", "spec", "drawing"],
  [FORGE_OBJECT.COMPONENT]:     ["component", "part"],
  [FORGE_OBJECT.ASSEMBLY]:      ["assembly"],
  [FORGE_OBJECT.PROGRAM]:       ["program", "mission"],
  [FORGE_OBJECT.KNOWLEDGE]:     ["knowledge", "document"],
  [FORGE_OBJECT.COMPETENCY]:    ["competency", "skill"],
  [FORGE_OBJECT.INSTITUTION]:   ["institution", "organisation", "organization"],
});

/** The one field a producer SHOULD use per class. Aliases are tolerated, not encouraged. */
export const PRIMARY_FIELD = Object.freeze(
  Object.fromEntries(Object.entries(CLASS_FIELDS).map(([cls, fields]) => [cls, fields[0]]))
);

export const FIELD_TO_CLASS = Object.freeze(
  Object.entries(CLASS_FIELDS).reduce((acc, [cls, fields]) => {
    for (const f of fields) acc[f] = cls;
    return acc;
  }, {})
);

const ENTITY_FIELD_NAMES = new Set(Object.keys(FIELD_TO_CLASS));

export const classForField = (field) => FIELD_TO_CLASS[field] ?? null;
export const isEntityField = (field) => ENTITY_FIELD_NAMES.has(field);

/**
 * Enforcement hook for C19 — the synchronisation gap between this
 * producer vocabulary and a consumer's internal field list. There is
 * no way to enforce it across module boundaries automatically, so a
 * consumer calls this at boot and finds out loudly instead of losing
 * objects silently.
 */
export function assertVocabulary(consumerFieldNames) {
  const consumer = new Set(consumerFieldNames || []);
  const producerOnly = [...ENTITY_FIELD_NAMES].filter((f) => !consumer.has(f));
  const consumerOnly = [...consumer].filter((f) => !ENTITY_FIELD_NAMES.has(f));
  return {
    synchronised: producerOnly.length === 0 && consumerOnly.length === 0,
    // Producers will emit these; the consumer ignores them -> silent object loss.
    producerOnly,
    // The consumer accepts these; no producer emits them -> dead vocabulary.
    consumerOnly,
  };
}

const META_TYPE_PREFIXES = ["navigation.", "system."];

// ---------- REQUIRED FIELDS (closes C21) ----------
// Previously validation was advisory: an inspection record with no
// component produced a warning and published anyway. In a traceability
// system that record is worse than useless, so these are ERRORS.
const REQUIRED_FIELDS_BY_TYPE_PREFIX = Object.freeze({
  "machine.":     ["machine"],
  "production.":  ["component"],
  "inspection.":  ["component", "result"],
  "engineering.": ["specification"],
  "person.":      ["person"],
  "knowledge.":   ["knowledge"],
  "navigation.":  ["studio"],
});

// Preserves 0 and false. Also preserves empty arrays and objects, which
// a future assembly-of-components field will need.
function compact(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v;
  }
  return out;
}

// ---------- CORE FACTORY ----------
export function createEvent({ type, at, ...fields }) {
  if (!type || typeof type !== "string") {
    throw new Error("createEvent: `type` is required and must be a string");
  }
  return { type, at: at ?? Date.now(), schema: EVENT_SCHEMA_VERSION, ...compact(fields) };
}

// ---------- DOMAIN FACTORIES ----------
export function machineEvent({ machine, hub, type = EVENT_TYPES.MACHINE.RUN, status, ...extra }) {
  if (machine == null) throw new Error("machineEvent: `machine` is required");
  return createEvent({ type, machine, hub, status: status ?? intendedStatus(type) ?? undefined, ...extra });
}

export function productionEvent({
  component, specification, machine, hub, person, assembly, program,
  type = EVENT_TYPES.PRODUCTION.COMPONENT_PRODUCED, ...extra
}) {
  if (component == null) throw new Error("productionEvent: `component` is required");
  return createEvent({ type, component, specification, machine, hub, person, assembly, program, ...extra });
}

export function inspectionEvent({
  component, specification, machine, person, hub, result, type, ...extra
}) {
  if (component == null) throw new Error("inspectionEvent: `component` is required");
  if (result == null) throw new Error("inspectionEvent: `result` is required");
  // Canonical values only — no synonym guessing.
  const resolved =
    type ??
    (result === INSPECTION_RESULT.FAIL
      ? EVENT_TYPES.INSPECTION.FAILED
      : result === INSPECTION_RESULT.PASS
        ? EVENT_TYPES.INSPECTION.PASSED
        : EVENT_TYPES.INSPECTION.RECORDED);
  return createEvent({ type: resolved, component, specification, machine, person, hub, result, ...extra });
}

// hub is NOT defaulted (closes C20). Hardcoding 'engineering' invented a
// hub that does not exist in this deployment, where hubs are geographic.
export function engineeringEvent({
  specification, program, person, knowledge, hub,
  type = EVENT_TYPES.ENGINEERING.SPEC_RELEASED, ...extra
}) {
  if (specification == null) throw new Error("engineeringEvent: `specification` is required");
  return createEvent({ type, specification, program, person, knowledge, hub, ...extra });
}

export function personEvent({ person, competency, hub, institution, type = EVENT_TYPES.PERSON.ARRIVED, ...extra }) {
  if (person == null) throw new Error("personEvent: `person` is required");
  return createEvent({ type, person, competency, hub, institution, ...extra });
}

export function knowledgeEvent({ knowledge, language, person, hub, specification, type = EVENT_TYPES.KNOWLEDGE.PUBLISHED, ...extra }) {
  if (knowledge == null) throw new Error("knowledgeEvent: `knowledge` is required");
  return createEvent({ type, knowledge, language, person, hub, specification, ...extra });
}

// hub may legitimately be null when a studio is not in the topology.
export function navigationEvent({ studio, hub = null, from = null, person, ...extra }) {
  if (studio == null) throw new Error("navigationEvent: `studio` is required");
  return createEvent({ type: EVENT_TYPES.NAVIGATION.ENTER, studio, hub, from, person, ...extra });
}

export function systemEvent({ type = EVENT_TYPES.SYSTEM.BOOTED, ...extra }) {
  return createEvent({ type, ...extra });
}

// ---------- VALIDATION ----------
export function validateEvent(event) {
  const issues = [];
  if (!event || typeof event !== "object") {
    return { valid: false, issues: [{ severity: "error", message: "event is not an object" }] };
  }
  const { type } = event;
  if (!type || typeof type !== "string") {
    issues.push({ severity: "error", message: "event has no `type`; it cannot be normalised" });
  }
  if (event.at != null && !Number.isFinite(event.at)) {
    issues.push({ severity: "error", message: "`at` must be a finite epoch value" });
  }

  const hasEntity = Object.keys(event).some(
    (k) => ENTITY_FIELD_NAMES.has(k) && event[k] != null && event[k] !== ""
  );
  const isMeta = typeof type === "string" && META_TYPE_PREFIXES.some((p) => type.startsWith(p));
  if (!hasEntity && !isMeta) {
    issues.push({
      severity: "warning",
      message: "event references no known entity and is not a meta event; it will not attach to a Forge Object",
    });
  }

  // Domain records must be complete. This is the C21 fix.
  if (typeof type === "string") {
    for (const [prefix, required] of Object.entries(REQUIRED_FIELDS_BY_TYPE_PREFIX)) {
      if (!type.startsWith(prefix)) continue;
      for (const field of required) {
        if (event[field] == null || event[field] === "") {
          issues.push({ severity: "error", message: `event type "${type}" requires field "${field}"` });
        }
      }
    }
  }

  if (event.status != null && !STATUS_VALUES.has(event.status)) {
    issues.push({ severity: "warning", message: `status "${event.status}" is not canonical; it will be stored verbatim` });
  }
  if (event.result != null && !RESULT_VALUES.has(event.result)) {
    issues.push({ severity: "warning", message: `result "${event.result}" is not a canonical inspection result` });
  }
  const expected = intendedStatus(type);
  if (expected && event.status != null && event.status !== expected) {
    issues.push({
      severity: "warning",
      message: `type "${type}" implies status "${expected}" but carries "${event.status}"`,
    });
  }

  return { valid: issues.every((i) => i.severity !== "error"), issues };
}

/** Validate and throw. For emitters that must fail loudly at the producer. */
export function assertEvent(event) {
  const { valid, issues } = validateEvent(event);
  if (!valid) {
    throw new Error(
      `Invalid Forge event: ${issues.filter((i) => i.severity === "error").map((i) => i.message).join("; ")}`
    );
  }
  return event;
}

const Events = Object.freeze({
  SCHEMA_VERSION: EVENT_SCHEMA_VERSION,
  STATUS,
  INSPECTION_RESULT,
  TYPES: EVENT_TYPES,
  LEGACY: LEGACY_EVENT,
  CLASS_FIELDS,
  PRIMARY_FIELD,
  FIELD_TO_CLASS,
  create: createEvent,
  machine: machineEvent,
  production: productionEvent,
  inspection: inspectionEvent,
  engineering: engineeringEvent,
  person: personEvent,
  knowledge: knowledgeEvent,
  navigation: navigationEvent,
  system: systemEvent,
  validate: validateEvent,
  assert: assertEvent,
  classForField,
  isEntityField,
  intendedStatus,
  toLegacyType,
  assertVocabulary,
});

export default Events;
