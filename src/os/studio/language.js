// ============================================================
// FORGE STUDIO — LANGUAGE DETECTION  (Phase 0)
//
// Deterministic, offline, no model. It reuses the existing SUPPORTED_LANGUAGES
// registry rather than declaring a second list, so adding a language later is a
// change to i18n.js and a marker set here — never a new AI implementation.
//
// HONEST ABOUT CONFIDENCE. Short input genuinely cannot be identified: "OK" is
// not Hausa or English, it is unknowable. Detection therefore returns an
// explicit `uncertain` flag rather than a confident guess, and the layer above
// is expected to fall back to the user's stored preference instead of inventing
// one.
//
// MIXED INPUT IS NORMAL, NOT AN ERROR. "Yanzu muna ready mu fara inspection na
// HUB-014" is how people actually speak in a Nigerian workshop. It is reported
// as `mixed: true` with a dominant language, and never rejected.
//
// PROTECTED TERMS ARE REMOVED BEFORE SCORING. Canon identifiers are
// language-neutral, and leaving them in would tilt every message towards English
// because they are written in Latin uppercase.
// ============================================================

import { SUPPORTED_LANGUAGES } from "../i18n.js";
import { protectTerms } from "./terms.js";

/**
 * Function words and orthographic markers. Function words are the reliable
 * signal — content words are borrowed freely across all of these languages.
 * `chars` are diacritics that appear in one language and not the others.
 */
const MARKERS = Object.freeze({
  ha: {
    words: ["ina", "yana", "yanzu", "kamata", "wannan", "muna", "mu", "yi", "me", "ya",
            "san", "abin", "rage", "kafin", "fara", "da", "ba", "akan", "matakin",
            "gaba", "shi", "ne", "halin", "bayan", "za", "samun", "ko", "kuma", "wani",
            "bukata", "kula", "gama", "turo", "mana", "bayyana", "min", "nawa", "cikin",
            "don", "sai", "amma", "ta", "na", "in", "an", "ka", "ki", "su", "sun"],
    chars: /[ƙɗɓƴ]/i,
  },
  yo: {
    words: ["kí", "ki", "ni", "mo", "yẹ", "ye", "ṣe", "se", "tókàn", "tokan", "lori",
            "ohun", "wa", "ti", "náà", "naa", "báwo", "bawo", "fún", "fun", "wọn",
            "kan", "jẹ", "je", "àwọn", "awon", "ṣàlàyé", "salaye", "pé", "pe", "ló", "lo"],
    chars: /[ẹọṣ]|[àèìòù]|[áéíóú]/,
  },
  ig: {
    words: ["gịnị", "gini", "ka", "kwesịrị", "kwesiri", "ime", "ọzọ", "ozo", "na",
            "ihe", "ndị", "ndi", "nke", "ya", "anyị", "anyi", "bụ", "bu", "maka",
            "kọwaa", "kowaa", "ọrụ", "oru", "were", "ugbu", "a", "gịnị", "dị", "di"],
    chars: /[ịọụṅ]/i,
  },
  pcm: {
    words: ["wetin", "dey", "abeg", "na", "make", "don", "wan", "sabi", "fit", "no",
            "go", "una", "dem", "wey", "how", "e", "im"],
    chars: null,
  },
  en: {
    words: ["the", "what", "should", "do", "next", "with", "is", "are", "please",
            "explain", "tell", "this", "that", "we", "have", "has", "on", "for",
            "and", "to", "of", "in", "it", "can", "need", "now", "been", "was",
            "will", "would", "my", "our", "team", "ready", "state", "status"],
    chars: null,
  },
  fr: {
    words: ["le", "la", "les", "que", "quoi", "est", "pour", "nous", "avec", "dans",
            "sur", "une", "des", "il", "elle", "faire", "prochaine", "étape"],
    chars: null,
  },
  urh: {
    words: ["vwo", "ọke", "kẹ", "rẹ", "na", "ọ", "avwanre", "wo"],
    chars: /[ẹọ]/,
  },
});

export const DETECTABLE = Object.freeze(Object.keys(MARKERS));

/**
 * Tokens that appear in more than one marker list — "in", "na", "a", "no", "e".
 *
 * These are the reason a naive detector calls pure English "mixed": "What state
 * is HUB-014 in?" contains `in`, which is also Hausa. Shared tokens are weak
 * evidence, so they score half and are EXCLUDED from the mixed determination.
 * Only a token unique to one language is allowed to argue that a second language
 * is genuinely present.
 */
