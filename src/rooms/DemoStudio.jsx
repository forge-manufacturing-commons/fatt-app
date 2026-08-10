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
// It authors no manufacturing state of its own. Every panel is derived
// from the Activity Engine and the Runtime Engine. The one button
// publishes real, canonical EVENT-shaped events through the same bus
// every other room reads — the factory reacts because work happened.
//
// PROJECTION: "harness" — NOT "activity". The distinction is the
// direction of causation, and it is the whole reason this room exists:
//
//   activity (ProductionLine):  bus -> derived state -> room observes
//   harness  (this room):       room publishes -> real bus
//                               -> runtime derives -> room observes
//
// A room may not claim "activity" while intentionally driving
// machine-bearing events to populate its own picture; that would make
// the observation circular. "harness" says the circularity is the point.
// The kernel audit enforces both halves and proves them mutually
// exclusive, so flipping this declaration back to "activity" fails.
//
// harness + useForgeActivity() + buildRuntime() is INTENTIONAL:
//   useForgeActivity()  the real bus — publish, log, hubStates, machineStates
//   buildRuntime()      the operating picture — manufacturingStatus,
//                       recommendations, languages, forgeObjects
// buildRuntime is NOT interchangeable with project(). It answers a
// different question and four panels below render only its output.
// src/rooms/ArrivalDock.jsx is also a live consumer of it.
// ============================================================

import { useCallback, useMemo, useRef, useState } from "react";
import Room from "../os/Room.jsx";
import { RoomShell, Label, Panel, Badge, Button } from "../os/console.jsx";
import { T, FONT, stateColor } from "../os/forge.js";
import { useForgeActivity, EVENT } from "../os/ActivityEngine.jsx";
import { buildRuntime } from "../os/ForgeRuntime.js";
import OperationsFeed from "../os/OperationsFeed.jsx";
import { feedTitle } from "../os/projections.js";

/**
 * PLATFORM CONTRACT — truthful.
 *
 * Reads:      useForgeActivity() -> log, hubStates, machineStates (the real bus)
 *             buildRuntime()     -> the operating picture
 * Publishes:  the seven canonical WORKFLOW events, deliberately, on demand
 * Principle:  PRINCIPLES["demo-studio"], displayed by RoomShell
 *
 * projection:"harness" — this room drives the bus and then observes the
 * consequence. state ✓ — machine and hub state are rendered through
 * stateColor(), the canonical mapping. causation ⊖ — the room shows WHAT the
 * runtime derived, not a causal chain; it does not display because/consequences,
 * so it does not claim causation.
 */
export const CONTRACT = {
  roomId: "demo-studio",
  principle: true,
  roomShell: true,
  projection: "harness",
  feed: true,
  recommendations: true,
  stateEngine: false,
  rules: false,
  policy: false,
  events: "canonical",
};

const STEP_MS = 900;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// The reference workflow, expressed in this project's real event vocabulary and
// event shape. Each step publishes one canonical event onto the live bus.
// STATIC DEMONSTRATION CONTENT — this is the script, not duplicated state.
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

