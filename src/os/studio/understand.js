// ============================================================
// FORGE STUDIO — UNDERSTANDING  (conversational phase, §4, §8, §25)
//
// THE STAGE THIS PHASE EXISTS TO ADD, and the one that was missing.
//
// Before this file, the model was attached at the wrong end of the pipeline. A
// deterministic phrase table decided what the participant meant, and the model was
// invited afterwards to rephrase the answer more fluently. So Forge could produce a
// beautiful Hausa sentence about the wrong question, and could not understand
// "What is stopping this work?" at all — because the table happens to contain
// "what is blocking" and not "what is stopping". The measured failures were:
//
//   "where is the drawing of hub 002"   component = null   (the id was simply lost)
//   "the 002 hub"                       unknown
//   "CHS 014 status"                    unknown
//   "has fabrication started?"          unknown
//   "Has anyone been assigned to it?"   unknown
//   "What is stopping this work?"       unknown
//
// Adding those six phrasings to the table would have fixed those six sentences and
// nothing else, which is precisely the trap §25 names. The division of labour is
// instead the one §25 sets out:
//
//   THE MODEL       reads the sentence and PROPOSES an operation and an entity
//   THE DETERMINISM validates the proposal, resolves the entity against the fold,
//                   retrieves, grounds, and composes the answer
//
// DETERMINISTIC FIRST, MODEL ON ESCALATION — AND WHY THAT IS NOT A HEDGE.
//
// The phrase table is not deleted. It is demoted to what §12 requires anyway: the
// path that answers when the provider is a 429, a timeout or an unreachable host,
// which in a Nigerian workshop is an ordinary Tuesday rather than an incident. So
// understanding runs deterministically first and consults the model ONLY when the
// deterministic read is genuinely inadequate — an unrecognised intent, or an
// operation that needs a subject and has none. Three consequences, all wanted:
//
//   * a workshop with no connectivity keeps the behaviour it has today
//   * the common questions cost no extra provider call and no extra latency
//   * the model is used exactly where understanding is hard, which is where its
//     value is real and where a table can never catch up
//
// I am naming the trade because it is a real one: a phrase table that matches
// CONFIDENTLY AND WRONGLY will not escalate, and the model never sees that sentence.
// That is why escalation also fires on a missing subject, and why the mutation suite
// includes a mutant that makes the deterministic read always look sufficient.
//
// WHAT THE MODEL CANNOT DO FROM HERE. It returns a request, never a fact — there is
// no claim, no source, no state and no event in the interpret contract. It cannot
// select the response language (§15: that was resolved from the participant's own
// words and the global preference before this file ran). It cannot name an entity
// into existence, because request.js resolves every entity against the fold. And it
// cannot widen its own context: it is given the participant's sentence, the
// operations it may propose, and the ids the Canon actually holds — nothing else,
// and in particular no state, organisation, history or specification content.
// ============================================================

import { resolveIntent, INTENT } from "./intent.js";
import { resolveSubject, lastIntentType, RESOLUTION } from "./conversation.js";
import { validateRequest, REQUEST, PROPOSABLE } from "./request.js";
import { canonEntities } from "./entity.js";

/** How the intent in front of you was arrived at. Diagnostics and tests only. */
export const UNDERSTOOD_BY = Object.freeze({
  DETERMINISTIC: "DETERMINISTIC",
  MODEL:         "MODEL",
  CLARIFY:       "CLARIFY",
});

/**
 * Is the deterministic read good enough to skip the model?
 *
 * Good enough means: it recognised an operation, AND if that operation needs a
 * subject it has one. Nothing about elegance — only whether Forge can actually
 * perform the read the participant asked for.
 *
 * A CANON LIMITATION IS ALWAYS SUFFICIENT, whatever the intent says. "What material
 * is CHS-014 made from?" resolves to an unrecognised intent and a `material`
 * subject, and the honest answer — Forge Canon does not record component material —
 * needs no model to produce and must not be escalated in the hope of a better one.
 * Escalating it would invite the model to fill a gap ForgeOS has, which is §18's and
 * §11's whole concern.
 */
