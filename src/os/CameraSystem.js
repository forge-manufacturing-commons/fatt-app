// ============================================================
// FORGE OS — CAMERA SYSTEM  (directive Phase 8)
//
// Command_Center_Spec.md §"Official Forge camera registry":
//   "These 8 are the ONLY approved cameras — every future render
//    must reference one."
//
// In the runtime a camera is a VIEW CONTRACT: it sets how a room
// presents its subject (framing, overlay grammar, grade). Rooms
// declare a camera; they do not invent framing.
// ============================================================

export const CAMERAS = {
  hero:          { id:"CAM_HERO_FRONT_085MM_A_0001",      label:"Hero",               lens:"85mm",  grade:"hero",       overlays:["registration"],                          note:"10° plate tilt visible, gold chamfer in silhouette" },
  orthographic:  { id:"CAM_ORTHO_TOP_000MM_A_0001",       label:"Orthographic",       lens:"ortho", grade:"documentation", overlays:["grid","datum","dimension"],           note:"true ortho, top" },
  blueprint:     { id:"CAM_BLUEPRINT_TOP_000MM_A_0001",   label:"Blueprint",          lens:"ortho", grade:"blueprint",  overlays:["grid","datum","dimension","cad"],        note:"ortho top + blueprint post-process" },
  inspection:    { id:"CAM_INSPECT_LOW_050MM_A_0001",     label:"Inspection",         lens:"50mm",  grade:"inspection", overlays:["scanline","tolerance","stamp"],          note:"low grazing angle to read machining marks" },
  exploded:      { id:"CAM_EXPLODE_FRONT_035MM_A_0001",   label:"Exploded",           lens:"35mm",  grade:"documentation", overlays:["assembly-arrow","callout"],           note:"fits full explode height" },
  macro:         { id:"CAM_MACRO_HUB_100MM_A_0001",       label:"Macro",              lens:"100mm", grade:"macro",      overlays:["crosshair","callout"],                   note:"100mm macro on a single hub indicator" },
  orbit:         { id:"CAM_ORBIT_RING_085MM_A_0001",      label:"Orbit",              lens:"85mm",  grade:"hero",       overlays:[],                                        note:"circular path, 8s+ period, constant elevation" },
  review:        { id:"CAM_REVIEW_34_050MM_A_0001",       label:"Engineering Review", lens:"50mm",  grade:"documentation", overlays:["datum","callout"],                    note:"3/4 view, neutral, documentation-grade" },
};

export function camera(name) {
  const c = CAMERAS[name];
  if (!c) { console.error(`[FORGE OS] Camera "${name}" is not one of the 8 approved cameras (Command_Center_Spec.md).`); return CAMERAS.review; }
  return c;
}
// A room's camera drives its overlay grammar and grade class.
export const cameraClass = name => `forge-cam forge-cam--${camera(name).grade}`;
