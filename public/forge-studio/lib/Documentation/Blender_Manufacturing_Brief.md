# Blender Manufacturing Brief -- Forge World Alpha

**Forge Studio is the Engineering Drawing Office. This document is the complete handoff to the Blender Manufacturing Department.** Every section below is a self-contained work order: purpose through quality checklist. No design decisions remain for Blender to invent -- only execution.

---

## 1. NAWEDOAM Truck

**Purpose:** Produce all photoreal views, poses, and animations of the existing master truck asset for the Homepage and Manufacturing Cloud.
**Engineering intent:** The truck must read as an already-in-production manufacturing product, not a vehicle mockup -- steel, precision, ownership-by-component, per NAWEDOAM_Manufacturing_Model.pdf.
**Construction notes:** Do NOT remodel. The master scene (case_kei_fresh.blend) is source of truth. Only camera, lighting, and material/pass setup are in scope for this pass.
**Materials:** Use the Forge Material Library (Section 5) exclusively -- no ad hoc materials. Body: brushed steel + powder-coated panels per existing truck livery. Wheel rims: painted steel, Cyan accent glow per existing design.
**Lighting:** Per Command_Center_Spec.md camera registry -- 7 lighting setups (Studio, Workshop, Assembly Bay, Inspection Bay, Outdoor, Night, Golden Hour). No theatrical lighting; every light source must be diegetic (a real fixture in frame or implied just outside it).
**Camera:** The 8 official Forge cameras (Command_Center_Spec.md) plus the 8-angle turnaround + 4 pose cameras in Nigeria_Truck_Render_Spec.md Mission 002. veh-camera-shotlist.svg is the schematic reference.
**Animation:** 13 motion sequences per Nigeria_Truck_Render_Spec.md Mission 002 (360 turntable, door open, panel reveal, exploded assembly, component highlight, assembly sequence, inspection scan, drive in/out, dolly, orbit, close detail, wheel rotation). Timing/easing vocabulary: Motion_Vocabulary.md.
**Collections:** 04_VEHICLES / VEH_TRUCK_ODOGWU_LIB (canonical asset), _SETS (turnaround rigs), _OUT (render output) per docs/naming_conventions.md.
**Export requirements:** Per view/lighting/motion combination: PNG (transparent), high-res JPEG, MP4 (motion only); .blend/.fbx/.glb/.obj for every animation per the original brief.
**Acceptance tests:** Strip all logos/labels -- does the truck still read as an active manufacturing product, not a concept render? Every one of the 14 views + 7 lighting setups + 13 motions must be present and named per spec before sign-off.
**Performance targets:** Turntable/orbit renders: 4K @ 24fps minimum for MP4 preview. Static views: 4K stills. Real-time preview triangle/texture budgets to be set by Software Engineering based on target device.
**Quality checklist:**
- [ ] All 14 views rendered and named per VEH_TRUCK_ODOGWU_VIEW_{NAME}_A_0001
- [ ] All 7 lighting setups produced
- [ ] All 13 motions delivered as .blend+.fbx+.glb+.mp4
- [ ] No remodeling of the master truck geometry
- [ ] Materials pulled only from the Forge Material Library
- [ ] Naming validated against docs/naming_conventions.md

## 2. Nigeria Manufacturing Plate

