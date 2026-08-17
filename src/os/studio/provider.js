// ============================================================
// FORGE STUDIO — PROVIDER TRANSPORT  (Phase 2)
//
// The client half of the inference boundary. It is an ADAPTER in the sense
// infer.js already defined: it produces claims, and `runInference` grounds every
// one of them against the live fold before anything reaches a participant.
//
// THREE PROPERTIES THIS FILE EXISTS TO GUARANTEE
//
// 1. NO SECRET. There is no provider key here and no `VITE_` variable that could
//    carry one. The only credential used is the Supabase anon key, which is
//    designed to be public. The provider key lives in the Edge Function's
//    environment and is never sent to the browser, so reading this bundle tells an
//    attacker nothing they could use.
//
// 2. BOUNDED CONTEXT. The model is sent ONLY the Canon facts the deterministic
//    pass already read and verified, as explicit `path = value` pairs. It is not
//    given the fold, the log, the tool surface, or a way to ask for more. It
//    cannot therefore see room-local data, another organisation's components, or
//    identity internals — not because it is told not to look, but because they
//    were never in the request.
//
// 3. UNTRUSTED RETURN. Claims come back as claims, and `canonFact` here does not
//    make anything true — it makes a claim that verifyClaim will resolve or
//    downgrade. A model that invents `components.HUB-014.history.inspection.passed`
//    produces UNKNOWN, and the Hausa answer becomes a Canon-limitation refusal.
//
// AND ONE MORE: THE PROSE IS OPTIONAL. If the model's answer survives grounding it
// is offered as better phrasing. If ANY binding claim fails, the model's sentence
// is discarded entirely and the deterministic answer stands. A partially-grounded
// paragraph is not shown with the bad parts removed, because a sentence that has
// had a clause deleted is no longer a sentence anyone verified.
// ============================================================

import { canonFact, canonDerived, interpretation, recommendation, unknown, roomLocal,
         foldSource, groundResponse, CLAIM } from "./grounding.js";

/**
 * The Supabase client is loaded LAZILY, on the first actual call.
 *
 * Not a micro-optimisation — a correctness fix. `src/lib/supabase.js` reads
 * `import.meta.env`, which exists under Vite and NOT under Node, so importing it
 * at the top of this module made the entire Studio unimportable from a test
 * runner: `TypeError: Cannot read properties of undefined (reading
 * 'VITE_SUPABASE_URL')`. A safety layer that cannot be tested outside a browser
 * is a safety layer nobody will test.
 *
 * It is also the honest shape. This module's contract is "produce claims"; the
 * network is an implementation detail of one path through it, and the
 * deterministic path must not depend on a browser global to exist.
 */
let clientPromise = null;
async function getSupabase() {
  if (!clientPromise) {
    clientPromise = import("../../lib/supabase.js")
      .then((m) => ({ supabase: m.supabase, isConfigured: m.isConfigured }))
      .catch(() => ({ supabase: null, isConfigured: false }));
  }
  return clientPromise;
}

/** Provider outcomes, so a surface can explain a failure rather than hide it. */
export const PROVIDER = Object.freeze({
  OK: "OK",
  NOT_CONFIGURED: "NOT_CONFIGURED",
  UNREACHABLE: "UNREACHABLE",
  REFUSED: "REFUSED",
  MALFORMED: "MALFORMED",
});

const FUNCTION_NAME = "forge-ai";

/**
 * The Canon facts the model is allowed to see, as declared path/value pairs.
 *
 * Built from the DETERMINISTIC pass, which means the model can only ever comment
 * on facts that already grounded. This is what makes the provider an improvement
 * to the wording rather than a second opinion on the manufacturing.
 */
/**
 * Which fold fields each intent is ALLOWED to send. (Phase 2.1, §16)
 *
 * Phase 2 sent the same five component fields for every question. That was wrong
 * in two ways. It leaks: a participant asking only "who is responsible?" had the
 * component's hub, mission and specification handed to a third-party model for no
 * reason. And it does not scale: the same habit applied to a Canon holding millions
 * of events is how a context window becomes a cost centre and a privacy incident.
 *
 * So context is scoped to the RELATIONSHIP asked about. A location question sends
 * the hub. A responsibility question sends the organisation. A participation
 * question sends contributions[]. `state` accompanies most of them because a
 * fluent sentence about a part usually needs to say what stage it is at — that is
 * a deliberate inclusion, not a default.
 */
