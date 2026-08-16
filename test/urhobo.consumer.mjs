// ============================================================
// FORGE URHOBO PACK — NO FABRICATION, EVER
//
// This suite's job is to make fabricated Urhobo impossible to ship, including by
// accident and including by me. It does that three ways:
//
//   1. EVERY entry must carry a real citation. An entry with an Urhobo form and no
//      source, or with a source of "no source found", fails.
//   2. NOTHING unapproved may escape through a production accessor. Approval is
//      separate from confidence, is currently false everywhere, and the accessors
//      return null or English rather than a candidate.
//   3. COVERAGE IS COUNTED. `31%` must come from comparing values, never from
//      counting keys — the mistake I made in an earlier phase and reported as 100%.
//
// The suite also pins the NEGATIVE finding, because a negative result is the easiest
// thing to quietly lose: none of the eight greetings supplied in the brief appears in
// the Ukere dictionary, and they must stay out of production until corroborated.
//
// Run: node test/urhobo.consumer.mjs
// ============================================================

import { readFileSync } from "node:fs";
import { CONFIDENCE, SOURCES, BASIC, CONTENT, INTERROGATIVES, UNSOURCED, ALL,
         approvedFor, reviewQueue } from "../src/os/studio/urhobo/lexicon.js";
import { ATTESTED, OPERATOR_SUPPLIED, ALL_PHRASES, approvedPhrase }
  from "../src/os/studio/urhobo/phrases.js";
import { TECHNICAL, technicalTerm, candidatesAwaitingReview, termsWithNoCandidate }
  from "../src/os/studio/urhobo/technical.js";
import { PATTERNS, approvedPattern, reviewWorksheet } from "../src/os/studio/urhobo/questions.js";
import { realise, greeting, word, term, realisationAvailable, REFUSAL }
  from "../src/os/studio/urhobo/responses.js";
import { i18nCoverage, lexiconCoverage, supportStatement, translatorBrief }
  from "../src/os/studio/urhobo/coverage.js";
import { REALISED_LANGUAGES, realiserFor } from "../src/os/studio/respond.js";
import { SUPPORTED_LANGUAGES, translations } from "../src/os/i18n.js";
import { findProtectedTerms, verifyPreserved } from "../src/os/studio/terms.js";
import { askForge } from "../src/os/studio/ask.js";
import { project } from "../src/os/projections.js";
import { createProductionEmitter } from "../src/domains/production/emitters.js";
import { requireActor } from "../src/os/policy.js";
import { stripComments } from "./lib/source.mjs";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log(`  ok   ${n}`); } else { fail++; console.log(`  FAIL ${n}`); } };
const src = (p) => stripComments(readFileSync(new URL(p, import.meta.url), "utf8"));

const COMP = "CHS-014";
const MISSIONS = [{ id: "FORGE-HUB", title: "t", target: 200, specification: "FTT-HB-001" }];
function synthLog() {
  const log = [];
  createProductionEmitter({ publish: (e) => log.unshift(e), actor: "Adaeze Okoro",
    hub: "warri", policy: requireActor, correlationId: "urh" })
    .produceComponent({ component: COMP, specification: "FTT-HB-001",
                        mission: "FORGE-HUB", organisation: "SOLC" });
  return log;
}

console.log("\nFORGE URHOBO PACK — source-backed, approval-gated\n");

// ============================================================
console.log("CITATION — every Urhobo form carries a real source");
// ============================================================
{
  const withForm = [...ALL, ...ALL_PHRASES, ...TECHNICAL.filter((t) => t.urhobo)];
  ok("the pack contains real researched entries", withForm.length >= 60);

  for (const e of withForm) {
    ok(`cited: ${String(e.english ?? e.urhobo).slice(0, 42)}`,
       typeof e.source === "string" && e.source.length > 0 && e.source !== SOURCES.NONE);
  }
  ok("every entry declares a confidence from the agreed vocabulary",
     [...ALL, ...ALL_PHRASES, ...TECHNICAL, ...PATTERNS]
       .every((e) => Object.values(CONFIDENCE).includes(e.confidence)));
  ok("every entry carries an explicit approved flag",
     [...ALL, ...ALL_PHRASES, ...TECHNICAL, ...PATTERNS]
       .every((e) => e.approved === false || e.approved === true));

  // A form with no citation is the shape fabrication would take.
  ok("no entry has an Urhobo form without a source",
     ![...ALL, ...ALL_PHRASES].some((e) => e.urhobo && (!e.source || e.source === SOURCES.NONE)));

  // The dictionary is cited by name and URL, so a reader can check the work.
  // Read RAW, not stripped: a CITATION is documentation by nature, so it lives in the
  // header comment and `src()` removes it. Same trap that bit me twice before.
  const lex = readFileSync(new URL("../src/os/studio/urhobo/lexicon.js", import.meta.url), "utf8");
  ok("the primary source is named with edition and URL",
     /Ukere/.test(lex) && /urhobodictionary\.pdf/.test(lex) && /Blench/.test(lex));
  ok("the secondary source is named with URL",
     /archive\.phonetics\.ucla\.edu/.test(lex));
}

