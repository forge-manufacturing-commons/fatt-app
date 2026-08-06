// ============================================================
// FORGE STUDIO — consumption layer (Software Engineering side)
//
// ForgeStudio_Alpha is the frozen design authority. This module
// is the runtime API through which the app consumes it. Every
// asset URL, every token, every motion recipe references what
// ForgeStudio shipped — not our re-interpretation of it.
//
// Rule (Handover §"Do not"): do not redesign, recreate, invent.
// This file only READS the studio. If a new asset is needed,
// ForgeStudio Beta ships it. Not us.
// ============================================================

// ---- Design tokens (Forge_Design_Tokens.md, canonical hex values)
export const STUDIO_TOKENS = {
  gold:       "#F5A623",  // primary accent — ownership, verification, ankara warm motif
  cyan:       "#0A7F73",  // signal accent — network, inspection
  emerald:    "#1a7a4a",  // secondary accent — growth, SME-assigned state
  heat:       "#F5A623",  // hot accent — fabrication, welding, alerts
  steel:      "#8899aa",  // primary neutral — body metal
  steelDark:  "#1C2128",  // deep neutral — panels, backgrounds
  cream:      "#F5F1E9",  // light neutral — labels, edge highlights
};

// ---- Asset URL builder — assets are at /forge-studio/lib/{category}/{file}.svg
const BASE = "/forge-studio/lib";
const url = (cat, file) => `${BASE}/${cat}/${file}.svg`;