const CONTEXT_FIELDS = Object.freeze({
  "component.state":         ["state", "organisation", "hub", "mission"],
  "component.hub":           ["hub", "state"],
  "component.who":           ["organisation", "state"],
  "component.mission":       ["mission", "state"],
  "component.contributions": ["contributions", "state"],
  "component.directives":    ["directives", "state"],
  "acknowledgement.status":  ["directives", "state"],
  "component.history":       ["history", "state"],
  "inspection.status":       ["history", "state"],
  "component.next_action":   ["state", "mission"],
  "specification.explain":   ["specification", "state"],
  "mission.progress":        ["mission"],
});

/** Fields sent when the intent is unrecognised: the minimum that identifies the part. */
const MINIMAL_FIELDS = Object.freeze(["state"]);

export function boundedContext({ grounded, view = {}, intent = {} } = {}) {
  const out = [];
  const seen = new Set();
  const push = (path, value) => {
    if (!path || seen.has(path) || value === undefined) return;
    seen.add(path);
    out.push({ path, value });
  };

  // Anything the DETERMINISTIC pass already verified. The model can only ever
  // comment on facts that already grounded, which is what makes it an improvement
  // to the wording rather than a second opinion on the manufacturing.
  //
  // A COLLECTION IS SENT AS A COUNT HERE TOO, AND IT WAS NOT.
  //
  // The field loop below has always counted arrays, and the comment there explains
  // why: the model needs to know that three people contributed in order to say so and
  // does not need their names. But this loop pushed `c.value` — the value that
  // `verifyClaim` resolved from the fold — and for a claim citing
  // `components.CHS-014.history` that value IS THE WHOLE ARRAY, with every
  // transition, timestamp and the name of the person who performed it.
  //
  // So "What happened to CHS-014?" was sending personal data and full event detail to
  // a third-party model, past a minimisation rule that was already written and already
  // correct one loop further down. The two paths disagreed and the weaker one won,
  // which is the ordinary way a minimisation guarantee is lost — not by someone
  // deciding to send more, but by a second code path nobody re-checked. Found by the
  // §10 assertion that history is sent as a number.
  for (const c of grounded?.claims ?? []) {
    if (c?.type !== CLAIM.CANON_FACT && c?.type !== CLAIM.CANON_DERIVED) continue;
    if (c.verified !== true) continue;
    if (c.source?.path) push(c.source.path, Array.isArray(c.value) ? c.value.length : c.value);
  }

  const id = intent?.component;
  const comp = id ? view?.components?.[id] : null;
  if (comp) {
    const fields = CONTEXT_FIELDS[intent?.type] ?? MINIMAL_FIELDS;
    for (const f of fields) {
      const v = comp[f];
      if (v == null) continue;
      // Collections are sent as a COUNT, not as their contents. The model needs to
      // know that three people contributed in order to say so; it does not need
      // their names to form the sentence, and sending them would put personal data
      // through a third party to no purpose.
      if (Array.isArray(v)) push(`components.${id}.${f}`, v.length);
      else push(`components.${id}.${f}`, v);
    }
  }

  const mid = intent?.mission ?? comp?.mission ?? null;
  const m = mid ? (view?.missions ?? []).find((x) => x.id === mid) : null;
  if (m && (intent?.type === "mission.progress" || intent?.type === "component.next_action")) {
    push(`missions.${m.id}.accepted`, m.accepted);
    push(`missions.${m.id}.target`, m.target);
    push(`missions.${m.id}.state`, m.state);
  }
  return out;
}

/** Every field name `boundedContext` is capable of sending. Used by the audit. */
export const CONTEXT_FIELD_NAMES = Object.freeze(
  [...new Set([...Object.values(CONTEXT_FIELDS).flat(), ...MINIMAL_FIELDS])],
);