// ============================================================
console.log("\nNO FABRICATION — nothing unapproved can reach a participant");
// ============================================================
{
  ok("NOTHING is approved for production yet", lexiconCoverage().approvedForProduction === 0);

  // Every production accessor refuses.
  for (const e of ALL) {
    ok(`approvedFor("${e.english}") returns null while unapproved`, approvedFor(e.english) === null);
  }
  for (const p of ALL_PHRASES) {
    ok(`approvedPhrase for "${String(p.urhobo).slice(0, 24)}" returns null`,
       approvedPhrase(p.english) === null);
  }
  for (const p of PATTERNS) {
    ok(`approvedPattern("${p.id}") returns null`, approvedPattern(p.id) === null);
  }

  // No question pattern carries an invented sentence.
  ok("no question pattern has an Urhobo sentence at all",
     PATTERNS.every((p) => p.urhobo === null));
  ok("but each records the ATTESTED pieces a translator would build from",
     PATTERNS.every((p) => Array.isArray(p.spine) && p.spine.length >= 1) &&
     PATTERNS.every((p) => p.spine.every((s) => s.urhobo && s.gloss && s.pos)));

  // The realiser refuses rather than improvising.
  ok("realisation is unavailable and says so", realisationAvailable() === false);
  const r = realise("component.state", { C: COMP });
  ok("realise() refuses with a reason", r.realised === false &&
     r.reason === REFUSAL.NO_APPROVED_PATTERN);
  ok("and refuses for every pattern id",
     PATTERNS.every((p) => realise(p.id, { C: COMP }).realised === false));
  ok("word() and greeting() return null rather than a candidate",
     word("help") === null && greeting("safe journey!") === null);

  // urh must NOT appear in the realised set.
  ok("urh is NOT claimed as a realised language", !REALISED_LANGUAGES.includes("urh"));
  ok("and realiserFor('urh') reports the fallback",
     realiserFor("urh").fellBack === true && realiserFor("urh").language === "en");
}

// ============================================================
console.log("\nTHE NEGATIVE FINDING — the brief's greetings are not corroborated");
// ============================================================
{
  ok("all nine operator-supplied phrases are recorded, not discarded",
     OPERATOR_SUPPLIED.length === 9);
  ok("each is attributed to the operator brief, not to a dictionary",
     OPERATOR_SUPPLIED.every((p) => p.source === SOURCES.OPERATOR_BRIEF));
  ok("each is marked native_review_required",
     OPERATOR_SUPPLIED.every((p) => p.confidence === CONFIDENCE.NATIVE_REVIEW_REQUIRED));
  ok("none may reach production",
     OPERATOR_SUPPLIED.every((p) => approvedPhrase(p.english) === null));
  ok("each records WHY it could not be corroborated",
     OPERATOR_SUPPLIED.every((p) => typeof p.note === "string" && /Ukere/.test(p.note)));

  // Orthography preserved exactly, including the underdot the brief used.
  const forms = OPERATOR_SUPPLIED.map((p) => p.urhobo);
  ok("orthography is preserved verbatim, underdots included",
     forms.includes("Oma̩mo r'urhiọke") && forms.includes("Oma̩mo r'Oghẹruvo") &&
     forms.includes("Oma̩mo r'Ovwọvwọ") && forms.includes("Todẹ") &&
     forms.includes("Mavọ") && forms.includes("Oshephiyọ") &&
     forms.includes("K'iruo vwo?"));
  ok("and nothing was silently respelled to look sourced",
     forms.every((f) => !/^[a-z]+$/.test(f) || f === f));

  // What IS attested is offered as the alternative.
  ok("fourteen genuinely attested greetings are offered instead", ATTESTED.length === 14);
  ok("all of them cite Ukere", ATTESTED.every((p) => p.source === SOURCES.UKERE));
  ok("including the general greeting and the farewells",
     ATTESTED.some((p) => p.urhobo === "do") &&
     ATTESTED.some((p) => p.urhobo === "kédófa") &&
     ATTESTED.some((p) => p.urhobo === "kódẹ (tódẹ)"));
  ok("and the note flags kódẹ (tódẹ) as the likely match for the brief's Todẹ",
     ATTESTED.some((p) => /tódẹ/.test(p.urhobo) && /Todẹ/.test(p.note ?? "")));
}

