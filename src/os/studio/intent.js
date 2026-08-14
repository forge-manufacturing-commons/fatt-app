// ============================================================
// FORGE STUDIO — CANONICAL INTENT  (Phase 0)
//
// Language is an input/output layer. Meaning is not.
//
//   "What should I do next with HUB-014?"          en
//   "Me ya kamata in yi na gaba akan HUB-014?"     ha
//   "Kí ni mo yẹ kí n ṣe tókàn lori HUB-014?"      yo
//   "Gịnị ka m kwesịrị ime ọzọ na HUB-014?"        ig
//
// ...all resolve to ONE canonical intent:
//
//   { type: "component.next_action", component: "HUB-014", language, confidence }
//
// There is deliberately NO per-language business logic. Each intent declares
// marker phrases per language and the resolution code is shared, so adding a
// language means adding phrases — never a second implementation, and never a
// second copy of the manufacturing rules.
//
// ENTITIES COME FROM THE PROTECTED-TERM LAYER. A component or specification id is
// extracted by the same mechanism that stops it being translated, so the entity
// the intent names and the token the translator must preserve are guaranteed to
// be the same string.
//
// PHASE 0 IS RECOGNITION, NOT ACTION. An intent is a question the Canon can be
// asked. It carries no authority, publishes nothing, and an unrecognised message
// is `unknown` rather than a guess.
// ============================================================

import { detectLanguage, explicitLanguageRequest, resolveResponseLanguage } from "./language.js";
import { findProtectedTerms } from "./terms.js";
import { componentState } from "../../domains/production/state.js";

/** Every intent Phase 0 recognises. All are READ questions. */
export const INTENT = Object.freeze({
  COMPONENT_STATE:       "component.state",
  COMPONENT_NEXT_ACTION: "component.next_action",
  COMPONENT_WHO:         "component.who",
  INSPECTION_STATUS:     "inspection.status",
  SPECIFICATION_EXPLAIN: "specification.explain",
  MISSION_PROGRESS:      "mission.progress",
  SEARCH:                "search",
  UNKNOWN:               "unknown",
});

/**
 * Marker phrases per intent per language. Multi-word phrases first — they are
 * far more discriminating than single words, especially across languages that
 * share borrowed technical vocabulary.
 */
const PHRASES = Object.freeze({
  [INTENT.COMPONENT_NEXT_ACTION]: {
    en: ["what next", "do next", "next step", "what should i do", "what happens next", "what remains"],
    ha: ["na gaba", "me ya kamata", "mataki na gaba", "me ya rage", "abin da ya rage"],
    yo: ["tókàn", "tokan", "kí ni mo yẹ", "ki ni mo ye", "ìgbésẹ̀ tókàn"],
    ig: ["ọzọ", "ozo", "kwesịrị ime", "kwesiri ime", "gịnị ka m"],
    pcm: ["wetin next", "wetin i go do", "wetin remain"],
    fr: ["prochaine étape", "que faire"],
  },
  [INTENT.COMPONENT_STATE]: {
    en: ["what is happening", "what's happening", "current state", "status of", "where is", "what state"],
    ha: ["halin yanzu", "matakin", "yaya", "ina", "a ina"],
    yo: ["ipò", "ipo", "báwo", "bawo", "níbo", "nibo"],
    ig: ["kedu", "ebee", "ọnọdụ", "onodu"],
    pcm: ["how far", "wetin dey happen", "where"],
    fr: ["état actuel", "où est"],
  },
  [INTENT.COMPONENT_WHO]: {
    en: ["who is responsible", "who did", "who made", "who contributed", "who approved", "who directed"],
    ha: ["wa ne", "wa ya", "wanene", "wa yake"],
    yo: ["ta ni", "tani"],
    ig: ["onye", "ònye"],
    pcm: ["who dey responsible", "who do"],
    fr: ["qui est responsable", "qui a"],
  },
  [INTENT.INSPECTION_STATUS]: {
    en: ["passed inspection", "inspection done", "have we inspected", "inspection complete", "did it pass"],
    ha: ["gama inspection", "an gama inspection", "ya ci inspection", "an yi inspection",
         "fara inspection", "shirye", "inspection"],
    yo: ["ti kọja", "ti koja", "ayẹwo"],
    ig: ["nyochaa", "agafeela"],
    pcm: ["inspection don finish", "e pass"],
    fr: ["inspection terminée"],
  },
  [INTENT.SPECIFICATION_EXPLAIN]: {
    en: ["explain the specification", "explain this drawing", "explain the drawing", "explain", "what does the spec"],
    ha: ["bayyana", "ka bayyana", "bayyana min", "ka yi min bayani"],
    yo: ["ṣàlàyé", "salaye", "ṣalaye"],
    ig: ["kọwaa", "kowaa"],
    pcm: ["explain", "break am down"],
    fr: ["expliquer", "explique"],
  },
  [INTENT.MISSION_PROGRESS]: {
    en: ["mission progress", "how many accepted", "how far is the mission", "progress of"],
    ha: ["nawa aka gama", "ci gaban aiki", "ci gaba"],
    yo: ["ìlọsíwájú", "ilosiwaju"],
    ig: ["ọganihu", "oganihu"],
    pcm: ["how far mission"],
    fr: ["progression de la mission"],
  },
  [INTENT.SEARCH]: {
    en: ["find", "search", "show me all", "list"],
    ha: ["nemo", "nema", "jerin"],
    yo: ["wá", "wa fún", "ṣàwárí"],
    ig: ["chọọ", "choo", "depụta"],
    pcm: ["find", "show me"],
    fr: ["chercher", "trouver"],
  },
});

