// ============================================================
// FORGE OPERATIONS CONSOLE (FOC)
// The overall operating environment of the Forge Foundation. NMCP is
// the first intelligence system running inside it; others are declared
// but not yet built. Each module has an explicit build state so the
// console never implies a capability that does not yet exist.
// ============================================================

export const FOC = {
  id: "FOC",
  name: "Forge Operations Console",
  descriptor: "National manufacturing knowledge infrastructure",
};

export const MODULE_STATE = {
  OPERATIONAL: "OPERATIONAL", // built and live
  COMMISSIONING: "COMMISSIONING", // being populated / partial
  DECLARED: "DECLARED",       // designed, not yet built
};

// The intelligence systems that run inside the console.
export const MODULES = [
  { id:"NMCP", code:"NMCP", name:"National Manufacturing Capability Platform",
    role:"Capability mapping and manufacturing intelligence",
    state:MODULE_STATE.COMMISSIONING, path:"/grid" },
  { id:"SKN", code:"SKN", name:"Supplier Knowledge Network",
    role:"Verified supplier and fabricator register",
    state:MODULE_STATE.DECLARED, path:null },
  { id:"TDS", code:"TDS", name:"Technical Documentation System",
    role:"Controlled documents, standards and specifications",
    state:MODULE_STATE.COMMISSIONING, path:"/docs" },
  { id:"SCP", code:"SCP", name:"Supply Chain Platform",
    role:"Corridor, logistics and materials-flow modelling",
    state:MODULE_STATE.DECLARED, path:null },
  { id:"FAI", code:"Forge AI", name:"Forge Reasoning Layer",
    role:"Planning, recommendation and capability analysis",
    state:MODULE_STATE.DECLARED, path:null },
];

// Actions the console can offer. Each is honest about whether it is wired.
// PLANNED actions render as declared capability, never as live buttons that
// silently do nothing — that would imply a backend that does not exist yet.
export const ACTION_STATE = {
  LIVE: "LIVE",         // performs a real action
  PLANNED: "PLANNED",   // declared, not yet wired
};

export function moduleByCode(code){ return MODULES.find(m => m.code === code) || null; }
