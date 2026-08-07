// ============================================================
// FORGE OS — DEMO STUDIO  (room 17)
//
// The executable reference room. It proves the full pipeline that
// already exists in this project, end to end:
//
//   Button -> publish() -> ActivityEngine (event bus)
//          -> derived hub/machine states
//          -> buildRuntime() (Runtime Engine / operating picture)
//          -> live UI
//
// It authors nothing of its own. Every panel is derived from the
// Activity Engine and the Runtime Engine. The one button publishes
// real, canonical EVENT-shaped events through the same bus every
// other room reads — the factory reacts because work happened.
//
// This is also the first place buildRuntime() from ForgeRuntime.js
// is wired into a live view. Until now the Runtime Engine existed
// but nothing rendered it.
// ============================================================

import { useCallback, useMemo, useRef, useState } from "react";
import { stateColor } from "../os/forge.js";
import Room from "../os/Room.jsx";
import { useForgeActivity, EVENT } from "../os/ActivityEngine.jsx";
import { buildRuntime } from "../os/ForgeRuntime.js";

const STEP_MS = 900;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// The reference workflow, expressed in this project's real event vocabulary and
// event shape. Each step publishes one canonical event onto the live bus.
const WORKFLOW = [
  { key: "drawing", label: "Drawing Approved",
    event: { type: EVENT.DRAWING_APPROVED, hub: "ilorin", machine: "workbench", component: "DEMO-777",
             human: "Malcolm", role: "ENGINEER", variant: "M", workshop: "Demo Cell", text: "Demo bracket drawing approved" } },
  { key: "received", label: "Component Received",
    event: { type: EVENT.COMPONENT_RECEIVED, hub: "nnewi", machine: "lathe", component: "DEMO-777",
             human: "Malcolm", role: "ENGINEER", variant: "M", workshop: "Demo Cell", text: "Demo blank received" } },
  { key: "started", label: "Machine Started",
    event: { type: EVENT.MACHINE_STARTED, hub: "warri", machine: "migWelder", component: "DEMO-777",
             human: "Adaeze Okoro", role: "WELDER", variant: "F", workshop: "Demo Cell", text: "Demo weld started" } },
  { key: "inspected", label: "Inspection Completed",
    event: { type: EVENT.INSPECTION_COMPLETED, hub: "aba", machine: "inspectionTable", component: "DEMO-777",
             human: "Uche Chikelu", role: "INSPECTOR", variant: "M", workshop: "Demo Cell", text: "Demo inspection completed" } },
  { key: "verified", label: "Quality Verified",
    event: { type: EVENT.QUALITY_VERIFIED, hub: "lagos", machine: "inspectionTable", component: "DEMO-777",
             human: "Amina Suleiman", role: "INSPECTOR", variant: "F", workshop: "Forge Quality Office", text: "Demo part verified" } },
  { key: "dispatched", label: "Shipment Dispatched",
    event: { type: EVENT.SHIPMENT_DISPATCHED, hub: "portharcourt", machine: "forklift", component: "DEMO-777",
             human: "Yusuf Musa", role: "ENGINEER", variant: "M", workshop: "Demo Cell", text: "Demo part dispatched to assembly" } },
  { key: "stopped", label: "Machine Stopped",
    event: { type: EVENT.MACHINE_STOPPED, hub: "warri", machine: "migWelder", component: "DEMO-777",
             human: "Adaeze Okoro", role: "WELDER", variant: "F", workshop: "Demo Cell", text: "Demo weld complete" } },
];

const shortTime = (at) => { try { return new Date(at).toLocaleTimeString([], { hour12: false }); } catch { return ""; } };

const box = { border: "1px solid rgba(255,255,255,.14)", borderRadius: 10, padding: 14, background: "rgba(255,255,255,.03)" };
const h = { fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", opacity: .6, margin: "0 0 10px" };
const row = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 13, padding: "3px 0" };
const dot = (c) => ({ width: 8, height: 8, borderRadius: 999, background: c, display: "inline-block", marginRight: 8 });

function Panel({ title, children }) {
  return <div style={box}><div style={h}>{title}</div>{children}</div>;
}

