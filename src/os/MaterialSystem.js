// ============================================================
// FORGE OS — MATERIAL SYSTEM  (directive Phase 7)
//
// "Map Forge Studio materials directly into runtime.
//  Never redefine materials in individual components."
//
// PROVENANCE — read before trusting this file:
//  • The 8 SURFACE swatches below are REAL. They are exactly the
//    files ForgeStudio_Alpha ships in Materials/. Nothing invented.
//  • The 7 colour TOKENS are REAL (Forge_Design_Tokens.md).
//  • The `physical` properties are DERIVED. Studio's
//    "Material System full swatch + physical-property specification"
//    is listed under CHANGELOG [Unreleased]. Replace on Beta.
//    Do not treat `PHYSICAL` as design authority.
// ============================================================

import { STUDIO_TOKENS } from "../lib/ForgeStudio.js";

const M = "/forge-studio/lib/Materials";

// The 8 real surface treatments Forge Studio ships.
export const SURFACES = {
  forgedPlate:       { id:"MAT_SURFACE_FORGEDPLATE_A_0001",       swatch:`${M}/mat-forged-plate.svg`,        role:"plate body — the Nigeria plate, structural panels" },
  forgedChamfer:     { id:"MAT_SURFACE_FORGEDCHAMFER_A_0001",     swatch:`${M}/mat-forged-chamfer.svg`,      role:"machined edge — ownership, verification" },
  cutSteelEdge:      { id:"MAT_SURFACE_CUTSTEELEDGE_A_0001",      swatch:`${M}/mat-cut-steel-edge.svg`,      role:"laser/waterjet cut edge" },
  steelMesh:         { id:"MAT_SURFACE_STEELMESH_A_0001",         swatch:`${M}/mat-steel-mesh.svg`,          role:"guarding, safety screens" },
  honeycombPanel:    { id:"MAT_SURFACE_HONEYCOMBPANEL_A_0001",    swatch:`${M}/mat-honeycomb-panel.svg`,     role:"lightweight structural panel" },
  machinePerforation:{ id:"MAT_SURFACE_MACHINEPERFORATION_A_0001",swatch:`${M}/mat-machine-perforation.svg`, role:"machine body perforation" },
  machineVents:      { id:"MAT_SURFACE_MACHINEVENTS_A_0001",      swatch:`${M}/mat-machine-vents.svg`,       role:"machine cooling vents" },
  ventilationHoles:  { id:"MAT_SURFACE_VENTILATIONHOLES_A_0001",  swatch:`${M}/mat-ventilation-holes.svg`,   role:"enclosure ventilation" },
};

// Colour materials = the 7 canonical tokens, with their sanctioned role.
export const MATERIALS = {
  steel:   { token:STUDIO_TOKENS.steel,     role:"primary body metal" },
  forged:  { token:STUDIO_TOKENS.steelDark, role:"structural, panels, backgrounds" },
  gold:    { token:STUDIO_TOKENS.gold,      role:"machined edge, ownership, verification" },
  heat:    { token:STUDIO_TOKENS.heat,      role:"weld, fabrication, hot process, alert" },
  cyan:    { token:STUDIO_TOKENS.cyan,      role:"inspection, precision, signal" },
  emerald: { token:STUDIO_TOKENS.emerald,   role:"accepted, verified, live" },
  cream:   { token:STUDIO_TOKENS.cream,     role:"labels, stroke language" },
};

// DERIVED — not Studio law. Keeps surface response consistent until Beta.
export const PHYSICAL = {
  _provenance:"DERIVED. Studio Material System spec is [Unreleased]. Replace on Beta.",
  steel:  { roughness:.34, metallic:1  },
  forged: { roughness:.52, metallic:1  },
  gold:   { roughness:.22, metallic:1  },
  heat:   { roughness:.44, metallic:.6 },
  cyan:   { roughness:.40, metallic:.5 },
  emerald:{ roughness:.40, metallic:.5 },
  cream:  { roughness:.45, metallic:.3 },
};

// The ONLY sanctioned way a component expresses a material.
export function material(name) {
  const m = MATERIALS[name];
  if (!m) { console.error(`[FORGE OS] Material "${name}" is not in the Material System. Do not define one locally.`); return null; }
  return m;
}
export function surface(name) {
  const s = SURFACES[name];
  if (!s) { console.error(`[FORGE OS] Surface "${name}" is not a Forge Studio material asset.`); return null; }
  return s;
}
export const materialVar = name => (material(name) ? material(name).token : "transparent");
