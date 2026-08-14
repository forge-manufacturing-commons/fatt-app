// ============================================================
// FORGE STUDIO — RESPONSE PLANNING  (Phase 2)
//
// The last stage of the pipeline, and the one that makes Forge AI usable rather
// than merely safe:
//
//   language -> intent -> Canon tools -> grounded claims -> RESPONSE -> answer
//
// WHAT THIS IS NOT. It is not a translator. Nothing here takes an English
// sentence and converts it. It takes VERIFIED CANON FACTS — values already read
// out of the fold and already re-resolved by grounding.js — and realises them as
// a sentence in the language the participant used. The Canon is queried once, in
// one language-neutral form, and the answer is composed at the very end. That is
// why an English, Hausa, Yoruba and Igbo user reach the same fact: they are not
// asking different questions, they are reading the same answer.
//
// WHY IT IS DETERMINISTIC. A model is not required to say "HUB-014 yana cikin
// matakin manufacturing". The facts are known, the grammar is fixed, and a
// template that interpolates verified values cannot hallucinate a state that the
// component is not in. When the provider IS attached (provider.js), its prose is
// only ever ADDITIONAL — and only survives if every claim it made grounds. So
// Forge AI answers correctly in Hausa with no model connected at all, and a model
// can improve the phrasing without becoming able to change the facts.
//
// THE REALISATION CONTRACT. Every sentence is assembled from:
//   * FIXED language-specific connective text, written here
//   * CANONICAL VALUES, interpolated verbatim and never inflected
//
// A canonical value is never translated, never pluralised, never case-folded.
// "manufacturing" stays "manufacturing" inside a Hausa sentence, because it is
// the name of a lifecycle state in Forge Canon, not an English word that happens
// to appear there. terms.js already guarantees this for translation; here the
// guarantee is structural, because the value is never touched at all.
//
// ONE TEMPLATE SET PER INTENT, NOT PER LANGUAGE PER INTENT. Adding a language
// means adding a REALISER — the connective words — not a second set of
// manufacturing rules and not a second idea of what the Canon says.
// ============================================================

import { CLAIM, isBinding, isCanonLimitation, notRecorded } from "./grounding.js";
import { INTENT } from "./intent.js";
import { verifyPreserved } from "./terms.js";

/**
 * Connective vocabulary per language. This is the ONLY place language-specific
 * wording lives, and it contains no manufacturing logic whatsoever — every entry
 * is a function of already-verified canonical values.
 *
 * Hausa is written first and in full because it is the language this phase had to
 * prove. The others are complete for the intents the tests exercise; a gap
 * falls back to English rather than inventing grammar, which is why `pick()`
 * exists and why a missing realiser is a legible fallback and not a crash.
 */
