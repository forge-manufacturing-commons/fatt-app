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

import { useMemo } from "react";
import { useForgeActivity } from "@kernel/ActivityEngine.jsx";
import { project } from "@kernel/projections.js";
import { MISSIONS } from "@kernel/missions.js";
import { RoomShell, Label, Panel, Stat, Badge, NetworkSurface } from "@kernel/console.jsx";
import OperationsFeed from "@kernel/OperationsFeed.jsx";
import { T, FONT, S, stateColor, severityColor } from "@kernel/forge.js";

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
  const { log, hubStates, machineStates } = useForgeActivity();
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
      {/* SITUATION */}
      <Label>Situation</Label>
      <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:S.lg }}>
        <Stat value={health.toUpperCase()} label="System health"
              note={critical ? `${critical} critical constraint(s)` : "No critical constraints"}
              accent={healthColor} />
        <Stat value={hubs.length || null}   label="Hubs reporting"   note="Live on the bus" />
        <Stat value={machines.length || null} label="Machines"       note="Seen in the stream" />
        <Stat value={inProduction}          label="In production"    note="Being made or inspected" accent={T.amber} />
        <Stat value={accepted}              label="Accepted"         note="Through verification" accent={T.green} />
        <Stat value={awaiting}              label="Awaiting review"  note="Blocking production" accent={T.amber} />
        <Stat value={released}              label="Released specs"   note="Cleared to manufacture" accent={T.green} />
        <Stat value={view.anomalies.length} label="Anomalies"
              note={view.anomalies.length ? "Impossible transitions" : "None detected"}
              accent={view.anomalies.length ? T.pink : T.teal} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))", gap:S.lg }}>

        {/* DECISIONS — every recommendation explains itself */}
        <div>
          <Label>Decisions · Forge OS recommends</Label>
          <Panel accent={view.recommendations.length ? T.amber : T.teal}>
            {view.recommendations.length === 0 ? (
              <div style={{ fontFamily:FONT.ui, fontSize:12.5, color:T.grey, fontStyle:"italic" }}>
                Nothing outstanding. The network is proceeding without intervention.
              </div>
            ) : view.recommendations.slice(0, 6).map((r) => (
              <div key={r.id} style={{ padding:"10px 0", borderBottom:`1px solid ${T.border}` }}>
                <div style={{ display:"flex", gap:9, alignItems:"flex-start" }}>
                  <span style={{ width:6, height:6, background:severityColor(r.severity), marginTop:6,
                    flexShrink:0, transform:"rotate(45deg)" }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:FONT.ui, fontWeight:700, fontSize:12.5,
                      color:T.ivory, lineHeight:1.45 }}>{r.message}</div>
                    {r.because?.length > 0 && (
                      <div style={{ marginTop:6, paddingLeft:10, borderLeft:`1px solid ${T.border}` }}>
                        <div style={{ fontFamily:FONT.ui, fontWeight:700, fontSize:8.5,
                          letterSpacing:"0.18em", textTransform:"uppercase",
                          color:severityColor(r.severity), marginBottom:4 }}>Reason</div>
                        {r.because.map((line, i) => (
                          <div key={i} style={{ fontFamily:FONT.ui, fontSize:10.5, color:T.grey,
                            lineHeight:1.55 }}>{line}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Badge color={severityColor(r.severity)}>{r.severity}</Badge>
                </div>
              </div>
            ))}
          </Panel>
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
