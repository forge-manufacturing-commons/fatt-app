// ============================================================
// FORGE OS — NATIONAL MANUFACTURING GRID
//
// This room is the proof that the kernel is reusable. It introduces ZERO
// bespoke infrastructure: no local palette, no local status colours, no
// local shell, no local feed, no local statistic component, no locally
// stored manufacturing state.
//
// Everything below is composition:
//   RoomShell      identity + operating principle      @kernel/console
//   Stat           projection-driven statistics        @kernel/console
//   NetworkSurface capability network                  @kernel/console
//   OperationsFeed the one shared feed                 @kernel/OperationsFeed
//   project()      manufacturing state, derived        @kernel/projections
//   stateColor()   one semantic state->colour mapping  @kernel/forge
//   T / FONT       canonical tokens                    @kernel/forge
//
// Every number is counted from the event log. Where nothing is known, Stat
// renders "Not surveyed" rather than inventing a figure — the grid reports
// national capability, so a fabricated number here would be the most
// damaging kind.
// ============================================================

import { useMemo } from "react";
import { useForgeActivity } from "@kernel/ActivityEngine.jsx";
import { project } from "@kernel/projections.js";
import { MISSIONS } from "@kernel/missions.js";
import { RoomShell, Label, Panel, Stat, Badge, NetworkSurface } from "@kernel/console.jsx";
import OperationsFeed from "@kernel/OperationsFeed.jsx";
import { T, FONT, S, stateColor, severityColor } from "@kernel/forge.js";

export default function NationalGrid() {
  const { log, hubStates } = useForgeActivity();
  const view = useMemo(() => project(log, MISSIONS), [log]);

  const hubs = Object.entries(hubStates || {});
  const nodes = hubs.map(([id, state]) => ({ id, state }));

  const comps = Object.values(view.components);
  const specs = Object.values(view.specifications);

  // Counted, never asserted.
  const activeMissions = view.missions.filter((m) => m.state !== "closed").length;
  const inProduction   = comps.filter((c) => ["manufacturing", "inspection"].includes(c.state)).length;
  const accepted       = comps.filter((c) => ["assembly", "completed", "installed"].includes(c.state)).length;
  const constraints    = view.recommendations.filter((r) => r.severity === "critical").length;
  const released       = specs.filter((s) => s.state === "released").length;
  const people         = new Set((log || []).map((e) => e.human).filter(Boolean)).size;
  const workshops      = new Set((log || []).map((e) => e.workshop).filter(Boolean)).size;

  return (
    <RoomShell
      roomId="national-grid"
      kicker="Forge OS · National Manufacturing Grid"
      title="Nigeria's manufacturing"
      accent="nervous system."
      lede="Every figure on this surface is counted from the event log. Nothing is hardcoded, and where the network has not been surveyed the grid says so rather than estimating."
      meta="Demo mode · seed data · not operational"
    >
      <Label>National capability</Label>
      <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:S.xl }}>
        <Stat value={hubs.length || null}      label="Connected hubs"    note="Reporting to the bus" />
        <Stat value={workshops || null}        label="Workshops"          note="Seen in the stream" />
        <Stat value={people || null}           label="People connected"   note="Named in events" />
        <Stat value={activeMissions}           label="Active missions"    note="Not yet closed" accent={T.amber} />
        <Stat value={released}                 label="Released specs"     note="Cleared for manufacture" accent={T.green} />
        <Stat value={inProduction}             label="In production"      note="Being made or inspected" accent={T.amber} />
        <Stat value={accepted}                 label="Accepted"           note="Through verification" accent={T.green} />
        <Stat value={constraints}              label="Critical constraints"
              note={constraints ? "Require intervention" : "None outstanding"}
              accent={constraints ? T.pink : T.teal} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(330px,1fr))", gap:S.lg }}>
        <div style={{ gridColumn:"1 / -1" }}>
          <Label>Live manufacturing network</Label>
          <NetworkSurface nodes={nodes} label={`${hubs.length} hubs reporting · state-coloured from the kernel`} />
        </div>

        <div>
          <Label>Mission progress</Label>
          <Panel accent={T.amber}>
            {view.missions.map((m) => (
              <div key={m.id} style={{ marginBottom:S.md }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:10, alignItems:"baseline" }}>
                  <span style={{ fontFamily:FONT.mono, fontSize:11, color:T.ivory }}>{m.id}</span>
                  <Badge color={stateColor(m.state)}>{m.state}</Badge>
                </div>
                <div style={{ fontFamily:FONT.ui, fontSize:11.5, color:T.grey, marginTop:3 }}>{m.title}</div>
                <div style={{ height:4, background:T.border, marginTop:S.sm }}>
                  <div style={{ width:`${m.progress}%`, height:"100%", background:T.amber }} />
                </div>
                <div style={{ fontFamily:FONT.ui, fontSize:10.5, color:T.grey, marginTop:5 }}>
                  {m.accepted} of {m.target} accepted · {m.progress}%
                </div>
              </div>
            ))}
          </Panel>
        </div>

        <div>
          <Label>Forge OS recommends</Label>
          <Panel variant="panelTR" accent={view.recommendations.length ? T.amber : T.teal}>
            {view.recommendations.length === 0 ? (
              <div style={{ fontFamily:FONT.ui, fontSize:12.5, color:T.grey, fontStyle:"italic" }}>
                Nothing outstanding across the national grid.
              </div>
            ) : view.recommendations.slice(0, 6).map((r) => (
              <div key={r.id} style={{ display:"flex", gap:9, padding:"7px 0",
                borderBottom:`1px solid ${T.border}` }}>
                <span style={{ width:6, height:6, background:severityColor(r.severity), marginTop:6,
                  flexShrink:0, transform:"rotate(45deg)" }} />
                <span style={{ fontFamily:FONT.ui, fontSize:12, color:T.ivory70, lineHeight:1.45 }}>
                  {r.message}
                </span>
              </div>
            ))}
          </Panel>
        </div>

        <div style={{ gridColumn:"1 / -1" }}>
          <Label>Operations feed</Label>
          <Panel accent={T.border}>
            <OperationsFeed rows={view.feed} limit={20}
              empty="No national activity recorded yet." />
          </Panel>
        </div>
      </div>
    </RoomShell>
  );
}
