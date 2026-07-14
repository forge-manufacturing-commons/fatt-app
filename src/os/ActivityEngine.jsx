// ============================================================
// FORGE OS — ACTIVITY ENGINE  (directive Phase 9)
//
// "The factory should appear alive. Not because of decorative
//  animation. Because work is happening. Everything should be
//  event-driven."
//
// This is a real event bus. Machines, hubs and rooms SUBSCRIBE and
// DERIVE their state from it. No component hardcodes an animation.
// Swap `SEED_STREAM` for Supabase/websocket and nothing else changes.
// ============================================================

import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";

// ---- Canonical event types (directive §Phase 9 examples)
export const EVENT = {
  DRAWING_APPROVED:     "drawing.approved",
  COMPONENT_RECEIVED:   "component.received",
  INSPECTION_COMPLETED: "inspection.completed",
  MACHINE_STARTED:      "machine.started",
  MACHINE_STOPPED:      "machine.stopped",
  QUALITY_VERIFIED:     "quality.verified",
  SHIPMENT_DISPATCHED:  "shipment.dispatched",
  MAINTENANCE_OPENED:   "maintenance.opened",
};

// Which machine state an event implies. Machines derive; they don't decide.
const MACHINE_STATE_FROM = {
  [EVENT.MACHINE_STARTED]:      "active",
  [EVENT.MACHINE_STOPPED]:      "idle",
  [EVENT.MAINTENANCE_OPENED]:   "maintenance",
  [EVENT.INSPECTION_COMPLETED]: "inspection",
  [EVENT.QUALITY_VERIFIED]:     "inspection",
};

// Which hub state an event implies.
const HUB_STATE_FROM = {
  [EVENT.MACHINE_STARTED]:      "fabricating",
  [EVENT.COMPONENT_RECEIVED]:   "fabricating",
  [EVENT.DRAWING_APPROVED]:     "coordinating",
  [EVENT.INSPECTION_COMPLETED]: "verifying",
  [EVENT.QUALITY_VERIFIED]:     "verifying",
  [EVENT.SHIPMENT_DISPATCHED]:  "expanding",
  [EVENT.MAINTENANCE_OPENED]:   "maintenance",
  [EVENT.MACHINE_STOPPED]:      "standby",
};

// ---- Seed stream. Real named people, real hubs, real machines.
// This is the ONLY place factory truth is authored. Replace with a
// live source and every room updates with zero refactoring.
export const SEED_STREAM = [
  { type:EVENT.MACHINE_STARTED,      hub:"warri",       machine:"migWelder",       component:"CHS-014", human:"Adaeze Okoro",   role:"WELDER",    variant:"F", workshop:"Warri Fabrication Co-op",  text:"Chassis rail weld started" },
  { type:EVENT.COMPONENT_RECEIVED,   hub:"nnewi",       machine:"lathe",           component:"HUB-002", human:"Chike Nwosu",    role:"ENGINEER",  variant:"M", workshop:"Nnewi Precision Works",    text:"Wheel hub blanks received" },
  { type:EVENT.DRAWING_APPROVED,     hub:"ilorin",      machine:"workbench",       component:"BRK-007", human:"Ngozi Bello",    role:"ENGINEER",  variant:"F", workshop:"Ilorin Polytechnic",       text:"Bracket drawing approved" },
  { type:EVENT.INSPECTION_COMPLETED, hub:"aba",         machine:"inspectionTable", component:"PNL-021", human:"Uche Chikelu",   role:"INSPECTOR", variant:"M", workshop:"Aba SME Cluster",          text:"Panel inspection completed" },
  { type:EVENT.QUALITY_VERIFIED,     hub:"lagos",       machine:"inspectionTable", component:"CHS-014", human:"Amina Suleiman", role:"INSPECTOR", variant:"F", workshop:"Forge Quality Office",     text:"Chassis rail verified" },
  { type:EVENT.MACHINE_STARTED,      hub:"kaduna",      machine:"sheetBrake",      component:"PNL-022", human:"Ibrahim Danladi",role:"WELDER",    variant:"M", workshop:"Kaduna Heavy Industry",    text:"Panel fold in progress" },
  { type:EVENT.SHIPMENT_DISPATCHED,  hub:"portharcourt",machine:"forklift",        component:"HUB-002", human:"Yusuf Musa",     role:"ENGINEER",  variant:"M", workshop:"NSE Houston (advisory)",   text:"Hub set dispatched to assembly" },
  { type:EVENT.MAINTENANCE_OPENED,   hub:"benin",       machine:"hydraulicPress",  component:"—",       human:"Godwin Ejime",   role:"ENGINEER",  variant:"M", workshop:"Benin Foundry",            text:"Press maintenance window opened" },
];

const TICK_MS = 4200;

const Ctx = createContext(null);

export function ForgeActivityProvider({ children, stream = SEED_STREAM, disabled = false, tickMs = TICK_MS }) {
  const [index, setIndex] = useState(0);
  const [log, setLog] = useState([]);
  const subs = useRef(new Set());

  const publish = useCallback((evt) => {
    const stamped = { ...evt, at: Date.now(), seq: (evt.seq ?? 0) };
    setLog(l => [stamped, ...l].slice(0, 40));
    subs.current.forEach(fn => { try { fn(stamped); } catch (e) { console.error("[FORGE OS] subscriber failed", e); } });
  }, []);

  useEffect(() => {
    if (disabled || !stream.length) return;
    publish({ ...stream[0], seq: 0 });
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % stream.length;
      setIndex(i);
      publish({ ...stream[i], seq: i });
    }, tickMs);
    return () => clearInterval(t);
  }, [disabled, stream, tickMs, publish]);

  // Derived state — machines and hubs READ this. They never set it.
  const machineStates = useMemo(() => {
    const m = {};
    [...log].reverse().forEach(e => { if (e.machine && MACHINE_STATE_FROM[e.type]) m[e.machine] = MACHINE_STATE_FROM[e.type]; });
    return m;
  }, [log]);

  const hubStates = useMemo(() => {
    const h = {};
    [...log].reverse().forEach(e => { if (e.hub && HUB_STATE_FROM[e.type]) h[e.hub] = HUB_STATE_FROM[e.type]; });
    return h;
  }, [log]);

  const value = useMemo(() => ({
    event: log[0] || null,
    log, index, machineStates, hubStates, publish,
    subscribe: (fn) => { subs.current.add(fn); return () => subs.current.delete(fn); },
  }), [log, index, machineStates, hubStates, publish]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useForgeActivity() {
  const c = useContext(Ctx);
  if (!c) throw new Error("[FORGE OS] useForgeActivity outside ForgeActivityProvider — the OS is not booted.");
  return c;
}
export function useMachineState(machineId, fallback = "idle") {
  const { machineStates } = useForgeActivity();
  return machineStates[machineId] || fallback;
}
export function useHubState(hubId, fallback = "standby") {
  const { hubStates } = useForgeActivity();
  return hubStates[hubId] || fallback;
}
