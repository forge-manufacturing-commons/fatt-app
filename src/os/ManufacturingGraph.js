// ============================================================
// FORGE — NATIONAL MANUFACTURING GRAPH
// The NMCP is not a map. It is a graph of manufacturing capability;
// geography is one projection of it. Later projections (network view,
// capability matrix, supply-chain flow) read from this same model.
//
// PROVENANCE DISCIPLINE — read before adding numbers:
// Every metric carries a provenance state. Nothing is displayed as
// operational fact unless it is VERIFIED. Design intent is labelled as
// design intent. This platform is shown to engineering bodies and
// institutions; an unverified figure presented as live capacity would
// cost more credibility than an empty field ever will.
// ============================================================

export const PROVENANCE = {
  VERIFIED:  "VERIFIED",   // confirmed, evidenced, auditable
  ENGAGED:   "ENGAGED",    // outreach opened, not yet confirmed
  DECLARED:  "DECLARED",   // design intent of the network
  UNKNOWN:   "UNKNOWN",    // not yet surveyed
};

// ---- capability classes: what a node DOES, not where it is ----
export const CAPABILITY = {
  ASSEMBLY:    { id:"ASSEMBLY",    label:"Assembly",              glyph:"▣", tone:"gold"    },
  FABRICATION: { id:"FABRICATION", label:"Fabrication",           glyph:"◤", tone:"cyan"    },
  FOUNDRY:     { id:"FOUNDRY",     label:"Foundry & Casting",     glyph:"◈", tone:"heat"    },
  MACHINING:   { id:"MACHINING",   label:"Precision Machining",   glyph:"⬢", tone:"cyan"    },
  MATERIALS:   { id:"MATERIALS",   label:"Materials & Processing",glyph:"◇", tone:"emerald" },
  ELECTRICAL:  { id:"ELECTRICAL",  label:"Electrical & Controls", glyph:"⌁", tone:"gold"    },
  ENERGY:      { id:"ENERGY",      label:"Energy Systems",        glyph:"◉", tone:"heat"    },
  LOGISTICS:   { id:"LOGISTICS",   label:"Logistics & Trade",     glyph:"▷", tone:"gold"    },
  VALIDATION:  { id:"VALIDATION",  label:"Engineering Validation",glyph:"⊞", tone:"cyan"    },
  ACADEMY:     { id:"ACADEMY",     label:"University / Polytechnic", glyph:"⌂", tone:"emerald" },
};

// ---- relationship types: every edge means something ----
export const RELATION = {
  PARTNERSHIP: { id:"PARTNERSHIP", label:"Manufacturing partnership", stroke:"solid",  weight:2.0 },
  RESEARCH:    { id:"RESEARCH",    label:"Research collaboration",    stroke:"dashed", weight:1.4 },
  TRANSFER:    { id:"TRANSFER",    label:"Knowledge transfer",        stroke:"dotted", weight:1.2 },
  CORRIDOR:    { id:"CORRIDOR",    label:"Supply-chain corridor",     stroke:"double", weight:2.6 },
  PROJECT:     { id:"PROJECT",     label:"Active project",            stroke:"pulse",  weight:2.2 },
};

// ---- node lifecycle: honest about what exists today ----
export const CELL_STATE = {
  ONLINE:   "ONLINE",    // producing, evidenced
  ENGAGED:  "ENGAGED",   // in conversation / onboarding
  DECLARED: "DECLARED",  // designed into the network, not yet engaged
};

// Metric block. Counts are null until surveyed — never invented.
const metrics = (over={}) => ({
  smes:null, machines:null, institutions:null, engineers:null,
  capacityIndex:null, provenance:PROVENANCE.UNKNOWN, ...over,
});

