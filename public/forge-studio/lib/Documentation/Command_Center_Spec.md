# Forge Manufacturing Command Center — Engineering Specification

Extends Mission 001 (`Nigeria_Truck_Render_Spec.md`). The Nigeria Manufacturing Plate is the centerpiece of the Command Center. This document is the machining/render brief — Forge Studio produces the drawings; the Blender pipeline executes them.

## Hub indicator (machined, not iconographic)
Detail drawing: `ForgeStudio/Nigeria/nga-hub-indicator-detail.svg` (section view, 5:1).
- Forge Gold bezel, machined ring, Ø22mm, 2mm proud of surface
- Steel recess, 20° draft angle, brushed finish inside
- LED core Ø10mm, flush-mounted, cream-white (#F2EEE6) at rest; hub-identity accent when active
- Halo: soft emission ≤15% opacity, never a lens-flare/glow effect
- 18 hubs at real coordinates (see `Hub_Industrial_Identity.md`) — each keeps its industrial-identity accent color

## Network channels (engineered, not glowing lines)
Detail drawing: `ForgeStudio/Nigeria/nga-channel-sections.svg` (sections, 2:1).
- Manufacturing corridors: 4mm V-channel, machined
- Power routes: 6mm rectangular recessed conduit, Heat Orange conductor strip visible at 70% depth
- Transport/logistics: 1.5mm laser engraving, no recess
- Power-flow animation travels INSIDE the conduit (subtle luminance shift along the strip), never floating above the surface

## Official Forge camera registry
| ID | Camera | Standard |
|---|---|---|
| CAM_HERO_FRONT_085MM_A_0001 | Hero | 85mm, 10° plate tilt visible, gold chamfer in silhouette |
| CAM_ORTHO_TOP_000MM_A_0001 | Orthographic | true ortho, top; also L/R/front/back variants |
| CAM_BLUEPRINT_TOP_000MM_A_0001 | Blueprint | ortho top + blueprint post-process |
| CAM_INSPECT_LOW_050MM_A_0001 | Inspection | 50mm, low grazing angle to read machining marks |
| CAM_EXPLODE_FRONT_035MM_A_0001 | Exploded | 35mm wide, fits full explode height |
| CAM_MACRO_HUB_100MM_A_0001 | Macro | 100mm macro on a single hub indicator |
| CAM_ORBIT_RING_085MM_A_0001 | Orbit | 85mm on circular path, 8s+ period, constant elevation |
| CAM_REVIEW_34_050MM_A_0001 | Engineering Review | 50mm, 3/4 view, neutral, documentation-grade |

Naming follows `CAM_{family}_{shot}_{lens_mm}MM_{variant}_{seq}` from `docs/naming_conventions.md`. These 8 are the ONLY approved cameras — every future render must reference one.

## Animation brief (Blender-only deliverables)
360 turntable · slow engineering orbit · inspection dolly · assembly reveal · exploded assembly · machine light activation · hub activation (bezel LED up-ramp, 0.8s, staggered by hub) · power traveling through machined channels (conduit luminance, 6–10s loop). All restrained; nothing flashy. Timing/easing vocabulary: `Motion_Vocabulary.md`.

## Export set (per Blender pipeline)
Master .blend · GLB · FBX · OBJ · PNG · WebP · transparent renders · depth / AO / shadow passes · wireframe · blueprint. Organized as reusable Blender Collections per `forge_foundry/config/project_architecture.json` — no destructive edits, no duplicated geometry.

## Final test (acceptance criterion)
Strip every logo, label and word from the render: an engineer must still read it as the command center of a national manufacturing operating system. If not, refine before submitting for QA.
