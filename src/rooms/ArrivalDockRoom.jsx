// ============================================================
// FORGE OS — ARRIVAL DOCK
// Split from Rooms.jsx (Sprint E1). Behaviour is unchanged: one room,
// one file, one contract, one compliance result, one ownership boundary.
// ============================================================

import Room from "../os/Room.jsx";
import ArrivalDockScreen from "./ArrivalDock.jsx";
// ============================================================
// PLATFORM CONTRACT — declared exception.
// The Arrival Dock is a continuous-scroll argument, not a control station:
// capability exists -> here are the hands -> here is how it is built -> here
// are the cities -> here is the object -> nobody builds it alone. Wrapping it
// in RoomShell would put a kicker and a principle header above a deliberate
// hero and break the very thing that makes it work.
//
// So roomShell is declared FALSE. The audit honours explicit exceptions rather
// than forcing every screen into one visual pattern — but it still holds this
// room to everything else it claims.
// ============================================================
export const CONTRACT = {
  roomId: "arrival-dock",
  principle: false,
  roomShell: false,
  // This room is a Room-wrapper that mounts the arrival screen. It derives
  // nothing itself, so it claims nothing. The screen it mounts reads the bus.
  projection: "none",
  feed: false,
  recommendations: false,
  stateEngine: false,
  rules: false,
  policy: false,
  events: "canonical",
};

/* 01 — ARRIVAL DOCK ----------------------------------------
   A first-time visitor gets the continuous scroll, unbroken.
   The rooms are DEPTH for people who already believe — they are
   not a replacement for the way through. Room identity, camera
   contract and the activity engine are all still mounted here;
   only the engineering header is suppressed, because the dock is
   an argument, not a labelled specimen.
------------------------------------------------------------ */
export default function ArrivalDock() {
  return (
    <Room id="arrival-dock" chrome={false} overlays={false} className="forge-room--bare">
      <ArrivalDockScreen />
    </Room>
  );
}

/* 02 — NATIONAL MANUFACTURING GRID -------------------------- */
