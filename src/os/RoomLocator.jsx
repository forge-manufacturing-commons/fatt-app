// ============================================================
// FORGE OS — ROOM LOCATOR
// A persistent location cue: which room am I in, of how many, in what state.
// Reinforces that the homepage sections are ROOMS of one coherent system —
// not a scroll of marketing panels. (RO continuity request.)
// Reads the kernel registry; invents nothing.
// ============================================================

import { useLocation } from "react-router-dom";
import { ROOMS, roomByPath } from "./ForgeOS.js";
import "./RoomLocator.css";

export default function RoomLocator() {
  const { pathname } = useLocation();
  const room = roomByPath(pathname) || ROOMS[0];
  const total = ROOMS.length;

  return (
    <div className={`forge-locator forge-locator--${room.status}`} aria-label="Current room">
      <span className="forge-locator-room forge-system">ROOM {room.sequence}</span>
      <span className="forge-locator-sep">/</span>
      <span className="forge-locator-name forge-technical">{room.name}</span>
      <span className={`forge-locator-state forge-locator-state--${room.status}`}>
        <i aria-hidden="true" />{room.activeState}
      </span>
      <span className="forge-locator-of forge-system">{room.sequence} / {String(total).padStart(2,"0")}</span>
    </div>
  );
}
