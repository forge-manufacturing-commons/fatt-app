// ============================================================
// FORGE OS — SHELL
// The Homepage is only the Arrival Dock. This is not navigation
// between pages; it is movement between rooms of one system.
// ============================================================

import { useEffect, useState } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { isConfigured } from "./lib/supabase";
import { ForgeActivityProvider, useForgeActivity } from "./os/ActivityEngine.jsx";
// Legacy phase/tone engine still drives the hero band, board pulses, ecosystem,
// pipeline and Nigeria map. It is NESTED inside the OS engine, not replaced —
// swapping it out would orphan five working components for no gain.
import { ForgeActivityProvider as LegacyPhaseProvider } from "./lib/ForgeActivityEngine.jsx";
import { ROOMS, roomById } from "./os/ForgeOS.js";
import { LOGO_NAVBAR } from "./lib/assets";
import Room from "./os/Room.jsx";
import RoomLocator from "./os/RoomLocator.jsx";
import "./os/ForgeOS.css";

import { ArrivalDock, ProductionLine,
         InspectionHangar, ImpactDashboard, BuildBoard } from "./rooms/Rooms.jsx";
import DemoStudio from "./rooms/DemoStudio.jsx";
import LanguageStudio from "./rooms/LanguageStudio.jsx";
import EngineeringBay from "./rooms/EngineeringBay.jsx";
import NationalGridRoom from "./rooms/NationalGrid.jsx";
import OperationsCentre from "./rooms/OperationsCentre.jsx";
import Join from "./pages/Join.jsx";
import { PLATFORM } from "./constants/site.js";
import { DocsIndex, Constitution, Governance, Whitepaper, Licenses, Partners, Research }
  from "./pages/Institution.jsx";
import Repositories from "./pages/Repositories.jsx";
import { ForgeIdentityProvider, useIdentity } from "./os/ForgeIdentity.jsx";
import Access from "./pages/Access.jsx";
import Workspace from "./os/Workspace.jsx";

const BUILT = {
  "arrival-dock":     ArrivalDock,
  "national-grid":    NationalGridRoom,
  "engineering-bay":  EngineeringBay,
  "production-line":  ProductionLine,
  "inspection-hangar":InspectionHangar,
  "control-room":     OperationsCentre,
  "impact-dashboard": ImpactDashboard,
  "build-board":      BuildBoard,
  "demo-studio":      DemoStudio,
  "language-studio":  LanguageStudio,
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
          <IdentityLink />
        </nav>
      </div>
    </div>
  );
}

// Identity entry point. Shows the actor when signed in, an unread count when
// they have notifications, and the registration route when they do not.
function IdentityLink() {
  const { session, profile, unreadCount, configured } = useIdentity();
  if (!configured) return null;
  if (!session) return <NavLink to="/access">Register</NavLink>;
  return (
    <NavLink to="/workspace">
      {profile?.display_name || "Workspace"}
      {unreadCount > 0 && (
        <b style={{ marginLeft: 6, color: "var(--forge-pink, #FF2E63)" }}>{unreadCount}</b>
      )}
    </NavLink>
  );
}

// Domain groups for the rail. Room ids reference the kernel ROOMS registry.
// Any room not listed here is auto-collected under "More" — the rail never hides a room.
const DOMAIN_GROUPS = [
  { id: "operations",  label: "Operations",  ids: ["arrival-dock", "national-grid", "production-line", "control-room", "impact-dashboard"] },
  { id: "engineering", label: "Engineering", ids: ["engineering-bay", "inspection-hangar", "build-board"] },
  { id: "network",     label: "Network",     ids: ["sme-portal", "university-portal", "government-portal", "investor-portal", "marketplace"] },
  { id: "knowledge",   label: "Knowledge",   ids: ["language-studio"] },
  { id: "systems",     label: "Systems",     ids: ["manufacturing-cloud", "digital-twin", "ai-assistant", "demo-studio"] },
];

