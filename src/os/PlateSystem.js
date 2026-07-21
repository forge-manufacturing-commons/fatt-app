// ============================================================
// FORGE PLATE SYSTEM
// The signature visual artifact of the Forge Foundation. Not a map —
// a family of precision manufacturing-intelligence plates. Every
// jurisdiction, sector, or material becomes a plate in one visual
// language: engraved graphite, satin gold datum, controlled-document
// metadata, coordinate crosshair.
//
//   Nigeria Plate · ECOWAS Plate · Africa Plate ·
//   Automotive Plate · Aluminium Plate · Battery Plate · ...
//
// NMCP-NGA-001 is the first plate. Its structure is the template.
// ============================================================

export const PLATE_SYSTEM = {
  family: "Forge Plate System",
  datumSymbol: "⊕",          // the coordinate crosshair — permanent Forge mark
  template: {
    metadataFields: ["dataset","revision","status","projection","datum","scale","date","source"],
    layerModel: "independent activation",
    palette: ["graphite","steel","engineering-white","forge-gold","inspection-green","signal-cyan"],
  },
};

// This plate. Renamed per RO: it documents CAPABILITY, not commands.
export const PLATE = {
  id: "NMCP-NGA-001",
  title: "National Manufacturing Capability Plate",
  short: "NMCP",
  platform: "National Manufacturing Capability Platform",
  authority: "FORGE FOUNDATION",
  revision: "1.0",
  status: "CONTROLLED",
  projection: "EPSG:4326 (WGS 84)",
  datum: "WGS 84",
  scale: "1:4,200,000 (nominal)",
  date: "2026",
  source: "Forge Foundation · National Survey (in progress)",
};

// ---- INDUSTRIAL SECTORS — the layer selector (engraved panel, not UI) ----
export const SECTORS = [
  { id:"automotive",  label:"Automotive",  active:true  },
  { id:"fabrication", label:"Fabrication", active:true  },
  { id:"machining",   label:"Machining",   active:true  },
  { id:"casting",     label:"Casting & Foundry", active:true },
  { id:"composite",   label:"Composite",   active:false },
  { id:"electrical",  label:"Electrical",  active:true  },
  { id:"energy",      label:"Energy",      active:true  },
  { id:"marine",      label:"Marine",      active:false },
  { id:"rail",        label:"Rail",        active:false },
  { id:"aerospace",   label:"Aerospace",   active:false },
  { id:"agriculture", label:"Agriculture", active:false },
  { id:"defence",     label:"Defence",     active:false },
];

// ---- STATUS — provenance-honest. What is mapped vs surveyed. ----
export const STATUS = {
  networkMapped:   { value:18, unit:"CELLS DECLARED", verified:false },
  surveyProgress:  { value:0,  unit:"% SURVEYED",     verified:true  },
  smes:            { value:null, unit:"SMEs",         verified:false },
  fabricators:     { value:null, unit:"FABRICATORS",  verified:false },
  universities:    { value:null, unit:"UNIVERSITIES", verified:false },
  researchLabs:    { value:null, unit:"RESEARCH LABS",verified:false },
};
