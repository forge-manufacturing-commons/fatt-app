// ============================================================
// FORGE OS — ENGINEERING BAY
//
// The kernel reference implementation. One action — approving a
// specification — travels the entire pipeline and is visible at every gate:
//
//   Intent -> Policy -> Rules -> State -> Event -> Runtime -> Consequence
//
// Nothing here holds business logic. The room renders what the kernel
// decides. If you want to change who may approve, edit policy.js; what the
// domain permits, edit domains/engineering/rules.js; which transitions
// exist, edit domains/engineering/state.js. No screen owns these answers.
//
// Every event is shown in three layers, because recording is not
// coordinating:
//   EVENT       what happened
//   CONSEQUENCE what changed as a result
//   DECISION    what Forge OS recommends next
// ============================================================

import { useMemo, useState } from "react";
import { useForgeActivity } from "../os/ActivityEngine.jsx";
import { useIdentity } from "../os/ForgeIdentity.jsx";
import { specificationState } from "../domains/engineering/state.js";
import { engineeringRules } from "../domains/engineering/rules.js";
import { createEngineeringEmitter } from "../domains/engineering/emitters.js";
import { createPolicy, requireActor, PolicyViolation } from "../os/policy.js";
import { RuleViolation } from "../os/rules.js";
import { IllegalTransition } from "../os/state.js";
import { FORGE_CLIPS } from "../os/geometry.js";
import { project } from "../os/projections.js";
import { MISSIONS } from "../os/missions.js";
import OperationsFeed from "../os/OperationsFeed.jsx";
import StateGraph from "../os/StateGraph.jsx";

const BLACK="#0D0D0F", IVORY="#F5F1E9", TEAL="#0A7F73", AMBER="#F5A623", PINK="#FF2E63";
const SURFACE="#111418", BORDER="#1C2128", MUTED="#8899aa", GREEN="#1a7a4a";
const UI="var(--forge-brand-font, 'Poppins', system-ui, sans-serif)";
const DISPLAY="var(--forge-display-font, 'Poppins', system-ui, sans-serif)";
const MONO="var(--forge-mono, ui-monospace, monospace)";

// Demo engineers with DIFFERENT competencies, so the rules can be seen
// permitting and refusing rather than described. Labelled as demo.
const ACTORS = [
  { id: "eng-ngozi",  name: "Ngozi Bello",    competencies: ["engineering-level-3"] },
  { id: "eng-tunde",  name: "Tunde Bakare",   competencies: ["engineering-level-2"] },
  { id: "eng-folake", name: "Folake Adeyemi", competencies: ["engineering-level-3"] },
];

// The documents that exist. Their STATE is not stored here — it is folded
// from the event log by projections.js, which is what lets every other room
// see the same reality without shared component state.
const DECLARED_SPECS = [
  { id: "FTT-CR-001", title: "Chassis rail, 2.0mm CR steel",  author: "eng-ngozi",  revision: "A.01" },
  { id: "FTT-HB-001", title: "Wheel hub, machined billet",    author: "eng-tunde",  revision: "A.03" },
  { id: "FTT-BR-007", title: "Axle bracket, folded plate",    author: "eng-folake", revision: "B.01" },
  { id: "FTT-PV-002", title: "Air receiver, pressure vessel", author: "eng-ngozi",  revision: "C.02" },
];

// The order a specification travels, for the lifecycle strip.
const SPEC_ORDER = ["draft", "review", "approved", "released", "deprecated"];

// Transitions offered to an operator, with the verb they actually mean.
const ACTION_LABEL = {
  submitForReview: "Submit for review",
  approve: "Approve for manufacture",
  reject: "Reject to draft",
  release: "Release for production",
  revise: "Raise revision",
  deprecate: "Deprecate",
  abandon: "Abandon",
};

const STATE_COLOR = {
  draft: MUTED, review: AMBER, approved: TEAL,
  released: GREEN, deprecated: PINK, withdrawn: PINK,
};

function Label({ children }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ fontFamily:UI, fontWeight:600, fontSize:10, letterSpacing:"0.2em",
        textTransform:"uppercase", color:TEAL }}>{children}</div>
      <div style={{ width:40, height:2, background:PINK, marginTop:6 }} />
    </div>
  );
}

