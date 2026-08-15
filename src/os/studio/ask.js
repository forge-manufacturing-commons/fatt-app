// ============================================================
// FORGE STUDIO — THE PIPELINE  (Phase 2)
//
// One function the room calls, and the only place the stages are wired together:
//
//   message
//     -> detect language          language.js
//     -> resolve canonical intent intent.js
//     -> read Forge Canon         canonTools.js  (deep-frozen, read-only)
//     -> produce claims           infer.js       (adapter — UNTRUSTED)
//     -> verify every claim       grounding.js   (second security boundary)
//     -> realise in the language  respond.js
//
// THE ORDER IS THE SECURITY MODEL. Verification sits between the thing that
// produces claims and the thing that speaks them, so no adapter — deterministic,
// remote, hostile, or a future model with a persuasive tone — can reach the
// sentence without passing the fold. Swapping the adapter cannot reorder this.
//
// MODE is a capability ceiling, not a hint:
//   ASK      read the Canon and answer.
//   EXPLAIN  the same facts plus the interpretation the Canon's own state
//            machine supplies. Still read.
//   PREPARE  additionally return a DRAFT event object. Not published, not
//            authorised, not validated against policy. See prepare.js.
//
// Nothing in this file imports an emitter, a policy, `publish`, Supabase, or any
// room-local module. That is checked by the test suite rather than promised here.
// ============================================================

import { createCanonTools } from "./canonTools.js";
import { resolveIntent, INTENT } from "./intent.js";
import { groundResponse, CLAIM, isBinding } from "./grounding.js";
import { runInference, deterministicAdapter } from "./infer.js";
import { planResponse, realiserFor } from "./respond.js";
import { prepareDraft } from "./prepare.js";

export const MODE = Object.freeze({
  ASK: "ASK",
  EXPLAIN: "EXPLAIN",
  PREPARE: "PREPARE",
});

/**
 * State a prepared draft in the participant's language.
 *
 * The `notice` carried on the draft already says NOT PUBLISHED / NOT AUTHORISED in
 * that language, so this sentence names WHAT was prepared and then defers to it.
 * The two are kept together deliberately: a draft description that could be read
 * without the notice is a draft that looks like a recorded event.
 */
function draftSentence(draft, language) {
  const { r } = realiserFor(language);
  return `${r.prepared(draft.label, draft.component)} ${draft.notice}`;
}

/**
 * Ask Forge Canon a question in any supported language.
 *
 * @param message            what the participant said
 * @param view               project(log, MISSIONS) — deep-frozen
 * @param log                the event stream (event-level grounding only)
 * @param preferredLanguage  the session preference, used only when detection is
 *                           genuinely uncertain. Never overrides a confident read.
 * @param mode               ASK | EXPLAIN | PREPARE
 * @param adapter            claim producer. Defaults to the deterministic one, so
 *                           Forge AI answers with NO provider attached.
 * @param session            prior turns, for resolving "the component we discussed".
 *                           Session memory only — it is not persisted and does not
 *                           outrank the Canon.
 */
