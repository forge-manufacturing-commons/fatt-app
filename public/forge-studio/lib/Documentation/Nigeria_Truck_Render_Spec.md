# Nigeria Map & NAWEDOAM Truck — Render Spec / Shot List
Source brief: `uploads/ChatGPT Image Jul 12, 2026, 05_38_31 AM.png` (Forge Studio internal spec sheet). This document translates that brief into a written production spec for the Blender pipeline (`forge_foundry/`) — Forge Studio (this vector library) cannot produce photoreal 3D renders, turntables, or animation exports; those require an actual render pass in Blender.

## MISSION 001 — Nigeria Manufacturing Plate (supersedes the general Part 1 map brief below in intent, not geometry)

**This is not a map. It is an industrial object** — Nigeria reengineered as a single CNC-machined forged-steel billet representing the nation's manufacturing capability.

### Physical spec
- Tilt: 10° on X-axis (positive), permanently, so the gold chamfer is always visible
- Thickness: 25–40mm
- Top surface: brushed steel (PBR, anisotropic brush pattern, NOT glossy chrome)
- Perimeter: gold chamfer, full perimeter, 2–4mm, plus micro-bevels
- Surface detail: laser-engraved state boundaries, engraved transport corridors, engraved manufacturing corridors, engraved power corridors
- Wear layer: industrial wear, steel scratches, machined tool marks, subtle AO, roughness variation — deliberately NOT pristine/toylike
- Hubs: physically embedded (recessed/engraved), each an illuminated engineering node — not a decal or pin

### 18 hubs — real coordinates (do not estimate)
Full list with real lat/lon and per-hub industrial identity: see `Hub_Industrial_Identity.md`. Lagos, Abeokuta, Ibadan, Ilorin, Benin City, Warri, Asaba, Port Harcourt, Aba, Owerri, Enugu, Onitsha, Nnewi, Makurdi, Jos, Kaduna, Kano, Maiduguri.

### Required export views
Hero View · 10° Hero Tilt · Top Orthographic · Exploded View · Wireframe · Blueprint · Night Mode · Power Grid · Industrial Heat Map · Transparent PNG · GLB · FBX · Blend · OBJ

### What Forge Studio ships now vs. what this mission requires
This vector library has shipped an **updated, coordinate-accurate schematic** of the 18-hub network (`NGA_MAP_INDUSTRIALHUBS_A_0001`, real-coordinate projection, SMIL-animated node pulses, industrial-identity color coding) and this written mission spec. The physical CNC-machined steel billet — material shading, engraving, wear, AO, and the GLB/FBX/Blend/OBJ exports — requires an actual Blender modeling + render pass; it cannot be produced as an SVG. Treat this document as the brief that pass should execute against.

---

