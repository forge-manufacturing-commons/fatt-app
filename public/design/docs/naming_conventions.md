# Forge Foundry Naming Conventions

## Goals

- Scale to thousands of assets
- Avoid hardcoded object-specific naming logic
- Keep names sortable, machine-readable, and human-readable
- Separate asset family, role, state, and sequence

## Top-Level Collections

- `00_REFERENCE`
- `01_CAMERAS`
- `02_LIGHTING`
- `03_HUMANS`
- `04_VEHICLES`
- `05_NIGERIA`
- `06_WORKSHOP`
- `07_TYPOGRAPHY`
- `08_GEOMETRY`
- `09_PARTICLES`
- `10_EXPORT`
- `11_ARCHIVE`

## Standard Subcollections

- `*_LIB`: canonical reusable asset library
- `*_SRC`: imported or reference source assets
- `*_WRK`: active working area
- `*_OUT`: publish-ready outputs

Specialized overrides:
- `01_CAMERAS_SETS`
- `01_CAMERAS_MRK`
- `02_LIGHTING_RIGS`
- `02_LIGHTING_SHARED`
- `10_EXPORT_STAGING`
- `10_EXPORT_QUEUE`
- `10_EXPORT_PUBLISH`
- `10_EXPORT_QC`

## Naming Templates

- `CAM_{family}_{shot}_{lens_mm}MM_{variant}_{seq}`
- `LGT_{rig}_{role}_{variant}_{seq}`
- `MAT_{family}_{surface}_{variant}_{seq}`
- `HMN_{role}_{identity}_{pose}_{variant}_{seq}`
- `VEH_{family}_{model}_{variant}_{state}_{seq}`
- `NGA_{family}_{asset}_{variant}_{seq}`
- `WKS_{family}_{asset}_{variant}_{seq}`
- `GEO_{family}_{asset}_{variant}_{seq}`
- `VFX_{family}_{asset}_{variant}_{seq}`
- `EXP_{target}_{asset}_{variant}_{seq}`
- `ARC_{family}_{asset}_{variant}_{seq}`

## Token Rules

- Use uppercase ASCII tokens
- Use underscores as separators
- Use zero-padded numeric suffixes
- Use stable family tokens before variant tokens
- Never encode one-off scene assumptions into names
- Never use spaces in production asset names

## Sequence Rules

- Primary sequence padding: `4`
- Variant sequence padding: `2`

Examples:
- `CAM_HERO_FRONT_085MM_A_0001`
- `LGT_PRODUCT_KEY_A_0001`
- `MAT_STEEL_BRUSHED_A_0001`
- `HMN_ENGINEER_AFR_NEUTRAL_A_0001`
- `VEH_TRUCK_ODOGWU_A_FINAL_0001`

## Metadata

The architecture builder stores the active naming schema and project metadata as Blender scene custom properties so later systems can derive names from the same source of truth.
