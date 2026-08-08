// ============================================================
// FORGE OS — NATIONAL MANUFACTURING OPERATIONS CENTRE
//
// Not a dashboard. A dashboard reports; an operations centre directs. This
// room shows the whole manufacturing picture folded from one event log, and
// every recommendation states WHY it was made.
//
// Zero bespoke infrastructure. Composition only:
//   RoomShell / Stat / Panel / Badge / NetworkSurface   @kernel/console
//   OperationsFeed                                      @kernel/OperationsFeed
//   project()                                           @kernel/projections
//   stateColor() / severityColor() / tokens             @kernel/forge
//
// It reads the SAME fold as the Engineering Bay and the National Grid, so a
// decision taken there is visible here without this room being told.
// ============================================================

import { useMemo, useRef, useState } from "react";
import { useForgeActivity } from "@kernel/ActivityEngine.jsx";
import { project } from "@kernel/projections.js";
import { MISSIONS } from "@kernel/missions.js";
import { RoomShell, Label, Panel, Stat, Badge, NetworkSurface, Recommendation } from "@kernel/console.jsx";
import OperationsFeed from "@kernel/OperationsFeed.jsx";
import { T, FONT, S, FORGE_CLIPS, stateColor, severityColor } from "@kernel/forge.js";
import { MANUFACTURING_STORY, STORY_META } from "@kernel/story.js";
import RippleIndicator from "@kernel/ripple/RippleIndicator.jsx";
import { CausalChain, CausalInspector, useCausalInspector } from "@kernel/causality/CausalChain.jsx";

export const CONTRACT = {
  roomId: "control-room",
  principle: true,
  roomShell: true,
  projection: "manufacturing",
  feed: true,
  recommendations: true,
  stateEngine: false,
  rules: false,
  policy: false,
  events: "canonical",
};