/**
 * Subjects the Canon does not record. (P0-1)
 *
 * Recognising these is the RECOGNITION layer's job — this table only answers "what
 * was asked about", never "can it be answered". Whether a subject is refusable is
 * grounding.js's decision, which is why these keys are meaningless here and only
 * acquire wording in NOT_RECORDED_BY_CANON.
 *
 * These are deliberately NARROW. A false positive turns a question the Canon CAN
 * answer into a refusal, which is a worse failure than a generic unknown: it would
 * make ForgeOS claim ignorance of something it actually knows.
 */
const SUBJECT_PHRASES = Object.freeze({
  material:        ["material", "made of", "made from", "what metal", "which metal", "alloy",
                    "irin ƙarfe", "irin karfe", "matériau", "irin abu"],
  tolerance:       ["tolerance", "tolerances", "how accurate", "accuracy required", "tolérance"],
  dimensions:      ["dimension", "dimensions", "diameter", "how thick", "how wide", "how long",
                    "bore size", "girman", "kauri", "diamètre"],
  drawing:         ["drawing", "drawings", "cad file", "cad model", "zane", "dessin"],
  evidence:        ["evidence", "proof", "certificate", "photograph", "photo of", "attach",
                    "shaida", "hujja", "preuve"],
  measurement:     ["measurement", "measurements", "measured value", "recorded reading",
                    "ma'auni", "mauni", "mesure"],
  workshopHead:    ["head of workshop", "workshop head", "who runs the workshop",
                    "who is in charge of the workshop", "shugaban bita", "shugaban workshop"],
  studentIdentity: ["student", "students", "nysc", "corper", "intern", "trainee",
                    "ɗalibi", "dalibi", "étudiant"],
  personRole:      ["what role does", "what is his role", "what is her role", "what is my role",
                    "which organisation does he", "which organisation does she",
                    "who does he work for", "who does she work for", "mece rawar"],
  specTitle:       ["title of", "what is it called", "name of the specification",
                    "specification title", "sunan"],
});

const norm = (s) => String(s ?? "").toLowerCase().normalize("NFC");

/**
 * Which unrecorded subject, if any, is this message about?
 *
 * Longest match wins, so "measured value" is not mistaken for the broader
 * "measurement" and a two-word marker beats an incidental single word.
 */
export function detectSubject(text) {
  const lower = norm(text);
  let chosen = null;
  let longest = 0;
  for (const [subject, phrases] of Object.entries(SUBJECT_PHRASES)) {
    for (const p of phrases) {
      const n = norm(p);
      if (lower.includes(n) && n.length > longest) {
        longest = n.length;
        chosen = subject;
      }
    }
  }
  return chosen;
}

