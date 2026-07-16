// ============================================================
// FORGE OS — NMCP ARRIVAL
// The National Manufacturing Command Plate is the FIRST engineering
// artifact a visitor meets — before Forge is introduced. It establishes:
// "Nigeria itself is the manufacturing platform." Installed centrepiece,
// not background wallpaper. RO Final Alpha directive.
// Reuses the existing NMCP 3D viewer — the object is not redesigned.
// ============================================================
import NMCP from "../../os/NMCP.jsx";
import "./NmcpArrival.css";

export default function NmcpArrival() {
  return (
    <section className="nmcp-arrival" aria-label="National Manufacturing Command Plate">
      <div className="nmcp-arrival-head">
        <span className="nmcp-arrival-kicker">FORGE HEADQUARTERS · INSTALLED ARTIFACT</span>
        <h1 className="nmcp-arrival-title">
          Nigeria is the<br/><span className="steel">manufacturing platform.</span>
        </h1>
        <p className="nmcp-arrival-lede">
          The NAWEDOAM Manufacturing Command Plate — a machined-steel instrument of the
          national build network. Eighteen hubs. Real coordinates. One coordinated country.
        </p>
      </div>

      {/* the installed plate — museum-scale, the centrepiece of arrival */}
      <div className="nmcp-arrival-exhibit">
        <NMCP />
      </div>

      <div className="nmcp-arrival-foot">
        <span className="nmcp-arrival-note">NMCP-0001 · Forge Alpha Certified · the engineering icon of Forge</span>
        <span className="nmcp-arrival-scroll">Enter Forge OS ↓</span>
      </div>
    </section>
  );
}