export default function DemoStudio() {
  const { event, log, hubStates, machineStates, publish } = useForgeActivity();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState([]);
  const [active, setActive] = useState(null);
  const busy = useRef(false);

  const run = useCallback(async () => {
    if (busy.current) return;
    busy.current = true; setRunning(true); setDone([]); setActive(null);
    for (const step of WORKFLOW) {
      setActive(step.key);
      publish(step.event);
      setDone((d) => [...d, step.key]);
      await wait(STEP_MS);
    }
    setActive(null); setRunning(false); busy.current = false;
  }, [publish]);

  // First live consumer of the Runtime Engine — the operating picture.
  const runtime = useMemo(
    () => buildRuntime({ event, log, hubStates, machineStates }),
    [event, log, hubStates, machineStates],
  );
  const ms = runtime.manufacturingStatus;

  return (
    <Room id="demo-studio">
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p className="forge-human" style={{ maxWidth: "62ch", opacity: .8, margin: 0 }}>
            One workflow through the whole runtime: the button publishes canonical events onto the
            live Activity Engine; hub and machine states derive from them; the Runtime Engine assembles
            the operating picture below. Nothing here is animated — it reacts because work happened.
          </p>
          <button
            onClick={run}
            disabled={running}
            className="forge-cta-primary"
            style={{ cursor: running ? "default" : "pointer", opacity: running ? .6 : 1, whiteSpace: "nowrap" }}
          >
            {running ? "Running…" : "▶ Run Manufacturing Workflow"}
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {WORKFLOW.map((step, i) => {
            const state = active === step.key ? "active" : done.includes(step.key) ? "done" : "idle";
            return (
              <span key={step.key} className="forge-technical" style={{
                padding: "5px 11px", borderRadius: 999, fontSize: 12,
                border: "1px solid " + (state === "active" ? "#1a7a4a" : "rgba(255,255,255,.18)"),
                background: state === "done" ? "rgba(47,158,68,.16)" : state === "active" ? "#1a7a4a" : "transparent",
                color: state === "active" ? "#0D0D0F" : "inherit",
              }}>{i + 1}. {step.label}</span>
            );
          })}
        </div>

        <Panel title="Manufacturing Status (Runtime Engine)">
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap", fontSize: 13 }}>
            <span>Active events: <b>{ms.activeEvents}</b></span>
            <span>Workshops: <b>{ms.workshops}</b></span>
            <span>People: <b>{ms.people}</b></span>
            <span>Machines: <b>{ms.machines}</b></span>
            <span>Components: <b>{ms.components}</b></span>
          </div>
        </Panel>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 }}>
          <Panel title="Machines (derived)">
            {Object.keys(machineStates).length
              ? Object.entries(machineStates).map(([id, st]) => (
                  <div key={id} style={row}>
                    <span><span style={dot(stateColor(st))} />{id}</span>
                    <span style={{ color: stateColor(st), fontWeight: 600, fontSize: 12 }}>{st}</span>
                  </div>
                ))
              : <div style={{ opacity: .5, fontSize: 12 }}>Press Run to bring machines under load.</div>}
          </Panel>

          <Panel title="Hubs (derived)">
            {Object.keys(hubStates).length
              ? Object.entries(hubStates).map(([id, st]) => (
                  <div key={id} style={row}>
                    <span><span style={dot(stateColor(st))} />{id}</span>
                    <span style={{ color: stateColor(st), fontWeight: 600, fontSize: 12 }}>{st}</span>
                  </div>
                ))
              : <div style={{ opacity: .5, fontSize: 12 }}>No hubs reporting yet.</div>}
          </Panel>

          <Panel title="Recommendations">
            {runtime.recommendations.length
              ? runtime.recommendations.map((r, i) => (
                  <div key={i} style={{ fontSize: 12, padding: "3px 0" }}>
                    <b>{r.station}</b> — {r.reason}
                  </div>
                ))
              : <div style={{ opacity: .5, fontSize: 12 }}>None</div>}
          </Panel>

          <Panel title="Languages (Runtime Engine)">
            {runtime.languages.map((l) => (
              <div key={l} style={row}><span><span style={dot("#0A7F73")} />{l}</span></div>
            ))}
          </Panel>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Panel title={`Forge Objects (${runtime.forgeObjects.length})`}>
            {runtime.forgeObjects.length
              ? runtime.forgeObjects.slice(0, 10).map((o, i) => (
                  <div key={i} style={row}>
                    <span><span style={dot("#3a4a5a")} />{o.id} · <span style={{ opacity: .6 }}>{o.class}</span></span>
                    <span style={{ fontSize: 12, opacity: .7 }}>{o.state}</span>
                  </div>
                ))
              : <div style={{ opacity: .5, fontSize: 12 }}>No objects yet.</div>}
          </Panel>

          <Panel title="Live Event Stream">
            {log.length
              ? <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 240, overflow: "auto" }}>
                  {log.slice(0, 12).map((e, i) => (
                    <div key={`${e.at}-${i}`} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: i === 0 ? 1 : .75 }}>
                      <span>{e.type}{e.text ? ` · ${e.text}` : ""}</span>
                      <span style={{ opacity: .5, whiteSpace: "nowrap", marginLeft: 10 }}>{shortTime(e.at)}</span>
                    </div>
                  ))}
                </div>
              : <div style={{ opacity: .5, fontSize: 12 }}>Awaiting activity.</div>}
          </Panel>
        </div>

        <p className="forge-technical" style={{ opacity: .5, fontSize: 11, margin: 0 }}>
          Note: the seed stream keeps publishing every few seconds, so the operating picture also
          reflects background factory activity alongside the demo events.
        </p>
      </div>
    </Room>
  );
}
