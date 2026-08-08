// ============================================================
// FORGE OS — PRODUCTION LINE
// Split from Rooms.jsx (Sprint E1). Behaviour is unchanged: one room,
// one file, one contract, one compliance result, one ownership boundary.
// ============================================================

import Room from "../os/Room.jsx";
import Machine, { MACHINES } from "../os/Machine.jsx";
import { useForgeActivity } from "../os/ActivityEngine.jsx";

/* 04 — PRODUCTION LINE -------------------------------------- */
export default function ProductionLine() {
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