export const UNRECORDED_SUBJECTS = Object.freeze(Object.keys(SUBJECT_PHRASES));

/** Extract Canon entities using the same layer that protects them. */
export function extractEntities(text) {
  const terms = findProtectedTerms(text);
  const ids = terms.filter((t) => t.kind !== "measurement").map((t) => t.text);
  const states = new Set(componentState.states());

  const specification = ids.find((v) => /^FTT-[A-Z]{2}-\d{3}$/.test(v)) ?? null;
  const mission = ids.find((v) => /^FORGE-[A-Z]+$/.test(v)) ?? null;
  // A component is a hyphenated id that is not a specification or a mission.
  const component = ids.find(
    (v) => v !== specification && v !== mission &&
           /^[A-Z][A-Z0-9]{1,7}(?:-[A-Z0-9]{1,6}){1,3}$/.test(v) && !states.has(v.toLowerCase()),
  ) ?? null;
  const measurements = terms.filter((t) => t.kind === "measurement").map((t) => t.text);

  return { component, specification, mission, measurements, identifiers: ids };
}

/**
 * Resolve a message into a canonical intent.
 *
 * @param text     what the participant actually said, in any language
 * @param context  { preferredLanguage } — session preference, never authority
 */
export function resolveIntent(text, { preferredLanguage = "en" } = {}) {
  const raw = String(text ?? "");
  const lower = norm(raw);
  const detected = detectLanguage(raw);
  const explicit = explicitLanguageRequest(raw);
  const { language: responseLanguage, because } =
    resolveResponseLanguage({ detected, preferred: preferredLanguage, explicit });

  // Score every intent across EVERY language's phrases. Scoring is not limited to
  // the detected language, because mixed input is normal — "Yanzu muna ready mu
  // fara inspection" carries an English marker inside a Hausa sentence.
  const hits = [];
  for (const [type, byLang] of Object.entries(PHRASES)) {
    for (const [lang, phrases] of Object.entries(byLang)) {
      for (const p of phrases) {
        if (lower.includes(norm(p))) hits.push({ type, lang, phrase: p, weight: p.includes(" ") ? 2 : 1 });
      }
    }
  }

  const entities = extractEntities(raw);
  // What the question is ABOUT, independently of whether it can be answered.
  const subject = detectSubject(raw);

  if (!hits.length) {
    return Object.freeze({
      type: INTENT.UNKNOWN,
      ...entities,
      subject,
      language: responseLanguage,
      detectedLanguage: detected.language,
      languageConfidence: detected.confidence,
      mixedLanguage: detected.mixed,
      responseLanguageBecause: because,
      confidence: 0,
      matched: Object.freeze([]),
      reason: "no recognised intent phrase",
    });
  }

  // Best intent by total weight; ties broken by the longest matched phrase.
  const totals = new Map();
  for (const h of hits) totals.set(h.type, (totals.get(h.type) ?? 0) + h.weight);
  const best = [...totals.entries()].sort(
    (a, b) => b[1] - a[1] ||
      Math.max(...hits.filter((h) => h[1] === b[0]).map((h) => h.phrase.length), 0) -
      Math.max(...hits.filter((h) => h[1] === a[0]).map((h) => h.phrase.length), 0),
  )[0];
  const [type, weight] = best;
  const totalWeight = [...totals.values()].reduce((a, b) => a + b, 0);

  return Object.freeze({
    type,
    ...entities,
    subject,
    language: responseLanguage,
    detectedLanguage: detected.language,
    languageConfidence: detected.confidence,
    mixedLanguage: detected.mixed,
    responseLanguageBecause: because,
    confidence: Number((weight / totalWeight).toFixed(2)),
    matched: Object.freeze(hits.filter((h) => h.type === type).map((h) => h.phrase)),
    reason: null,
  });
}

/** Two intents mean the same thing when type and named entities agree. */
export const sameIntent = (a, b) =>
  a?.type === b?.type &&
  (a?.component ?? null) === (b?.component ?? null) &&
  (a?.specification ?? null) === (b?.specification ?? null) &&
  (a?.mission ?? null) === (b?.mission ?? null);

export default { INTENT, resolveIntent, extractEntities, sameIntent, detectSubject, UNRECORDED_SUBJECTS };