/** Map a wire class onto a Forge claim. Unknown classes become UNKNOWN, never facts. */
function toClaim(c) {
  const text = String(c?.text ?? "");
  const path = c?.source?.path ? String(c.source.path) : null;
  switch (c?.class) {
    case "CANON_FACT":
      // A CLAIM, not a fact. verifyClaim decides.
      return path ? canonFact(text, foldSource(path)) : unknown(text, "the model cited no source");
    case "CANON_DERIVED":
      return path ? canonDerived(text, [foldSource(path)])
                  : unknown(text, "the model cited no source for a derivation");
    case "AI_INTERPRETATION":  return interpretation(text);
    case "AI_RECOMMENDATION":  return recommendation(text);
    case "ROOM_LOCAL_KNOWLEDGE": return roomLocal(text, "model output");
    case "UNKNOWN":            return unknown(text, "the model reported the Canon is silent");
    default:
      return unknown(text, `unrecognised claim class "${String(c?.class)}"`);
  }
}

/**
 * Call the Edge Function and return { status, claims, answer }.
 *
 * NEVER THROWS. A provider failure is a normal, expected outcome — the Studio
 * must keep answering from the Canon when the network is down, which is the
 * ordinary condition in a Nigerian workshop rather than an exceptional one.
 */
export async function callForgeAI({ message, language, intent, context, signal } = {}) {
  const { supabase, isConfigured } = await getSupabase();
  if (!isConfigured || !supabase) {
    return { status: PROVIDER.NOT_CONFIGURED, claims: [], answer: null,
             reason: "Supabase is not configured in this build" };
  }
  try {
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: {
        message: String(message ?? ""),
        language: String(language ?? "en"),
        intent: {
          type: intent?.type ?? "unknown",
          component: intent?.component ?? null,
          mission: intent?.mission ?? null,
        },
        context: Array.isArray(context) ? context : [],
      },
      ...(signal ? { signal } : {}),
    });

    if (error) {
      return { status: PROVIDER.UNREACHABLE, claims: [], answer: null,
               reason: error.message ?? "the inference function could not be reached" };
    }
    if (!data || data.ok !== true) {
      const code = String(data?.code ?? "");
      return {
        status: code === "PROVIDER_NOT_CONFIGURED" ? PROVIDER.NOT_CONFIGURED
              : code === "PROVIDER_MALFORMED" ? PROVIDER.MALFORMED
              : PROVIDER.REFUSED,
        claims: [], answer: null,
        reason: String(data?.reason ?? "the inference function refused the request"),
      };
    }
    if (!Array.isArray(data.claims)) {
      return { status: PROVIDER.MALFORMED, claims: [], answer: null,
               reason: "the inference function returned no claims array" };
    }

    // WIRE SHAPE, DELIBERATELY NOT MAPPED HERE.
    //
    // The transport returns exactly what the Edge Function sent. Mapping to Forge
    // claims happens in `providerAdapter`, one layer up, for a reason the test
    // suite found: when this function did the mapping, a test that substituted the
    // transport bypassed `toClaim` entirely and silently tested nothing. An
    // injected transport must be able to deliver precisely the bytes a real
    // provider would, including a malformed class — otherwise the class mapping,
    // which is where an unrecognised class becomes UNKNOWN rather than a fact, is
    // never exercised by any test.
    return {
      status: PROVIDER.OK,
      claims: data.claims,
      answer: typeof data.answer === "string" ? data.answer : null,
      language: typeof data.language === "string" ? data.language : null,
      reason: null,
    };
  } catch (err) {
    return { status: PROVIDER.UNREACHABLE, claims: [], answer: null,
             reason: err?.message ?? String(err) };
  }
}

/**
 * Ask the provider to INTERPRET a sentence. Returns { intent, entity } or null.
 *
 * A different call from `callForgeAI` because it is a different job with different
 * risk, and the difference is worth stating precisely:
 *
 *   callForgeAI        sends Canon VALUES, receives CLAIMS, and every claim is
 *                      re-resolved against the fold before anyone reads it.
 *   callForgeInterpret sends NO values — the sentence, the operations Forge performs,
 *                      the ids the Canon holds — and receives a PROPOSAL that
 *                      request.js validates against the fold.
 *
 * Neither can produce a fact on its own authority. But only the first has a grounding
 * stage after it, which is exactly why the second is not allowed to carry facts at
 * all: there would be nothing downstream to catch one.
 *
 * NEVER THROWS, and null is a completely ordinary return. A failed interpretation
 * costs the model's understanding of one sentence; the deterministic read is already
 * computed and stands, so the participant gets an answer either way (§12).
 */
