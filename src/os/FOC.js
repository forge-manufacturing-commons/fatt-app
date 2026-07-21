// ============================================================
// FORGE OPERATIONS CONSOLE (FOC)
// The operating environment of the Forge Foundation. NMCP is one
// intelligence system inside it; others are reserved for future build.
//
// DATA DISCIPLINE — SPECIMEN MODE:
// This console demonstrates the full operational instrument using
// SPECIMEN data — illustrative values that show what the platform will
// present once surveyed. Every specimen value is watermarked and tagged.
// Nothing here is a verified operational figure. When real survey data
// lands, specimen values are replaced field by field and lose the tag.
// The distinction is never hidden from the viewer.
// ============================================================

export const FOC = {
  name: "Forge Operations Console",
  short: "FOC",
  tagline: "National Manufacturing Knowledge Infrastructure",
  modules: [
    { id:"NMCP", label:"National Manufacturing Capability Platform", state:"ACTIVE"   },
    { id:"SKN",  label:"Supplier Knowledge Network",                 state:"RESERVED" },
    { id:"TDS",  label:"Technical Documentation System",             state:"RESERVED" },
    { id:"SCP",  label:"Supply Chain Platform",                      state:"RESERVED" },
    { id:"FAI",  label:"Forge AI — Reasoning & Planning",            state:"RESERVED" },
  ],
};

// data-state tags — every value carries one
export const DATA_STATE = {
  VERIFIED: "VERIFIED",   // surveyed, evidenced
  SPECIMEN: "SPECIMEN",   // illustrative — shown to demonstrate the instrument
  PENDING:  "PENDING",    // structure exists, no value yet
};

// specimen helper — marks a value as illustrative
export const specimen = (v) => ({ value:v, state:DATA_STATE.SPECIMEN });
export const pending   = ()  => ({ value:null, state:DATA_STATE.PENDING });
export const verified  = (v) => ({ value:v, state:DATA_STATE.VERIFIED });