**Purpose:** Machine the Nigeria map as a single forged-steel component -- the centerpiece of the Command Center.
**Engineering intent:** Not a map. An industrial object communicating national manufacturing capability. See Nigeria_Truck_Render_Spec.md Mission 001 and Command_Center_Spec.md.
**Construction notes:** Thickness 25-40mm. 10 degree presentation tilt (fixed, permanent). Full-perimeter gold chamfer 2-4mm + micro-bevels. Laser-engraved state boundaries, manufacturing/transport/power corridors per nga-channel-sections.svg (V-channel 4mm / recessed conduit 6mm / engrave 1.5mm). 18 hub indicators machined per nga-hub-indicator-detail.svg (22mm gold bezel 2mm proud, 20 degree draft recess, 10mm flush LED core). Hub positions: real coordinates only, per Hub_Industrial_Identity.md.
**Materials:** Brushed steel top (anisotropic brush, NOT glossy chrome), Forge Gold chamfer/bezels, industrial wear layer (scratches, tool marks, roughness variation, subtle AO).
**Lighting:** Studio + Night Mode (per nga-night-lights.svg reference) at minimum; Power Grid mode requires conduit self-illumination (Heat Orange emission inside the channel, not above the surface).
**Camera:** CAM_HERO_FRONT_085MM_A_0001, CAM_ORTHO_TOP_000MM_A_0001, CAM_BLUEPRINT_TOP_000MM_A_0001, CAM_INSPECT_LOW_050MM_A_0001, CAM_EXPLODE_FRONT_035MM_A_0001, CAM_MACRO_HUB_100MM_A_0001, CAM_ORBIT_RING_085MM_A_0001, CAM_REVIEW_34_050MM_A_0001 -- all 8, per Command_Center_Spec.md.
**Animation:** 360 turntable, slow engineering orbit, inspection dolly, assembly reveal, exploded assembly, hub activation (staggered LED up-ramp, 0.8s per hub), power traveling through channels (6-10s loop, conduit luminance only).
**Collections:** 05_NIGERIA / NGA_MAP_LIB (canonical plate), NGA_MAP_SETS (view rigs), NGA_MAP_OUT (renders) per naming_conventions.md.
**Export requirements:** Hero, Orthographic, Exploded, Wireframe, Blueprint, Night, Power Grid, Heat Map, Inspection, Transparent PNG -- 10 views minimum, plus .blend/GLB/FBX/OBJ.
**Acceptance tests:** Strip labels: does it read as a machined steel engineering object, not a decorative map? All 18 hubs present at correct real-world relative positions.
**Performance targets:** 4K stills; power-grid/night animation loops <=10s, seamless.
**Quality checklist:**
- [ ] 10 degree tilt applied and locked
- [ ] 25-40mm thickness confirmed in viewport
- [ ] Gold chamfer + micro-bevels visible from hero angle
- [ ] 18 hubs at real coordinates, each with correct industrial-identity color
- [ ] All 3 channel types machined per section spec
- [ ] No glossy/chrome shader used
- [ ] 10 required views rendered

## 3. Hero Environment / Factory World

**Purpose:** Build the reusable factory environment surrounding the truck + plate.
**Engineering intent:** The visitor should feel they entered a functioning manufacturing ecosystem, not a stage set. See Hero_Environment_Spec.md.
**Construction notes:** Build directly from env-factory-floorplan.svg (1:200 zoned plan) and env-hero-platform-plan.svg (1:50 platform detail). 8 zones, 2 forklift lanes, 1 operator walkway, 6x4 steel plate grid with DATUM X/Y, laser-guide truck envelope, embedded inspection rail, 9 reserved human stations (no figures). Steel columns on grid lines; trusses spanning zone rows; cable trays + conduit along column lines only; bridge-crane rails on the two long walls; catwalks over storage side.
**Materials:** Forge Material Library only (Section 5) -- steel floor, structural steel, powder-coated columns, concrete apron at Receiving/Shipping, factory glass at windows.
**Lighting:** Ceiling fixtures on the column grid; inspection lighting over platform + QC; task lighting per reserved station; beacon/emergency at lane ends only; foundry glow from Welding Bay direction only.
**Camera:** CAM_REVIEW_34_050MM_A_0001 for documentation passes; CAM_HERO_FRONT_085MM_A_0001 for the primary hero composite with truck in frame.
**Animation:** Restrained atmosphere only: factory haze, heat shimmer (Welding Bay only), tiny distant welding flashes, dust, slow crane-shadow traverse.
**Collections:** 06_WORKSHOP / WKS_FACTORY_LIB (structure), WKS_ZONES (the 8 zone volumes), WKS_STATIONS (9 reserved positions) -- all independently exportable.
**Export requirements:** PNG (transparent where applicable), preview renders per zone, plus the full-scene composite with truck + plate in position.
**Acceptance tests:** Every reserved station has clear floor area + adjacent equipment + task lighting. No zone overlaps another in the plan.
**Performance targets:** Environment must remain a background layer -- hero platform + truck + plate stay the focal point in every composite.
**Quality checklist:**
- [ ] All 8 zones built to plan footprint
- [ ] Forklift lanes + walkway physically clear
- [ ] 9 reserved stations present, unoccupied
- [ ] Cable trays/conduit follow column-line rule (no diagonal runs)
- [ ] Atmosphere restrained -- no exaggerated effects
- [ ] Truck + plate remain visual focus

## 4. Machine Library (16 units)

