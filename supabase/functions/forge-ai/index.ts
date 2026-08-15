// ============================================================
// FORGE AI — SERVER-SIDE INFERENCE BOUNDARY  (Phase 2.1)
//
// The only place in ForgeOS that may hold a model-provider secret, and the reason
// the browser never has to.
//
//   Browser  ──▶  this function  ──▶  provider
//                 (secret lives in Deno.env, never in a response)
//
// THIS FILE IS NOW ONLY TRANSPORT. The request/response contract, the limits, the
// prompt and the provider-profile registry live in contract.mjs — plain JavaScript
// with no Deno APIs — so Deno runs it here and the Node test suite runs the very
// same code. In Phase 2 this logic was TypeScript inside this file, unreachable
// from any test, and the assertions about it were regexes against its source. A
// regex can prove a validator exists; it cannot prove the validator rejects a
// CANON_FACT with no source. Now that is a test.
//
// WHAT THIS FUNCTION IS STRUCTURALLY INCAPABLE OF
//
//   * It has NO database client. It never imports @supabase/supabase-js, holds no
//     anon key and no service role. It cannot read a table, write one, or publish
//     an event — by absence, not by policy.
//   * It is NOT the source of manufacturing truth. Canon context arrives in the
//     request, already read from the fold and already bounded by intent.
//   * It is NOT trusted. Everything it returns is re-resolved against the live fold
//     by grounding.js on the client. Its job is to keep a secret and enforce a
//     shape — not to be believed.
//
// NO PROVIDER IS ASSUMED. contract.mjs ships an EMPTY profile registry, so with
// nothing selected this function returns PROVIDER_NOT_SELECTED and the client's
// deterministic path answers as it always did. Failing closed costs a nicer
// sentence and never costs a fact.
// ============================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  LIMITS, resolveProfile, validateAsk, validateModelOutput, buildPrompt,
} from "./contract.mjs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

/** A refusal the client can render. `ok: false` is never a fact. */
const refuse = (reason: string, code: string, status = 200) =>
  json({ ok: false, code, reason, answer: null, claims: [], language: null }, status);

/**
 * Call the selected provider.
 *
 * The provider is chosen by ENVIRONMENT, never by the request, so a caller cannot
 * redirect inference somewhere else — nor cause the secret to be sent to an
 * endpoint of their choosing. The key is read here, placed in headers by the
 * profile, and never returned, logged or echoed, including on error paths, which
 * is where secrets usually leak. A provider error is reported by STATUS ONLY; the
 * body can contain the request back and is never repeated.
 */
async function callProvider(prompt: string) {
  const env = {
    FORGE_AI_PROVIDER: Deno.env.get("FORGE_AI_PROVIDER"),
    FORGE_AI_PROVIDER_KEY: Deno.env.get("FORGE_AI_PROVIDER_KEY"),
    FORGE_AI_MODEL: Deno.env.get("FORGE_AI_MODEL"),
    FORGE_AI_ENDPOINT: Deno.env.get("FORGE_AI_ENDPOINT"),
  };

  const resolved = resolveProfile(env);
  if (!resolved.ok) return { ok: false, code: resolved.code, reason: resolved.reason };

  const { profile, endpoint, model } = resolved;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LIMITS.timeoutMs);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        ...profile.headers({ key: env.FORGE_AI_PROVIDER_KEY }),
      },
      body: JSON.stringify(profile.body({ model, prompt, maxTokens: 800 })),
    });

    if (!res.ok) {
      // STATUS, PLUS THE PROVIDER'S OWN ERROR CODE — and nothing else.
      //
      // Reporting the bare status proved to be too little. A 429 can mean "slow
      // down" or "this account has no credit", and those require opposite responses
      // from the operator; a 400 can mean a model name that does not exist.
      // Diagnosing that from outside the function was impossible, so the short,
      // enum-like `type` and `code` fields are now surfaced.
      //
      // WHAT IS STILL NEVER REPEATED: the response body, any message text, and
      // anything that could echo the request or the credential. Both fields are
      // length-capped and a parse failure is swallowed — a diagnostic must not
      // become a leak, and must not turn a provider error into a function crash.
      let detail = "";
      try {
        const e = (await res.json())?.error;
        const bits = [e?.type, e?.code]
          .filter((v) => typeof v === "string")
          .map((v) => v.slice(0, 40));
        if (bits.length) detail = ` (${[...new Set(bits)].join(" / ")})`;
      } catch { /* no parsable error envelope — the status alone stands */ }
      return { ok: false, code: "PROVIDER_ERROR",
               reason: `provider returned status ${res.status}${detail}` };
    }

    const body = await res.json();
    let text = "";
    try {
      text = String(profile.extract(body) ?? "");
    } catch {
      return { ok: false, code: "PROVIDER_MALFORMED",
               reason: "provider response did not match its profile" };
    }
    if (!text) return { ok: false, code: "PROVIDER_EMPTY", reason: "provider returned no text" };

    // The model was asked for JSON. Prose instead is a MALFORMED response, and it
    // is not salvaged by regex — a "best effort" parse is precisely how
    // unverifiable prose gets presented as a fact.
    try {
      return { ok: true, raw: JSON.parse(text) };
    } catch {
      return { ok: false, code: "PROVIDER_MALFORMED", reason: "provider did not return valid JSON" };
    }
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === "AbortError";
    return {
      ok: false,
      code: aborted ? "PROVIDER_TIMEOUT" : "PROVIDER_UNREACHABLE",
      reason: aborted ? "provider timed out" : "provider could not be reached",
    };
  } finally {
    clearTimeout(timer);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return refuse("only POST is accepted", "METHOD_NOT_ALLOWED", 405);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return refuse("body was not valid JSON", "BAD_REQUEST", 400);
  }

  const checked = validateAsk(body);
  if (!checked.ok) return refuse(checked.reason, "BAD_REQUEST", 400);

  const provider = await callProvider(buildPrompt(checked.ask));
  if (!provider.ok) return refuse(provider.reason, provider.code);

  const shaped = validateModelOutput(provider.raw, checked.ask);
  if (!shaped.ok) return refuse(shaped.reason, "PROVIDER_MALFORMED");

  // `verified: false` is stated explicitly. This response has NOT been checked
  // against Forge Canon — it cannot be, from here — and the client must ground it
  // before showing any part of it as a fact.
  return json({
    ok: true,
    verified: false,
    language: shaped.value.language,
    answer: shaped.value.answer,
    claims: shaped.value.claims,
  });
});