## Part 1 — Nigeria Map (NGA_) — general brief (see Mission 001 above for the current authoritative spec)
**Material:** brushed steel body, gold chamfer edge (2–4mm), per Forge Design Tokens (Forge Gold #C89B4A, Forge Steel #7C8085).
**Geometry:** engraved state boundaries, subtle LGA grid, major cities + coordinates, manufacturing hubs (see hub list below), transport corridors (road/rail/port), power infrastructure, industrial zones (oil & gas, solid minerals, agriculture, manufacturing).
**Tilt:** 10° on X-axis (hero view) so the gold chamfer reads in silhouette.

### Views required
| View | Naming |
|---|---|
| Top (0°) | `NGA_MAP_TOP_0DEG_A_0001` |
| 10° tilt (hero) | `NGA_MAP_TILT10_HERO_A_0001` |
| Side left / right | `NGA_MAP_SIDE_L_A_0001` / `NGA_MAP_SIDE_R_A_0001` |
| Front / Back | `NGA_MAP_FRONT_A_0001` / `NGA_MAP_BACK_A_0001` |
| Exploded | `NGA_MAP_EXPLODED_A_0001` |
| Data overlays: hubs / corridors / power grid / night lights / heatmap / blueprint / wireframe | `NGA_MAP_{OVERLAY}_A_0001` |

Schematic (non-photoreal) vector versions of the data-overlay views are shipped now in `ForgeStudio/Nigeria/` — see below. The photoreal machined-steel base render is a Blender deliverable, not produced here.

### Manufacturing hubs (accurate locations — bind real coordinates in Blender, not placeholder)
Lagos, Ibadan, Abeokuta (Southwest) · Benin City, Port Harcourt, Warri (South-South) · Enugu, Onitsha (Southeast) · Kano, Kaduna (North/Northwest) · Jos, Maiduguri (North Central/Northeast) · Calabar (South-South) · Ilorin, Sokoto (Northwest/North Central agricultural).

## Part 2 — NAWEDOAM Truck (VEH_TRUCK_ODOGWU)
**Turnaround (360°):** front 3/4 left, front, front 3/4 right, left side, right side, rear 3/4 left, rear, rear 3/4 right — 8 angles minimum, naming `VEH_TRUCK_ODOGWU_{ANGLE}_A_0001`.
**Poses/action shots:** workshop floor, inspection bay, loading bay, road/highway — naming `VEH_TRUCK_ODOGWU_POSE_{SCENE}_A_0001`.
**Animations (deliver as .blend + rendered .mp4):** 360° turntable, door open (if applicable), panel reveal, drive/movement, assembly reveal, exploded view, parts highlight, close-up details.

## Export specs (both parts)
- Formats: Blender (.blend), FBX, GLTF, OBJ, PNG (transparent), JPEG (high-res), MP4 (animations), SVG (overlays/engraving only — vector layer, not the render itself)
- Resolution: 4K (3840×2160), physical camera, industrial HDRI lighting, PBR materials, Forge Gold chamfer 2–4mm, transparent or dark-steel background
- Naming: follow `docs/naming_conventions.md` exactly (`NGA_` for map, `VEH_` for vehicle) — do not invent parallel schemes

## What Forge Studio (this vector library) delivers now vs. what needs Blender
| Deliverable | Status |
|---|---|
| Schematic vector map overlays (hubs, corridors, power grid, night lights, blueprint, wireframe) | ✅ shipped — `ForgeStudio/Nigeria/` |
| Machined-steel photoreal base map, all angles/exploded | ❌ needs Blender render pass |
| Truck 360° turnaround, poses, action shots | ❌ needs Blender render pass |
| Animations (.mp4) | ❌ needs Blender render + video export |
| Naming/collection scaffolding for all of the above | ✅ already covered by `forge_foundry/` architecture + this doc |


---

## MISSION 002 — NAWEDOAM Vehicle Asset Library (complete production brief)

**The truck is a manufacturing product, not artwork.** Full asset list below is the authoritative brief for the Blender render pass — Forge Studio (this vector library) cannot produce photoreal renders, passes, or video; it ships the shot list, camera/motion diagram, and naming only.

### Views (14)
Front · Rear · Left · Right · Top · Bottom · Front 3/4 · Rear 3/4 · Orthographic (all 6 faces) · Exploded · Section Cut · Wireframe · Blueprint · Material Pass · AO Pass · Depth Pass · Shadow Pass · Transparent PNG

Naming: `VEH_TRUCK_ODOGWU_VIEW_{NAME}_A_0001` (e.g. `VEH_TRUCK_ODOGWU_VIEW_FRONT34_A_0001`)

### Lighting setups (7)
Studio · Workshop · Assembly Bay · Inspection Bay · Outdoor · Night · Golden Hour

Naming: `VEH_TRUCK_ODOGWU_LIGHT_{SETUP}_A_0001`

### Motion (13)
360° Turntable · Door Open · Panel Reveal · Exploded Assembly · Component Highlight · Assembly Sequence · Inspection Scan · Drive In · Drive Out · Camera Dolly · Camera Orbit · Close Detail · Wheel Rotation

Naming: `VEH_TRUCK_ODOGWU_ANIM_{NAME}_A_0001` — every animation delivered as .blend + .fbx + .glb + .mp4 preview per the brief.

### Camera & shot diagram
A schematic (non-photoreal) top-down + side camera-position diagram for the 14 static views and the turntable/dolly/orbit paths is shipped now: `ForgeStudio/Vehicle/veh-camera-shotlist.svg` — this is the vector reference a Blender lighting/camera artist works from; it is not the render itself.

### What Forge Studio ships now vs. what this mission requires
| Deliverable | Status |
|---|---|
| Full written shot list (views/lighting/motion/passes/naming) | ✅ this document |
| Camera position + turntable/orbit path diagram (schematic) | ✅ `ForgeStudio/Vehicle/veh-camera-shotlist.svg` |
| Photoreal renders (any view, any lighting, any pass) | ❌ needs Blender render pass |
| Animations (.blend/.fbx/.glb/.mp4) | ❌ needs Blender render + video export pipeline |
