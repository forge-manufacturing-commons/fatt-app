// ============================================================
// FORGE OS — NMCP RUNTIME COMPONENT
// NAWEDOAM Manufacturing Command Plate — Forge Alpha Certified, Rev A.02
//
// This consumes the component's OWN metadata.json as the source of truth —
// the same file that ships in /assets/NMCP. The website does not re-describe
// the plate; it reads the manufactured component's identity.
//
// Render socket: /assets/NMCP/renders/signature.png (degrades honestly if absent).
// LED hub states are data-driven from the Activity Engine — the steel is
// permanent, the data is alive (RO directive).
// ============================================================

import PlateInstrument from "./PlateInstrument.jsx";
import { useEffect, useState } from "react";
import { useForgeActivity } from "./ActivityEngine.jsx";
import { STUDIO_HUBS } from "./ForgeOS.js";
import NmcpCinematic from "./NmcpCinematic.jsx";
import "./NMCP.css";

const META_URL   = "/assets/NMCP/metadata.json";
const RENDER_URL = "/assets/NMCP/renders/signature.png";

export default function NMCP() {
  const [meta, setMeta] = useState(null);
  const [hasRender, setHasRender] = useState(false);
  const [plate3D, setPlate3D] = useState(true);
  const { hubStates } = useForgeActivity();

  useEffect(() => {
    fetch(META_URL).then(r => r.ok ? r.json() : null).then(setMeta).catch(() => setMeta(null));
    const img = new Image();
    img.onload = () => setHasRender(true);
    img.onerror = () => setHasRender(false);
    img.src = RENDER_URL;
  }, []);

  const liveHubs = Object.keys(hubStates).length;

  return (
    <div className="nmcp">
      <div className="nmcp-stage">
        {/* Forge Inspection System — authored Blender cameras, no orbit toy. */}
        <PlateInstrument><NmcpCinematic /></PlateInstrument>
        {/* LED overlay — data-driven hub states over the steel. Steel permanent, data alive. */}
        <div className="nmcp-leds" aria-hidden="true">
          {STUDIO_HUBS.slice(0, 18).map((h, i) => {
            const st = hubStates[(h.id || h.name || "").toLowerCase()] || "standby";
            return <span key={i} className={`nmcp-led nmcp-led--${st}`} />;
          })}
        </div>
      </div>

      {meta && (
        <div className="nmcp-plate-id">
          <div className="nmcp-id-row">
            <span className="nmcp-serial forge-command">{meta.id}</span>
            <span className={`nmcp-cert forge-system`}>{meta.status}</span>
          </div>
          <div className="nmcp-name forge-human">{meta.name}</div>
          <dl className="nmcp-spec">
            <div><dt>MATERIAL</dt><dd>EN S355 STRUCTURAL STEEL</dd></div>
            <div><dt>MASS</dt><dd>{meta.geometry.computed_plate_mass_kg} kg <em>CALC</em></dd></div>
            <div><dt>THICKNESS</dt><dd>{meta.geometry.plate_thickness_mm} mm</dd></div>
            <div><dt>HUBS</dt><dd>{meta.hubs} · {liveHubs} live</dd></div>
            <div><dt>REVISION</dt><dd>{meta.revision}</dd></div>
            <div><dt>LIFECYCLE</dt><dd>{meta.lifecycle}</dd></div>
          </dl>
          <p className="nmcp-provenance forge-technical">
            Boundary: real GADM admin-1 · Hubs: real WGS84 · Mass: computed from geometry, not weighed
          </p>
        </div>
      )}
    </div>
  );
}
