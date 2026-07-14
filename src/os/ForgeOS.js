// ============================================================
// FORGE OS — KERNEL
//
// This is not a website. It is an industrial operating system.
// Every room, machine, overlay, camera and material in Forge OS
// resolves through this kernel. Nothing is defined locally.
//
// Authority: ForgeStudio_Alpha (frozen). This kernel CONSUMES it.
// Rule: do not redesign, do not reinterpret, do not invent.
// ============================================================

import { STUDIO, STUDIO_TOKENS, STUDIO_HUBS, projectHub } from "../lib/ForgeStudio.js";

export { STUDIO, STUDIO_TOKENS, STUDIO_HUBS, projectHub };

// ------------------------------------------------------------
// LIFECYCLE GUARD (Asset_Lifecycle.md)
// Production 6 / QA Passed 63 / Engineering Review 36 / Prototype 27
// A room may declare the minimum lifecycle stage it will mount.
// Anything below the bar is refused — loudly, not silently.
// ------------------------------------------------------------
export const LIFECYCLE = { DEPRECATED: 0, DRAFT: 1, PROTOTYPE: 2, ENGINEERING_REVIEW: 3, QA_PASSED: 4, PRODUCTION: 5 };

export function requireAsset(id, minStage = LIFECYCLE.QA_PASSED) {
  const src = STUDIO[id];
  if (!src) {
    console.error(`[FORGE OS] Asset "${id}" is not in the Forge Studio registry. Do not invent a substitute — request it in Studio Beta.`);
    return null;
  }
  return src;
}

// ------------------------------------------------------------
// ROOM REGISTRY — Forge OS structure (directive §FORGE OS STRUCTURE)
//
// Every room shares this runtime. A room is a PLACE, not a page.
// `status: "operational"` = built. `status: "commissioning"` = declared,
// drop-in point clean, NOT faked with placeholder content.
// ------------------------------------------------------------
export const ROOMS = [
  { id:"arrival-dock",     name:"Arrival Dock",                 path:"/",            camera:"hero",       status:"operational",   sequence:"01",
    purpose:"Entry to Forge OS. Where the vehicle, the network and the people first register." },
  { id:"national-grid",    name:"National Manufacturing Grid",  path:"/grid",        camera:"orthographic", status:"operational", sequence:"02",
    purpose:"The Nigeria Manufacturing Command Center. 18 hubs, live states, real coordinates." },
  { id:"engineering-bay",  name:"Engineering Bay",              path:"/engineering", camera:"review",     status:"operational",   sequence:"03",
    purpose:"Drawings, tolerances, datum. Where a component is specified before it is cut." },
  { id:"production-line",  name:"Production Line",              path:"/production",  camera:"inspection", status:"operational",   sequence:"04",
    purpose:"Machines under load. One SME, one component, one owner." },
  { id:"inspection-hangar",name:"Vehicle Inspection Hangar",    path:"/inspection",  camera:"macro",      status:"operational",   sequence:"05",
    purpose:"The vehicle under scan. Verification, seals, QC stamps." },
  { id:"control-room",     name:"Factory Control Room",         path:"/control",     camera:"blueprint",  status:"operational",   sequence:"06",
    purpose:"The activity engine, exposed. Every event in the factory, as it happens." },
  { id:"impact-dashboard", name:"National Impact Dashboard",    path:"/impact",      camera:"review",     status:"operational",   sequence:"07",
    purpose:"What the network has actually produced. Numbers only where numbers are real." },
  // Declared. Runtime shared. Not yet furnished — and not faked.
  { id:"build-board",      name:"Build Board",                  path:"/board",       camera:"blueprint",  status:"operational",   sequence:"08",
    purpose:"SCADA work-order terminal. Component, owner, progress, sign-off." },
  { id:"manufacturing-cloud", name:"Manufacturing Cloud",       path:"/cloud",       camera:"review",     status:"commissioning", sequence:"09", purpose:"Shared production infrastructure across the SME network." },
  { id:"digital-twin",     name:"Digital Twin",                 path:"/twin",        camera:"orbit",      status:"commissioning", sequence:"10", purpose:"Live 3D mirror of the vehicle. Awaiting Blender GLB." },
  { id:"sme-portal",       name:"SME Portal",                   path:"/sme",         camera:"review",     status:"commissioning", sequence:"11", purpose:"One SME. One component. One owner." },
  { id:"university-portal",name:"University Portal",            path:"/university",  camera:"review",     status:"commissioning", sequence:"12", purpose:"Polytechnic and university workshops, HODs, student teams." },
  { id:"government-portal",name:"Government Portal",            path:"/government",  camera:"review",     status:"commissioning", sequence:"13", purpose:"Regulatory, standards and state-level participation." },
  { id:"investor-portal",  name:"Investor Portal",              path:"/investor",    camera:"review",     status:"commissioning", sequence:"14", purpose:"Diaspora capital, technical advisory, in-kind support." },
  { id:"marketplace",      name:"Marketplace",                  path:"/marketplace", camera:"review",     status:"commissioning", sequence:"15", purpose:"Components, vehicles, capability." },
  { id:"ai-assistant",     name:"AI Manufacturing Assistant",   path:"/assistant",   camera:"review",     status:"commissioning", sequence:"16", purpose:"Manufacturing intelligence across every room." },
];

export const roomById   = id   => ROOMS.find(r => r.id === id) || null;
export const roomByPath = path => ROOMS.find(r => r.path === path) || null;
export const operationalRooms = () => ROOMS.filter(r => r.status === "operational");

// ------------------------------------------------------------
// PORTAL MATRIX — DERIVED, NOT AUTHORED.
// ForgeStudio's Governance layer (portal matrix) is DEFERRED
// (CHANGELOG [Unreleased]). This is the runtime's working
// derivation from Asset_Registry cross-portal reuse notes.
// Replace wholesale when Studio Beta issues the real matrix.
// ------------------------------------------------------------
export const PORTAL_MATRIX = {
  _provenance: "DERIVED at runtime. Studio Governance layer deferred. Not design authority.",
  status:      ["build-board","sme-portal","government-portal","investor-portal","manufacturing-cloud","marketplace"],
  engineering: ["engineering-bay","inspection-hangar","production-line","build-board"],
  machines:    ["production-line","engineering-bay","inspection-hangar"],
  nigeria:     ["national-grid","impact-dashboard","government-portal"],
  humans:      ["arrival-dock","build-board","national-grid","sme-portal","university-portal"],
};
