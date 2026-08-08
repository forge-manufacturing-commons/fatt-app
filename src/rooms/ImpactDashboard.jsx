// ============================================================
// FORGE OS — IMPACT DASHBOARD
// Split from Rooms.jsx (Sprint E1). Behaviour is unchanged: one room,
// one file, one contract, one compliance result, one ownership boundary.
// ============================================================

import Room from "../os/Room.jsx";
import Machine, { MACHINES } from "../os/Machine.jsx";
import { useForgeActivity } from "../os/ActivityEngine.jsx";
import { STUDIO_HUBS, ROOMS } from "../os/ForgeOS.js";

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
