// ============================================================
// FORGE OS — ROOMS
// Every room is a place. Each declares a camera, mounts machines,
// and derives its state from the Activity Engine. None of these
// are webpage sections.
// ============================================================

import Room from "../os/Room.jsx";
import Machine, { MACHINES } from "../os/Machine.jsx";
import { SerialPlate, LaserRuler, VerificationSeal } from "../os/Engineering.jsx";
import { useForgeActivity } from "../os/ActivityEngine.jsx";
import { STUDIO_HUBS } from "../os/ForgeOS.js";
import { BLENDER } from "../os/BlenderSocket.js";
import { HumanGlyph } from "../humans/HumanGlyphLibrary.jsx";
import NMCP from "../os/NMCP.jsx";

import NigeriaMap from "../components/manufacturing/NigeriaMap";
import BoardPreview from "../components/forge/BoardPreview";

// The Arrival Dock IS the argument: capability exists -> here are the hands ->
// here is how it is built -> here are the cities -> here is the actual work ->
// here is the object -> here is the impact -> nobody builds it alone.
// It is consumed WHOLE. Chopping it into rooms broke it once; not again.
import Showcase from "../pages/Showcase.jsx";

/* 01 — ARRIVAL DOCK ----------------------------------------
   A first-time visitor gets the continuous scroll, unbroken.
   The rooms are DEPTH for people who already believe — they are
   not a replacement for the way through. Room identity, camera
   contract and the activity engine are all still mounted here;
   only the engineering header is suppressed, because the dock is
   an argument, not a labelled specimen.
------------------------------------------------------------ */
export function ArrivalDock() {
  return (
    <Room id="arrival-dock" chrome={false} overlays={false} className="forge-room--bare">
      <Showcase />
    </Room>
  );
}

/* 02 — NATIONAL MANUFACTURING GRID -------------------------- */
export function NationalGrid() {
  const { hubStates } = useForgeActivity();
  const live = Object.keys(hubStates).length;
  // RO directive — visual order: 1.NMCP  2.status  3.heading  4.copy  5.nav.
  // The plate comes FIRST and fills the room. All text is demoted below it.
  return (
    <Room id="national-grid" chrome={false} className="room-nmcp room-nmcp--command">
      {/* 1. THE PLATE — first in flow, fills the room, the primary instrument */}
      <NMCP />

      {/* 3+4. heading & copy — DEMOTED below the object, supporting only */}
      <div className="nmcp-room-foot">
        <div className="nmcp-room-headline">
          <span className="nmcp-room-seq forge-system">02 / NATIONAL MANUFACTURING GRID</span>
          <p className="nmcp-room-lede forge-human">
            The national manufacturing control surface — {STUDIO_HUBS.length} hubs at real coordinates,
            {" "}{live} reporting live this cycle.
          </p>
        </div>
        {/* 5. navigation */}
        <div className="nmcp-room-cta">
          <a href="/government" className="forge-cta-primary">Enter the manufacturing network →</a>
          <span className="forge-technical">NMCP-0001 · the engineering icon of Forge</span>
        </div>
      </div>
    </Room>
  );
}

/* 03 — ENGINEERING BAY -------------------------------------- */
export function EngineeringBay() {
  return (
    <Room id="engineering-bay">
      <div className="forge-machine-floor">
        <Machine id="workbench" telemetry={{ DRAWINGS: 6 }} />
        <Machine id="toolCabinet" />
        <Machine id="drillPress" />
        <Machine id="assemblyFixture" telemetry={{ JIG: "CHS-014" }} />
      </div>
      <div style={{ display:"flex", gap:20, flexWrap:"wrap", marginTop:34 }}>
        <SerialPlate component="CHS-014" owner="Warri Fabrication Co-op" status="IN FABRICATION" />
        <SerialPlate component="HUB-002" owner="Nnewi Precision Works" status="VERIFIED" />
        <SerialPlate component="BRK-007" owner="Ilorin Polytechnic" status="APPROVED" />
      </div>
    </Room>
  );
}

/* 04 — PRODUCTION LINE -------------------------------------- */
export function ProductionLine() {
  const { machineStates } = useForgeActivity();
  const line = ["migWelder","lathe","sheetBrake","hydraulicPress","chainHoist","compressedAir","gasCylinders","craneHook"];
  const active = line.filter(m => machineStates[m] === "active").length;
  return (
    <Room id="production-line">
      <p className="forge-system" style={{ marginBottom:20, color:"var(--forge-muted)" }}>
        [ {active} OF {line.length} MACHINES UNDER LOAD ] — state derived from the activity engine, not animated
      </p>
      <div className="forge-machine-floor">
        {line.map(m => <Machine key={m} id={m} />)}
      </div>
    </Room>
  );
}

/* 05 — VEHICLE INSPECTION HANGAR ---------------------------- */
export function InspectionHangar() {
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
export function ControlRoom() {
  const { log } = useForgeActivity();
  return (
    <Room id="control-room">
      <div className="forge-ctrl">
        {log.length === 0 && <p className="forge-system">[ awaiting first event ]</p>}
        {log.map((e, i) => (
          <div key={`${e.at}-${i}`} className="forge-ctrl-row" data-type={e.type}>
            <span className="forge-ctrl-t">{new Date(e.at).toLocaleTimeString()}</span>
            <span className="forge-ctrl-type">{e.type}</span>
            <span className="forge-ctrl-txt">{e.text}</span>
            <span className="forge-ctrl-hub">{e.hub?.toUpperCase()}</span>
            <span className="forge-ctrl-who">{e.human}</span>
          </div>
        ))}
      </div>
    </Room>
  );
}

/* 07 — NATIONAL IMPACT DASHBOARD ---------------------------- */
export function ImpactDashboard() {
  const { log } = useForgeActivity();
  // ONLY numbers that are actually true of this system. Nothing invented.
  const real = [
    { k:"Manufacturing hubs mapped", v:STUDIO_HUBS.length, note:"real WGS84 coordinates" },
    { k:"Machine classes in the library", v:Object.keys(MACHINES).length, note:"Machine_Library.md" },
    { k:"Rooms in Forge OS", v:16, note:"kernel registry" },
    { k:"Events processed this session", v:log.length, note:"activity engine" },
  ];
  return (
    <Room id="impact-dashboard">
      <div className="forge-impact">
        {real.map(r => (
          <div key={r.k} className="forge-impact-cell">
            <span className="forge-impact-v forge-command">{r.v}</span>
            <span className="forge-impact-k forge-human">{r.k}</span>
            <span className="forge-impact-n forge-technical">{r.note}</span>
          </div>
        ))}
      </div>
      <p className="forge-human" style={{ marginTop:22, color:"var(--forge-muted)", maxWidth:"64ch" }}>
        These are the only numbers Forge OS currently knows to be true. Production figures —
        vehicles built, SMEs contracted, students trained — will appear here when the network
        reports them. They will not be estimated.
      </p>
    </Room>
  );
}

/* 08 — BUILD BOARD ------------------------------------------ */
export function BuildBoard() {
  return (
    <Room id="build-board">
      <BoardPreview />
    </Room>
  );
}