// ---- the graph: 18 real hubs, real WGS84, capability-first ----
export const NODES = [
  { id:"lagos",       cell:"FC-001", capability:"ASSEMBLY",    state:CELL_STATE.DECLARED, metrics:metrics() },
  { id:"abeokuta",    cell:"FC-002", capability:"MATERIALS",   state:CELL_STATE.DECLARED, metrics:metrics() },
  { id:"ibadan",      cell:"FC-003", capability:"FABRICATION", state:CELL_STATE.DECLARED, metrics:metrics() },
  { id:"ilorin",      cell:"FC-004", capability:"VALIDATION",  state:CELL_STATE.DECLARED, metrics:metrics() },
  { id:"benin",       cell:"FC-005", capability:"FOUNDRY",     state:CELL_STATE.DECLARED, metrics:metrics() },
  { id:"warri",       cell:"FC-006", capability:"ENERGY",      state:CELL_STATE.DECLARED, metrics:metrics() },
  { id:"asaba",       cell:"FC-007", capability:"LOGISTICS",   state:CELL_STATE.DECLARED, metrics:metrics() },
  { id:"portharcourt",cell:"FC-008", capability:"ENERGY",      state:CELL_STATE.DECLARED, metrics:metrics() },
  { id:"aba",         cell:"FC-009", capability:"FABRICATION", state:CELL_STATE.DECLARED, metrics:metrics() },
  { id:"enugu",       cell:"FC-010", capability:"MACHINING",   state:CELL_STATE.DECLARED, metrics:metrics() },
  { id:"onitsha",     cell:"FC-011", capability:"LOGISTICS",   state:CELL_STATE.DECLARED, metrics:metrics() },
  { id:"nnewi",       cell:"FC-012", capability:"MACHINING",   state:CELL_STATE.DECLARED, metrics:metrics() },
  { id:"jos",         cell:"FC-013", capability:"MATERIALS",   state:CELL_STATE.DECLARED, metrics:metrics() },
  { id:"kaduna",      cell:"FC-014", capability:"MACHINING",   state:CELL_STATE.DECLARED, metrics:metrics() },
  { id:"kano",        cell:"FC-015", capability:"FABRICATION", state:CELL_STATE.DECLARED, metrics:metrics() },
  { id:"maiduguri",   cell:"FC-016", capability:"LOGISTICS",   state:CELL_STATE.DECLARED, metrics:metrics() },
  { id:"sokoto",      cell:"FC-017", capability:"MATERIALS",   state:CELL_STATE.DECLARED, metrics:metrics() },
  { id:"abuja",       cell:"FC-018", capability:"VALIDATION",  state:CELL_STATE.DECLARED, metrics:metrics() },
];

// ---- edges: the manufacturing nervous system ----
export const EDGES = [
  { from:"lagos", to:"ibadan",       relation:"CORRIDOR"    },
  { from:"lagos", to:"abeokuta",     relation:"PARTNERSHIP" },
  { from:"lagos", to:"benin",        relation:"CORRIDOR"    },
  { from:"benin", to:"warri",        relation:"PARTNERSHIP" },
  { from:"warri", to:"portharcourt", relation:"CORRIDOR"    },
  { from:"asaba", to:"onitsha",      relation:"CORRIDOR"    },
  { from:"onitsha", to:"nnewi",      relation:"PARTNERSHIP" },
  { from:"nnewi", to:"aba",          relation:"PARTNERSHIP" },
  { from:"aba",  to:"enugu",         relation:"PARTNERSHIP" },
  { from:"enugu",to:"ilorin",        relation:"RESEARCH"    },
  { from:"ilorin", to:"ibadan",      relation:"RESEARCH"    },
  { from:"abuja", to:"kaduna",       relation:"CORRIDOR"    },
  { from:"kaduna", to:"kano",        relation:"CORRIDOR"    },
  { from:"kano", to:"maiduguri",     relation:"CORRIDOR"    },
  { from:"kano", to:"sokoto",        relation:"CORRIDOR"    },
  { from:"jos",  to:"kaduna",        relation:"PARTNERSHIP" },
  { from:"abuja",to:"ilorin",        relation:"TRANSFER"    },
  { from:"abuja",to:"enugu",         relation:"TRANSFER"    },
  { from:"lagos",to:"abuja",         relation:"CORRIDOR"    },
];

