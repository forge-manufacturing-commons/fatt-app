// ============================================================
// FORGE OS — PRODUCTION LINE
//
// COMPOSITION. Room is retained because the registry declares
// camera:"inspection" — that camera and its overlays are RUNTIME
// responsibilities, not presentation. chrome={false} hands the header to
// RoomShell, which is the canonical one. This is decided from this room's own
// registry entry, NOT copied from BuildBoard.
//
//   Room chrome={false}   registry identity, inspection camera, overlays,
//                         commissioning guard
//     RoomShell           kicker, Poppins Black title, principle
//       Machine × 8       existing behaviour — untouched
//
// DATA SOURCE. machineStates comes from useForgeActivity() and is EVENT-DERIVED:
// the bus folds it via MACHINE_STATE_FROM over the log. project() does not
// produce machine states at all — it yields specifications, components,
// missions, recommendations, anomalies, consequences and the feed. Replacing
// useForgeActivity() with project() would delete this room's only data source.
// Hence projection:"activity", not "manufacturing" and not "none".
// ============================================================

import Room from "../os/Room.jsx";
import { RoomShell } from "../os/console.jsx";
import { T, FONT } from "../os/forge.js";
import Machine, { MACHINES } from "../os/Machine.jsx";
import { useForgeActivity } from "../os/ActivityEngine.jsx";

/**
 * PLATFORM CONTRACT — truthful.
 *
 * Reads:      machineStates from useForgeActivity() — event-derived, not static
 * Publishes:  nothing
 * Principle:  PRINCIPLES["production-line"], displayed by RoomShell
 *
 * projection:"activity" — operational state folded from the event log by the
 * bus, as distinct from "manufacturing" (project()) and "none" (nothing
 * derived).
 *
 * stateEngine:false does NOT mean this room has no state. It means the room does
 * not use the formal state-transition engine: machine state arrives already
 * folded from events. The distinction is deliberate.
 *
 * stateColor is ⊖ at room level: the room renders no state-coloured element
 * itself. Machine owns that internally via its own MACHINE_STATES map, recorded
 * as separate debt and NOT refactored here.
 */
export const CONTRACT = {
  roomId: "production-line",
  principle: true,
  roomShell: true,
  projection: "activity",
  feed: false,
  recommendations: false,
  stateEngine: false,
  rules: false,
  policy: false,
  events: "canonical",
};

/* 04 — PRODUCTION LINE -------------------------------------- */
export default function ProductionLine() {
  const { machineStates } = useForgeActivity();
  const line = ["migWelder","lathe","sheetBrake","hydraulicPress","chainHoist","compressedAir","gasCylinders","craneHook"];
  const active = line.filter(m => machineStates[m] === "active").length;
  return (
    <Room id="production-line" chrome={false} className="forge-room--shelled">
      <RoomShell
        roomId="production-line"
        kicker="Forge OS · Production Line"
        title="Machines under"
        accent="load."
      >
        <p className="forge-system" style={{ marginBottom:20, color:T.grey, fontFamily:FONT.ui }}>
          [ {active} OF {line.length} MACHINES UNDER LOAD ] — state derived from the activity engine, not animated
        </p>
        <div className="forge-machine-floor">
          {line.map(m => <Machine key={m} id={m} />)}
        </div>
      </RoomShell>
    </Room>
  );
}