export async function askForge({
  message,
  view = {},
  log = [],
  preferredLanguage = "en",
  mode = MODE.ASK,
  adapter = deterministicAdapter,
  session = null,
} = {}) {
  const tools = createCanonTools(view, log);

  let intent = resolveIntent(message, { preferredLanguage });

  // SESSION CONTINUITY, WITHOUT PRETENDING TO REMEMBER. "What about the one we
  // discussed?" names no component, so the last component of THIS session is
  // carried forward. It is conversational context and nothing more: it can only
  // ever supply an identifier to look up in the Canon, never a fact. If the
  // carried id is not in the Canon, the answer is still "no record of that".
  let carried = null;
  if (!intent.component && session?.lastComponent) {
    carried = session.lastComponent;
    intent = Object.freeze({ ...intent, component: carried, componentFromSession: true });
  }

  // The participant's words travel with the intent so a provider adapter can send
  // them. They are DATA for the model, never an instruction to Forge — the intent
  // was already resolved above, from those same words, before any model saw them.
  intent = Object.freeze({ ...intent, message: String(message ?? "") });

  // PROVIDER STATUS IS CAPTURED, NOT SWALLOWED (§14).
  //
  // In Phase 2 a provider failure fell back to the deterministic answer silently.
  // The answer was correct, which is why it looked acceptable — but the participant
  // could not tell whether they were reading a model's phrasing or Forge's own, and
  // an operator could not tell that inference was down at all. Silence about a
  // failure is its own kind of dishonesty. The status is now surfaced.
  let providerStatus = null;
  const observed = (res) => { providerStatus = res ?? null; };
  const wired = adapter?.withStatus ? adapter.withStatus(observed) : adapter;

  const grounded = await runInference({ adapter: wired, intent, view, log, tools });
  const planned = planResponse({ grounded, intent, view });

  // PREPARE is additive and strictly last. It cannot change the answer, and it
  // produces an object rather than an action.
  // The participant's own words are passed through, because the event type they
  // asked for lives in the VERB ("record the pass", "an amince") and the resolved
  // intent only carries the fact that something was requested. Without the text,
  // PREPARE could never name an event type and always returned an empty draft.
  const draft = mode === MODE.PREPARE
    ? prepareDraft({ intent, view, language: planned.language, text: String(message ?? "") })
    : null;

  // A prepared draft is stated in the participant's language, appended to the
  // answer rather than replacing it — they still get the Canon's current position
  // AND a clear statement that nothing has been recorded.
  // When PREPARE succeeded but the message was not ALSO a recognisable question,
  // the "I did not understand that" preamble is misleading — the request was
  // understood well enough to draft a canonical event from it. Drop the preamble
  // and state the draft alone.
  const answer = draft?.draft
    ? (intent.type === INTENT.UNKNOWN
        ? draftSentence(draft, planned.language)
        : `${planned.answer} ${draftSentence(draft, planned.language)}`.trim())
    : planned.answer;

  // PREPARE's draft sentence is its own segment kind, so a surface can never
  // render "I have prepared a draft" with the same weight as a recorded fact.
  const segments = draft?.draft
    ? Object.freeze([
        ...(intent.type === INTENT.UNKNOWN ? [] : planned.segments),
        Object.freeze({ text: draftSentence(draft, planned.language), kind: "PREPARED" }),
      ])
    : planned.segments;

  return Object.freeze({
    // What the participant reads.
    answer,
    // The SAME answer, split by what kind of statement each part is (§8). A
    // recommendation and a Canon fact must never be presented identically.
    segments,
    language: planned.language,
    languageFellBack: planned.fellBack,

    // Why they should believe it. Present in every result so a surface can show
    // provenance without the caller having to ask for it.
    sources: planned.sources,
    canonLimitation: planned.canonLimitation,
    identifiersPreserved: planned.preserved,

    // What the pipeline decided, exposed for the intent preview and the audit.
    intent: Object.freeze({
      type: intent.type,
      component: intent.component ?? null,
      mission: intent.mission ?? null,
      specification: intent.specification ?? null,
      subject: intent.subject ?? null,
      confidence: intent.confidence,
      fromSession: Boolean(carried),
    }),
    detectedLanguage: intent.detectedLanguage ?? null,
    languageConfidence: intent.languageConfidence ?? 0,
    mixedLanguage: Boolean(intent.mixedLanguage),
    responseLanguageBecause: intent.responseLanguageBecause ?? null,

    // The grounding verdict. `sound` is false when anything asserted the Canon
    // and failed to prove it — the single field a surface should refuse to
    // present facts on.
    grounded: Object.freeze({
      sound: grounded.sound,
      facts: grounded.facts.length,
      derived: grounded.derived.length,
      unknowns: grounded.unknowns.length,
      downgraded: grounded.downgraded.length,
      roomLocal: grounded.roomLocal.length,
      canonLimitations: grounded.canonLimitations.length,
      claims: grounded.claims,
    }),

    mode,
    draft,

    // INFERENCE PROVENANCE. Which path produced the words the participant is
    // reading, and — when the provider failed — a sentence in their own language
    // saying so and confirming the Canon is untouched.
    provider: Object.freeze({
      attempted: providerStatus !== null,
      status: providerStatus?.status ?? null,
      reason: providerStatus?.reason ?? null,
      // A model's prose is only ever used when EVERY claim it made grounded.
      usedModelPhrasing: false,
      failed: providerStatus !== null && providerStatus.status !== "OK",
      notice: providerStatus !== null && providerStatus.status !== "OK"
        ? realiserFor(planned.language).r.providerDown()
        : null,
    }),
  });
}

/** Only these two classes may ever be shown to a user as Forge Canon facts. */
export const presentableFacts = (result) =>
  (result?.grounded?.claims ?? []).filter(isBinding);

export default { askForge, MODE, presentableFacts };
