// ============================================================
// FORGE ELECTION — CANONICAL EVENT SCHEMA  (MVP domain pack)
//
// A SIBLING to src/os/events.js, not an extension of it. The manufacturing
// EVENT_TYPES vocabulary is frozen at 34 types and asserted so by 7 test files —
// this module never imports or merges into it. It reuses only the GENERIC event
// mechanics (createEvent, makeEventId, EVENT_SCHEMA_VERSION, and the
// MISSION_POLICY_LEVEL enum, which is domain-neutral vocabulary about a concept —
// "may this event belong to a mission?" — not about manufacturing specifically).
//
// SELF-CONTAINED, LIKE ITS SIBLING. It does not import a registry or a studio
// topology, for the same reason: producers should not be broken by modules that
// do not exist yet, and this should not need rewriting when they arrive.
//
// MVP SCOPE. Just enough event types to make the demo candidate's Canon real:
// registering a candidate, assigning a ward to a responsible party, and
// reporting a ward's status. Not exhaustive — see docs/BUSINESS-AI-DOMAIN-CONTRACT.md
// for the sibling contract this pack's shape is meant to be copied for.
//
// CAPABILITY IS DECLARED, NOT YET WIRED. `EVENT_CAPABILITY` below is shaped
// exactly like src/os/events.js's own map (event type -> capability string) so
// it can be merged into policy.js's live check later — but this MVP phase does
// not touch events.js/Roles.js/policy.js, so nothing here is currently enforced
// by requireCapability. No live write path is exercised by the demo or the
// tests; this is the explicit, honest gap TRANSITIONAL.md-style documentation
// exists to name rather than to quietly assume closed.
//
// LOOP (TENANT SCOPING) adds `campaign` — REQUIRED on every event type,
// mirroring Business's `organisation` field on `projectBusiness(log,
// organisationId)`. Before this, `projectElection` folded whatever log it
// was handed with no internal scope check at all; isolation was pure
// caller discipline (never mixing two candidates' events into one array).
// See projections.js for the fold-side half of this.
//
// LOOP 29 adds `observer.assignment.recorded` — the FIRST non-candidate
// preparedness fact. Reconnaissance (this loop) found no authoritative
// source for anything richer (accreditation, training, deployment
// coverage, a polling-unit master geography) — see
// src/domains/election/studio/observerReadiness.js's own header for the
// full list of what stays explicitly unsupported. This event establishes
// exactly ONE fact: an identified observer has a recorded assignment to an
// operational location. `location` is free text, the SAME honesty
// `ward`/`constituency` already carry (no geographic hierarchy exists to
// validate against) — never called `polling_unit`, because no polling-unit
// master geography exists in this repository to make that name true.
// ============================================================

import { createEvent, makeEventId, EVENT_SCHEMA_VERSION, MISSION_POLICY_LEVEL } from "../../os/events.js";

export { makeEventId, EVENT_SCHEMA_VERSION, MISSION_POLICY_LEVEL };

export const ELECTION_EVENT_TYPES = Object.freeze({
  CANDIDATE: Object.freeze({
    REGISTERED: "candidate.registered",
  }),
  CAMPAIGN: Object.freeze({
    WARD_ASSIGNED:        "campaign.ward.assigned",
    WARD_STATUS_REPORTED: "campaign.ward.status_reported",
  }),
  DOCUMENT: Object.freeze({
    // Recorded ONLY once a real document/creative engine exists (not built this
    // phase — see docs/FORGE-AI-SERVICE-CONTRACT.md's "deliberately not built"
    // discipline). Declared now so the vocabulary has a name to grow into,
    // exactly as manufacturing's PROGRAM/mission fields existed before V1
    // populated them.
    PUBLISHED: "document.published",
  }),
  OBSERVER: Object.freeze({
    ASSIGNED: "observer.assignment.recorded",
  }),
});

/**
 * Every field REQUIRED for a type to be a complete record, mirroring
 * src/os/events.js's REQUIRED_FIELDS_BY_TYPE_PREFIX — a producer that omits one
 * of these publishes nothing, loudly, rather than a record with a silent hole.
 */
const REQUIRED_FIELDS_BY_TYPE = Object.freeze({
  [ELECTION_EVENT_TYPES.CANDIDATE.REGISTERED]:
    ["candidate", "campaign", "name", "office", "constituency", "party", "summary"],
  [ELECTION_EVENT_TYPES.CAMPAIGN.WARD_ASSIGNED]:
    ["ward", "campaign", "name", "organisation", "summary"],
  [ELECTION_EVENT_TYPES.CAMPAIGN.WARD_STATUS_REPORTED]:
    ["ward", "campaign", "status", "summary"],
  [ELECTION_EVENT_TYPES.DOCUMENT.PUBLISHED]:
    ["document", "campaign", "summary"],
  [ELECTION_EVENT_TYPES.OBSERVER.ASSIGNED]:
    ["observer", "campaign", "location", "summary"],
});