export default function EngineeringBay() {
  const { publish, log } = useForgeActivity();
  const { profile } = useIdentity();

  const [actorId, setActorId] = useState("eng-ngozi");
  const [selected, setSelected] = useState("FTT-CR-001");
  const [refusal, setRefusal] = useState(null);
  const [chain, setChain] = useState([]);   // event -> consequence -> decision

  const actor = ACTORS.find((a) => a.id === actorId);

  // THE CONNECTED KERNEL: every room folds the same log. Nothing about a
  // specification is stored in this component, so approving it here is
  // immediately visible to the Operations Centre and to mission progress.
  const view = useMemo(() => project(log, MISSIONS), [log]);

  const specs = useMemo(() => DECLARED_SPECS.map((d) => ({
    ...d,
    state: view.specifications[d.id]?.state ?? specificationState.initial,
    history: view.specifications[d.id]?.history ?? [],
  })), [view]);

  const spec = specs.find((x) => x.id === selected) || specs[0];

  // Policy is composed here; the room does not decide what it means.
  const policy = useMemo(() => createPolicy([requireActor]), []);
  const emitter = useMemo(
    () => createEngineeringEmitter({
      publish,
      actor: profile?.display_name || actor?.name,
      correlationId: `spec-${spec?.id}`,
    }),
    [publish, profile, actor, spec?.id]
  );

  // Which transitions the OBJECT permits — asked of the state engine, never guessed.
  const available = spec ? specificationState.transitions(spec.state) : [];
  const impossible = spec ? specificationState.impossible(spec.state) : [];

  function act(transition) {
    setRefusal(null);
    const ctx = {
      transition,
      author: spec.author,
      approver: actorId,
      competencies: actor?.competencies ?? [],
      supersedes: transition === "revise" ? spec.revision : undefined,
      specification: spec.id,
      specificationState: spec.state,
    };

    // GATE 2 — rules: does the manufacturing domain permit this?
    const verdict = engineeringRules.evaluate(ctx);
    if (!verdict.permitted) {
      setRefusal({ kind: "constraint", violations: verdict.violations });
      return;
    }

    try {
      // GATE 3 — state: may this object make this transition?
      const toState = specificationState.next(spec.state, transition);

      // GATE 1 — policy runs inside the emitter pipeline, then the event is published.
      const fn = { submitForReview: emitter.draftSpecification,
                   approve: emitter.approveSpecification,
                   release: emitter.releaseSpecification,
                   revise: emitter.reviseSpecification }[transition];

      // `transition` travels ON the event. The producer knows what it intended;
      // the projection applies it through the state graph. That is what makes
      // the decision reconstructable by any consumer, including Forge AI.
      const event = fn
        ? fn({ specification: spec.id, revision: spec.revision, transition,
               summary: `${spec.id} ${ACTION_LABEL[transition].toLowerCase()}` })
        : null;

      // Three layers. Consequence and decision are derived, not authored.
      setChain((prev) => [{
        at: Date.now(),
        event: event?.type ?? `engineering.${transition}`,
        summary: event?.summary ?? `${spec.id} ${transition}`,
        subject: spec.id,
        consequence: `${spec.id}: ${spec.state} → ${toState}`,
        decision: nextDecision(toState, spec.id),
        fromState: spec.state,
        toState,
        eventId: event?.eventId,
      }, ...prev].slice(0, 8));
    } catch (e) {
      if (e instanceof IllegalTransition) {
        setRefusal({ kind: "state", message: e.message, allowed: e.allowed });
      } else if (e instanceof PolicyViolation) {
        setRefusal({ kind: "policy", message: e.message, rule: e.rule });
      } else if (e instanceof RuleViolation) {
        setRefusal({ kind: "constraint", violations: e.violations });
      } else {
        setRefusal({ kind: "error", message: e.message });
      }
    }
  }

  // What Forge OS should do next. Derived from the state the object now holds.
  function nextDecision(state, id) {
    switch (state) {
      case "review":     return `Assign a level 3 engineer to review ${id}.`;
      case "approved":   return `${id} may now be released for production.`;
      case "released":   return `Production may be authorised against ${id}. Match a certified workshop.`;
      case "draft":      return `${id} requires authoring before it can re-enter review.`;
      case "deprecated": return `Withdraw ${id} from all open work orders.`;
      default:           return `No action required for ${id}.`;
    }
  }


  return (
    <div className="forge-brand" style={{ background:BLACK, color:IVORY, minHeight:"100%",
      padding:"clamp(24px,4vw,48px)", fontFamily:UI, boxSizing:"border-box" }}>

      <div style={{ fontFamily:UI, fontWeight:600, fontSize:10, letterSpacing:"0.2em",
        textTransform:"uppercase", color:TEAL, borderLeft:`2px solid ${TEAL}`,
        paddingLeft:12, marginBottom:16 }}>Forge OS · Engineering Bay</div>

      <h1 style={{ fontFamily:DISPLAY, fontWeight:900, fontSize:"clamp(26px,3.6vw,40px)",
        letterSpacing:"-0.03em", lineHeight:0.98, margin:"0 0 10px" }}>
        Nothing is manufactured against an <span style={{ color:PINK }}>unapproved specification</span>.
      </h1>
      <p style={{ color:"rgba(245,241,233,0.72)", fontSize:14.5, maxWidth:680,
        lineHeight:1.6, margin:"0 0 8px" }}>
        Every action here passes four gates: the record must be complete, the actor must be
        permitted, the manufacturing domain must allow it, and the document must be in a state
        that admits the transition. Refusals name the rule.
      </p>
      <div style={{ fontFamily:UI, fontWeight:700, fontSize:9, letterSpacing:"0.2em",
        textTransform:"uppercase", color:MUTED, marginBottom:28 }}>
        Demo mode · seed specifications · not operational
      </div>

      {/* acting-as: two competency levels, so the rules can be seen working */}
      <Label>Acting as</Label>
      <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:28 }}>
        {ACTORS.map((a) => (
          <button key={a.id} type="button" onClick={() => { setActorId(a.id); setRefusal(null); }}
            style={{ fontFamily:UI, fontWeight:700, fontSize:11, letterSpacing:"0.08em",
              padding:"10px 14px", cursor:"pointer", border:"none", clipPath:FORGE_CLIPS.buttonSm,
              background: a.id===actorId ? TEAL : "transparent",
              color: a.id===actorId ? BLACK : MUTED,
              boxShadow: a.id===actorId ? "none" : `inset 0 0 0 1px ${BORDER}` }}>
            {a.name}
            <span style={{ display:"block", fontSize:9, letterSpacing:"0.12em",
              opacity:.8, marginTop:3 }}>{a.competencies[0]}</span>
          </button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(330px,1fr))", gap:20 }}>

        {/* CONTROLLED DOCUMENTS */}
        <div>
          <Label>Controlled documents</Label>
          {specs.map((s) => {
            const on = s.id === selected;
            const c = STATE_COLOR[s.state] ?? MUTED;
            return (
              <div key={s.id} onClick={() => { setSelected(s.id); setRefusal(null); }}
                style={{ clipPath:FORGE_CLIPS.panelBR, background: on ? "rgba(10,127,115,0.10)" : SURFACE,
                  boxShadow:`inset 0 0 0 1px ${on ? TEAL : BORDER}`, borderLeft:`3px solid ${c}`,
                  padding:"14px 16px", marginBottom:8, cursor:"pointer" }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:10, alignItems:"baseline" }}>
                  <span style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
                    <span style={{ fontFamily:MONO, fontSize:12, color:IVORY }}>{s.id}</span>
                    {on && <span style={{ fontFamily:UI, fontWeight:800, fontSize:8.5,
                      letterSpacing:"0.18em", textTransform:"uppercase", color:BLACK,
                      background:AMBER, padding:"2px 6px" }}>Active</span>}
                  </span>
                  <span style={{ fontFamily:UI, fontWeight:700, fontSize:9.5, letterSpacing:"0.14em",
                    textTransform:"uppercase", color:c, border:`1px solid ${c}`, padding:"3px 7px",
                    clipPath:FORGE_CLIPS.buttonSm }}>{s.state}</span>
                </div>
                <div style={{ fontFamily:UI, fontSize:12.5, color:"rgba(245,241,233,.8)", marginTop:6 }}>{s.title}</div>
                <div style={{ fontFamily:UI, fontSize:10.5, color:MUTED, marginTop:5 }}>
                  rev {s.revision} · authored by {ACTORS.find(a=>a.id===s.author)?.name ?? s.author}
                </div>
                <div style={{ fontFamily:UI, fontSize:10.5, color:MUTED, marginTop:4, fontStyle:"italic" }}>
                  {specificationState.means(s.state)}
                </div>
              </div>
            );
          })}
        </div>

        {/* ACTIONS — offered by the state engine, refused by rules */}
        <div>
          <Label>Current work item · {spec?.id}</Label>
          <div style={{ clipPath:FORGE_CLIPS.panelTR, background:SURFACE,
            borderTop:`2px solid ${TEAL}`, padding:"16px 18px" }}>

            {/* The Manufacturing State Engine, visible. Current glows,
                reachable illuminated, unreachable dimmed. */}
            <div style={{ marginBottom:16 }}>
              <StateGraph machine={specificationState} current={spec?.state} order={SPEC_ORDER} />
              <div style={{ fontFamily:UI, fontSize:11.5, color:MUTED, marginTop:9, fontStyle:"italic" }}>
                {specificationState.means(spec?.state)}
              </div>
            </div>
            {available.length === 0 ? (
              <div style={{ fontFamily:UI, fontSize:13, color:MUTED }}>
                {spec?.state} is terminal. This document is closed.
              </div>
            ) : (
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {available.map((t) => (
                  <button key={t} type="button" onClick={() => act(t)}
                    style={{ fontFamily:UI, fontWeight:700, fontSize:11, letterSpacing:"0.1em",
                      textTransform:"uppercase", padding:"11px 16px", cursor:"pointer", border:"none",
                      clipPath:FORGE_CLIPS.button, background:AMBER, color:BLACK }}>
                    {ACTION_LABEL[t] ?? t}
                  </button>
                ))}
              </div>
            )}

            {impossible.length > 0 && (
              <div style={{ marginTop:16 }}>
                <div style={{ fontFamily:UI, fontWeight:600, fontSize:9.5, letterSpacing:"0.16em",
                  textTransform:"uppercase", color:MUTED, marginBottom:7 }}>
                  Impossible from {spec?.state}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {impossible.map((t) => (
                    <span key={t} style={{ fontFamily:MONO, fontSize:10, color:MUTED,
                      border:`1px dashed ${BORDER}`, padding:"3px 7px" }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* REFUSALS — industrial phrasing, never "validation failed" */}
          {refusal && (
            <div style={{ clipPath:FORGE_CLIPS.panelBR, background:"rgba(255,46,99,0.08)",
              border:`1px solid ${PINK}`, padding:"14px 16px", marginTop:12 }}>
              <div style={{ fontFamily:UI, fontWeight:700, fontSize:10, letterSpacing:"0.18em",
                textTransform:"uppercase", color:PINK, marginBottom:8 }}>
                {refusal.kind === "constraint" ? "Manufacturing constraint"
                  : refusal.kind === "policy" ? "Not permitted"
                  : refusal.kind === "state" ? "Transition not available" : "Refused"}
              </div>
              {refusal.violations ? refusal.violations.map((v) => (
                <div key={v.id} style={{ marginBottom:8 }}>
                  <div style={{ fontFamily:UI, fontSize:13, color:IVORY, lineHeight:1.5 }}>{v.because}</div>
                  <div style={{ fontFamily:MONO, fontSize:10.5, color:AMBER, marginTop:3 }}>Rule {v.code}</div>
                </div>
              )) : (
                <div style={{ fontFamily:UI, fontSize:13, color:IVORY, lineHeight:1.5 }}>{refusal.message}</div>
              )}
            </div>
          )}
        </div>

        {/* THREE LAYERS */}
        <div>
          <Label>Event · consequence · decision</Label>
          <div style={{ clipPath:FORGE_CLIPS.panelBR, background:SURFACE,
            borderTop:`2px solid ${chain.length ? GREEN : BORDER}`, padding:"16px 18px" }}>
            {chain.length === 0 ? (
              <div style={{ fontFamily:UI, fontSize:12.5, color:MUTED, fontStyle:"italic" }}>
                Act on a specification. Forge OS will show what happened, what changed,
                and what it recommends next.
              </div>
            ) : chain.map((c) => (
              <div key={c.at} style={{ marginBottom:16, paddingBottom:14,
                borderBottom:`1px solid ${BORDER}` }}>
                {/* EVENT */}
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontFamily:UI, fontWeight:800, fontSize:8.5, letterSpacing:"0.2em",
                    textTransform:"uppercase", color:BLACK, background:TEAL, padding:"3px 7px" }}>Event</span>
                  <span style={{ fontFamily:MONO, fontSize:11, color:TEAL }}>{c.event}</span>
                </div>
                <div style={{ fontFamily:UI, fontSize:13, color:IVORY, margin:"7px 0 0 2px" }}>{c.summary}</div>

                {/* CONSEQUENCE — the transition, drawn */}
                <div style={{ marginTop:12, paddingLeft:12, borderLeft:`2px solid ${AMBER}` }}>
                  <span style={{ fontFamily:UI, fontWeight:800, fontSize:8.5, letterSpacing:"0.2em",
                    textTransform:"uppercase", color:AMBER }}>Consequence</span>
                  <div style={{ display:"flex", alignItems:"center", gap:9, marginTop:6, flexWrap:"wrap" }}>
                    <span style={{ fontFamily:MONO, fontSize:11.5, color:IVORY }}>{c.subject}</span>
                    <span style={{ fontFamily:UI, fontWeight:700, fontSize:10, letterSpacing:"0.12em",
                      textTransform:"uppercase", color:MUTED }}>{c.fromState}</span>
                    <span style={{ color:AMBER, fontSize:13 }}>→</span>
                    <span style={{ fontFamily:UI, fontWeight:800, fontSize:10, letterSpacing:"0.12em",
                      textTransform:"uppercase", color:BLACK, background:AMBER, padding:"3px 7px" }}>{c.toState}</span>
                  </div>
                </div>

                {/* DECISION */}
                <div style={{ marginTop:12, paddingLeft:12, borderLeft:`2px solid ${GREEN}` }}>
                  <span style={{ fontFamily:UI, fontWeight:800, fontSize:8.5, letterSpacing:"0.2em",
                    textTransform:"uppercase", color:GREEN }}>Decision</span>
                  <div style={{ fontFamily:UI, fontSize:12.5, color:"rgba(245,241,233,.85)",
                    marginTop:6, lineHeight:1.5 }}>{c.decision}</div>
                </div>

                {c.eventId && (
                  <div style={{ fontFamily:MONO, fontSize:9, color:MUTED, marginTop:10, opacity:.7 }}>
                    {c.eventId}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* THE RIPPLE — no page change, no reload. These read the same fold
              the Operations Centre reads, so what changes here changes there. */}
          <div style={{ marginTop:18 }}>
            <Label>Operating system response</Label>
            <div style={{ clipPath:FORGE_CLIPS.panelBR, background:SURFACE,
              borderTop:`2px solid ${AMBER}`, padding:"16px 18px" }}>
              {view.missions.map((m) => (
                <div key={m.id} style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", gap:10, alignItems:"baseline" }}>
                    <span style={{ fontFamily:MONO, fontSize:11, color:IVORY }}>{m.id}</span>
                    <span style={{ fontFamily:UI, fontWeight:700, fontSize:10, letterSpacing:"0.12em",
                      textTransform:"uppercase", color:TEAL }}>{m.state}</span>
                  </div>
                  <div style={{ fontFamily:UI, fontSize:11.5, color:MUTED, marginTop:3 }}>{m.title}</div>
                  <div style={{ height:4, background:BORDER, marginTop:8 }}>
                    <div style={{ width:`${m.progress}%`, height:"100%", background:AMBER }} />
                  </div>
                  <div style={{ fontFamily:UI, fontSize:10.5, color:MUTED, marginTop:5 }}>
                    {m.accepted} of {m.target} accepted · {m.progress}%
                  </div>
                </div>
              ))}

              <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:12, marginTop:4 }}>
                <div style={{ fontFamily:UI, fontWeight:600, fontSize:9.5, letterSpacing:"0.16em",
                  textTransform:"uppercase", color:TEAL, marginBottom:8 }}>
                  Forge OS recommends · {view.recommendations.length}
                </div>
                {view.recommendations.length === 0 ? (
                  <div style={{ fontFamily:UI, fontSize:12, color:MUTED, fontStyle:"italic" }}>
                    Nothing outstanding.
                  </div>
                ) : view.recommendations.slice(0, 4).map((r) => {
                  const c = r.severity === "critical" ? PINK : r.severity === "warning" ? AMBER : TEAL;
                  return (
                    <div key={r.id} style={{ display:"flex", gap:9, padding:"6px 0" }}>
                      <span style={{ width:6, height:6, background:c, marginTop:6, flexShrink:0,
                        transform:"rotate(45deg)" }} />
                      <span style={{ fontFamily:UI, fontSize:12, color:"rgba(245,241,233,.85)",
                        lineHeight:1.45 }}>{r.message}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ marginTop:18 }}>
            <Label>Operations feed</Label>
            <div style={{ clipPath:FORGE_CLIPS.panelTR, background:SURFACE,
              borderTop:`2px solid ${BORDER}`, padding:"14px 16px" }}>
              <OperationsFeed rows={view.feed} limit={8}
                empty="No operations recorded yet. Act on a specification above." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
