// ============================================================
// FORGE OS — MACHINE  (directive Phase 6)
//
// "Every machine asset should become a reusable React component.
//  Machines must support idle / active / maintenance / inspection
//  / offline / future telemetry."
//
// A Machine is not a picture of a machine. It is a machine:
//  - it has an asset ID from Machine_Library.md
//  - it has a real footprint in mm
//  - it derives its state from the Activity Engine
//  - it exposes a telemetry socket that is ALREADY wired
// ============================================================

import { useMachineState } from "./ActivityEngine.jsx";
import { motion } from "./MotionSystem.js";
import "./ForgeOS.css";

const B = "/forge-studio/lib/Machines";

// All 16, verbatim from Machine_Library.md. Footprints are Studio's
// illustrative reference figures — Studio flags them as NOT measured
// from a real unit. Do not quote them as engineering fact.
export const MACHINES = {
  workbench:        { id:"WKS_MACHINE_WORKBENCH_A_0001",        svg:`${B}/mch-workbench.svg`,        name:"Workbench",         footprint:"1500 × 900 mm" },
  inspectionTable:  { id:"WKS_MACHINE_INSPECTIONTABLE_A_0001",  svg:`${B}/mch-inspection-table.svg`, name:"Inspection Table",  footprint:"1600 mm" },
  toolCabinet:      { id:"WKS_MACHINE_TOOLCABINET_A_0001",      svg:`${B}/mch-tool-cabinet.svg`,     name:"Tool Cabinet",      footprint:"800 × 1400 mm" },
  hydraulicPress:   { id:"WKS_MACHINE_HYDRAULICPRESS_A_0001",   svg:`${B}/mch-hydraulic-press.svg`,  name:"Hydraulic Press",   footprint:"1000 × 1600 mm" },
  lathe:            { id:"WKS_MACHINE_LATHE_A_0001",            svg:`${B}/mch-lathe.svg`,            name:"Lathe",             footprint:"2200 mm" },
  migWelder:        { id:"WKS_MACHINE_MIGWELDER_A_0001",        svg:`${B}/mch-mig-welder.svg`,       name:"MIG Welder",        footprint:"700 mm" },
  drillPress:       { id:"WKS_MACHINE_DRILLPRESS_A_0001",       svg:`${B}/mch-drill-press.svg`,      name:"Drill Press",       footprint:"700 × 1400 mm" },
  sheetBrake:       { id:"WKS_MACHINE_SHEETBRAKE_A_0001",       svg:`${B}/mch-sheet-brake.svg`,      name:"Sheet Brake",       footprint:"2400 mm" },
  gasCylinders:     { id:"WKS_MACHINE_GASCYLINDERS_A_0001",     svg:`${B}/mch-gas-cylinders.svg`,    name:"Gas Cylinders",     footprint:"1300 mm" },
  compressedAir:    { id:"WKS_MACHINE_COMPRESSEDAIR_A_0001",    svg:`${B}/mch-compressed-air.svg`,   name:"Compressed Air",    footprint:"1200 mm" },
  forklift:         { id:"WKS_MACHINE_FORKLIFT_A_0001",         svg:`${B}/mch-forklift.svg`,         name:"Forklift",          footprint:"2200 mm" },
  steelRack:        { id:"WKS_MACHINE_STEELRACK_A_0001",        svg:`${B}/mch-steel-rack.svg`,       name:"Steel Rack",        footprint:"1600 × 1800 mm" },
  chainHoist:       { id:"WKS_MACHINE_CHAINHOIST_A_0001",       svg:`${B}/mch-chain-hoist.svg`,      name:"Chain Hoist",       footprint:"1300 mm" },
  craneHook:        { id:"WKS_MACHINE_CRANEHOOK_A_0001",        svg:`${B}/mch-crane-hook.svg`,       name:"Crane Hook",        footprint:"900 mm" },
  assemblyFixture:  { id:"WKS_MACHINE_ASSEMBLYFIXTURE_A_0001",  svg:`${B}/mch-assembly-fixture.svg`, name:"Assembly Fixture",  footprint:"1400 mm" },
  materialPallets:  { id:"WKS_MACHINE_MATERIALPALLETS_A_0001",  svg:`${B}/mch-material-pallets.svg`, name:"Material Pallets",  footprint:"1200 mm" },
};

// Six states. Each maps to a canonical motion — never a bespoke animation.
export const MACHINE_STATES = {
  idle:        { label:"IDLE",        accent:"steel",   motion:null,               dot:"#8899aa" },
  active:      { label:"ACTIVE",      accent:"heat",    motion:"weldFlash",        dot:"#F5A623" },
  maintenance: { label:"MAINTENANCE", accent:"gold",    motion:"factoryPulse",     dot:"#F5A623" },
  inspection:  { label:"INSPECTION",  accent:"cyan",    motion:"inspectionScan",   dot:"#0A7F73" },
  offline:     { label:"OFFLINE",     accent:"forged",  motion:null,               dot:"#1C2128" },
  booting:     { label:"BOOTING",     accent:"cyan",    motion:"machineBoot",      dot:"#0A7F73" },
};

export default function Machine({ id, state: forced, telemetry = null, label = true, className = "" }) {
  const spec = MACHINES[id];
  const derived = useMachineState(id, "idle");
  const state = forced || derived;
  const s = MACHINE_STATES[state] || MACHINE_STATES.idle;

  if (!spec) {
    console.error(`[FORGE OS] Machine "${id}" is not in Machine_Library.md. Do not invent a machine.`);
    return null;
  }

  return (
    <figure
      className={`forge-machine forge-machine--${state} ${className}`}
      data-machine-id={spec.id}
      data-state={state}
      aria-label={`${spec.name}, ${s.label}`}
    >
      <div className="forge-machine-frame">
        <img
          src={spec.svg}
          alt=""
          aria-hidden="true"
          className={`forge-machine-svg ${s.motion ? motion(s.motion) : ""}`}
        />
        <span className="forge-machine-led" style={{ background: s.dot }} aria-hidden="true" />
      </div>
      {label && (
        <figcaption className="forge-machine-meta">
          <span className="forge-technical">{spec.name}</span>
          <span className="forge-machine-state" style={{ color: s.dot }}>{s.label}</span>
          <span className="forge-machine-dim">{spec.footprint}</span>
          {/* Telemetry socket — wired now, so no refactor when real data arrives. */}
          {telemetry && (
            <span className="forge-machine-telemetry">
              {Object.entries(telemetry).map(([k, v]) => (
                <em key={k}><b>{k}</b>{String(v)}</em>
              ))}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