/**
 * MISSION RELATIONSHIP, EXPLICIT PER TYPE (per the task's own instruction: "Every
 * event type must have explicit mission relationship... UNKNOWN must remain
 * distinct from OPTIONAL").
 *
 * This MVP declares NO mission concept for Election yet — a campaign's own
 * strategic hierarchy (does a ward belong to a "mission"-equivalent?) is a real
 * domain question this phase does not answer, matching TRANSITIONAL.md's D2
 * pattern: FORBIDDEN is not the same claim as "we haven't decided", so every
 * type here is explicitly FORBIDDEN, not silently OPTIONAL. Revisit when a real
 * campaign-strategy hierarchy is designed — a domain decision, not a derivation.
 */
export const MISSION_POLICY = Object.freeze({
  [ELECTION_EVENT_TYPES.CANDIDATE.REGISTERED]:        MISSION_POLICY_LEVEL.FORBIDDEN,
  [ELECTION_EVENT_TYPES.CAMPAIGN.WARD_ASSIGNED]:       MISSION_POLICY_LEVEL.FORBIDDEN,
  [ELECTION_EVENT_TYPES.CAMPAIGN.WARD_STATUS_REPORTED]: MISSION_POLICY_LEVEL.FORBIDDEN,
  [ELECTION_EVENT_TYPES.DOCUMENT.PUBLISHED]:            MISSION_POLICY_LEVEL.FORBIDDEN,
  [ELECTION_EVENT_TYPES.OBSERVER.ASSIGNED]:             MISSION_POLICY_LEVEL.FORBIDDEN,
});

/**
 * CAPABILITY, DECLARED (see module header — not yet wired into policy.js).
 * Shaped exactly like events.js's EVENT_CAPABILITY: event type -> capability
 * string a role must hold.
 */
export const EVENT_CAPABILITY = Object.freeze({
  [ELECTION_EVENT_TYPES.CANDIDATE.REGISTERED]:         "election.register",
  [ELECTION_EVENT_TYPES.CAMPAIGN.WARD_ASSIGNED]:        "election.assign",
  [ELECTION_EVENT_TYPES.CAMPAIGN.WARD_STATUS_REPORTED]: "election.report",
  [ELECTION_EVENT_TYPES.DOCUMENT.PUBLISHED]:            "election.publish",
  [ELECTION_EVENT_TYPES.OBSERVER.ASSIGNED]:             "election.observer_assign",
});

/**
 * REQUIRED ACTOR KIND, DECLARED (LOOP 30) — event type -> the ONLY
 * `campaigns.actor_kind` value (electionBootstrap.js's ACTOR_KIND, plain
 * string literals here rather than an import — this module stays
 * self-contained, per its own header, the same reason EVENT_CAPABILITY
 * above never imports Roles.js) that may cause this event to be written.
 *
 * WHY THIS LIVES HERE, NOT IN write.js. This is a fact about the EVENT
 * TYPE's own authority requirement, the same category `EVENT_CAPABILITY`
 * already is — not a fact about how a message is parsed (write.js's own
 * concern) or about how a client checks it (electionWebAdapter.js's own
 * concern, since checking requires a database read this file must never
 * perform). `DOCUMENT.PUBLISHED` has no entry: no document/creative engine
 * exists to write it yet (see its own declaration), so there is nothing to
 * gate.
 *
 * THIS MAP IS DATA, NOT ENFORCEMENT. Nothing in this file, or in write.js,
 * ever reads `campaigns.actor_kind` — only `electionWebAdapter.js` does,
 * because only it holds the `client` a real check requires. This mirrors
 * `EVENT_CAPABILITY`'s own "declared, not yet wired into policy.js"
 * status, except this loop DOES wire it — at the one layer capable of it.
 */
export const REQUIRED_ACTOR_KIND = Object.freeze({
  [ELECTION_EVENT_TYPES.CANDIDATE.REGISTERED]:          "candidate_campaign",
  [ELECTION_EVENT_TYPES.CAMPAIGN.WARD_ASSIGNED]:        "candidate_campaign",
  [ELECTION_EVENT_TYPES.CAMPAIGN.WARD_STATUS_REPORTED]: "candidate_campaign",
  [ELECTION_EVENT_TYPES.OBSERVER.ASSIGNED]:             "observer_organisation",
});

function compact(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v;
  }
  return out;
}