**Purpose:** Model the 16 isolated manufacturing-equipment units cataloged in Machine_Library.md.
**Engineering intent:** Nothing decorative -- every unit must be believable, functional-looking equipment that could plausibly exist on a real factory floor.
**Construction notes:** Use each WKS_MACHINE engineering elevation (ForgeStudio/Machines/) as the dimensioned reference -- footprints and heights are specified per unit in Machine_Library.md. Build at the stated scale; do not freelance proportions.
**Materials:** Forge Steel (primary bodies), Heat Treated Steel (press rams, cutting edges), industrial rubber (tires, hoses, grips), painted steel (gas cylinder bodies).
**Lighting:** Neutral studio lighting for library preview renders; in-scene, each unit inherits its zone lighting (Section 3).
**Camera:** Macro pass for individual unit hero shots; true orthographic for catalog thumbnails.
**Animation:** Static units. Exception: hoist/crane-hook units may have a minimal idle-sway loop consistent with Motion_Vocabulary.md restraint rules.
**Collections:** 06_WORKSHOP / WKS_MACHINE_LIB, one sub-collection per unit, each independently exportable and placeable in the factory floor plan.
**Export requirements:** PNG (transparent), catalog orthographic view, .blend/GLB/FBX/OBJ per unit.
**Acceptance tests:** Each unit matches its stated footprint within the plan (Section 3) when placed -- no unit clips a zone boundary.
**Performance targets:** Optimize for repeated instancing across the factory floor -- use linked duplicates, not unique geometry per instance.
**Quality checklist:**
- [ ] All 16 units modeled to stated dimensions
- [ ] Materials pulled from Forge Material Library only
- [ ] Each unit fits its assigned zone without clipping
- [ ] Instancing used for repeated units
- [ ] Naming matches WKS_MACHINE naming pattern

## 5. Camera Rig (8 official cameras)

**Purpose:** Build the 8 approved Forge cameras as reusable, parented rig objects -- no scene may use an unlisted camera.
**Engineering intent:** One consistent visual grammar across every render, in every collection, forever.
**Construction notes:** Per Command_Center_Spec.md camera registry table: Hero (85mm), Orthographic (true ortho, all 6 faces), Blueprint (ortho top + post-process), Inspection (50mm, low grazing angle), Exploded (35mm wide), Macro (100mm), Orbit (85mm, circular path >=8s period, constant elevation), Engineering Review (50mm, 3/4, neutral).
**Materials:** N/A (camera objects).
**Lighting:** N/A -- cameras are lighting-agnostic; each scene applies its own lighting setup independently of camera choice.
**Camera:** This IS the camera deliverable.
**Animation:** Orbit camera: constant-speed circular path, no easing. Dolly (Inspection): linear in/out only.
**Collections:** 01_CAMERAS / CAM_LIB (the 8 canonical rigs), CAM_SETS (per-scene instances), CAM_MRK (framing markers).
**Export requirements:** Camera data exports with any .blend deliverable that uses it; no standalone camera export needed.
**Acceptance tests:** Every future render in every collection references one of these 8 cameras by name.
**Performance targets:** N/A.
**Quality checklist:**
- [ ] All 8 cameras built and named per naming convention
- [ ] Orbit camera path verified constant-elevation
- [ ] No scene references a camera outside this set

## 6. Material Library

**Purpose:** Provide the finite, documented set of materials every Blender deliverable above must draw from -- no ad hoc shaders.
**Engineering intent:** Durability over decoration: one material definition per surface type, reused everywhere, forever.
**Construction notes:** Detailed physical-property specification is the next Forge Studio deliverable (in progress) -- this section is a placeholder contract: every Blender deliverable in Sections 1-4 must cite a material from that forthcoming spec by name, not invent a new one.
**Materials:** Forge Steel, Heat Treated Steel, Brushed Aluminium, Powder Coat, Industrial Rubber, Concrete, Factory Floor, Copper, Brass, Glass, Machine Plastic (final list, per the Material System brief).
**Lighting:** N/A (material deliverable).
**Camera:** N/A.
**Animation:** N/A.
**Collections:** 08_GEOMETRY or a dedicated MAT_LIB shared collection -- materials are linked assets, never duplicated per-object.
**Export requirements:** Material definitions exported as reusable Blender node groups / asset-library entries, plus a 2D swatch reference per material (Forge Studio deliverable).
**Acceptance tests:** No two objects in the entire Forge World use visually-inconsistent versions of the same material.
**Performance targets:** Shared node groups only -- no per-object material duplication.
**Quality checklist:**
- [ ] Full swatch + property spec delivered by Forge Studio (pending)
- [ ] Every deliverable above references a named material from that spec
- [ ] No inline/ad hoc shaders in any Collection

---

## Governing rule for the Blender Manufacturing Department
If a decision is not specified above or in the referenced ForgeStudio documents, do not invent it -- return it to Forge Studio (the Engineering Drawing Office) for specification first.
