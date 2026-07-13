# Machine Library — Engineering Elevations

16 isolated manufacturing-equipment references, each a dimensioned side-elevation silhouette (schematic, not a photoreal render) under `ForgeStudio/Machines/`. These are the engineering drawings a Blender modeling pass works from — not the final 3D asset.

Naming: `WKS_MACHINE_{NAME}_A_0001` (extends the existing `WKS_` workshop-equipment family in `docs/naming_conventions.md`).

| Asset | Footprint | Intended use |
|---|---|---|
| WKS_MACHINE_WORKBENCH_A_0001 | 1500mm (W) x 900mm (H) | General fabrication surface — Workshop, Engineering Review Bay, Training Workshop |
| WKS_MACHINE_INSPECTIONTABLE_A_0001 | 1600mm (W) | QC/inspection surface with reference grid top — Quality Laboratory, Inspection Bay |
| WKS_MACHINE_TOOLCABINET_A_0001 | 800mm (W) x 1400mm (H) | Tool storage, 4-drawer — any workshop/factory floor module |
| WKS_MACHINE_HYDRAULICPRESS_A_0001 | 1000mm (W) x 1600mm (H) | Forming/pressing equipment — Production Line, Assembly Bay |
| WKS_MACHINE_LATHE_A_0001 | 2200mm (L) | Precision turning — Production Line, Nnewi-style automotive machining bays |
| WKS_MACHINE_MIGWELDER_A_0001 | 700mm (W) | Welding station equipment — Welding Bay, Assembly Bay |
| WKS_MACHINE_DRILLPRESS_A_0001 | 700mm (W) x 1400mm (H) | Precision drilling — Production Line |
| WKS_MACHINE_SHEETBRAKE_A_0001 | 2400mm (L) | Sheet metal bending — Production Line, Fabrication bays |
| WKS_MACHINE_GASCYLINDERS_A_0001 | 1300mm (H), 2-cylinder set | Welding gas supply — Welding Bay, Material Warehouse |
| WKS_MACHINE_COMPRESSEDAIR_A_0001 | 1200mm (W) | Pneumatic supply unit — any production floor module |
| WKS_MACHINE_FORKLIFT_A_0001 | 2200mm (L) | Material handling — Material Warehouse, Arrival Dock, logistics routes |
| WKS_MACHINE_STEELRACK_A_0001 | 1600mm (W) x 1800mm (H) | Dimensioned storage rack (engineering-elevation companion to WKS_FURNITURE_STORAGERACK) |
| WKS_MACHINE_CHAINHOIST_A_0001 | 1300mm (H) | Vertical lifting — Assembly Bay, Production Line |
| WKS_MACHINE_CRANEHOOK_A_0001 | 900mm (H) | Overhead crane end-effector — pairs with WKS_STRUCTURE_CRANESILHOUETTE |
| WKS_MACHINE_ASSEMBLYFIXTURE_A_0001 | 1400mm (W) | Component-holding jig — Assembly Bay, one-owner-one-component staging |
| WKS_MACHINE_MATERIALPALLETS_A_0001 | 1200mm (W) | Goods/material staging — Material Warehouse, Arrival Dock, logistics routes |

## Conventions
- All dimensions in mm, Forge Cyan dimension lines/arrows/labels (matches `ENG_OVERLAY_DIMENSION`).
- Silhouette fill: Forge Steel (`#7C8085`) for the primary body, near-black (`#1c1e21`) for recessed/mechanical detail, one accent (Gold/Heat/Emerald/Cyan) only where a real safety or functional color convention applies (e.g. gas cylinder body colors, hydraulic ram).
- Every machine is drawn at a consistent "engineering elevation" angle (side view) for cross-machine comparability — not a hero/perspective view.
- These are placeholder-free: dimensions are illustrative reference figures, not measured from a real physical unit — flag for real spec sourcing if exact figures matter downstream.