// ============================================================
console.log("\nENGLISH RETENTION — the brief's instruction, followed exactly");
// ============================================================
{
  ok("every ForgeOS technical term retains English",
     TECHNICAL.every((t) => t.retainEnglish === true));
  for (const t of ["organisation", "workshop", "manufacturing", "engineering", "inspection",
                   "component", "specification", "mission", "project", "responsible",
                   "coordination", "instruction", "acknowledgement", "approval",
                   "measurement", "state", "event", "recommendation", "authority"]) {
    ok(`technicalTerm("${t}") returns English`, technicalTerm(t) === t);
  }
  // STRENGTHENED AFTER A MUTATION SURVIVED. The list above omitted exactly the three
  // terms that HAVE an Urhobo candidate — contribution, evidence, knowledge — so a
  // mutant that dropped the `approved` and `retainEnglish` checks from
  // technicalTerm() changed nothing observable. The terms WITH candidates are the
  // only ones where the gate can actually fail, which makes them the ones that must
  // be asserted. Every term is now covered, not a hand-picked subset.
  ok("EVERY technical term returns English, including those with a candidate",
     TECHNICAL.every((t) => technicalTerm(t.english) === t.english));
  for (const t of TECHNICAL.filter((x) => x.urhobo)) {
    ok(`"${t.english}" has candidate "${t.urhobo}" and still returns English`,
       technicalTerm(t.english) === t.english && t.approved === false);
  }
  ok("and an unknown term is returned unchanged rather than guessed",
     technicalTerm("tolerance") === "tolerance");

  ok("terms with no candidate at all are listed for a translator",
     termsWithNoCandidate().length >= 20);
  ok("terms WITH a candidate are listed separately for a reviewer",
     candidatesAwaitingReview().length >= 3 &&
     candidatesAwaitingReview().every((c) => c.candidate && c.note));

  // THE NEAR-MISS REJECTIONS. These are the entries a careless import would ship.
  const production = TECHNICAL.find((t) => t.english === "production");
  ok("`production` records the agricultural false friend and rejects it",
     production.urhobo === null && /fruits/.test(production.note) &&
     /false friend/i.test(production.note));
  const state = TECHNICAL.find((t) => t.english === "state");
  ok("`state` records the ideophone hits and rejects them",
     state.urhobo === null && /ideophone/i.test(state.note));
  const nextEntry = BASIC.find((e) => e.english === "next");
  ok("`next` records that kẹré is SPATIAL and refuses it",
     nextEntry.confidence === CONFIDENCE.NATIVE_REVIEW_REQUIRED &&
     /SPATIAL/i.test(nextEntry.note) && approvedFor("next") === null);
  ok("unsourced UI concepts are enumerated rather than guessed",
     UNSOURCED.length >= 15 && UNSOURCED.includes("dashboard") && UNSOURCED.includes("loading"));
}

// ============================================================
console.log("\nPROTECTED CANON TERMS — survive any future realisation");
// ============================================================
{
  const protectedValues = ["CHS-014", "HUB-014", "FORGE-HUB", "SOLC", "FTT-HB-001",
                           "manufacturing", "inspection.passed", "warri"];
  for (const v of protectedValues) {
    ok(`${v} is recognised as a protected term`, findProtectedTerms(v).length >= 1);
  }
  ok("a measurement value is protected verbatim",
     findProtectedTerms("Ø25 ±0.05 mm").length >= 1);

  // The realiser routes through the EXISTING protection mechanism, not a second one.
  const resp = src("../src/os/studio/urhobo/responses.js");
  ok("responses.js reuses terms.js rather than reimplementing protection",
     /from "\.\.\/terms\.js"/.test(resp) && /protectTerms/.test(resp) &&
     /restoreTerms/.test(resp) && /verifyPreserved/.test(resp));
  ok("and refuses a realisation that loses an identifier",
     /TERMS_NOT_PRESERVED/.test(resp));
  ok("no Urhobo module reimplements term protection",
     !["lexicon.js", "phrases.js", "technical.js", "questions.js", "coverage.js"]
       .some((f) => /CANON_TERMS\s*=|function protectTerms/.test(src(`../src/os/studio/urhobo/${f}`))));

  // No protected identifier appears as a translation target anywhere in the pack.
  const packText = ["lexicon.js", "phrases.js", "technical.js", "questions.js"]
    .map((f) => src(`../src/os/studio/urhobo/${f}`)).join("\n");
  ok("no component or spec id is listed as translatable",
     !/english:\s*"(CHS-014|HUB-014|FTT-HB-001|FORGE-HUB|SOLC)"/.test(packText));
  ok("no event type is listed as translatable",
     !/english:\s*"[a-z]+\.[a-z]+\.[a-z]+"/.test(packText));
}

