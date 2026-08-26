// ============================================================
// FORGE ELECTION — THE FOLD  (MVP domain pack)
//
// The SAME PATTERN as src/os/projections.js's `project(log, missions)` — events
// are the only source of truth, the fold is the only Canon, absence is explicit
// — applied to a different event vocabulary. This is NOT a second engine: there
// is still exactly one rule (events write, the fold reads), just one more
// instance of it, the same way src/domains/production and src/domains/engineering
// are two instances of "a domain" rather than two competing kernels.
//
// Returns a `view` shaped `{ candidates, wards, observers, feed }` —
// `candidates`/`wards`/`observers` are maps keyed by id, the SAME shape
// entity.js's `DEFAULT_ENTITY_KINDS` already knows how to read
// (`Object.keys(view.components)`-style), so an election `kinds` list is
// three lines of data, not a new resolver.
//
// `observers` (LOOP 29) is folded by the SAME single function, unaware of
// actor_kind — this fold has NEVER known which kind of actor a campaign
// declares itself to be (that lives on `campaigns`, a different table
// entirely — see electionBootstrap.js). It folds whatever event TYPES
// actually appear in a campaign's own scoped log. In practice a
// candidate's campaign never contains an `observer.assignment.recorded`
// event (nothing in the write path lets it), so `observers` stays empty
// for one and `candidates`/`wards` stay empty for the other — separation
// comes from which events were ever WRITTEN into each tenant's log, not
// from a branch in this fold.
//
// LOOP (TENANT SCOPING) — `projectElection(log, campaign)`. Before this,
// isolation between two candidates/campaigns was pure caller discipline:
// nothing inside this function ever checked that every event in `log`
// actually belonged to the same campaign. That is exactly the gap this
// project's own Business Canon closed for itself with `projectBusiness(log,
// organisationId)` — the same pattern is copied here, field-for-field:
// fail-closed (a missing `campaign` scope folds an EMPTY Canon, never
// everyone's events), and the filter is the FIRST thing the fold does, so
// no branch below ever sees an event from a different campaign. Proven in
// test/election-readiness.consumer.mjs by folding a log that deliberately
// mixes two campaigns' events and confirming only one appears in the view.
// ============================================================

import { ELECTION_EVENT_TYPES } from "./events.js";

const deepFreeze = (o) => {
  if (o && typeof o === "object" && !Object.isFrozen(o)) {
    Object.values(o).forEach(deepFreeze);
    Object.freeze(o);
  }
  return o;
};

export function projectElection(log = [], campaign = null) {
  const candidates = {};
  const wards = {};
  const observers = {};
  const feed = [];

  // TENANT FILTER, FIRST — see the header note above. An event for a
  // different campaign, or with no campaign at all, never reaches a single
  // branch below.
  const scoped = campaign
    ? log.filter((e) => e?.campaign === campaign)
    : [];

  // Oldest first, so a later event correctly overwrites an earlier one's fields —
  // same fold discipline as os/projections.js.
  const ordered = [...scoped].reverse();

  for (const e of ordered) {
    if (e?.type === ELECTION_EVENT_TYPES.CANDIDATE.REGISTERED) {
      candidates[e.candidate] = {
        id: e.candidate, name: e.name ?? null, office: e.office ?? null,
        constituency: e.constituency ?? null, party: e.party ?? null,
      };
    }
    // `person` (LOOP 34) — folded ONLY off WARD_ASSIGNED into the ward's
    // TOP-LEVEL `person`, the same last-value-wins discipline `organisation`
    // already gets. This is the wardAssignedEvent.person -> projectElection()
    // correctness fix: the factory has always accepted this field (see
    // events.js), but until now the fold silently discarded it. This is the
    // ASSIGNEE — "who is assigned to this ward" — a current-state fact,
    // last-value-wins like `organisation`.
    //
    // WARD_STATUS_REPORTED also carries its own `person` — the REPORTER of
    // one specific status update, a DIFFERENT fact from the assignee above.
    // LOOP 35 preserves it too, but NEVER into this same top-level field —
    // it is folded per-entry into `history[].person` instead (see below),
    // mirroring src/os/projections.js's own established `history.push({...,
    // by: e.person || e.human})` convention. The two `person` fields are
    // deliberately never merged into one Canon field.
    if (e?.type === ELECTION_EVENT_TYPES.CAMPAIGN.WARD_ASSIGNED) {
      const prev = wards[e.ward] ?? { id: e.ward, name: null, organisation: null, person: null, status: null, history: [] };
      wards[e.ward] = {
        ...prev, name: e.name ?? prev.name, organisation: e.organisation ?? prev.organisation,
        person: e.person ?? prev.person,
      };
    }
    if (e?.type === ELECTION_EVENT_TYPES.CAMPAIGN.WARD_STATUS_REPORTED) {
      const prev = wards[e.ward] ?? { id: e.ward, name: null, organisation: null, person: null, status: null, history: [] };
      wards[e.ward] = {
        ...prev, status: e.status ?? prev.status, reason: e.reason ?? null,
        // `person` HERE is the REPORTER of THIS status report — a fact about
        // this one history entry, never the ward's top-level `person`
        // (LOOP 34's field, the ASSIGNEE). The two are deliberately never
        // merged into one field: mirrors src/os/projections.js's own
        // established convention of `history.push({..., by: e.person ||
        // e.human})` — a per-entry actor, not a folded current-state field.
        history: [...prev.history, { status: e.status ?? null, reason: e.reason ?? null, person: e.person ?? null, at: e.at ?? null }],
      };
    }
    // OBSERVER ASSIGNMENT (LOOP 29) — last-value-wins on `location`, the
    // SAME discipline WARD_ASSIGNED already uses (an assignment fact, not a
    // status-history fact — no `history` array here, mirroring
    // wardAssignedEvent's own shape rather than wardStatusEvent's).
    if (e?.type === ELECTION_EVENT_TYPES.OBSERVER.ASSIGNED) {
      const prev = observers[e.observer] ?? { id: e.observer, location: null };
      observers[e.observer] = { ...prev, location: e.location ?? prev.location };
    }
    if (e?.type) {
      feed.push({ at: e.at, eventId: e.eventId, type: e.type,
        subject: e.candidate || e.ward || e.observer || e.document || null,
        actor: e.person || null, detail: e.summary || null });
    }
  }

  return deepFreeze({ candidates, wards, observers, feed: feed.reverse() });
}

export default { projectElection };