// ---- Registry indexed by ID (per Asset_Registry.json)
export const STUDIO = {
  // Geometry
  ankaraWeave:      url("Geometry", "geo-ankara-weave"),
  forgedLattice:    url("Geometry", "geo-forged-lattice"),
  assemblyGrid:     url("Geometry", "geo-assembly-grid"),
  routingGeometry:  url("Geometry", "geo-routing-geometry"),
  verificationLines:url("Geometry", "geo-verification-lines"),
  networkPulses:    url("Geometry", "geo-network-pulses"),
  // Lighting
  weldingFlash:     url("Lighting", "lgt-welding-flash"),
  inspectionLaser:  url("Lighting", "lgt-inspection-laser"),
  statusLeds:       url("Lighting", "lgt-status-leds"),
  heatGlow:         url("Lighting", "lgt-heat-glow"),
  // Engineering overlays
  ruler:            url("Engineering", "eng-ruler"),
  dimensionArrow:   url("Engineering", "eng-dimension-arrow"),
  calloutBox:       url("Engineering", "eng-callout-box"),
  crosshair:        url("Engineering", "eng-crosshair"),
  serialPlate:      url("Engineering", "eng-serial-plate"),
  coordinateSystem: url("Engineering", "eng-coordinate-system"),
  fixturePin:       url("Engineering", "eng-fixture-pin"),
  inspectionStamp:  url("Engineering", "eng-inspection-stamp"),
  originMarker:     url("Engineering", "eng-origin-marker"),
  datumLine:        url("Engineering", "eng-datum-line"),
  verificationSeal: url("Engineering", "eng-verification-seal"),
  weldGuide:        url("Engineering", "eng-weld-guide"),
  // Status & Ownership
  staUnassigned:    url("Status", "sta-unassigned"),
  staAssigned:      url("Status", "sta-assigned"),
  staInFabrication: url("Status", "sta-in-fabrication"),
  staVerification:  url("Status", "sta-verification"),
  staVerified:      url("Status", "sta-verified"),
  staDeployed:      url("Status", "sta-deployed"),
  // Dashboard
  dshBuildProgress: url("Dashboard", "dsh-build-progress"),
  dshMesPanel:      url("Dashboard", "dsh-mes-panel"),
  dshScadaWidget:   url("Dashboard", "dsh-scada-widget"),
  dshDigitalLabel:  url("Dashboard", "dsh-digital-label"),
  dshInspectionCard:url("Dashboard", "dsh-inspection-card"),
  dshMachineClock:  url("Dashboard", "dsh-machine-clock"),
  dshTerminalWidget:url("Dashboard", "dsh-terminal-widget"),
  dshPartTracker:   url("Dashboard", "dsh-part-tracker"),
  dshProductionCard:url("Dashboard", "dsh-production-card"),
  dshFactoryCounter:url("Dashboard", "dsh-factory-counter"),
  // Environment
  envFactoryFloor:  url("Environment", "env-factory-floorplan"),
  envHeroPlatform:  url("Environment", "env-hero-platform-plan"),
  wksSteelBeam:     url("Environment", "wks-steel-beam"),
  wksCableTray:     url("Environment", "wks-cable-tray"),
  wksCraneSilhouette: url("Environment", "wks-crane-silhouette"),
  wksFactoryWindow: url("Environment", "wks-factory-window"),
  wksWorkshopWall:  url("Environment", "wks-workshop-wall"),
  wksReflectiveFloor:url("Environment", "wks-reflective-floor"),
  wksFactoryShadow: url("Environment", "wks-factory-shadow"),
  wksMachineShadow: url("Environment", "wks-machine-shadow"),
  wksFloorMarking:  url("Environment", "wks-floor-marking"),
  wksPaintStripe:   url("Environment", "wks-paint-stripe"),
  wksForkliftRoute: url("Environment", "wks-forklift-route"),
  wksStorageRack:   url("Environment", "wks-storage-rack"),
  wksSteelTable:    url("Environment", "wks-steel-table"),
  wksOilStain:      url("Environment", "wks-oil-stain"),
  // Particles & Atmosphere
  factoryHaze:      url("Particles", "vfx-factory-haze"),
  dustParticles:    url("Particles", "vfx-dust-particles"),
  heatShimmer:      url("Particles", "vfx-heat-shimmer"),
  ledIndicator:     url("Particles", "vfx-led-indicator"),
  weldingSparks:    url("Particles", "vfx-welding-sparks"),
  // Nigeria — schematic overlays (photoreal machined billet is a Blender deliverable)
  ngaIndustrialHubs:  url("Nigeria", "nga-industrial-hubs"),
  ngaTransport:       url("Nigeria", "nga-transport-corridors"),
  ngaPowerGrid:       url("Nigeria", "nga-power-grid"),
  ngaNightLights:     url("Nigeria", "nga-night-lights"),
  ngaHeatmap:         url("Nigeria", "nga-heatmap-industry"),
  ngaBlueprint:       url("Nigeria", "nga-blueprint-view"),
  ngaWireframe:       url("Nigeria", "nga-wireframe-view"),
  ngaHubDetail:       url("Nigeria", "nga-hub-indicator-detail"),
  ngaChannelSections: url("Nigeria", "nga-channel-sections"),
  // Motion
  motAssemblySnap:    url("Animation", "mot-assembly-snap"),
  motBlueprintReveal: url("Animation", "mot-blueprint-reveal"),
  motComponentLock:   url("Animation", "mot-component-lock"),
  motConveyor:        url("Animation", "mot-conveyor-motion"),
  motFactoryPulse:    url("Animation", "mot-factory-pulse"),
  motMachineBoot:     url("Animation", "mot-machine-boot"),
  motMechanicalSlide: url("Animation", "mot-mechanical-slide"),
  motIndustrialFade:  url("Animation", "mot-industrial-fade"),
  // Identity
  idnLogoStamped:   url("Identity", "idn-logo-stamped"),
  idnSerial:        url("Identity", "idn-serial-number"),
};

