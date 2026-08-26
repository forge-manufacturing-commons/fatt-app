// ============================================================
// FORGE ELECTION — WEB SURFACE  (Loop 27)
//
// This repository has NO React-rendering test harness (no Jest/Vitest/
// jsdom/@testing-library — CLAUDE.md states plainly: "Tests are plain Node
// scripts, not a framework"). These are therefore STRUCTURAL/ARCHITECTURAL
// tests — the strongest evidence this repo's existing infrastructure
// supports — proving the source-level contract src/pages/Election.jsx must
// hold, exactly the same style test/election.consumer.mjs's own D4/H1-style
// checks already use for the same reason.
//
// The RUNTIME behavior (the page actually renders "Not signed in" with no
// console errors, and /, /workspace are unaffected) was verified separately
// this loop via a live Vite dev server + browser automation — that
// verification is not repeated here as an automated test because this
// repository has no headless-browser test runner; it is disclosed as its
// own MOCK/manual evidence class in the final report, never upgraded to
// "automated" or "LIVE".
//
// Run: node test/election-web-surface.consumer.mjs
// ============================================================

import { readFileSync } from "node:fs";
import { stripComments } from "./lib/source.mjs";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log(`  ok   ${n}`); } else { fail++; console.log(`  FAIL ${n}`); } };
const src = (p) => stripComments(readFileSync(new URL(p, import.meta.url), "utf8"));

const PAGE = "../src/pages/Election.jsx";
const APP = "../src/App.jsx";

console.log("\nFORGE ELECTION — Web surface (structural)\n");

const page = src(PAGE);