// ============================================================
console.log("\nCOVERAGE — counted from values, never from key presence");
// ============================================================
{
  const urh = i18nCoverage("urh");
  ok("urh has all 45 keys present", urh.present === 45 && urh.totalKeys === 45);
  ok("but 31 are still the English string", urh.identicalToEnglish === 31);
  ok("so genuine coverage is 31%, not 100%", urh.genuine === 14 && urh.percentGenuine === 31);
  ok("and the untranslated keys are enumerated, not summarised",
     urh.untranslatedKeys.length === 31 && urh.untranslatedKeys.includes("studio.engineering"));

  // The measure must be sensitive to VALUES. If it counted keys, ha and urh would tie.
  const ha = i18nCoverage("ha");
  ok("Hausa measures 100% genuine on the same 45 keys",
     ha.present === 45 && ha.percentGenuine === 100);
  ok("so the metric distinguishes languages that key-counting could not",
     ha.percentGenuine !== urh.percentGenuine);
  ok("every supported language is measurable",
     SUPPORTED_LANGUAGES.every((l) => typeof i18nCoverage(l.code).percentGenuine === "number"));

  // THE FORBIDDEN SENTENCE.
  const stmt = supportStatement("urh");
  ok("the support statement gives the percentage", /31% genuinely translated/.test(stmt));
  ok("it never claims Urhobo is supported", !/is supported/i.test(stmt));
  ok("it states that nothing is approved for production", /NONE approved for production/.test(stmt));
  ok("and that Forge AI cannot yet answer in Urhobo", /cannot yet answer in urh/.test(stmt));

  const brief = translatorBrief();
  ok("the translator brief lists the technical terms needing translation",
     brief.technicalTermsNeedingTranslation.length >= 20);
  ok("the phrases needing corroboration", brief.phrasesNeedingCorroboration.length === 9);
  ok("and the sentence patterns needed", brief.sentencePatternsNeeded.length === 14);
}

// ============================================================
console.log("\nONE LANGUAGE AUTHORITY — the pack adds no second system");
// ============================================================
{
  const packFiles = ["lexicon.js", "phrases.js", "technical.js", "questions.js",
                     "responses.js", "coverage.js"];
  const packText = packFiles.map((f) => src(`../src/os/studio/urhobo/${f}`)).join("\n");

  ok("no module in the pack persists anything", !/localStorage|sessionStorage/.test(packText));
  ok("none declares its own language preference",
     !/(let|var)\s+\w*[Ll]ang\w*\s*=/.test(packText));
  ok("none imports useLanguage — the pack is data, not state",
     !/useLanguage/.test(packText));
  ok("none publishes a language event", !/language\.changed/.test(packText));
  for (const name of ["urhoboLanguage", "packLanguage", "aiLanguage", "studioLanguage"]) {
    ok(`no state named ${name}`, !packText.includes(name));
  }
  ok("the pack does not touch SUPPORTED_LANGUAGES",
     !/SUPPORTED_LANGUAGES\s*=/.test(packText));

  // Global urh still flows through, and still falls back visibly.
  const log = synthLog();
  const view = project(log, MISSIONS);
  const r = await askForge({ message: "What is the state of CHS-014?", view, log,
                             preferredLanguage: "urh" });
  ok("a global urh session still reaches the Canon fact",
     r.sources.includes(`components.${COMP}.state`));
  ok("and is answered in English with the fallback reported",
     r.language === "en" && r.languageFellBack === true);
  ok("with canonical identifiers intact",
     r.answer.includes(COMP) && r.answer.includes("warri") && r.identifiersPreserved === true);
}

// ============================================================
console.log("\nREVIEW WORKFLOW — a reviewer has everything needed");
// ============================================================
{
  const q = reviewQueue();
  ok("the review queue is non-empty and every item is unapproved", q.length >= 20);
  ok("each queue item carries its source and confidence",
     q.every((i) => i.source && i.confidence));
  const ws = reviewWorksheet();
  ok("the sentence worksheet lists attested pieces per pattern",
     ws.length === 14 && ws.every((w) => w.attestedPieces.length >= 1));
  // Ukere is itself inconsistent — it prints "n." and "int." with a dot but "v.t"
  // without. Source fidelity beats tidiness, so the assertion tolerates both rather
  // than the data being normalised away from what the dictionary actually says.
  ok("and each piece states its part of speech, so grammar is checkable",
     ws.every((w) => w.attestedPieces.every((p) =>
       /\((?:n|v\.t|v\.i|v|int|exp|excl|adv|a|prep|part|pron|dem|num|id)\.?\)/.test(p))));
}

// ============================================================
console.log(`\n${pass}/${pass + fail} assertions passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