const REALISERS = Object.freeze({
  ha: {
    // "HUB-014 yana cikin matakin manufacturing a halin yanzu."
    state: (c, s) => `${c} yana cikin matakin ${s} a halin yanzu.`,
    responsibility: (c, o) => `${o} ce ke da alhakin aikin ${c}.`,
    noResponsibility: (c) => `Babu wata ƙungiya da ta ɗauki alhakin ${c} a Forge Canon.`,
    hub: (c, h) => `Ana yin aikin ${c} a ${h}.`,
    noHub: (c) => `Forge Canon ba ta da rikodin hub ɗin da ake yin aikin ${c}.`,
    mission: (c, m) => `Aikin yana ƙarƙashin ${m}.`,
    noMission: (c) => `${c} ba ya ƙarƙashin wata manufa a Forge Canon.`,
    progress: (m, a, t) => `An amince da ${a} daga cikin ${t} a ${m}.`,
    remaining: (n) => `Sauran ${n} ne.`,
    nextActions: (c, list) => `Mataki na gaba da lifecycle ya ba da izini: ${list}.`,
    noNextAction: (c, s) => `Lifecycle bai ba da wani mataki daga "${s}" ba.`,
    inspectionPassed: (c) => `${c} ya wuce inspection — an rubuta shi a Forge Canon.`,
    inspectionUnknown: (c) => `Forge Canon ba ta da rikodin da ke tabbatar da cewa ${c} ya wuce inspection.`,
    contributions: (c, n) => `Mutane ${n} sun ba da gudummawa ga ${c}.`,
    noContributions: (c) => `Forge Canon ba ta da rikodin gudummawa ga ${c}.`,
    directives: (c, n) => `Akwai umarni ${n} da aka rubuta a kan ${c}.`,
    noDirectives: (c) => `Forge Canon ba ta da rikodin umarni a kan ${c}.`,
    acknowledged: (who, outcome) => `${who} ya amsa umarnin: ${outcome}.`,
    notAcknowledged: (c) => `Ba a rubuta amsa ga umarnin ${c} ba tukuna a Forge Canon.`,
    historyCount: (c, n) => `An rubuta canje-canje ${n} a kan ${c}.`,
    noHistory: (c) => `Forge Canon ba ta da tarihin canji a kan ${c}.`,
    unknownComponent: (c) => `Forge Canon ba ta da rikodin wani abu mai suna ${c}.`,
    notUnderstood: () => `Ban gane tambayar a matsayin tambaya ga Forge Canon ba. Ka gwada tambaya game da wani component, hub, alhaki, ko manufa.`,
    // AUTHORITY. Never "I cannot" — always what ForgeOS requires.
    cannotAct: () => `Zan iya shirya rikodin, amma ForgeOS na buƙatar tabbataccen shaidar injiniya kafin a rubuta shi. Ba zan iya ba wa kaina wannan izini ba.`,
    prepared: (type, c) => `Na shirya daftarin ${type} na ${c}.`,
    sourceLabel: () => "MAFARIN BAYANI · Forge Canon",
    // PROVIDER FAILURE (§14). States what did not happen AND that the Canon is
    // untouched — a participant's first worry when a system errors mid-task is
    // whether it half-recorded something.
    providerDown: () => "Forge AI ba zai iya kammala amsar a yanzu ba. Ba a canza Forge Canon ba.",
  },
  en: {
    state: (c, s) => `${c} is currently in ${s}.`,
    responsibility: (c, o) => `${o} is responsible for ${c}.`,
    noResponsibility: (c) => `No organisation has claimed responsibility for ${c} in Forge Canon.`,
    hub: (c, h) => `${c} is being made at ${h}.`,
    noHub: (c) => `Forge Canon has no record of the hub where ${c} is being made.`,
    mission: (c, m) => `The work sits under ${m}.`,
    noMission: (c) => `${c} is not part of any mission in Forge Canon.`,
    progress: (m, a, t) => `${a} of ${t} accepted on ${m}.`,
    remaining: (n) => `${n} remain.`,
    nextActions: (c, list) => `The lifecycle permits: ${list}.`,
    noNextAction: (c, s) => `The lifecycle permits no transition from "${s}".`,
    inspectionPassed: (c) => `${c} passed inspection — it is recorded in Forge Canon.`,
    inspectionUnknown: (c) => `Forge Canon holds no record that ${c} passed inspection.`,
    contributions: (c, n) => `${n} contribution${n === 1 ? "" : "s"} recorded on ${c}.`,
    noContributions: (c) => `Forge Canon records no contributions to ${c}.`,
    directives: (c, n) => `${n} directive${n === 1 ? "" : "s"} recorded on ${c}.`,
    noDirectives: (c) => `Forge Canon records no directives on ${c}.`,
    acknowledged: (who, outcome) => `${who} answered the directive: ${outcome}.`,
    notAcknowledged: (c) => `No acknowledgement of the directive on ${c} is recorded in Forge Canon yet.`,
    historyCount: (c, n) => `${n} recorded transition${n === 1 ? "" : "s"} on ${c}.`,
    noHistory: (c) => `Forge Canon holds no transition history for ${c}.`,
    unknownComponent: (c) => `Forge Canon has no record of anything called ${c}.`,
    notUnderstood: () => `I did not read that as a question Forge Canon can answer. Try asking about a component, its hub, who is responsible, or a mission.`,
    cannotAct: () => `I can prepare the record, but ForgeOS requires an authorised engineering identity before it can be recorded. I cannot grant myself that authority.`,
    prepared: (type, c) => `I have prepared a draft ${type} for ${c}.`,
    sourceLabel: () => "CANON SOURCE · Forge Canon",
    providerDown: () => "Forge AI is temporarily unable to complete the response. The Canon has not been changed.",
  },
  yo: {
    state: (c, s) => `${c} wà ní ${s} lọ́wọ́lọ́wọ́.`,
    responsibility: (c, o) => `${o} ni ó ni ojúṣe fún ${c}.`,
    noResponsibility: (c) => `Kò sí àjọ tí ó gba ojúṣe fún ${c} nínú Forge Canon.`,
    hub: (c, h) => `Wọ́n ń ṣe ${c} ní ${h}.`,
    noHub: (c) => `Forge Canon kò ní àkọsílẹ̀ ibi tí wọ́n ń ṣe ${c}.`,
    mission: (c, m) => `Iṣẹ́ náà wà lábẹ́ ${m}.`,
    noMission: (c) => `${c} kò wà lábẹ́ iṣẹ́ àpinfunni kankan nínú Forge Canon.`,
    progress: (m, a, t) => `${a} nínú ${t} ni a gbà lórí ${m}.`,
    remaining: (n) => `${n} ṣẹ́ kù.`,
    nextActions: (c, list) => `Lifecycle gbà: ${list}.`,
    noNextAction: (c, s) => `Lifecycle kò gbà ìyípadà kankan láti "${s}".`,
    inspectionPassed: (c) => `${c} kọjá inspection — a kọ ọ́ sínú Forge Canon.`,
    inspectionUnknown: (c) => `Forge Canon kò ní àkọsílẹ̀ pé ${c} kọjá inspection.`,
    contributions: (c, n) => `Ìkópa ${n} ni a kọ sílẹ̀ lórí ${c}.`,
    noContributions: (c) => `Forge Canon kò kọ ìkópa kankan sí ${c}.`,
    directives: (c, n) => `Àṣẹ ${n} ni a kọ sílẹ̀ lórí ${c}.`,
    noDirectives: (c) => `Forge Canon kò kọ àṣẹ kankan lórí ${c}.`,
    acknowledged: (who, outcome) => `${who} dáhùn àṣẹ náà: ${outcome}.`,
    notAcknowledged: (c) => `Kò sí ìdáhùn sí àṣẹ lórí ${c} nínú Forge Canon.`,
    historyCount: (c, n) => `Ìyípadà ${n} ni a kọ sílẹ̀ lórí ${c}.`,
    noHistory: (c) => `Forge Canon kò ní ìtàn ìyípadà fún ${c}.`,
    unknownComponent: (c) => `Forge Canon kò ní àkọsílẹ̀ ohunkóhun tí ń jẹ́ ${c}.`,
    notUnderstood: () => `Mi kò ka ìyẹn sí ìbéèrè tí Forge Canon lè dáhùn.`,
    cannotAct: () => `Mo lè pèsè àkọsílẹ̀, ṣùgbọ́n ForgeOS béèrè ìdánimọ̀ onímọ̀ ẹ̀rọ tí a fọwọ́ sí kí ó tó kọ ọ́.`,
    prepared: (type, c) => `Mo pèsè àkọsílẹ̀ ${type} fún ${c}.`,
    sourceLabel: () => "ÌPÍLẸ̀ · Forge Canon",
    providerDown: () => "Forge AI kò lè parí ìdáhùn báyìí. A kò yí Forge Canon padà.",
  },
  ig: {
    state: (c, s) => `${c} nọ na ${s} ugbu a.`,
    responsibility: (c, o) => `${o} bụ onye na-ahụ maka ${c}.`,
    noResponsibility: (c) => `Ọ dịghị nzukọ nabatara ọrụ maka ${c} na Forge Canon.`,
    hub: (c, h) => `A na-emere ${c} na ${h}.`,
    noHub: (c) => `Forge Canon enweghị ndekọ ebe a na-emere ${c}.`,
    mission: (c, m) => `Ọrụ ahụ dị n'okpuru ${m}.`,
    noMission: (c) => `${c} adịghị n'okpuru ozi ọrụ ọ bụla na Forge Canon.`,
    progress: (m, a, t) => `A nabatara ${a} n'ime ${t} na ${m}.`,
    remaining: (n) => `${n} fọdụrụ.`,
    nextActions: (c, list) => `Lifecycle kwere: ${list}.`,
    noNextAction: (c, s) => `Lifecycle ekweghị mgbanwe ọ bụla site na "${s}".`,
    inspectionPassed: (c) => `${c} gafere inspection — e dekọrọ ya na Forge Canon.`,
    inspectionUnknown: (c) => `Forge Canon enweghị ndekọ na ${c} gafere inspection.`,
    contributions: (c, n) => `Ntinye aka ${n} ka e dekọrọ na ${c}.`,
    noContributions: (c) => `Forge Canon edekọghị ntinye aka ọ bụla na ${c}.`,
    directives: (c, n) => `Iwu ${n} ka e dekọrọ na ${c}.`,
    noDirectives: (c) => `Forge Canon edekọghị iwu ọ bụla na ${c}.`,
    acknowledged: (who, outcome) => `${who} zaghachiri iwu ahụ: ${outcome}.`,
    notAcknowledged: (c) => `Ọ dịghị nzaghachi iwu na ${c} e dekọrọ na Forge Canon.`,
    historyCount: (c, n) => `Mgbanwe ${n} ka e dekọrọ na ${c}.`,
    noHistory: (c) => `Forge Canon enweghị akụkọ mgbanwe maka ${c}.`,
    unknownComponent: (c) => `Forge Canon enweghị ndekọ ihe ọ bụla a na-akpọ ${c}.`,
    notUnderstood: () => `Agụghị m nke ahụ dị ka ajụjụ Forge Canon nwere ike ịza.`,
    cannotAct: () => `Enwere m ike ịkwadebe ndekọ ahụ, mana ForgeOS chọrọ njirimara injinia akwadoro tupu e dekọọ ya.`,
    prepared: (type, c) => `Akwadebere m ndekọ ${type} maka ${c}.`,
    sourceLabel: () => "ISI MMALITE · Forge Canon",
    providerDown: () => "Forge AI enweghị ike imecha nzaghachi ugbu a. Agbanweghị Forge Canon.",
  },
  pcm: {
    state: (c, s) => `${c} dey ${s} right now.`,
    responsibility: (c, o) => `${o} na the one wey responsible for ${c}.`,
    noResponsibility: (c) => `No organisation don claim responsibility for ${c} inside Forge Canon.`,
    hub: (c, h) => `Dem dey make ${c} for ${h}.`,
    noHub: (c) => `Forge Canon no get record of the hub where dem dey make ${c}.`,
    mission: (c, m) => `The work dey under ${m}.`,
    noMission: (c) => `${c} no dey under any mission inside Forge Canon.`,
    progress: (m, a, t) => `${a} out of ${t} don be accepted on ${m}.`,
    remaining: (n) => `${n} still remain.`,
    nextActions: (c, list) => `The lifecycle allow: ${list}.`,
    noNextAction: (c, s) => `Lifecycle no allow any move from "${s}".`,
    inspectionPassed: (c) => `${c} pass inspection — e dey inside Forge Canon.`,
    inspectionUnknown: (c) => `Forge Canon no get any record say ${c} pass inspection.`,
    contributions: (c, n) => `${n} contribution dey recorded on ${c}.`,
    noContributions: (c) => `Forge Canon no record any contribution to ${c}.`,
    directives: (c, n) => `${n} directive dey recorded on ${c}.`,
    noDirectives: (c) => `Forge Canon no record any directive on ${c}.`,
    acknowledged: (who, outcome) => `${who} answer the directive: ${outcome}.`,
    notAcknowledged: (c) => `Nobody don answer the directive on ${c} inside Forge Canon.`,
    historyCount: (c, n) => `${n} transition dey recorded on ${c}.`,
    noHistory: (c) => `Forge Canon no get transition history for ${c}.`,
    unknownComponent: (c) => `Forge Canon no get record of anything wey dem call ${c}.`,
    notUnderstood: () => `I no read that one as question wey Forge Canon fit answer.`,
    cannotAct: () => `I fit prepare the record, but ForgeOS need authorised engineering identity before e go enter.`,
    prepared: (type, c) => `I don prepare draft ${type} for ${c}.`,
    sourceLabel: () => "CANON SOURCE · Forge Canon",
    providerDown: () => "Forge AI no fit finish the answer now. Forge Canon no change at all.",
  },
});