export const SHARED_TOKENS = Object.freeze(new Set(
  Object.values(MARKERS)
    .flatMap((m) => m.words)
    .filter((w, i, all) => all.indexOf(w) !== i),
));

const isUnique = (token, code) =>
  MARKERS[code].words.includes(token) && !SHARED_TOKENS.has(token);

const tokenise = (s) =>
  String(s ?? "").toLowerCase().replace(/[^\p{L}\p{M}'’\s]/gu, " ").split(/\s+/).filter(Boolean);

/**
 * Detect the language of a message.
 *
 * @returns {{ language, confidence, uncertain, mixed, scores, secondary, tokens }}
 *   `language` is the dominant code, or null when nothing scored.
 *   `uncertain` means the caller should prefer a stored preference.
 */
export function detectLanguage(text) {
  // Canon identifiers are language-neutral; scoring them would bias to English.
  const { masked } = protectTerms(text);
  const tokens = tokenise(masked);
  const scores = {};
  const unique = {};
  for (const code of DETECTABLE) { scores[code] = 0; unique[code] = 0; }

  for (const [code, m] of Object.entries(MARKERS)) {
    for (const tk of tokens) {
      if (!m.words.includes(tk)) continue;
      // A token shared with another language is weak evidence and may not argue
      // that a second language is present.
      if (isUnique(tk, code)) { scores[code] += 1; unique[code] += 1; }
      else scores[code] += 0.5;
    }
    // A distinctive diacritic is strong evidence — it appears in no other set.
    if (m.chars && m.chars.test(masked)) { scores[code] += 2; unique[code] += 2; }
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topCode, topScore] = ranked[0];
  const [secondCode, secondScore] = ranked[1] ?? [null, 0];

  if (topScore === 0) {
    return Object.freeze({
      language: null, confidence: 0, uncertain: true, mixed: false,
      scores: Object.freeze(scores), secondary: null, tokens: tokens.length,
      reason: "no language marker was recognised",
    });
  }

  const total = ranked.reduce((n, [, v]) => n + v, 0);
  const confidence = Number((topScore / total).toFixed(2));

  // MIXED means a second language contributed a token that belongs to it ALONE,
  // on top of a clear primary. "Yanzu muna ready mu fara inspection" is mixed
  // because `ready` is English-only inside Hausa. "What state is HUB-014 in?" is
  // NOT mixed, because its only Hausa-looking token (`in`) is shared.
  const mixed = unique[topCode] >= 2 && (unique[secondCode] ?? 0) >= 1;
  // Too little signal to be trusted on its own.
  const uncertain = topScore < 2 || (tokens.length <= 2 && topScore < 3);

  return Object.freeze({
    language: topCode,
    confidence,
    uncertain,
    mixed,
    scores: Object.freeze(scores),
    secondary: mixed ? secondCode : null,
    tokens: tokens.length,
    reason: uncertain ? "too few markers to be confident" : null,
  });
}

/**
 * Resolve which language to REPLY in.
 *
 * Rules, in order: an explicit request wins; a confident detection wins next;
 * otherwise keep the stored preference. Nothing is translated unnecessarily,
 * and a language is never switched on a weak signal.
 */
export function resolveResponseLanguage({ detected, preferred = "en", explicit = null } = {}) {
  const supported = new Set(SUPPORTED_LANGUAGES.map((l) => l.code));
  if (explicit && supported.has(explicit)) {
    return { language: explicit, because: "explicitly requested" };
  }
  if (detected?.language && !detected.uncertain && supported.has(detected.language)) {
    return { language: detected.language, because: "confidently detected" };
  }
  return {
    language: supported.has(preferred) ? preferred : "en",
    because: detected?.uncertain ? "detection uncertain — kept preference" : "no detection",
  };
}

/** "Explain it in English" / "Ka yi min bayani da Turanci" -> an explicit switch. */
const EXPLICIT = Object.freeze([
  [/\b(in|da)\s+(english|turanci)\b/i, "en"],
  [/\b(in|da)\s+(hausa)\b/i, "ha"],
  [/\b(in|ni|ede)\s+(yoruba|yorùbá)\b/i, "yo"],
  [/\b(in|na|asụsụ)\s+(igbo)\b/i, "ig"],
  [/\b(in|for)\s+(pidgin)\b/i, "pcm"],
  [/\b(in|en)\s+(french|français|francais)\b/i, "fr"],
]);

export function explicitLanguageRequest(text) {
  for (const [re, code] of EXPLICIT) if (re.test(String(text ?? ""))) return code;
  return null;
}

export default { detectLanguage, resolveResponseLanguage, explicitLanguageRequest, DETECTABLE };