const row = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 13, padding: "3px 0" };
const dot = (c) => ({ width: 8, height: 8, borderRadius: 999, background: c, display: "inline-block", marginRight: 8 });
const quiet = { fontFamily: FONT.ui, fontSize: 12, color: T.grey };

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

  // The operating picture. Not a projection — a different question.
  const runtime = useMemo(
    () => buildRuntime({ event, log, hubStates, machineStates }),
    [event, log, hubStates, machineStates],
  );
  const ms = runtime.manufacturingStatus;

  // PRESENTATION TRANSFORMATION, not state. The canonical OperationsFeed row
  // shape, built with the canonical feedTitle() so the wording matches every
  // other feed in the OS. The events themselves are unchanged — this replaced a
  // hand-rolled second feed implementation, not a second source of truth.
  const feedRows = useMemo(
    () => log.map((e) => ({
      type: e.type,
      at: e.at,
      title: feedTitle(e.type),
      subject: e.component || e.machine || null,
      actor: e.human || e.person || null,
      hub: e.hub || null,
      detail: e.text || null,
      result: e.result || e.status || null,
    })),
    [log],
  );

  return (
    <Room id="demo-studio" chrome={false} className="forge-room--shelled">
      <RoomShell
        roomId="demo-studio"
        kicker="Forge OS · Demo Studio"
        title="The whole runtime in one"
        accent="run."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p className="forge-human" style={{ maxWidth: "62ch", color: T.ivory70, margin: 0 }}>
              One workflow through the whole runtime: the button publishes canonical events onto the
              live Activity Engine; hub and machine states derive from them; the Runtime Engine assembles
              the operating picture below. Nothing here is animated — it reacts because work happened.
            </p>
            <Button onClick={run} disabled={running}>
              {running ? "Running…" : "▶ Run Manufacturing Workflow"}
            </Button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {WORKFLOW.map((step, i) => {
              const state = active === step.key ? "active" : done.includes(step.key) ? "done" : "idle";
              return (
                <Badge key={step.key}
                       color={state === "idle" ? T.greyDark : T.green}
                       filled={state === "active"}>
                  {i + 1}. {step.label}
                </Badge>
              );
            })}
          </div>

          <Panel>
            <Label>Manufacturing Status (Runtime Engine)</Label>
            <div style={{ display: "flex", gap: 22, flexWrap: "wrap", fontSize: 13 }}>
              <span>Active events: <b>{ms.activeEvents}</b></span>
              <span>Workshops: <b>{ms.workshops}</b></span>
              <span>People: <b>{ms.people}</b></span>
              <span>Machines: <b>{ms.machines}</b></span>
              <span>Components: <b>{ms.components}</b></span>
            </div>
          </Panel>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 }}>
            <Panel>
              <Label>Machines (derived)</Label>
              {Object.keys(machineStates).length
                ? Object.entries(machineStates).map(([id, st]) => (
                    <div key={id} style={row}>
                      <span><span style={dot(stateColor(st))} />{id}</span>
                      <span style={{ color: stateColor(st), fontWeight: 600, fontSize: 12 }}>{st}</span>
                    </div>
                  ))
                : <div style={quiet}>Press Run to bring machines under load.</div>}
            </Panel>

            <Panel>
              <Label>Hubs (derived)</Label>
              {Object.keys(hubStates).length
                ? Object.entries(hubStates).map(([id, st]) => (
                    <div key={id} style={row}>
                      <span><span style={dot(stateColor(st))} />{id}</span>
                      <span style={{ color: stateColor(st), fontWeight: 600, fontSize: 12 }}>{st}</span>
                    </div>
                  ))
                : <div style={quiet}>No hubs reporting yet.</div>}
            </Panel>

            {/* The Runtime Engine's recommendations are {station, reason}. The frozen
                Recommendation primitive renders the projection's richer
                {severity, because, consequences} shape, so composing it here would
                render an empty card. Station and reason are shown as they are. */}
            <Panel>
              <Label>Recommendations</Label>
              {runtime.recommendations.length
                ? runtime.recommendations.map((r, i) => (
                    <div key={i} style={{ fontSize: 12, padding: "3px 0" }}>
                      <b>{r.station}</b> — {r.reason}
                    </div>
                  ))
                : <div style={quiet}>None</div>}
            </Panel>

            <Panel>
              <Label>Languages (Runtime Engine)</Label>
              {runtime.languages.map((l) => (
                <div key={l} style={row}><span><span style={dot(T.teal)} />{l}</span></div>
              ))}
            </Panel>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            <Panel>
              <Label>Forge Objects ({runtime.forgeObjects.length})</Label>
              {runtime.forgeObjects.length
                ? runtime.forgeObjects.slice(0, 10).map((o, i) => (
                    <div key={i} style={row}>
                      <span><span style={dot(T.greyDark)} />{o.id} · <span style={{ color: T.grey }}>{o.class}</span></span>
                      <span style={{ fontSize: 12, color: T.grey }}>{o.state}</span>
                    </div>
                  ))
                : <div style={quiet}>No objects yet.</div>}
            </Panel>

            <Panel>
              <Label>Live Event Stream</Label>
              <div style={{ maxHeight: 240, overflow: "auto" }}>
                <OperationsFeed rows={feedRows} limit={12} empty="Awaiting activity." />
              </div>
            </Panel>
          </div>

          <p className="forge-technical" style={{ color: T.grey, fontSize: 11, margin: 0 }}>
            Note: the seed stream keeps publishing every few seconds, so the operating picture also
            reflects background factory activity alongside the demo events.
          </p>
        </div>
      </RoomShell>
    </Room>
  );
}