// ---- Hub Industrial Identity — verbatim from Hub_Industrial_Identity.md
// 18 hubs, real coordinates, industrial identity + accent bucket.
// Do NOT re-map coordinates or invent a 5th accent bucket.
export const STUDIO_HUBS = [
  { id:"lagos",     name:"Lagos",         lat:6.45,  lon:3.39,  identity:"Assembly & Logistics",      accent:"gold"    },
  { id:"abeokuta",  name:"Abeokuta",      lat:7.15,  lon:3.35,  identity:"Textile & Agro-Processing", accent:"emerald" },
  { id:"ibadan",    name:"Ibadan",        lat:7.38,  lon:3.90,  identity:"Manufacturing & Trade",     accent:"gold"    },
  { id:"ilorin",    name:"Ilorin",        lat:8.50,  lon:4.55,  identity:"Engineering Validation",    accent:"cyan"    },
  { id:"benin",     name:"Benin City",    lat:6.34,  lon:5.63,  identity:"Foundry",                   accent:"heat"    },
  { id:"warri",     name:"Warri",         lat:5.52,  lon:5.75,  identity:"Energy",                    accent:"heat", featured:true },
  { id:"asaba",     name:"Asaba",         lat:6.20,  lon:6.73,  identity:"Logistics & Trade",         accent:"gold"    },
  { id:"portharcourt", name:"Port Harcourt", lat:4.82, lon:7.05, identity:"Oil & Gas",                accent:"heat"    },
  { id:"aba",       name:"Aba",           lat:5.12,  lon:7.37,  identity:"Fabrication",               accent:"gold"    },
  { id:"owerri",    name:"Owerri",        lat:5.48,  lon:7.03,  identity:"Trade & Services",          accent:"gold"    },
  { id:"enugu",     name:"Enugu",         lat:6.44,  lon:7.50,  identity:"Solid Minerals",            accent:"emerald" },
  { id:"onitsha",   name:"Onitsha",       lat:6.15,  lon:6.79,  identity:"Trade & Distribution",      accent:"gold"    },
  { id:"nnewi",     name:"Nnewi",         lat:6.02,  lon:6.92,  identity:"Automotive Manufacturing",  accent:"cyan"    },
  { id:"makurdi",   name:"Makurdi",       lat:7.73,  lon:8.53,  identity:"Agriculture Processing",    accent:"emerald" },
  { id:"jos",       name:"Jos",           lat:9.90,  lon:8.90,  identity:"Solid Minerals",            accent:"emerald" },
  { id:"kaduna",    name:"Kaduna",        lat:10.52, lon:7.44,  identity:"Heavy Industry",            accent:"emerald" },
  { id:"kano",      name:"Kano",          lat:12.00, lon:8.52,  identity:"Manufacturing",             accent:"gold"    },
  { id:"maiduguri", name:"Maiduguri",     lat:11.85, lon:13.15, identity:"Agriculture Processing",    accent:"emerald" },
];

// Equirectangular projection from Hub_Industrial_Identity.md bbox.
// bbox: lat 4.2°N–13.9°N, lon 2.7°E–14.7°E → 0..100% within Nigeria plate.
const LAT_MIN = 4.2, LAT_MAX = 13.9, LON_MIN = 2.7, LON_MAX = 14.7;
export function projectHub(lat, lon) {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * 100;
  const y = 100 - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 100; // invert (SVG y grows down)
  return { x, y };
}

// ---- Motion Vocabulary — canonical CSS keyframe names (defined in .css)
// Runtime animations are added by SE, NOT by the SVG file (Known_Issues.md).
// Reference implementations documented in Motion_Vocabulary.md.
export const STUDIO_MOTION = {
  laserSweep:       "forge-laser-sweep",       // 2.4s ease-in-out — verification/scan
  weldFlash:        "forge-weld-flash",        // 1.6s irregular flicker — fabrication
  blueprintReveal:  "forge-grid-in",           // 3s ease-out — CAD view introduction
  machineBoot:      "forge-boot",              // 2.4s staggered — page/system power-on
  componentLock:    "forge-lock",              // 2.4s ease-in-out — assignment/commit
  mechanicalSlide:  "forge-slide",             // 3s — panel/drawer transition
  industrialFade:   "forge-industrial-fade",   // 3s ease-in-out — soft state change
};
