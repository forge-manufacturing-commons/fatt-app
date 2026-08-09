// ============================================================
// FORGE OS — BUILD BOARD
//
// COMPOSITION (E2.2 — validated for THIS room only, not a template):
//
//   Room chrome={false}   registry identity, camera contract, overlays,
//                         commissioning guard — kept
//     RoomShell           kicker, Poppins Black title, principle — added
//       BoardPreview      existing behaviour — untouched
//
// Why chrome={false} rather than plain nesting: Room renders its OWN header
// (sequence, name, purpose, camera plate) and RoomShell renders another
// (kicker, Poppins Black title, principle). Nesting with chrome on produces two
// identity headers, two titles, a black background inside a black room, and
// `.forge-room-floor` padding compounding with RoomShell's clamp padding.
// chrome={false} lets Room keep everything structural and hands the header to
// RoomShell, which is the canonical one.
//
// The legacy floor is neutralised for shelled rooms via .forge-room--shelled
// (ForgeOS.css). Without it RoomShell renders as a 1180px black card with
// visible edges — confirmed visually before this fix.
//
// KNOWN TRADE-OFF: chrome={false} also suppresses Room's footer activity line
// ([event.type] · HUB). RoomShell has no footer, so BuildBoard loses that line
// — and thereby matches every already-converged room, none of which has one.
// Recorded rather than hidden.
// ============================================================

import Room from "../os/Room.jsx";
import { RoomShell } from "../os/console.jsx";
import BoardPreview from "../components/forge/BoardPreview";

/**
 * PLATFORM CONTRACT — truthful.
 *
 * BuildBoard is a thin wrapper around BoardPreview. It derives no manufacturing
 * state, subscribes to no events, renders no feed and displays no consequences.
 *
 * Reads from the projection:  nothing
 * Publishes:                  nothing
 * Principle:                  PRINCIPLES["build-board"], displayed by RoomShell
 *
 * Projection / State / Feed / Causation are declared false. They are not gaps to
 * be closed — inventing any of them here would add manufacturing functionality
 * purely to turn N/A into a tick.
 */
export const CONTRACT = {
  roomId: "build-board",
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

/* 08 — BUILD BOARD ------------------------------------------ */
export default function BuildBoard() {
  return (
    <Room id="build-board" chrome={false} className="forge-room--shelled">
      <RoomShell
        roomId="build-board"
        kicker="Forge OS · Build Board"
        title="Work orders, owners,"
        accent="sign-off."
      >
        <BoardPreview />
      </RoomShell>
    </Room>
  );
}
