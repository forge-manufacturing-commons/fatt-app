// ============================================================
// FORGE OS — BLENDER SOCKET  (directive Phase 10)
//
// "Every Blender asset must have a clean integration point.
//  GLB / PNG / SVG / Animation. No refactoring should be required
//  when production assets arrive."
//
// The socket is declared NOW and resolves at runtime. A missing asset
// degrades to its Studio SVG schematic — it never breaks a room, and
// it never silently pretends the render exists.
//
// Blender pipeline state (Forge_World_v0.3.blend, Session 3):
//   Nigeria plate: real GADM boundary, 18 hubs at real WGS84,
//   gold chamfer as geometry, industrial pedestal. Renders produced.
//   Truck GLB: exists. Environment renders: not yet exported.
// ============================================================

import { STUDIO } from "../lib/ForgeStudio.js";

export const BLENDER = {
  // Nigeria Manufacturing Command Center — Session 3 deliverables.
  nigeriaHero:        { slot:"/renders/nigeria/hero.png",         fallback:STUDIO.nigeriaHubs || null, camera:"CAM_HERO_FRONT_085MM_A_0001",     status:"rendered · awaiting export" },
  nigeriaOrtho:       { slot:"/renders/nigeria/orthographic.png", fallback:null, camera:"CAM_ORTHO_TOP_000MM_A_0001",       status:"rendered · awaiting export" },
  nigeriaBlueprint:   { slot:"/renders/nigeria/blueprint.png",    fallback:null, camera:"CAM_BLUEPRINT_TOP_000MM_A_0001",   status:"rendered · awaiting export" },
  nigeriaInspection:  { slot:"/renders/nigeria/inspection.png",   fallback:null, camera:"CAM_INSPECT_LOW_050MM_A_0001",     status:"rendered · awaiting export" },
  nigeriaMacro:       { slot:"/renders/nigeria/macro-warri.png",  fallback:null, camera:"CAM_MACRO_HUB_100MM_A_0001",       status:"rendered · awaiting export" },
  // Vehicle
  vehicleGLB:         { slot:"/models/nawedoam.glb",              fallback:null, camera:"CAM_ORBIT_RING_085MM_A_0001",      status:"pending Blender export" },
  // Hero manufacturing bay (directive Phase 2)
  bayHero:            { slot:"/renders/bay/hero.png",             fallback:null, camera:"CAM_HERO_FRONT_085MM_A_0001",      status:"pending Blender export" },
};

export function blenderAsset(name) {
  const a = BLENDER[name];
  if (!a) { console.error(`[FORGE OS] No Blender socket "${name}".`); return null; }
  return a;
}
// True only when a production render has actually landed in /public.
export const hasRender = name => Boolean(BLENDER[name]?.landed);