function deterministicIsSufficient(intent) {
  if (intent?.subject) return true;
  if (intent?.type === INTENT.UNKNOWN) return false;
  const needsSubject = [
    INTENT.COMPONENT_STATE, INTENT.COMPONENT_NEXT_ACTION, INTENT.COMPONENT_WHY,
    INTENT.COMPONENT_WHO, INTENT.COMPONENT_CONTRIBUTIONS, INTENT.COMPONENT_DIRECTIVES,
    INTENT.COMPONENT_HISTORY, INTENT.COMPONENT_HUB, INTENT.COMPONENT_MISSION,
    INTENT.INSPECTION_STATUS, INTENT.ACKNOWLEDGEMENT_STATUS, INTENT.CANON_GAPS,
  ].includes(intent?.type);
  if (needsSubject && !intent?.component) return false;
  if (intent?.type === INTENT.MISSION_PROGRESS && !intent?.mission) return false;
  return true;
}

/**
 * The bounded material an interpreter may be given. (§10)
 *
 * IDENTIFIERS AND OPERATION NAMES. NOT FACTS.
 *
 * The vocabulary is the ids the Canon holds, because resolving "hub 002" to HUB-002
 * requires knowing HUB-002 exists and nothing more. No state, no organisation, no
 * hub, no mission progress, no history and no specification content crosses this
 * boundary — the model is being asked to read a sentence, not to know the
 * manufacturing. The answer call downstream has its own separately-bounded context
 * and is the only thing that ever sees a value.
 *
 * `recent` is the last few messages, needed for "Why?" to be interpretable at all.
 * It carries the participant's OWN WORDS and never Forge's answers, so nothing the
 * Canon said can be laundered back in as though the model had established it.
 */
export function interpretContext({ message, view = {}, conversation = null, limit = 24 } = {}) {
  const entities = canonEntities(view).slice(0, limit).map((e) => `${e.id} (${e.kind})`);
  const recent = [...(conversation?.turns ?? [])].slice(-3).map((t) => t.message);
  return Object.freeze({
    message: String(message ?? ""),
    operations: PROPOSABLE,
    entities: Object.freeze(entities),
    recent: Object.freeze(recent),
  });
}

/**
 * Understand a message. Returns an intent shaped exactly like `resolveIntent`'s.
 *
 * Shaped identically ON PURPOSE: ask.js, infer.js, provider.js and respond.js all
 * consume that shape, and a new stage that changed it would ripple through four
 * files and every suite that asserts on them. The additions are extra fields, so
 * every existing reader keeps working unchanged.
 *
 * @param interpreter  async ({ message, operations, entities, recent }) => { intent, entity }
 *                     Injected. Absent means deterministic-only, which is the
 *                     offline behaviour and is fully supported rather than degraded.
 */
