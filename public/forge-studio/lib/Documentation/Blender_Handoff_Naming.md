# Blender Handoff — Naming for Not-Yet-Produced Assets

Phase 1 only ships vector (SVG) assets. The categories below require the Blender pipeline in `forge_foundry/` and must follow the project's existing naming schema (`docs/naming_conventions.md`) exactly — do not invent new schemes.

| Category | Collection | Name template | Example |
|---|---|---|---|
| Hero environment (rails, gantry, cable trays, columns, ducts) | 06_WORKSHOP | WKS_{family}_{asset}_{variant}_{seq} | WKS_BAY_GANTRY_A_0001 |
| Nigeria billet/forged/CNC/blueprint variants | 05_NIGERIA | NGA_{family}_{asset}_{variant}_{seq} | NGA_MAP_FORGED_A_0001 |
| Human library (welder, engineer, inspector, student…) | 03_HUMANS | HMN_{role}_{identity}_{pose}_{variant}_{seq} | HMN_WELDER_AFR_NEUTRAL_A_0001 |
| Machinery library (MIG welder, lathe, press, forklift…) | 06_WORKSHOP | WKS_{family}_{asset}_{variant}_{seq} | WKS_TOOL_LATHE_A_0001 |
| Materials (steel, powder coat, concrete…) | — (shared) | MAT_{family}_{surface}_{variant}_{seq} | MAT_STEEL_BRUSHED_A_0001 |
| Cameras (hero framing, silhouette zones) | 01_CAMERAS | CAM_{family}_{shot}_{lens_mm}MM_{variant}_{seq} | CAM_HERO_FRONT_085MM_A_0001 |

Human assets: no placeholders, no stock photography, no synthetic faces — reserve these names for real photography/rigs of authentic African engineers and fabricators, composited later using the Engineering overlay set (serial plates, callouts) already shipped in this phase.
