// ============================================================
// PRODUCTION DOMAIN — state graphs
// The component and the machine each have a lifecycle. The component's
// is the spine of manufacturing traceability: every physical part moves
// through these states exactly once, and the graph is what makes an
// out-of-order claim detectable rather than merely unusual.
// ============================================================
import { createStateMachine } from "../../os/state.js";

export const componentState = createStateMachine({
  id: "component",
  initial: "planned",
  states: {
    planned:       { means: "Specified but not started",        on: { release: "manufacturing", cancel: "cancelled" } },
    manufacturing: { means: "Being made",                       on: { submitForInspection: "inspection", fault: "blocked" } },
    inspection:    { means: "Awaiting or under inspection",      on: { pass: "assembly", fail: "rework" } },
    rework:        { means: "Failed inspection, being corrected", on: { submitForInspection: "inspection", scrap: "scrapped" } },
    assembly:      { means: "Cleared for assembly",             on: { assemble: "completed" } },
    completed:     { means: "Finished, awaiting delivery",       on: { install: "installed" } },
    installed:     { means: "In service",                        on: { retire: "retired", fault: "blocked" } },
    blocked:       { means: "Held — cannot proceed",             on: { resume: "manufacturing", scrap: "scrapped" } },
    retired:       { means: "Withdrawn from service",            terminal: true },
    scrapped:      { means: "Destroyed, not recoverable",        terminal: true },
    cancelled:     { means: "Abandoned before manufacture",      terminal: true },
  },
});

export const machineState = createStateMachine({
  id: "machine",
  initial: "offline",
  states: {
    offline:     { means: "Not reporting",            on: { bringOnline: "available" } },
    available:   { means: "Idle and ready",           on: { reserve: "reserved", start: "running", openMaintenance: "maintenance", goOffline: "offline" } },
    reserved:    { means: "Allocated to a job",       on: { start: "running", release: "available" } },
    running:     { means: "Under load",               on: { complete: "available", fault: "fault", stop: "available" } },
    fault:       { means: "Failed in service",        on: { openMaintenance: "maintenance", goOffline: "offline" } },
    maintenance: { means: "Under maintenance",        on: { closeMaintenance: "available", goOffline: "offline" } },
  },
});

export default { componentState, machineState };
