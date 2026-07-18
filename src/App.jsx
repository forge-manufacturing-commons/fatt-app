// ============================================================
// FORGE OS — SHELL
// The Homepage is only the Arrival Dock. This is not navigation
// between pages; it is movement between rooms of one system.
// ============================================================

import { useEffect, useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { isConfigured } from "./lib/supabase";
import { ForgeActivityProvider, useForgeActivity } from "./os/ActivityEngine.jsx";
// Legacy phase/tone engine still drives the hero band, board pulses, ecosystem,
// pipeline and Nigeria map. It is NESTED inside the OS engine, not replaced —
// swapping it out would orphan five working components for no gain.
import { ForgeActivityProvider as LegacyPhaseProvider } from "./lib/ForgeActivityEngine.jsx";
import { ROOMS, roomById } from "./os/ForgeOS.js";
import Room from "./os/Room.jsx";
import RoomLocator from "./os/RoomLocator.jsx";
import "./os/ForgeOS.css";

import { ArrivalDock, NationalGrid, EngineeringBay, ProductionLine,
         InspectionHangar, ControlRoom, ImpactDashboard, BuildBoard } from "./rooms/Rooms.jsx";
import Join from "./pages/Join.jsx";
import { PLATFORM } from "./constants/site.js";
import { DocsIndex, Constitution, Governance, Whitepaper, Licenses, Partners, Research }
  from "./pages/Institution.jsx";
import Repositories from "./pages/Repositories.jsx";

const BUILT = {
  "arrival-dock":     ArrivalDock,
  "national-grid":    NationalGrid,
  "engineering-bay":  EngineeringBay,
  "production-line":  ProductionLine,
  "inspection-hangar":InspectionHangar,
  "control-room":     ControlRoom,
  "impact-dashboard": ImpactDashboard,
  "build-board":      BuildBoard,
};

// ------------------------------------------------------------
// INSTITUTIONAL TIER (Sprint 11, Epic 2)
// Forge (institution) -> Forge OS (system) -> Forge-A-Truck-Thon (challenge).
// The hierarchy is stated on every screen; the platform is the subject.
// ------------------------------------------------------------
function InstRail() {
  return (
    <div className="forge-inst-rail">
      <div className="forge-inst-in">
        <span className="forge-inst-tier">
          <b>{PLATFORM.institution}</b>
          <span>{PLATFORM.descriptor}</span>
        </span>
        <nav className="forge-inst-links" aria-label="Platform">
          <NavLink to="/docs">Documentation</NavLink>
          <NavLink to="/repositories">Repositories</NavLink>
          <NavLink to="/governance">Governance</NavLink>
          <NavLink to="/research">Research</NavLink>
          <a href="https://github.com/forgeatruck-ux" target="_blank" rel="noreferrer">GitHub</a>
          <NavLink to="/join">Contribute</NavLink>
        </nav>
      </div>
    </div>
  );
}

function OSRail() {
  const { event } = useForgeActivity();
  return (
    <div className="forge-os-rail">
      <div className="forge-os-rail-in">
        <NavLink to="/" className="forge-os-mark">FORGE<b>OS</b></NavLink>
        <nav className="forge-os-doors" aria-label="Forge OS rooms">
          {ROOMS.map(r => (
            <NavLink
              key={r.id}
              to={r.path}
              end={r.path === "/"}
              className={({ isActive }) =>
                `forge-os-door${isActive ? " active" : ""}${r.status === "commissioning" ? " forge-os-door--commissioning" : ""}`}
              title={r.purpose}
            >
              <em>{r.sequence}</em>{r.name}
            </NavLink>
          ))}
        </nav>
        <span className="forge-os-status forge-system">
          <i /> {event ? event.type.toUpperCase() : "SYSTEM ONLINE"}
        </span>
      </div>
    </div>
  );
}

// A room that is declared but not yet furnished still mounts — on the
// same runtime, honestly labelled. We do not 404 a room of Forge OS.
function CommissioningRoom({ id }) {
  return <Room id={id} />;
}

export default function App() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
    }
  }, []);

  return (
    <ForgeActivityProvider>
    <LegacyPhaseProvider>
      <>
        {!isConfigured && <div className="demo-banner">Demo mode — seed data. Add Supabase keys in .env to go live.</div>}
        <InstRail />
        <OSRail />
        <RoomLocator />
        <div className="page">
          <Routes>
            {ROOMS.map(r => {
              const Built = BUILT[r.id];
              return (
                <Route
                  key={r.id}
                  path={r.path}
                  element={Built ? <Built /> : <CommissioningRoom id={r.id} />}
                />
              );
            })}
            <Route path="/join" element={<Join />} />
            {/* Institutional surfaces — controlled documents & source of record */}
            <Route path="/docs"          element={<DocsIndex />} />
            <Route path="/constitution"  element={<Constitution />} />
            <Route path="/governance"    element={<Governance />} />
            <Route path="/whitepaper"    element={<Whitepaper />} />
            <Route path="/licenses"      element={<Licenses />} />
            <Route path="/partners"      element={<Partners />} />
            <Route path="/research"      element={<Research />} />
            <Route path="/repositories"  element={<Repositories />} />
          </Routes>
        </div>
        <footer>
          <div className="wrap">
            <div className="forge-hierarchy">
              <b>{PLATFORM.institution}</b> — {PLATFORM.descriptor}.
              {" "}<b>{PLATFORM.system}</b> — the platform runtime.
              {" "}<b>{PLATFORM.challenge}</b> — {PLATFORM.challengeDescriptor.toLowerCase()}.
              {" "}Reference platform: <b>{PLATFORM.referencePlatform}</b>.
            </div>
            NAWEDOAM: one SME, one component, one owner. Built by a keiretsu network of
            enterprises, polytechnic and university workshops, NYSC corps members, and
            diaspora engineers.
            <div className="attribution">Base 3D model: "Kei Truck" by grs (Sketchfab), CC-BY 4.0, modified.</div>
          </div>
        </footer>
      </>
    </LegacyPhaseProvider>
    </ForgeActivityProvider>
  );
}
