// ============================================================
// FORGE MANUFACTURING COMMAND CENTER — single source of truth
// Coordinates are % positions within the FULL transparent_overlay_top.png
// coordinate plane (2000x2000). Calibrated against the plate's actual
// alpha-mask bounds (bbox 234,382 → 1844,1710) via geo-projection and
// verified on-plate programmatically. Do not nudge with CSS — edit here.
// ============================================================

export const HUBS = [
  { id: "lagos", labelDx: -30, labelDy: 4, labelAnchor: "end", leader: false,  name: "Lagos",           shortName: "LAG", region: "South West",    x: 16.5, y: 70.4, type: "mega",       status: "coordinating",  specialty: "Vehicle integration & logistics",
    capabilities: ["Mega manufacturing", "Logistics", "Commercial coordination", "Engineering ecosystem"],
    projects: ["NAWEDOAM supply routes"], builders: 42, smes: 11, institutions: 3, featured: false, lastActivity: "Supplier matched · 46min" },
  { id: "ilorin", labelDx: 0, labelDy: 16, labelAnchor: "middle", leader: false, name: "Ilorin",          shortName: "ILR", region: "North Central", x: 24.3, y: 56.3, type: "education",  status: "verifying",  specialty: "Technical education & fabrication",
    capabilities: ["Technical education", "Fabrication", "Skills development"],
    projects: ["Workforce pipeline"], builders: 18, smes: 5, institutions: 4, featured: false, lastActivity: "Drawing check in review · Engr. Okonkwo" },
  { id: "abuja", labelDx: 16, labelDy: 0, labelAnchor: "start", leader: false,  name: "Abuja",           shortName: "ABJ", region: "FCT",           x: 44.0, y: 52.4, type: "capital",    status: "standby",  specialty: "National coordination & policy",
    capabilities: ["National coordination", "Policy", "Institutional engagement"],
    projects: ["Program governance"], builders: 9,  smes: 2, institutions: 5, featured: false, lastActivity: "Permit approved · 2h" },
  { id: "kaduna", labelDx: 16, labelDy: 0, labelAnchor: "start", leader: false, name: "Kaduna",          shortName: "KAD", region: "North West",    x: 43.7, y: 42.4, type: "industrial", status: "expanding",  specialty: "Heavy industry & engineering",
    capabilities: ["Heavy industry", "Engineering", "Northern industrial capacity"],
    projects: ["Steel sourcing"], builders: 15, smes: 4, institutions: 2, featured: false, lastActivity: "Onboarding new SME · today" },
  { id: "kano", labelDx: 16, labelDy: 0, labelAnchor: "start", leader: false,   name: "Kano",            shortName: "KAN", region: "North West",    x: 50.9, y: 32.1, type: "industrial", status: "standby",  specialty: "Northern manufacturing ecosystem",
    capabilities: ["Manufacturing", "Production ecosystem", "Trade networks"],
    projects: ["Component distribution"], builders: 21, smes: 7, institutions: 2, featured: false, lastActivity: "Waiting for revision" },
  { id: "benin", labelDx: -34, labelDy: -10, labelAnchor: "end", leader: true,  name: "Benin City",      shortName: "BEN", region: "South South",   x: 31.5, y: 71.2, type: "fabrication",status: "sleeping",  specialty: "Engineering, machining & fabrication",
    capabilities: ["Engineering", "Machining", "Fabrication"],
    projects: ["Body panel study"], builders: 14, smes: 6, institutions: 2, featured: false, lastActivity: "Dormant · joining next cycle", labelDx: -34, labelDy: -10, labelAnchor: "end",    leader: false },
  { id: "warri", labelDx: -38, labelDy: 14, labelAnchor: "end", leader: true,  name: "Effurun / Warri", shortName: "WAR", region: "South South",   x: 32.5, y: 76.7, type: "alpha",      status: "fabricating",  specialty: "Forge Alpha Fabrication Hub",
    capabilities: ["Heavy fabrication", "Industrial welding", "Energy engineering", "Marine engineering"],
    projects: ["NAWEDOAM", "Steel chassis", "Structural frames"], builders: 27, smes: 8, institutions: 2, featured: true, lastActivity: "Torch cooling · Engr. Adebayo", labelDx: -38, labelDy: 14,  labelAnchor: "end",    leader: true },
  { id: "ph", labelDx: 6, labelDy: 30, labelAnchor: "middle", leader: true,     name: "Port Harcourt",   shortName: "PHC", region: "South South",   x: 40.8, y: 81.8, type: "energy",     status: "standby",  specialty: "Energy & marine engineering",
    capabilities: ["Energy", "Marine engineering", "Oil & gas industrial capability"],
    projects: ["Pressure systems review"], builders: 16, smes: 5, institutions: 2, featured: false, lastActivity: "Awaiting material · pressure test", labelDx: 6,   labelDy: 30,  labelAnchor: "middle", leader: true },
  { id: "aba", labelDx: 34, labelDy: 12, labelAnchor: "start", leader: true,    name: "Aba",             shortName: "ABA", region: "South East",    x: 43.2, y: 79.7, type: "sme",        status: "active",  specialty: "Dense SME production",
    capabilities: ["SME production", "Manufacturing entrepreneurship", "Rapid fabrication"],
    projects: ["Fitting & trim study"], builders: 25, smes: 12, institutions: 1, featured: false, lastActivity: "Component accepted · 3h", labelDx: 34,  labelDy: 12,  labelAnchor: "start",  leader: false },
  { id: "nnewi", labelDx: 34, labelDy: -12, labelAnchor: "start", leader: true,  name: "Nnewi",           shortName: "NNW", region: "South East",    x: 40.2, y: 73.4, type: "automotive", status: "fabricating",  specialty: "Automotive manufacturing",
    capabilities: ["Automotive manufacturing", "Industrial capability", "Parts ecosystem"],
    projects: ["Drivetrain sourcing"], builders: 19, smes: 9, institutions: 1, featured: false, lastActivity: "Fabrication in progress · 12min", labelDx: 34,  labelDy: -12, labelAnchor: "start",  leader: false },
];

// Storytelling supply graph (section 16) — meaningful direction, not roads.
export const LINKS = [
  ["lagos", "ilorin"], ["ilorin", "abuja"], ["abuja", "kaduna"], ["kaduna", "kano"],
  ["lagos", "benin"], ["benin", "warri"], ["warri", "ph"], ["ph", "aba"], ["aba", "nnewi"],
];

// Network-level stats. SEED DATA — clearly marked in the UI; these grow
// from real registrations, never presented as audited national figures.
export const NETWORK_STATS = [
  { label: "Manufacturing cities in the network", value: HUBS.length, seed: false },
  { label: "Builder network capacity (target)", value: HUBS.reduce((a, h) => a + h.builders, 0), seed: true },
  { label: "SME capacity (target)", value: HUBS.reduce((a, h) => a + h.smes, 0), seed: true },
  { label: "Institutional participation (target)", value: HUBS.reduce((a, h) => a + h.institutions, 0), seed: true },
];

export const SEQUENCE = { plate: 0.2, hubStart: 0.9, hubStep: 0.14, lines: 2.4, particles: 3.2, stats: 2.8 };
