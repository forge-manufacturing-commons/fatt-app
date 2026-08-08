// ============================================================
// FORGE OS — ARRIVAL DOCK
// Split from Rooms.jsx (Sprint E1). Behaviour is unchanged: one room,
// one file, one contract, one compliance result, one ownership boundary.
// ============================================================

import Room from "../os/Room.jsx";
import ArrivalDockScreen from "./ArrivalDock.jsx";

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