export async function callForgeInterpret({ message, language, operations, entities, recent } = {}) {
  const { supabase, isConfigured } = await getSupabase();
  if (!isConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: {
        op: "interpret",
        message: String(message ?? ""),
        language: String(language ?? "en"),
        operations: Array.isArray(operations) ? operations : [],
        entities: Array.isArray(entities) ? entities : [],
        recent: Array.isArray(recent) ? recent : [],
      },
    });
    if (error || !data || data.ok !== true) return null;
    if (typeof data.intent !== "string" || !data.intent) return null;
    return {
      intent: data.intent,
      entity: typeof data.entity === "string" ? data.entity : null,
    };
  } catch {
    return null;
  }
}

/**
 * Adapt the interpret transport to the `interpreter` signature understand.js expects.
 *
 * `entities` arrives from `interpretContext` as "HUB-002 (component)" strings, which
 * is the form a model reads most reliably. They are sent through as-is and the model
 * copies one back; `validateProposedEntity` then resolves whatever it returns against
 * the fold, so a model echoing the parenthetical or mangling the spacing still lands
 * on the right id — or on none, which is also a correct outcome.
 */
export function providerInterpreter({ transport = callForgeInterpret, language = "en" } = {}) {
  return async ({ message, operations, entities, recent }) =>
    transport({ message, language, operations, entities, recent });
}

/**
 * Build an adapter that asks the provider, and falls back to `base` on any failure.
 *
 * The fallback is not a degraded mode — `base` is the deterministic adapter, which
 * answers every question in this phase's test suite correctly. The provider adds
 * fluency. Losing it loses fluency and nothing else, which is the property that
 * lets Forge AI ship into a workshop with an unreliable connection.
 */
export function providerAdapter({ base, transport = callForgeAI, onStatus = null } = {}) {
  if (typeof base !== "function") {
    throw new Error("providerAdapter: a base adapter is required — the provider is never the only path");
  }
  const build = (report) => {
    const fn = async (ctx) => run(ctx, report);
    // `withStatus` lets askForge observe the outcome without the adapter needing to
    // know what a surface is. Without it, a provider failure is invisible to the
    // participant even though the answer is correct — see the note in ask.js.
    fn.withStatus = (cb) => build(cb);
    return fn;
  };
  const run = async (ctx, report) => {
    // The deterministic pass runs FIRST, unconditionally. It establishes what the
    // Canon actually says, and it is what bounds the model's context.
    const baseClaims = await base(ctx);
    const list = Array.isArray(baseClaims) ? baseClaims : [baseClaims];

    // CONTEXT IS BUILT HERE, FROM THE DETERMINISTIC RESULT (§16). The caller does
    // not supply it, so a caller cannot widen what the model sees.
    const grounded = groundResponse(list, { view: ctx?.canon ?? {}, log: ctx?.log ?? [] });
    const context = boundedContext({ grounded, view: ctx?.canon ?? {}, intent: ctx?.intent ?? {} });

    const res = await transport({
      message: ctx?.message ?? "",
      language: ctx?.language ?? "en",
      intent: ctx?.intent ?? {},
      context,
    });
    if (onStatus) onStatus(res);
    if (report) report(res);

    if (res?.status !== PROVIDER.OK || !Array.isArray(res.claims) || !res.claims.length) {
      return list;
    }

    // WIRE -> CLAIM happens here, so every transport (real or injected) goes
    // through the same mapping. An unrecognised class becomes UNKNOWN at this line.
    const modelClaims = res.claims.map(toClaim);

    // Both sets are returned and BOTH are grounded by runInference. The model's
    // claims cannot displace the deterministic ones; they are added alongside, so
    // a model claim that fails to resolve becomes a visible downgrade rather than
    // a silently missing fact.
    return [...list, ...modelClaims];
  };

  return build(onStatus);
}

export default { callForgeAI, callForgeInterpret, providerInterpreter,
                 providerAdapter, boundedContext, CONTEXT_FIELD_NAMES, PROVIDER };
