// ============================================================
// FORGE STUDIO — INFERENCE BOUNDARY  (Phase 1)
//
// The seam where a model will eventually be attached, and nothing more. NO
// provider is chosen, NO key exists, NO network call is made, and nothing here
// imports anything that could reach one.
//
// WHY THE SEAM EXISTS NOW. The safety architecture has to be provable before a
// model is connected, and it can only be proved if a HOSTILE adapter can be
// substituted in a test. So the adapter interface comes first and the deterministic
// implementation comes with it; the real one is Phase 2, on authorisation.
//
// THE CONTRACT AN ADAPTER MUST OBEY:
//
//   adapter({ intent, canon, language }) -> claim[]
//
// An adapter returns CLAIMS, never prose and never actions. It therefore cannot:
//   * publish an event      — it has no publish, no emitter, no bus
//   * write to the Canon    — the projection it receives is deep-frozen
//   * grant authority       — it has no identity, role, capability or policy
//   * be trusted            — every claim it returns is re-verified downstream
//
// A hostile adapter is not a security hole in this design; it is a test case.
// `runInference` grounds whatever comes back, so an adapter that lies produces
// UNKNOWN rather than a fact. That property is what Phase 1 exists to prove.
// ============================================================

import { groundResponse, canonFact, interpretation, recommendation, unknown, foldSource,
         notRecorded, NOT_RECORDED_BY_CANON }
  from "./grounding.js";
import { INTENT } from "./intent.js";
import { componentState } from "../../domains/production/state.js";

/**
 * Run an adapter and ground everything it returns.
 *
 * The adapter's output is treated as UNTRUSTED INPUT, in exactly the way an
 * event from an emitter is treated as untrusted until validateEvent and the
 * policy gates have run. Grounding is not optional and cannot be skipped by a
 * caller, because it happens here rather than in the adapter.
 */
export async function runInference({ adapter, intent, view = {}, log = [], tools = null }) {
  if (typeof adapter !== "function") {
    throw new Error("runInference: an adapter function must be injected — none is bundled");
  }
  let claims;
  try {
    claims = await adapter({ intent, canon: view, tools, language: intent?.language ?? "en" });
  } catch (err) {
    return groundResponse(
      [unknown("", `the inference adapter failed: ${err?.message ?? String(err)}`)],
      { view, log },
    );
  }
  const list = Array.isArray(claims) ? claims : [claims];
  // EVERY claim is re-verified against the live fold. The adapter's opinion of
  // its own provenance is irrelevant.
  return groundResponse(list, { view, log });
}

/**
 * The only adapter shipped in Phase 1: deterministic, offline, no model.
 *
 * It answers from the Canon and cites the fold path for every fact, so it also
 * serves as the reference for what a correct adapter looks like. Where the Canon
 * is silent it returns UNKNOWN — it never fills a gap.
 */