// ---- totals: report what is known, and how much is not ----
export function platformTotals() {
  const sum = (k) => NODES.reduce((a,n) => a + (typeof n.metrics[k]==="number" ? n.metrics[k] : 0), 0);
  const known = (k) => NODES.filter(n => typeof n.metrics[k]==="number").length;
  return {
    cellsDeclared: NODES.length,
    cellsOnline:   NODES.filter(n => n.state===CELL_STATE.ONLINE).length,
    cellsEngaged:  NODES.filter(n => n.state===CELL_STATE.ENGAGED).length,
    smes:          { value:sum("smes"),         surveyed:known("smes"),         of:NODES.length },
    institutions:  { value:sum("institutions"), surveyed:known("institutions"), of:NODES.length },
    relations:     EDGES.length,
    capabilities:  new Set(NODES.map(n=>n.capability)).size,
  };
}

// ------------------------------------------------------------
// ADVISORY LAYER — diaspora engineering bodies.
// These are the only relationships where outreach has genuinely opened,
// so they are the only entries carrying a state above DECLARED. Marked
// ENGAGED (contact made), never VERIFIED (no agreement concluded).
// ------------------------------------------------------------
export const ADVISORY = [
  { id:"nse-houston", name:"NSE Houston Branch",  kind:"Diaspora engineering body",
    relation:"TRANSFER", state:CELL_STATE.ENGAGED, provenance:PROVENANCE.ENGAGED },
  { id:"nse-glasgow", name:"NSE Glasgow Branch",  kind:"Diaspora engineering body",
    relation:"TRANSFER", state:CELL_STATE.ENGAGED, provenance:PROVENANCE.ENGAGED },
  { id:"anesa",       name:"ANESA Inc.",          kind:"Diaspora engineering body",
    relation:"RESEARCH", state:CELL_STATE.ENGAGED, provenance:PROVENANCE.ENGAGED },
];

// ------------------------------------------------------------
// NODE INTELLIGENCE — SPECIMEN DATA ONLY.
// Illustrative figures showing how a populated cell reads. Every value
// here is a specimen: it demonstrates the instrument, it is not a survey
// result. Rendered exclusively behind the console's SPECIMEN watermark.
// Real survey data will replace these one cell at a time.
// ------------------------------------------------------------
export const NODE_INTEL = {
  lagos:        { discipline:"Vehicle Assembly",       capacity:78, suppliers:186, universities:7, projects:22, readiness:"COMMISSIONING" },
  kaduna:       { discipline:"Precision Machining",    capacity:82, suppliers:142, universities:5, projects:18, readiness:"COMMISSIONING" },
  kano:         { discipline:"Heavy Fabrication",      capacity:71, suppliers:158, universities:4, projects:14, readiness:"COMMISSIONING" },
  nnewi:        { discipline:"Automotive Components",  capacity:88, suppliers:240, universities:3, projects:26, readiness:"COMMISSIONING" },
  aba:          { discipline:"Light Fabrication",      capacity:74, suppliers:198, universities:2, projects:16, readiness:"COMMISSIONING" },
  portharcourt: { discipline:"Energy Systems",         capacity:69, suppliers:96,  universities:4, projects:12, readiness:"COMMISSIONING" },
  enugu:        { discipline:"Precision Machining",    capacity:66, suppliers:88,  universities:5, projects:10, readiness:"COMMISSIONING" },
  ibadan:       { discipline:"Fabrication",            capacity:72, suppliers:120, universities:6, projects:13, readiness:"COMMISSIONING" },
  abuja:        { discipline:"Engineering Validation", capacity:64, suppliers:74,  universities:8, projects:20, readiness:"COMMISSIONING" },
  benin:        { discipline:"Foundry & Casting",      capacity:70, suppliers:82,  universities:3, projects:9,  readiness:"COMMISSIONING" },
};
// default for cells without a specimen sheet — honestly pending
export const INTEL_DEFAULT = { discipline:null, capacity:null, suppliers:null, universities:null, projects:null, readiness:"SURVEY PENDING" };

// the actions a decision panel offers — all REAL, none fabricated
export const CELL_ACTIONS = [
  { id:"register",  label:"Register capability",   kind:"primary" },
  { id:"survey",    label:"Contribute survey data",kind:"primary" },
  { id:"docs",      label:"Open documentation",    kind:"ghost"   },
  { id:"standards", label:"View standards",        kind:"ghost"   },
  { id:"consortium",label:"Join consortium",       kind:"ghost"   },
];
