# Hero Environment Specification — Forge World Alpha

Factory documentation for the environment surrounding the NAWEDOAM truck. Drawings: `env-factory-floorplan.svg` (1:200 zoned plan) and `env-hero-platform-plan.svg` (1:50 platform detail). This is the brief the Blender environment pass executes — Forge Studio ships drawings and rules, not 3D geometry.

## A. Hero Platform (see detail plan)
Steel floor panels on a 6x4 grid, machined joints; DATUM X/Y crossing at plate center; laser-guide envelope marks the truck footprint; embedded inspection rail full-width at the front edge; drainage at panel joints; expansion joint every 3 panels; plate numbering (PLATE 01…); oil-wear and tyre-mark zones only at working stations and forklift lanes — wear follows use, never decorates.

## B. Factory Architecture
Steel columns on the floor-plan grid lines; roof trusses spanning zone rows; cable trays + electrical conduit routed along column lines only (never diagonal); compressed-air piping parallel to cable trays, below; bridge-crane rails along the two long walls; catwalks above the storage side; factory windows on the receiving wall (warm gold ambient per WKS_STRUCTURE_FACTORYWINDOW); ladders + bracing at column bays. Reference silhouettes already shipped: wks-steel-beam, wks-cable-tray, wks-crane-silhouette, wks-factory-window, wks-workshop-wall.

## C. Manufacturing Zones (see floor plan)
Welding Bay · Assembly Bay · Engineering Review · Inspection Bay · Material Receiving · Component Storage · Quality Control · Shipping Area, plus two forklift lanes (gold dashed, per WKS_SAFETY_FORKLIFTROUTE) and an operator walkway (cream dashed). Zone accents follow the industrial-identity buckets (Heat=welding, Gold=assembly/shipping, Cyan=inspection/QC/review, Emerald=materials).

## D. Equipment placement
All 16 Machine Library items (`Machine_Library.md`) place per-zone: welders + gas cylinders in Welding Bay; press/lathe/drill/brake on the Production side; racks + pallets in Storage/Receiving; inspection table in QC; workbenches in Assembly/Review; forklift parked in a lane end. No equipment floats — everything sits on the plan grid.

## E. Lighting plan
Industrial ceiling fixtures on the column grid; inspection lighting over the platform + QC; task lighting at each reserved station; emergency + beacon fixtures at lane ends only; machine LEDs per VFX_LIGHT_LEDINDICATOR; foundry glow ONLY from the Welding Bay direction; indirect bounce fills. Nothing theatrical — light justifies itself by a fixture.

## F. Atmosphere (restraint rules)
Factory haze (VFX_PARTICLE_FACTORYHAZE, ≤ low opacity) · heat shimmer only above Welding Bay · tiny distant welding flashes (VFX_LIGHT_WELDINGFLASH, far background) · dust (VFX_PARTICLE_DUSTPARTICLES) · slow crane shadow traverse · nothing exaggerated. The visitor should feel work happening beyond the frame, never a show.

## Human Stage — reserved positions (no people)
9 reserved stations marked on the floor plan with crosshair symbols: WELD-01/02, ASSY-01/02, ENG-01/02, INSP-01, QC-01/02. Each reserves clear floor area, task lighting, and equipment adjacency so real human actors (photography of actual Nigerian engineers/fabricators — never synthetic) can be composited later without re-laying the environment.

## Modularity rule
Every element above maps to its own Blender Collection per `forge_foundry` architecture; collections export independently; no hardcoded scene assumptions; nothing single-use.