export const deterministicAdapter = ({ intent, canon }) => {
  const id = intent?.component;
  const comp = id ? canon?.components?.[id] : null;
  const lang = intent?.language ?? "en";

  // (P0-1) THE SUBJECT CHECK COMES FIRST, BEFORE THE INTENT SWITCH.
  //
  // If the question is about something the Canon does not record, the honest
  // answer does not depend on how well the phrasing was recognised. Putting this
  // after the switch would mean "what material is HUB-014?" fell through to the
  // generic "not recognised" reply — a MODEL limitation — when the truth is a
  // CANON limitation. The distinction matters: the first invites the model to
  // guess next time, the second names a gap in ForgeOS.
  //
  // SPECIFICATION_EXPLAIN is exempt because the Canon genuinely holds part of the
  // answer (state, author); that branch refuses the drawing content separately, so
  // it can state what it knows AND what it does not in the same response.
  const subject = intent?.subject;
  if (subject && NOT_RECORDED_BY_CANON[subject] && intent?.type !== INTENT.SPECIFICATION_EXPLAIN) {
    return [notRecorded(subject, id ?? intent?.specification ?? null, lang)];
  }

  if (intent?.type === INTENT.UNKNOWN) {
    return [unknown("", "the request was not recognised as a Canon question")];
  }
  if (id && !comp) {
    return [unknown(`${id}`, `no component "${id}" is recorded in the Canon`)];
  }

  switch (intent?.type) {
    case INTENT.COMPONENT_STATE:
      return [
        canonFact(`${id} ${comp.state}`, foldSource(`components.${id}.state`)),
        comp.organisation
          ? canonFact(`${id} ${comp.organisation}`, foldSource(`components.${id}.organisation`))
          : unknown(`${id} organisation`, "no organisation has claimed responsibility"),
        // MANUFACTURING LOCATION (P0-2). Answered here because "where is HUB-014?"
        // already resolves to COMPONENT_STATE — no new intent was needed, only a
        // fold field that was always on the events and never projected.
        comp.hub
          ? canonFact(`${id} ${comp.hub}`, foldSource(`components.${id}.hub`))
          : unknown(`${id} hub`, "no manufacturing hub is recorded for this component"),
      ];

    case INTENT.COMPONENT_NEXT_ACTION: {
      const next = componentState.transitions(comp.state);
      return [
        canonFact(`${id} ${comp.state}`, foldSource(`components.${id}.state`)),
        interpretation(`${comp.state} — ${componentState.means(comp.state) ?? ""}`),
        next.length
          ? recommendation(next.join(" | "))
          : unknown(`${id} next`, `the lifecycle permits no transition from "${comp.state}"`),
      ];
    }

    case INTENT.COMPONENT_WHO:
      // DELIBERATELY DOES NOT CITE `comp.hub`. A hub is where the work happened,
      // not who answers for it. Returning the hub to a "who is responsible?"
      // question would silently reintroduce the confusion E9 was built to remove
      // — and would invent a workshop-head authority the Canon does not hold.
      return [
        comp.organisation
          ? canonFact(`${comp.organisation}`, foldSource(`components.${id}.organisation`))
          : unknown("responsibility", "no organisation has claimed responsibility"),
        canonFact(String((comp.contributions ?? []).length),
                  foldSource(`components.${id}.contributions`)),
        canonFact(String((comp.history ?? []).length), foldSource(`components.${id}.history`)),
      ];

    case INTENT.INSPECTION_STATUS: {
      // The injection-resistant answer: a pass is only asserted when the fold's
      // own history contains the transition.
      const passed = (comp.history ?? []).some((h) => h.transition === "pass");
      return passed
        ? [canonFact(`${id} pass`, foldSource(`components.${id}.history`))]
        : [unknown(`${id} inspection`,
            "no inspection pass is recorded in the Canon for this component")];
    }

    case INTENT.MISSION_PROGRESS: {
      const mid = intent.mission;
      const m = (canon?.missions ?? []).find((x) => x.id === mid);
      if (!m) return [unknown(`${mid}`, `no mission "${mid}" is recorded in the Canon`)];
      return [
        canonFact(`${m.id} ${m.accepted}/${m.target}`, foldSource(`missions.${m.id}.accepted`)),
        canonFact(`${m.id} ${m.state}`, foldSource(`missions.${m.id}.state`)),
      ];
    }

    case INTENT.SPECIFICATION_EXPLAIN: {
      const sid = intent.specification;
      const s = sid ? canon?.specifications?.[sid] : null;
      if (!s) return [unknown(`${sid}`, `no specification "${sid}" is recorded in the Canon`)];
      return [
        canonFact(`${sid} ${s.state}`, foldSource(`specifications.${sid}.state`)),
        s.author ? canonFact(`${s.author}`, foldSource(`specifications.${sid}.author`))
                 : unknown("author", "no author is recorded"),
        interpretation(`${sid} ${s.state}`),
        // (P0-1) A specification in the Canon is a LIFECYCLE, not a document. The
        // Canon records that FTT-HB-001 was drafted, reviewed and approved, and by
        // whom — it holds no title, no dimensions, no material and no drawing. So
        // "explain the drawing" is answered with the lifecycle it does know AND an
        // explicit statement of what it does not, in the same breath. Room surfaces
        // that display a title are the room's declaration, never this.
        notRecorded(subject && NOT_RECORDED_BY_CANON[subject] ? subject : "drawing", sid, lang),
      ];
    }

    default:
      return [unknown("", `no deterministic answer for intent "${intent?.type}"`)];
  }
};

/** The adapter contract, published so Phase 2 has something to satisfy. */
export const ADAPTER_CONTRACT = Object.freeze({
  signature: "({ intent, canon, tools, language }) => claim[] | Promise<claim[]>",
  mustReturn: "claims only — never prose, never actions, never events",
  cannot: Object.freeze([
    "publish an event", "write to the Canon", "grant authority",
    "reach policy", "be trusted without grounding",
  ]),
  groundedBy: "runInference — every claim is re-verified against the live fold",
});

export default { runInference, deterministicAdapter, ADAPTER_CONTRACT };
