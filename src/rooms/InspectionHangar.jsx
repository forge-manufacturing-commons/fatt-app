// ============================================================
// FORGE OS — VEHICLE INSPECTION HANGAR
//
// COMPOSITION. Room is retained because the registry independently declares
// camera:"macro" — camera resolution, overlays, registry identity and the
// commissioning guard are runtime responsibilities, and this room is built
// around a scan overlay. chrome={false} hands the header to RoomShell.
//
// DATA SOURCE — projection:"none", truthfully. The room consumes no projection,
// no bus and no local state. Every value on screen is static config or a scene
// literal. The inspection table's state="inspection" is a forced prop: a scene
// literal, NOT an authoritative state source.
//
// E1 RESIDUE REMOVED. This file carried ~40 lines of dead Factory Control Room
// code left behind by the Rooms.jsx split — CTRL_MACHINE_COLOR, CTRL_HUB_COLOR,
// ctrlDot, CtrlMetric, CtrlList — none of it imported or rendered anywhere,
// because ControlRoom was superseded by OperationsCentre. All four hardcoded
// hex literals the baseline audit attributed to this room lived in that dead
// code, as did the only uses of buildRuntime and stateColor. Removing it is what
// makes Colour ✓ and stateColor ⊖ true rather than accidental.
// ============================================================

import Room from "../os/Room.jsx";
import { RoomShell } from "../os/console.jsx";
import { T, FONT } from "../os/forge.js";
import Machine from "../os/Machine.jsx";
import { LaserRuler, VerificationSeal } from "../os/Engineering.jsx";
import { BLENDER } from "../os/BlenderSocket.js";
import { HumanGlyph } from "../humans/HumanGlyphLibrary.jsx";

/**
 * PLATFORM CONTRACT — truthful.
 *
 * Reads:      BLENDER.vehicleGLB (static socket config). No projection, no bus.
 * Publishes:  nothing
 * Principle:  PRINCIPLES["inspection-hangar"], displayed by RoomShell
 *
 * projection:"none" — nothing derived. state ⊖ — the inspection table's state is
 * a forced scene literal, not a state source.
 */
export const CONTRACT = {
  roomId: "inspection-hangar",
  principle: true,
  roomShell: true,
  projection: "none",
  feed: false,
  recommendations: false,
  stateEngine: false,
  rules: false,
  policy: false,
  events: "canonical",
};

/* 05 — VEHICLE INSPECTION HANGAR ---------------------------- */
export default function InspectionHangar() {
  return (
    <Room id="inspection-hangar" chrome={false} className="forge-room--shelled">
      <RoomShell
        roomId="inspection-hangar"
        kicker="Forge OS · Vehicle Inspection Hangar"
        title="The vehicle under"
        accent="scan."
      >
        {/* position:relative is the LaserRuler's containing block. It must stay
            on the machine-floor wrapper, not migrate to RoomShell. */}
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
          <span className="forge-technical" style={{ color:T.grey, fontFamily:FONT.ui }}>
            VEHICLE SOCKET <code style={{ color:T.teal }}>{BLENDER.vehicleGLB.slot}</code> — {BLENDER.vehicleGLB.status}
          </span>
        </div>
      </RoomShell>
    </Room>
  );
}