/**
 * Pick a realiser, falling back to English for a language that has none yet.
 *
 * The fallback is deliberate and reported. Inventing grammar for a language this
 * file has no realiser for would be exactly the kind of confident fabrication the
 * grounding layer exists to prevent — one level up, in the wording rather than
 * the facts. `fr` and `urh` are detectable and intentionally fall back here until
 * a speaker supplies the connectives.
 */
export function realiserFor(language) {
  const r = REALISERS[language];
  return r
    ? { r, language, fellBack: false }
    : { r: REALISERS.en, language: "en", fellBack: true, requested: language };
}

export const REALISED_LANGUAGES = Object.freeze(Object.keys(REALISERS));

/** Values that must appear in the answer EXACTLY as the Canon holds them. */
const canonicalValuesOf = (view, componentId, missionId) => {
  const out = [];
  const c = componentId ? view?.components?.[componentId] : null;
  if (componentId) out.push(componentId);
  if (c?.state) out.push(c.state);
  if (c?.organisation) out.push(c.organisation);
  if (c?.hub) out.push(c.hub);
  if (c?.mission) out.push(c.mission);
  if (c?.specification) out.push(c.specification);
  if (missionId) out.push(missionId);
  return [...new Set(out)];
};

/**
 * Compose the answer.
 *
 * @param grounded  the output of groundResponse — ALREADY verified
 * @param intent    the canonical intent
 * @param view      the fold, for reading verified values (never for new claims)
 * @returns {{ answer, language, fellBack, sources, presented, refused, preserved }}
 *
 * IT READS ONLY WHAT THE CLAIMS ALREADY PROVED. The `view` is consulted for
 * values, but a value is only spoken when a BINDING claim citing its path
 * survived verification. That ordering is the whole safety property: the sentence
 * cannot mention a fact that failed to ground, because the branch that would
 * speak it is gated on the claim, not on the fold.
 */