export default function OperationsCentre() {
  const { log, hubStates, machineStates, publish } = useForgeActivity();
  const insp = useCausalInspector();
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const timers = useRef([]);

  // One button. Thirteen real events on the real bus, 2.6s apart. Every
  // consequence below is derived — nothing is animated into place.
  function runStory() {
    if (running) return;
    setRunning(true); setStep(0);
    timers.current.forEach(clearTimeout);
    timers.current = MANUFACTURING_STORY.map((s, i) =>
      setTimeout(() => {
        publish(s.event);
        setStep(i + 1);
        if (i === MANUFACTURING_STORY.length - 1) setRunning(false);
      }, i * STORY_META.stepMs)
    );
  }
  const current = running && step > 0 ? MANUFACTURING_STORY[step - 1] : null;
  const view = useMemo(() => project(log, MISSIONS), [log]);

  const hubs = Object.entries(hubStates || {});
  const machines = Object.entries(machineStates || {});
  const comps = Object.values(view.components);
  const specs = Object.values(view.specifications);

  // Health is derived, and weighted — one fault does not make a nation critical.
  const faulted = machines.filter(([, s]) => s === "maintenance").length;
  const critical = view.recommendations.filter((r) => r.severity === "critical").length;
  const health = critical > 0 ? "critical"
    : faulted > Math.max(1, machines.length * 0.25) ? "degraded"
    : "nominal";
  const healthColor = health === "critical" ? T.pink : health === "degraded" ? T.amber : T.green;


  const inProduction = comps.filter((c) => ["manufacturing", "inspection"].includes(c.state)).length;
  const accepted = comps.filter((c) => ["assembly", "completed", "installed"].includes(c.state)).length;
  const awaiting = specs.filter((s) => s.state === "review").length;
  const released = specs.filter((s) => s.state === "released").length;

  return (
    <RoomShell
      roomId="control-room"
      kicker="Forge OS · National Manufacturing Operations Centre"
      title="Every manufacturing decision is"
      accent="traceable."
      lede="One event log, folded into the national operating picture. Nothing on this screen is stored here — it is derived, which is why a decision taken in the Engineering Bay appears here without this room being notified."
      meta="Demo mode · seed data · not operational"
    >
      <RippleIndicator domain="operations" />
      <CausalInspector consequence={insp.selected} onClose={insp.close} />

      {/* ONE MANUFACTURING STORY */}
      <div style={{ clipPath:FORGE_CLIPS.panelBR, background:T.surface,
        borderTop:`2px solid ${running ? T.amber : T.teal}`, padding:"18px 20px",
        marginBottom:S.lg }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline",
          gap:12, flexWrap:"wrap" }}>
          <div>
            <div style={{ fontFamily:FONT.ui, fontWeight:700, fontSize:9.5,
              letterSpacing:"0.2em", textTransform:"uppercase", color:T.teal }}>
              {STORY_META.mission} · mission demonstration
            </div>
            <div style={{ fontFamily:FONT.ui, fontSize:13, color:T.ivory, marginTop:4 }}>
              A chassis rail from specification to acceptance — including a failed inspection.
            </div>
          </div>
          {running && (
            <div style={{ fontFamily:FONT.mono, fontSize:11, color:T.amber }}>
              step {step} / {STORY_META.steps}
            </div>
          )}
        </div>

        {current && (
          /* Industrial status, not prose. Operators scan; they do not read. */
          <div style={{ background:T.black, padding:"12px 14px", margin:`${S.md}px 0`,
            borderLeft:`2px solid ${T.amber}`, display:"grid",
            gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12 }}>
            {[["Current operation", current.title],
              ["Object", current.event.component || current.event.specification
                       || current.event.machine || current.event.mission || "—"],
              ["Location", (current.event.hub || "—").toString().toUpperCase()],
              ["Next action", current.description]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontFamily:FONT.ui, fontWeight:700, fontSize:8,
                  letterSpacing:"0.18em", textTransform:"uppercase", color:T.grey }}>{k}</div>
                <div style={{ fontFamily:FONT.ui, fontWeight:700, fontSize:12, color:T.ivory,
                  marginTop:3, lineHeight:1.35 }}>{v}</div>
              </div>
            ))}
          </div>
        )}

        {running && (
          <div style={{ height:3, background:T.border, marginBottom:S.md }}>
            <div style={{ width:`${(step / STORY_META.steps) * 100}%`, height:"100%",
              background:T.amber, transition:"width .5s linear" }} />
          </div>
        )}

        <button type="button" onClick={runStory} disabled={running}
          style={{ width:"100%", fontFamily:FONT.ui, fontWeight:800, fontSize:11.5,
            letterSpacing:"0.15em", textTransform:"uppercase", padding:"13px 22px",
            border:"none", clipPath:FORGE_CLIPS.button,
            background: running ? T.border : T.amber, color: running ? T.greyDark : T.black,
            cursor: running ? "default" : "pointer" }}>
          {running ? `Mission in progress · ${step}/${STORY_META.steps}`
                   : "Run one manufacturing story →"}
        </button>

      </div>

      {/* PRIMARY DIRECTIVE — the brightest object on the screen. If Forge OS is
          making operational decisions, the decision outranks the statistics that
          informed it. The KPIs below support this; they no longer compete with it. */}
      {view.recommendations[0] && (
        <div style={{ marginBottom:S.lg }}>
          <div style={{ clipPath:FORGE_CLIPS.panelBR, background:T.surface,
            borderTop:`3px solid ${severityColor(view.recommendations[0].severity)}`,
            boxShadow:`inset 0 0 0 1px ${severityColor(view.recommendations[0].severity)}33`,
            padding:"20px 24px" }}>
            <Recommendation rec={view.recommendations[0]} />
            {view.recommendations.length > 1 && (
              <div style={{ fontFamily:FONT.ui, fontWeight:700, fontSize:9,
                letterSpacing:"0.16em", textTransform:"uppercase", color:T.grey, marginTop:12 }}>
                {view.recommendations.length - 1} further directive(s) below
              </div>
            )}
          </div>
        </div>
      )}

      {/* SITUATION — supporting evidence for the directive above */}
      <Label>Situation</Label>
      <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:S.lg }}>
        <Stat value={health.toUpperCase()} label="System health"
              note={critical ? `${critical} critical constraint(s)` : "No critical constraints"}
              accent={healthColor} order={0} metric="health" consequences={view.consequences} />
        <Stat value={hubs.length || null}   label="Hubs reporting"   note="Live on the bus" order={1} metric="hubs" consequences={view.consequences} />
        <Stat value={machines.length || null} label="Machines"       note="Seen in the stream" order={2} metric="machines" consequences={view.consequences} />
        <Stat value={inProduction}          label="In production"    note="Being made or inspected" accent={T.amber} order={3} metric="in-production" consequences={view.consequences} />
        <Stat value={accepted}              label="Accepted"         note="Through verification" accent={T.green} order={4} metric="accepted" consequences={view.consequences} />
        <Stat value={awaiting}              label="Awaiting review"  note="Blocking production" accent={T.amber} order={5} metric="awaiting-review" consequences={view.consequences} />
        <Stat value={released}              label="Released specs"   note="Cleared to manufacture" accent={T.green} order={6} metric="released-specs" consequences={view.consequences} />
        <Stat value={view.anomalies.length} label="Anomalies"
              note={view.anomalies.length ? "Impossible transitions" : "None detected"}
              accent={view.anomalies.length ? T.pink : T.teal} order={7} metric="anomalies" consequences={view.consequences} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))", gap:S.lg }}>

        {/* DECISIONS — every recommendation explains itself */}
        <div>
          <Label>Decisions · Forge OS recommends</Label>
          <Panel accent={view.recommendations.length ? T.amber : T.teal}>
            {view.recommendations.length <= 1 ? (
              <div style={{ fontFamily:FONT.ui, fontSize:12.5, color:T.grey, fontStyle:"italic" }}>
                {view.recommendations.length === 0
                  ? "Nothing outstanding. The network is proceeding without intervention."
                  : "No further directives."}
              </div>
            ) : view.recommendations.slice(1, 5).map((r) => (
              <Recommendation key={r.id} rec={r} />
            ))}
          </Panel>
        </div>

        {/* CAUSAL CHAIN — what caused what. Click any fact to trace it. */}
        <div>
          <Label>Causation</Label>
          {view.consequences?.length ? (
            <CausalChain consequences={view.consequences} limit={6}
              correlationId={view.consequences[0]?.correlationId}
              onInspect={insp.inspect} />
          ) : (
            <Panel accent={T.border}>
              <div style={{ fontFamily:FONT.ui, fontSize:12.5, color:T.grey, fontStyle:"italic" }}>
                No derived consequences yet. Run the story, then click any fact to
                trace it back to the event that caused it.
              </div>
            </Panel>
          )}
        </div>

        {/* WORK IN PROGRESS — components with their live state */}
        <div>
          <Label>Components under way</Label>
          <Panel variant="panelTR" accent={T.teal}>
            {comps.length === 0 ? (
              <div style={{ fontFamily:FONT.ui, fontSize:12.5, color:T.grey, fontStyle:"italic" }}>
                No components in the stream yet.
              </div>
            ) : comps.slice(0, 8).map((c) => (
              <div key={c.id} style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", gap:10, padding:"8px 0", borderBottom:`1px solid ${T.border}` }}>
                <span style={{ fontFamily:FONT.mono, fontSize:11.5, color:T.ivory }}>{c.id}</span>
                <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {c.specification && (
                    <span style={{ fontFamily:FONT.mono, fontSize:10, color:T.grey }}>{c.specification}</span>
                  )}
                  <Badge color={stateColor(c.state)} filled>{c.state}</Badge>
                </span>
              </div>
            ))}
          </Panel>
        </div>

        {/* MISSIONS */}
        <div>
          <Label>Missions</Label>
          <Panel accent={T.amber}>
            {view.missions.map((m) => (
              <div key={m.id} style={{ marginBottom:S.md }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:10, alignItems:"baseline" }}>
                  <span style={{ fontFamily:FONT.mono, fontSize:11, color:T.ivory }}>{m.id}</span>
                  <Badge color={stateColor(m.state)}>{m.state}</Badge>
                </div>
                <div style={{ fontFamily:FONT.ui, fontSize:11.5, color:T.grey, marginTop:3 }}>{m.title}</div>
                <div style={{ height:4, background:T.border, marginTop:S.sm }}>
                  <div style={{ width:`${m.progress}%`, height:"100%", background:T.amber,
                    transition:"width .6s cubic-bezier(.16,1,.3,1)" }} />
                </div>
                <div style={{ fontFamily:FONT.ui, fontSize:10.5, color:T.grey, marginTop:5 }}>
                  {m.accepted} of {m.target} accepted · {m.progress}%
                </div>
              </div>
            ))}
          </Panel>
        </div>

        {/* NETWORK */}
        <div>
          <Label>Capability network</Label>
          <NetworkSurface nodes={hubs.map(([id, state]) => ({ id, state }))} height={300}
            label={`${hubs.length} hubs · state-coloured from the kernel`} />
        </div>

        {/* THE ONE SHARED FEED */}
        <div style={{ gridColumn:"1 / -1" }}>
          <Label>Operations feed</Label>
          <Panel accent={T.border}>
            <OperationsFeed rows={view.feed} limit={18}
              empty="No operations recorded yet." />
          </Panel>
        </div>
      </div>
    </RoomShell>
  );
}