// Grouped, collapsible navigation. Route-based (react-router), driven by the kernel
// ROOMS registry — so it scales to any number of rooms without a horizontal overflow.
function OSRail() {
  const { event } = useForgeActivity();
  const { pathname } = useLocation();
  const [openGroup, setOpenGroup] = useState(null);

  const groupedIds = new Set(DOMAIN_GROUPS.flatMap(g => g.ids));
  const groups = DOMAIN_GROUPS.map(g => ({
    ...g,
    rooms: g.ids.map(id => ROOMS.find(r => r.id === id)).filter(Boolean),
  })).filter(g => g.rooms.length > 0);
  const extras = ROOMS.filter(r => !groupedIds.has(r.id));
  if (extras.length) groups.push({ id: "more", label: "More", rooms: extras });

  const activeRoom = ROOMS.find(r => r.path === pathname);
  const activeGroupId = groups.find(g => g.rooms.some(r => r.id === activeRoom?.id))?.id;

  return (
    <div className="forge-os-rail">
      <div className="forge-os-rail-in">
        <NavLink to="/" className="forge-os-mark" onClick={() => setOpenGroup(null)} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <img src={LOGO_NAVBAR} alt="Forge" height={30} style={{ height: 30, width: "auto", objectFit: "contain" }} />
          <b style={{ color: "var(--forge-teal)", fontSize: 12, letterSpacing: "0.08em" }}>OS</b>
        </NavLink>
        <nav className="forge-os-doors" aria-label="Forge OS rooms" style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {groups.map(g => {
            const isOpen = openGroup === g.id;
            const isActive = activeGroupId === g.id;
            return (
              <div
                key={g.id}
                style={{ position: "relative" }}
                onMouseLeave={() => { if (isOpen) setOpenGroup(null); }}
              >
                <button
                  type="button"
                  className="forge-os-door"
                  aria-expanded={isOpen}
                  onClick={() => setOpenGroup(isOpen ? null : g.id)}
                  style={{
                    cursor: "pointer", font: "inherit", color: "inherit",
                    background: isOpen ? "rgba(255,255,255,.08)" : "transparent",
                    borderBottom: isActive ? "2px solid var(--forge-teal)" : "2px solid transparent",
                  }}
                >
                  {g.label} <span style={{ opacity: .5, fontSize: 11 }}>{g.rooms.length}</span>
                </button>
                {isOpen && (
                  <div
                    role="menu"
                    style={{
                      position: "absolute", top: "100%", left: 0, zIndex: 60,
                      minWidth: 240, background: "#111418", border: "1px solid #1C2128",
                      borderRadius: 8, padding: 6, boxShadow: "0 14px 34px rgba(0,0,0,.55)",
                    }}
                  >
                    {g.rooms.map(r => (
                      <NavLink
                        key={r.id}
                        to={r.path}
                        end={r.path === "/"}
                        onClick={() => setOpenGroup(null)}
                        title={r.purpose}
                        className={({ isActive: a }) =>
                          `forge-os-door${a ? " active" : ""}${r.status === "commissioning" ? " forge-os-door--commissioning" : ""}`}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "7px 10px", borderRadius: 6, whiteSpace: "nowrap",
                          opacity: r.status === "commissioning" ? .6 : 1,
                        }}
                      >
                        <em style={{ fontStyle: "normal", opacity: .5, fontSize: 11, minWidth: 20 }}>{r.sequence}</em>
                        <span>{r.name}</span>
                        {r.status === "commissioning" && (
                          <span style={{ marginLeft: "auto", fontSize: 9, letterSpacing: 1, opacity: .5 }}>SOON</span>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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
    <ForgeIdentityProvider>
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
            {/* Identity — Phase 1 */}
            <Route path="/access"         element={<Access />} />
            <Route path="/workspace"      element={<Workspace />} />
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
    </ForgeIdentityProvider>
  );
}