export function planResponse({ grounded, intent, view = {} } = {}) {
  const { r, language, fellBack } = realiserFor(intent?.language ?? "en");
  const id = intent?.component ?? null;
  const mid = intent?.mission ?? null;
  const comp = id ? view?.components?.[id] : null;

  const sentences = [];
  const sources = [];
  const bind = (claim) => { if (claim?.source?.path) sources.push(claim.source.path); return claim; };

  // Every binding claim, indexed by the fold path it proved. A path that is not
  // in here was NOT proved, and nothing below may speak it.
  const proved = new Map();
  for (const c of grounded?.claims ?? []) {
    if (isBinding(c) && c.source?.path) proved.set(c.source.path, c);
    for (const s of c.sources ?? []) if (isBinding(c) && s?.path) proved.set(s.path, c);
  }
  const provedPath = (p) => proved.get(p) ?? null;

  // Canonical values the answer actually SPEAKS. This is what the preservation
  // guarantee is about — not "does the answer mention everything the Canon holds"
  // (it should not; a hub question should not recite the mission) but "is every
  // value it does state identical to the Canon's". A realiser that lower-cased
  // SOLC, inflected `manufacturing`, or localised `warri` would fail this.
  const spoken = [];
  const mention = (...values) => { for (const v of values) if (v) spoken.push(String(v)); };

  const say = (p, fn, ...values) => {
    const claim = provedPath(p);
    if (!claim) return false;
    sources.push(p);
    mention(...values);
    sentences.push(fn());
    return true;
  };

  // A Canon-limitation refusal takes the whole response. Mixing "here are three
  // facts" with "the Canon does not record what you asked" buries the refusal.
  const limitation = (grounded?.claims ?? []).find(isCanonLimitation);
  if (limitation) {
    // Re-render the refusal in the RESPONSE language if it was built in another
    // one. The refusal is regenerated from its structured `subject` and `about`
    // rather than translated from its text, so the wording comes from
    // CANON_SILENCE and the subject comes from NOT_RECORDED_BY_CANON — the same
    // two sources that produced it in the first place. Nothing is paraphrased.
    const inLanguage = limitation.language === language
      ? limitation
      : notRecorded(limitation.subject, limitation.about ?? null, language);
    return Object.freeze({
      answer: inLanguage.text,
      language, fellBack,
      sources: Object.freeze([]),
      presented: 0, refused: 1, canonLimitation: true,
      // A refusal names the component it is about, so the identifier must survive.
      preserved: verifyPreserved([limitation.about].filter(Boolean).join(" "),
                                 inLanguage.text).preserved,
    });
  }

  switch (intent?.type) {
    case INTENT.COMPONENT_STATE:
      if (!comp) { sentences.push(r.unknownComponent(id ?? "—")); break; }
      say(`components.${id}.state`, () => r.state(id, comp.state), id, comp.state);
      say(`components.${id}.organisation`, () => r.responsibility(id, comp.organisation), id, comp.organisation);
      say(`components.${id}.hub`, () => r.hub(id, comp.hub), id, comp.hub);
      say(`components.${id}.mission`, () => r.mission(id, comp.mission), id, comp.mission);
      if (!sentences.length) sentences.push(r.unknownComponent(id ?? "—"));
      break;

    case INTENT.COMPONENT_HUB:
      if (!comp) { sentences.push(r.unknownComponent(id ?? "—")); break; }
      mention(id);
      if (!say(`components.${id}.hub`, () => r.hub(id, comp.hub), comp.hub)) sentences.push(r.noHub(id));
      break;

    case INTENT.COMPONENT_WHO:
      if (!comp) { sentences.push(r.unknownComponent(id ?? "—")); break; }
      // NEVER cites the hub. Location is not responsibility — Canon P0-2.
      mention(id);
      if (!say(`components.${id}.organisation`, () => r.responsibility(id, comp.organisation), comp.organisation)) {
        sentences.push(r.noResponsibility(id));
      }
      break;

    case INTENT.COMPONENT_MISSION:
      if (!comp) { sentences.push(r.unknownComponent(id ?? "—")); break; }
      mention(id);
      if (!say(`components.${id}.mission`, () => r.mission(id, comp.mission), comp.mission)) {
        sentences.push(r.noMission(id));
      }
      break;

    case INTENT.COMPONENT_CONTRIBUTIONS: {
      if (!comp) { sentences.push(r.unknownComponent(id ?? "—")); break; }
      const n = (comp.contributions ?? []).length;
      mention(id);
      if (n && say(`components.${id}.contributions`, () => r.contributions(id, n))) break;
      sentences.push(r.noContributions(id));
      break;
    }

    case INTENT.COMPONENT_DIRECTIVES: {
      if (!comp) { sentences.push(r.unknownComponent(id ?? "—")); break; }
      const n = (comp.directives ?? []).length;
      mention(id);
      if (n && say(`components.${id}.directives`, () => r.directives(id, n))) break;
      sentences.push(r.noDirectives(id));
      break;
    }

    case INTENT.ACKNOWLEDGEMENT_STATUS: {
      if (!comp) { sentences.push(r.unknownComponent(id ?? "—")); break; }
      const resolved = (comp.directives ?? []).find((d) => d?.acknowledgement);
      mention(id);
      if (resolved && say(`components.${id}.directives`,
                          () => r.acknowledged(resolved.directedTo ?? resolved.person ?? "—",
                                               resolved.acknowledgement))) break;
      sentences.push(r.notAcknowledged(id));
      break;
    }

    case INTENT.COMPONENT_HISTORY: {
      if (!comp) { sentences.push(r.unknownComponent(id ?? "—")); break; }
      const n = (comp.history ?? []).length;
      mention(id);
      if (n && say(`components.${id}.history`, () => r.historyCount(id, n))) break;
      sentences.push(r.noHistory(id));
      break;
    }

    case INTENT.INSPECTION_STATUS: {
      if (!comp) { sentences.push(r.unknownComponent(id ?? "—")); break; }
      // Only a PROVED history claim may assert a pass. Absence is stated as a
      // Canon absence, never as ignorance — Test 5 and Test 6 turn on this.
      const passed = (comp.history ?? []).some((h) => h.transition === "pass");
      mention(id);
      if (passed && say(`components.${id}.history`, () => r.inspectionPassed(id))) break;
      sentences.push(r.inspectionUnknown(id));
      break;
    }

    case INTENT.COMPONENT_NEXT_ACTION: {
      if (!comp) { sentences.push(r.unknownComponent(id ?? "—")); break; }
      say(`components.${id}.state`, () => r.state(id, comp.state), id, comp.state);
      const rec = (grounded?.recommendations ?? [])[0];
      if (rec?.text) sentences.push(r.nextActions(id, rec.text));
      else sentences.push(r.noNextAction(id, comp.state));
      break;
    }

    case INTENT.MISSION_PROGRESS: {
      const m = (view?.missions ?? []).find((x) => x.id === mid);
      if (!m) { sentences.push(r.unknownComponent(mid ?? "—")); break; }
      if (say(`missions.${m.id}.accepted`, () => r.progress(m.id, m.accepted, m.target), m.id)) {
        const d = (grounded?.derived ?? [])[0];
        if (d && isBinding(d)) sentences.push(r.remaining(Math.max(0, m.target - m.accepted)));
      }
      break;
    }

    case INTENT.ACTION_REQUEST:
      // THE AUTHORITY BOUNDARY, IN THE USER'S LANGUAGE. Not "I can't" — what
      // ForgeOS requires. The refusal names the system's rule, not the AI's limit.
      sentences.push(r.cannotAct());
      break;

    default:
      sentences.push(r.notUnderstood());
      break;
  }

  const answer = sentences.join(" ");
  // The structural guarantee, checked rather than assumed: every canonical value
  // the Canon holds for this subject survives verbatim in the answer.
  //
  // ARGUMENT ORDER MATTERS AND I HAD IT BACKWARDS. verifyPreserved(original,
  // produced) extracts protected terms from the FIRST argument and counts them in
  // the SECOND. Passing (answer, values) made it extract from the answer — where
  // "HUB-014" appears three times — and count in a stringified array where it
  // appears once, so a perfectly correct answer reported preserved: false. The
  // canonical values are the original; the answer is the product.
  const preserved = verifyPreserved([...new Set(spoken)].join(" "), answer).preserved;

  return Object.freeze({
    answer,
    language,
    fellBack,
    sources: Object.freeze([...new Set(sources)]),
    presented: sentences.length,
    refused: 0,
    canonLimitation: false,
    preserved,
  });
}

export default { planResponse, realiserFor, REALISED_LANGUAGES };
