// ============================================================
// FORGE OS — ROOM  (directive Phase 4)
//
// "Every section is a physical place. These are rooms inside
//  Forge OS. Not webpage sections."
//
// A Room:
//  - has an identity in the kernel ROOMS registry
//  - declares one of the 8 approved cameras (never invents framing)
//  - mounts that camera's engineering overlay grammar automatically
//  - carries a status line driven by the Activity Engine
// A section that cannot answer "which room am I?" does not mount.
// ============================================================

import { roomById } from "./ForgeOS.js";
import { camera, cameraClass } from "./CameraSystem.js";
import { CameraOverlays } from "./Engineering.jsx";
import { useForgeActivity } from "./ActivityEngine.jsx";
import "./ForgeOS.css";

export default function Room({ id, children, className = "", overlays = true }) {
  const room = roomById(id);
  const { event } = useForgeActivity();

  if (!room) {
    console.error(`[FORGE OS] Room "${id}" is not in the kernel registry. A section must be a room.`);
    return null;
  }
  const cam = camera(room.camera);

  return (
    <section
      id={room.id}
      className={`forge-room ${cameraClass(room.camera)} forge-room--${room.status} ${className}`}
      data-room={room.id}
      data-camera={cam.id}
      aria-label={room.name}
    >
      <header className="forge-room-head">
        <span className="forge-room-seq forge-system">{room.sequence}</span>
        <h2 className="forge-room-name forge-command">{room.name}</h2>
        <p className="forge-room-purpose forge-human">{room.purpose}</p>
        <dl className="forge-room-plate">
          <div><dt>CAMERA</dt><dd>{cam.label} · {cam.lens}</dd></div>
          <div><dt>ASSET</dt><dd>{cam.id}</dd></div>
          <div><dt>STATE</dt><dd className={`forge-room-status forge-room-status--${room.status}`}>{room.status.toUpperCase()}</dd></div>
        </dl>
      </header>

      {overlays && <CameraOverlays tokens={cam.overlays} />}

      <div className="forge-room-floor">
        {room.status === "commissioning" ? <Commissioning room={room} /> : children}
      </div>

      <footer className="forge-room-feed forge-system" aria-live="polite">
        {event ? <>[{event.type}] {event.text} · {event.hub?.toUpperCase()}</> : <>[system] awaiting activity</>}
      </footer>
    </section>
  );
}

// An honest empty room. Declared, powered, wired to the same runtime —
// and openly NOT furnished. We do not fake a room with placeholder content.
function Commissioning({ room }) {
  return (
    <div className="forge-commissioning">
      <span className="forge-system">[ ROOM COMMISSIONING ]</span>
      <p className="forge-human">
        {room.name} is declared in the Forge OS kernel and shares this runtime —
        the same asset registry, material system, camera system, motion vocabulary
        and activity engine as every operational room. It is not yet furnished, and
        it is not being faked with placeholder content.
      </p>
      <ul className="forge-technical">
        <li>Drop-in point: <code>src/rooms/{room.id}</code></li>
        <li>Camera contract: <code>{camera(room.camera).id}</code></li>
        <li>Blender socket: <code>GLB · PNG · SVG</code> — no refactor required on arrival</li>
      </ul>
    </div>
  );
}
