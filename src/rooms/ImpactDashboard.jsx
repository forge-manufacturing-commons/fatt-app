// ============================================================
// FORGE OS — NATIONAL IMPACT DASHBOARD
//
// COMPOSITION. Room is retained because the registry independently declares
// camera:"review" — camera resolution, overlays, registry identity and the
// commissioning guard are runtime responsibilities. Decided from this room's own
// registry entry, not copied from another room. chrome={false} hands the header
// to RoomShell.
//
// DATA SOURCE — projection:"none", and that is the correct result.
// Three of the four figures are STATIC configuration counts (STUDIO_HUBS,
// MACHINES, ROOMS). The fourth, log.length, is raw event INSTRUMENTATION — a
// tally of how many events this session processed. It is not folded operational
// state, so it does not qualify as projection:"activity", and the activity
// audit was tightened to reject exactly this pattern before this room was
// written.
//
// The room reports on the SYSTEM, not on manufacturing. Declaring "none" is
// truthful; declaring "activity" would have widened that category by precedent.
// ============================================================

import Room from "../os/Room.jsx";
import { RoomShell } from "../os/console.jsx";
import { T, FONT } from "../os/forge.js";
import Machine, { MACHINES } from "../os/Machine.jsx";
import { useForgeActivity } from "../os/ActivityEngine.jsx";
import { STUDIO_HUBS, ROOMS } from "../os/ForgeOS.js";

/**
 * PLATFORM CONTRACT — truthful.
 *
 * Reads:      STUDIO_HUBS, MACHINES, ROOMS (static config) + log.length
 *             (event instrumentation, not folded state)
 * Publishes:  nothing
 * Principle:  PRINCIPLES["impact-dashboard"], displayed by RoomShell
 *
 * projection:"none" — the room consumes no operational projection. This is a
 * successful architectural result, not a gap: the room's entire purpose is to
 * report only what the system actually knows.
 *
 * state ⊖ — it displays counts, not manufacturing state values.
 */
export const CONTRACT = {
  roomId: "impact-dashboard",
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

/* 07 — NATIONAL IMPACT DASHBOARD ---------------------------- */
export default function ImpactDashboard() {
  const { log } = useForgeActivity();
  // ONLY numbers that are actually true of this system. Nothing invented.
  const real = [
    { k:"Manufacturing hubs mapped", v:STUDIO_HUBS.length, note:"real WGS84 coordinates" },
    { k:"Machine classes in the library", v:Object.keys(MACHINES).length, note:"Machine_Library.md" },
    { k:"Rooms in Forge OS", v:ROOMS.length, note:"kernel registry" },
    { k:"Events processed this session", v:log.length, note:"activity engine" },
  ];
  return (
    <Room id="impact-dashboard" chrome={false} className="forge-room--shelled">
      <RoomShell
        roomId="impact-dashboard"
        kicker="Forge OS · National Impact Dashboard"
        title="Numbers only where numbers are"
        accent="real."
      >
        <div className="forge-impact">
          {real.map(r => (
            <div key={r.k} className="forge-impact-cell">
              <span className="forge-impact-v forge-command">{r.v}</span>
              <span className="forge-impact-k forge-human">{r.k}</span>
              <span className="forge-impact-n forge-technical">{r.note}</span>
            </div>
          ))}
        </div>
        {/* PRESERVED VERBATIM. This paragraph is the room's ethical position:
            Forge OS reports what is known and refuses to estimate the rest.
            Do not shorten it, generalise it, or make it promotional. */}
        <p className="forge-human" style={{ marginTop:22, color:T.grey, maxWidth:"64ch", fontFamily:FONT.ui }}>
          These are the only numbers Forge OS currently knows to be true. Production figures —
          vehicles built, SMEs contracted, students trained — will appear here when the network
          reports them. They will not be estimated.
        </p>
      </RoomShell>
    </Room>
  );
}
