// ============================================================
// FORGE OS — BUILD BOARD
// Split from Rooms.jsx (Sprint E1). Behaviour is unchanged: one room,
// one file, one contract, one compliance result, one ownership boundary.
// ============================================================

import Room from "../os/Room.jsx";
import BoardPreview from "../components/forge/BoardPreview";

/* 08 — BUILD BOARD ------------------------------------------ */
export default function BuildBoard() {
  return (
    <Room id="build-board">
      <BoardPreview />
    </Room>
  );
}