export async function understand({
  message,
  view = {},
  preferredLanguage = "en",
  conversation = null,
  interpreter = null,
} = {}) {
  // 1. THE DETERMINISTIC READ. Also the only source of the response language, the
  //    unrecorded-subject detection and the mixed-language flags.
  const base = resolveIntent(message, { preferredLanguage });

  // 2. THE SUBJECT, resolved against the CANON rather than against a shape pattern.
  //    This is what makes "hub 002" and "the 002 hub" work, and it also carries the
  //    subject forward so "Why?" has something to be about.
  const subject = resolveSubject({ message, view, conversation });

  // 3. AMBIGUITY STOPS EVERYTHING. No model call, no Canon read, no answer — a
  //    question instead (§7). Asking costs one turn; answering about the wrong part
  //    is a wrong manufacturing statement delivered with full confidence.
  if (subject.how === RESOLUTION.AMBIGUOUS) {
    return Object.freeze({
      ...base,
      type: INTENT.UNKNOWN,
      component: null,
      clarify: Object.freeze({ candidates: subject.candidates }),
      understoodBy: UNDERSTOOD_BY.CLARIFY,
      componentFromSession: false,
    });
  }

  // The Canon-resolved subject REPLACES the shape-matched one. `resolveIntent`'s
  // `component` comes from an uppercase-hyphen pattern over the raw text; this one
  // comes from the fold. When they disagree, the fold is right by definition — and
  // when the pattern found nothing, this is what supplies the id at all.
  let intent = Object.freeze({
    ...base,
    component: subject.id ?? base.component ?? null,
    componentFromSession: subject.how === RESOLUTION.CARRIED,
    understoodBy: UNDERSTOOD_BY.DETERMINISTIC,
    clarify: null,
  });

  // INTENT CARRY-FORWARD — THE MIRROR OF SUBJECT CARRY-FORWARD.
  //
  // "What about HUB-002?" names a part and asks nothing. Read literally it is an
  // unrecognised sentence; read conversationally it means "the question I just asked,
  // about this part instead", which is what §23's entity-confusion case requires and
  // what any person would assume. So when a message NAMES an entity but carries no
  // recognisable question, and the previous turn had a usable one, the question is
  // carried forward and the subject changes underneath it.
  //
  // THIS IS A RULE, NOT A PHRASE, which is the reason it lives here and not as five
  // more markers per language in intent.js. It works for "What about HUB-002?", "Kuma
  // HUB-002?", "HUB-002?" and a bare "HUB-002" — in any language, including ones with
  // no marker table at all — because it keys off structure rather than wording.
  //
  // Guarded three ways so it cannot fabricate an intent: it requires an entity to have
  // been NAMED in this message (not carried), it requires the deterministic read to
  // have recognised nothing, and `lastIntentType` refuses to hand back UNKNOWN or
  // ACTION_REQUEST. A bare "HUB-002" as the FIRST thing anyone says still resolves to
  // nothing, because there is no prior question to inherit.
  if (intent.type === INTENT.UNKNOWN && !intent.subject &&
      subject.how === RESOLUTION.NAMED && subject.kind === "component") {
    const carriedType = lastIntentType(conversation);
    if (carriedType) {
      intent = Object.freeze({ ...intent, type: carriedType, intentFromSession: true });
    }
  }

  if (deterministicIsSufficient(intent) || typeof interpreter !== "function") {
    return intent;
  }

  // 4. ESCALATE TO THE MODEL. Untrusted proposal in, validated request out.
  let proposal = null;
  try {
    proposal = await interpreter(interpretContext({ message, view, conversation }));
  } catch {
    // A failed interpreter is a provider failure, not an error the participant
    // caused. The deterministic understanding stands and §12 keeps the experience.
    return intent;
  }

  const validated = validateRequest(proposal ?? {}, { view });

  if (validated.status === REQUEST.AMBIGUOUS_ENTITY) {
    return Object.freeze({
      ...intent, type: INTENT.UNKNOWN, component: null,
      clarify: Object.freeze({ candidates: validated.candidates }),
      understoodBy: UNDERSTOOD_BY.CLARIFY,
    });
  }
  if (validated.status !== REQUEST.OK) {
    // FAIL CLOSED, AND KEEP WHAT WE HAD. An unknown operation, an entity the Canon
    // does not hold, or a missing subject all leave the deterministic read in place
    // rather than producing a better-sounding answer to a question nobody validated.
    return Object.freeze({ ...intent, proposalRejected: validated.status });
  }

  return Object.freeze({
    ...intent,
    type: validated.intentType,
    component: validated.component ?? intent.component,
    specification: validated.specification ?? intent.specification ?? null,
    mission: validated.mission ?? intent.mission ?? null,
    // The language is NOT taken from the model. It was resolved from the
    // participant's words and the global ForgeOS preference before this ran, and
    // §15 is explicit that understanding a language is not choosing one.
    understoodBy: UNDERSTOOD_BY.MODEL,
    operation: validated.operation,
  });
}

export default { understand, UNDERSTOOD_BY, interpretContext };
