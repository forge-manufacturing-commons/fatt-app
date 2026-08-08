// ============================================================
// FORGE OS — INSPECTION HANGAR
// Split from Rooms.jsx (Sprint E1). Behaviour is unchanged: one room,
// one file, one contract, one compliance result, one ownership boundary.
// ============================================================

import Room from "../os/Room.jsx";
import { stateColor } from "../os/forge.js";
import Machine from "../os/Machine.jsx";
import { LaserRuler, VerificationSeal } from "../os/Engineering.jsx";
import { buildRuntime } from "../os/ForgeRuntime.js";
import { BLENDER } from "../os/BlenderSocket.js";
import { HumanGlyph } from "../humans/HumanGlyphLibrary.jsx";

/* 05 — VEHICLE INSPECTION HANGAR ---------------------------- */
export default function InspectionHangar() {
  return (
    <Room id="inspection-hangar">
      <div style={{ position:"relative" }}>
        <LaserRuler style={{ position:"absolute", top:0, left:0, width:"100%", opacity:.3 }} />
        <div className="forge-machine-floor">
          <Machine id="inspectionTable" state="inspection" telemetry={{ TOL:"±0.15" }} />
          <Machine id="craneHook" />
          <Machine id="chainHoist" />
        </div>
      </div>
      <div style={{ display:"flex", gap:26, alignItems:"center", marginTop:30, flexWrap:"wrap" }}>
        <VerificationSeal style={{ width:70 }} />
        <HumanGlyph role="INSPECTOR" variant="F" metadata={{ name:"Amina Suleiman", workshop:"Forge Quality Office", task:"Verifying chassis rail" }} />
        <span className="forge-technical" style={{ color:"var(--forge-muted)" }}>
          VEHICLE SOCKET <code style={{color:"var(--forge-cyan)"}}>{BLENDER.vehicleGLB.slot}</code> — {BLENDER.vehicleGLB.status}
        </span>
      </div>
    </Room>
  );
}

/* 06 — FACTORY CONTROL ROOM --------------------------------- */
// The control room shows BOTH halves of the runtime: the raw event log (what
// happened) and the operating picture the Runtime Engine derives from it (what the
// system now knows). buildRuntime() existed in ForgeRuntime.js but nothing rendered
// it until here — this is the OS thinking, made visible.
const CTRL_MACHINE_COLOR = { active:"#1a7a4a", inspection:"#0A7F73", maintenance:"#F5A623", idle:"#3a4a5a" };
// Hub status colour comes from the kernel, not from this room.
const CTRL_HUB_COLOR = new Proxy({}, { get: (_, k) => stateColor(String(k)) });
const ctrlDot = (c) => ({ display:"inline-block", width:8, height:8, borderRadius:999, marginRight:8, background:c || "#3a4a5a", verticalAlign:"middle" });

function CtrlMetric({ label, value }) {
  return (
    <div style={{ border:"1px solid rgba(255,255,255,.12)", borderRadius:8, padding:"9px 12px", minWidth:92 }}>
      <div className="forge-system" style={{ fontSize:10, letterSpacing:".08em", color:"var(--forge-muted)" }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:800, color:"var(--forge-cyan)", lineHeight:1.15 }}>{value}</div>
    </div>
  );
}

function CtrlList({ title, entries, colors }) {
  return (
    <div>
      <div className="forge-system" style={{ marginBottom:6, color:"var(--forge-muted)" }}>{title} ({entries.length})</div>
      {entries.length === 0
        ? <p className="forge-technical" style={{ color:"var(--forge-muted)", margin:0 }}>none reporting</p>
        : entries.map(([id, st]) => (
            <div key={id} style={{ display:"flex", justifyContent:"space-between", padding:"3px 0", fontSize:13 }}>
              <span><i style={ctrlDot(colors[st])} />{id}</span>
              <span style={{ color:colors[st] || "#3a4a5a", fontSize:12, textTransform:"capitalize" }}>{st}</span>
            </div>
          ))}
    </div>
  );
}