// ============================================================
console.log("F/J/K/L/M/N — CHANNEL INDEPENDENCE: the page reaches the Canon ONLY through electionWebAdapter.js");
// ============================================================
{
  ok("F1. Election.jsx imports readElectionCanon/activateElection/prepareElectionWrite/approveElectionWrite " +
     "from electionWebAdapter.js — its one and only path to the domain",
     /from ["']\.\.\/os\/electionWebAdapter\.js["']/.test(page) &&
     /readElectionCanon/.test(page) && /activateElection/.test(page) &&
     /prepareElectionWrite/.test(page) && /approveElectionWrite/.test(page));

  ok("J. Election.jsx never calls projectElection() directly",
     !/\bprojectElection\s*\(/.test(page) && !/from ["'].*projections\.js["']/.test(page));

  // Importing the STATUS enum (vocabulary) from readiness.js is legitimate
  // and intended — the risk is CALLING deriveReadiness(), not importing a
  // comparison constant from its module, so the import line itself is
  // stripped before checking (mirroring the same fix already applied to M).
  ok("K. Election.jsx never calls deriveReadiness() directly",
     !/\bderiveReadiness\s*\(/.test(page) &&
     !/from ["'].*studio\/readiness\.js["']/.test(page.replace(/import\s*\{\s*READINESS_DIMENSION_STATUS[^;]*;/, "")));

  ok("L. Election.jsx never calls bootstrapCampaign() directly",
     !/\bbootstrapCampaign\s*\(/.test(page) && !/from ["'].*electionBootstrap\.js["']/.test(page));

  ok("M. Election.jsx never calls resolveElectionScope() directly",
     !/\bresolveElectionScope\s*\(/.test(page) && !/from ["'].*electionScope\.js["']/.test(page.replace(/import\s*\{\s*ELECTION_SCOPE\s*\}[^;]*;/, "")));

  ok("N. Election.jsx never calls executeElectionWrite() directly",
     !/\bexecuteElectionWrite\s*\(/.test(page));

  // The enum imports (ACTIVATION, ELECTION_SCOPE, STATUS) are DATA/vocabulary,
  // not orchestration — confirmed by checking they are used only for
  // equality comparison (===), never invoked with call syntax anywhere.
  ok("F2. ACTIVATION/ELECTION_SCOPE/STATUS are used only as comparison vocabulary, never called as functions",
     !/\bACTIVATION\s*\(/.test(page) && !/\bELECTION_SCOPE\s*\(/.test(page) && !/\bSTATUS\s*\(/.test(page));
}

// ============================================================
console.log("\nA/B — AUTHENTICATION GATING");
// ============================================================
{
  ok("A1. the page checks `!session` and renders an honest unauthenticated state before any Canon read",
     /if \(!session\)/.test(page));
  ok("A2. the unauthenticated branch offers sign-in, never a bypass or a fake identity",
     /Not signed in/.test(page) && /nav\(["']\/access["']\)/.test(page));
  ok("B1. the Canon refresh only runs once a session's user exists — gated in refresh() itself",
     /if \(!session\?\.\?user\) return;|if \(!session\?\.user\) return;/.test(page));
  ok("B2. refresh() is invoked from a useEffect keyed on the refresh callback, so it runs once identity resolves",
     /useEffect\(\(\) => \{ refresh\(\); \}, \[refresh\]\);/.test(page));

  // M2-TARGET — no adapter call anywhere in the page ever passes a userId
  // (or any spelling of the session's own user id) as an explicit
  // argument. The adapter's OWN contract (Loop 26) is that no exported
  // function even accepts one; this proves the UI never attempts to,
  // either — the only identity value that ever reaches the adapter is the
  // `client` itself, whose session the adapter reads server-side.
  ok("M2-TARGET. no call in this page passes userId / session.user.id / session?.user?.id as an argument",
     !/userId:\s*session/.test(page) && !/session\.user\.id/.test(page) && !/session\?\.user\?\.id/.test(page));
}

// ============================================================
console.log("\nC/D — CAMPAIGN ACTIVATION");
// ============================================================
{
  ok("C1. ActivationPanel's action calls activateElection() through the adapter, not a local construction",
     /const doActivate = useCallback\(async \(name\) => \{[\s\S]*?activateElection\(\{ client: supabase, name \}\)/.test(page));
  ok("D1. after a successful activation, the page calls refresh() again rather than building the result itself",
     /doActivate[\s\S]{0,400}await refresh\(\);/.test(page));
  ok("D2. doActivate's own success branches never construct a readiness/claims object locally",
     !/doActivate[\s\S]{0,600}claims:/.test(page));
}

// ============================================================
console.log("\nE — CANON RENDERING COMES FROM THE ADAPTER RESULT");
// ============================================================
{
  ok("E1. rendered claims/gaps/coverage all read off `ctx.readiness`/`ctx.scope` — the adapter's own return value",
     /ctx\.readiness\.claims/.test(page) && /ctx\.readiness\.gaps/.test(page) &&
     /ctx\.readiness\.knownWardCoverage/.test(page) && /ctx\.scope\.campaignId/.test(page));
  ok("E2. `ctx` itself is set ONLY from readElectionCanon()'s return — no other assignment to setCtx exists",
     (page.match(/setCtx\(/g) ?? []).length === 1 &&
     /const result = await readElectionCanon\(\{ client: supabase \}\);\n\s*setCtx\(result\);/.test(page));

  // M4-TARGET — refresh() must be a FRESH read every time, never a cache
  // keyed on the previous `ctx`. Isolate refresh()'s own function body (not
  // the whole file) and confirm it never reads the prior `ctx` state at
  // all — a cache/short-circuit mutation would need to branch on it.
  const refreshBody = (page.match(/const refresh = useCallback\(async \(\) => \{([\s\S]*?)\}, \[session\?\.user\]\);/) ?? [])[1] ?? "";
  ok("M4-TARGET. refresh()'s own body never reads a prior `ctx` value — every call is a fresh adapter read",
     refreshBody.length > 0 && !/\bctx\b/.test(refreshBody.replace(/setCtx/g, "")));
}

// ============================================================
console.log("\nG — RECOMMENDATION/CANON SEPARATION (and an honest note on scope)");
// ============================================================
{
  // deriveReadiness()'s own return shape (Loop 22) carries NO
  // `recommendations` field at all — that concept belongs to the
  // conversational layer (infer.js/respond.js), which this page never
  // imports. There is therefore nothing for this page to mislabel as CANON;
  // the check instead proves gaps (which DO carry their own `action` field)
  // are rendered under their own label, never merged into the claims list.
  ok("G1. gaps are rendered in their OWN block (GapRow/'Gaps'), never inside the claims ('Readiness claims') block",
     /Readiness claims \(CANON\)/.test(page) && /Gaps \(CANON-derived\)/.test(page) &&
     page.indexOf("ctx.readiness.claims.map") < page.indexOf("ctx.readiness.gaps.map"));
  ok("G2. the page imports no conversational/recommendation module (infer.js, respond.js, ask.js)",
     !/studio\/infer\.js|studio\/respond\.js|studio\/ask\.js/.test(page));
}

// ============================================================
console.log("\nH — CAMPAIGN SELECTION SCOPE (documented, not a leak)");
// ============================================================
{
  // This page never passes a `requestedCampaign` at all on the read path —
  // it always resolves to whatever the session's OWN single membership is.
  // That is a real, documented scope limitation (no campaign switcher this
  // loop — see the final report's gaps section), not a vulnerability: there
  // is no parameter here through which a browser could supply another
  // tenant's campaign id in the first place.
  ok("H1. readElectionCanon() is called with no requestedCampaign argument anywhere on the read path",
     /readElectionCanon\(\{ client: supabase \}\)/.test(page) &&
     !/readElectionCanon\(\{[^}]*requestedCampaign/.test(page));
}

// ============================================================
console.log("\nI — REFRESH");
// ============================================================
{
  ok("I1. the visible Refresh button calls the SAME refresh() function used everywhere else — no second read path",
     /onClick=\{refresh\}/.test(page));
  ok("I2. a successful write approval calls refresh() and never patches readiness/claims locally",
     /doApprove[\s\S]{0,500}await refresh\(\);/.test(page) &&
     !/doApprove[\s\S]{0,800}setCtx\(\{/.test(page));
}

// ============================================================
console.log("\nWRITE SAFETY (UI-level PREPARE/APPROVAL separation)");
// ============================================================
{
  ok("W1. the UI never calls executeElectionWrite — only approveElectionWrite, which itself gates execution",
     !/executeElectionWrite/.test(page));
  ok("W2. the confirmationId is generated exactly ONCE per prepared draft (in doPrepare) and reused by doApprove, " +
     "never regenerated inside doApprove",
     (page.match(/crypto\.randomUUID\(\)/g) ?? []).length === 1 &&
     /doPrepare[\s\S]{0,600}crypto\.randomUUID\(\)/.test(page) &&
     !/doApprove[\s\S]{0,600}crypto\.randomUUID\(\)/.test(page));
  ok("W3. approval reuses `prepared.confirmationId` — the SAME value doPrepare stored, not a fresh one",
     /confirmationId: prepared\.confirmationId/.test(page));

  // M5-TARGET — doPrepare()'s own body must never reference approveElectionWrite
  // at all. approveElectionWrite legitimately exists elsewhere in this file
  // (doApprove); the invariant is that PREPARE's own code path has no way
  // to reach it, isolated to doPrepare's function body specifically.
  const doPrepareBody = (page.match(/const doPrepare = useCallback\(async \(\) => \{([\s\S]*?)\}, \[campaignId, message\]\);/) ?? [])[1] ?? "";
  ok("M5-TARGET. doPrepare()'s own body never calls approveElectionWrite — PREPARE cannot reach EXECUTE",
     doPrepareBody.length > 0 && !/approveElectionWrite/.test(doPrepareBody));
}

// ============================================================
console.log("\nO — ROUTING: additive, existing routes untouched");
// ============================================================
{
  const app = src(APP);
  ok("O1. /election is registered as an ADDITIVE route, not inside the ROOMS/BUILT kernel loop",
     /<Route path="\/election"\s+element=\{<Election \/>\}\s*\/>/.test(app));
  ok("O2. the existing /, /business-assistant and other ROOMS routes are still generated from ROOMS.map unchanged",
     /\{ROOMS\.map\(r => \{/.test(app));
  ok("O3. /access and /workspace (the pattern this route mirrors) are still present, untouched",
     /<Route path="\/access"\s+element=\{<Access \/>\}\s*\/>/.test(app) &&
     /<Route path="\/workspace"\s+element=\{<Workspace \/>\}\s*\/>/.test(app));
}

// ============================================================
console.log("\nP — WRITE-SURFACE TRUTHFULNESS (LOOP 38): the panel's own copy must");
console.log("    not claim narrower capability than proposeElectionWrite() actually has");
// ============================================================
{
  // The USER-FACING contract — a real rendered string, not a comment, so it
  // survives stripComments() like every other check in this file. Protects
  // against regressing to a single-example placeholder that (paired with no
  // other UI cue) implies only one write operation exists.
  const placeholderMatch = page.match(/placeholder='([^']*)'\s*aria-label="Action"/);
  ok("P1. the Action input's placeholder demonstrates at least TWO different write commands, " +
     "not just the original ward-assignment example",
     Boolean(placeholderMatch) && /assign/i.test(placeholderMatch[1]) && /report/i.test(placeholderMatch[1]));

  // The DEVELOPER-FACING contract — read the RAW file (not the
  // comment-stripped `page`) specifically because this checks a comment's
  // own truthfulness, the one thing stripComments() would hide from every
  // other check in this file.
  const raw = readFileSync(new URL(PAGE, import.meta.url), "utf8");
  const norm = raw.replace(/\s+/g, " "); // JSDoc line-wraps split phrases across lines
  ok("P2. the ORIGINAL stale claim ('Exactly one write action... Assign a team to a ward. " +
     "No second operation...') no longer appears verbatim",
     !/Exactly one write action this loop — Assign a team to a ward\. No second/i.test(norm));
  ok("P3. the WriteActionPanel comment names the real supported command family " +
     "(candidate registration, ward assignment, ward status reporting, observer assignment)",
     /candidate registration/i.test(norm) && /ward assignment/i.test(norm) &&
     /ward status reporting/i.test(norm) && /observer assignment/i.test(norm));

  // NEGATIVE CONTROL — this correction must not have added a new UI
  // element (selector, dropdown, catalog) to make the point; scoped to
  // WriteActionPanel's OWN body (ActivationPanel, a DIFFERENT component
  // earlier in this file, legitimately has its own <input> for the
  // campaign-name field — counting the whole page would conflate the two).
  const panelBody = (page.match(/function WriteActionPanel\(\{ campaignId, refresh \}\) \{([\s\S]*?)\n\}\n/) ?? [])[1] ?? "";
  ok("P4. no operation selector/dropdown/catalog was added — still exactly ONE <input> inside WriteActionPanel itself",
     panelBody.length > 0 && (panelBody.match(/<input\b/g) ?? []).length === 1);
}

console.log(`\n${pass}/${pass + fail} assertions passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