// ---------- validation (mirrors events.js's validateEvent shape) ----------
export function validateElectionEvent(event) {
  const issues = [];
  if (!event || typeof event !== "object" || typeof event.type !== "string" || !event.type) {
    return { valid: false, issues: [{ severity: "error", message: "event has no `type`" }] };
  }
  const required = REQUIRED_FIELDS_BY_TYPE[event.type];
  if (!required) {
    issues.push({ severity: "error", message: `"${event.type}" is not a canonical Election event type` });
  } else {
    for (const field of required) {
      if (event[field] == null || event[field] === "") {
        issues.push({ severity: "error", message: `event type "${event.type}" requires field "${field}"` });
      }
    }
  }
  if (event.mission != null && event.mission !== "" &&
      MISSION_POLICY[event.type] === MISSION_POLICY_LEVEL.FORBIDDEN) {
    issues.push({ severity: "error",
      message: `event type "${event.type}" is MISSION_FORBIDDEN and must not carry a mission` });
  }
  return { valid: issues.every((i) => i.severity !== "error"), issues };
}

export function assertElectionEvent(event) {
  const { valid, issues } = validateElectionEvent(event);
  if (!valid) {
    throw new Error(`Invalid Election event: ${issues.filter((i) => i.severity === "error")
      .map((i) => i.message).join("; ")}`);
  }
  return event;
}

// ---------- domain factories ----------
//
// `campaign` — TENANT SCOPE, ADDED THIS LOOP. Deliberately NOT named
// `organisation`: that field already exists on `wardAssignedEvent` and means
// something else entirely (the ward's own assigned field team, e.g. "Demo
// Field Org") — reusing it for tenant scope would silently collide two
// unrelated meanings under one field name, exactly the kind of defect this
// project's own history has found and fixed before (Business's Loop 21
// phrase collisions were the same failure shape, one layer up). `campaign`
// is required, explicitly thrown on when absent (the same elevated
// treatment `candidate`/`ward`/`status` already get), and is the ONLY field
// `projectElection` trusts to scope a fold — see projections.js.
export function candidateEvent({ candidate, campaign, name, office, constituency, party, summary, ...extra }) {
  if (candidate == null) throw new Error("candidateEvent: `candidate` is required");
  if (campaign == null) throw new Error("candidateEvent: `campaign` is required");
  return createEvent({
    type: ELECTION_EVENT_TYPES.CANDIDATE.REGISTERED,
    candidate, campaign, name, office, constituency, party,
    summary: summary ?? `${name} registered to contest ${office} (${constituency})`,
    ...extra,
  });
}

export function wardAssignedEvent({ ward, campaign, name, organisation, person, status, summary, ...extra }) {
  if (ward == null) throw new Error("wardAssignedEvent: `ward` is required");
  if (campaign == null) throw new Error("wardAssignedEvent: `campaign` is required");
  return createEvent({
    type: ELECTION_EVENT_TYPES.CAMPAIGN.WARD_ASSIGNED,
    ward, campaign, name, organisation, person, status,
    summary: summary ?? `${organisation ?? "an organisation"} assigned to ${ward}`,
    ...extra,
  });
}

export function wardStatusEvent({ ward, campaign, status, reason, person, summary, ...extra }) {
  if (ward == null) throw new Error("wardStatusEvent: `ward` is required");
  if (campaign == null) throw new Error("wardStatusEvent: `campaign` is required");
  if (status == null) throw new Error("wardStatusEvent: `status` is required");
  return createEvent({
    type: ELECTION_EVENT_TYPES.CAMPAIGN.WARD_STATUS_REPORTED,
    ward, campaign, status, reason, person,
    summary: summary ?? `${ward} reported ${status}`,
    ...extra,
  });
}

// `observer` — the SUBJECT identifier, the same role `ward`/`candidate` play
// for their own event types: a caller-chosen id for THIS specific observer
// (a person or a named team), never invented by this factory. `location` is
// the operational location this observer is assigned to — free text, exactly
// as honest as `ward`, because no polling-unit master geography exists to
// validate it against. No `status`/`history` field exists here, mirroring
// `wardAssignedEvent` (assignment, not health) rather than `wardStatusEvent`
// — a second, richer "observer status" fact is a future, deliberate decision,
// not something this factory should quietly grow toward.
export function observerAssignedEvent({ observer, campaign, location, person, summary, ...extra }) {
  if (observer == null) throw new Error("observerAssignedEvent: `observer` is required");
  if (campaign == null) throw new Error("observerAssignedEvent: `campaign` is required");
  if (location == null) throw new Error("observerAssignedEvent: `location` is required");
  return createEvent({
    type: ELECTION_EVENT_TYPES.OBSERVER.ASSIGNED,
    observer, campaign, location, person,
    summary: summary ?? `${observer} assigned to ${location}`,
    ...extra,
  });
}

export default {
  ELECTION_EVENT_TYPES, MISSION_POLICY, EVENT_CAPABILITY, REQUIRED_ACTOR_KIND,
  validateElectionEvent, assertElectionEvent,
  candidateEvent, wardAssignedEvent, wardStatusEvent, observerAssignedEvent,
  makeEventId, EVENT_SCHEMA_VERSION,
};
