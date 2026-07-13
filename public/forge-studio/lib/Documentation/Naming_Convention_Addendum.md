# Naming Convention Addendum — Forge Studio Vector Library

Extends `docs/naming_conventions.md` (unchanged, authoritative for Blender/3D assets) with two token families for the 2D production library, following the exact same rules: uppercase ASCII, underscore-separated, zero-padded sequence, family before variant.

## New tokens

- `ENG_{family}_{asset}_{variant}_{seq}` — Engineering Overlay Library (07_TYPOGRAPHY collection: measurement, callouts, technical labels)
- `STA_{scope}_{state}_{variant}_{seq}` — Status & Ownership Library (new 12_STATUS collection: one-component/one-owner lifecycle states)

## Additional new tokens

- `DSH_{family}_{asset}_{variant}_{seq}` — Dashboard & Data widgets (new 14_DASHBOARD collection)
- `IDN_{family}_{asset}_{variant}_{seq}` — Identity & Verification (new 15_IDENTITY collection)
- `MOT_{NAME}_{variant}_{seq}` — Motion Vocabulary demo references (new 16_ANIMATION collection; canonical list in `Motion_Vocabulary.md`)

- `HDW_{family}_{asset}_{variant}_{seq}` — Hardware detail library (new 13_HARDWARE collection: bolts, ribs, and other small reusable fastener/structural detail assets)

## Existing tokens reused (per current schema)

- `GEO_{family}_{asset}_{variant}_{seq}` — Geometry (network/structure/process vectors)
- `VFX_{family}_{asset}_{variant}_{seq}` — Lighting effects + particles/atmosphere (per existing schema — not `LGT_`, which is reserved for 3D light-rig objects in Blender)
- `MAT_{family}_{surface}_{variant}_{seq}` — Forge Material seamless swatches (per existing schema)
- `WKS_{family}_{asset}_{variant}_{seq}` — Workshop/environment silhouette layers (per existing schema)

## 12_STATUS collection (proposed addition to project_architecture.json)

```json
{
  "index": "12",
  "name": "STATUS",
  "label": "Status",
  "description": "Component lifecycle state badges — one owner, one responsibility, one visible state per NAWEDOAM."
}
```

States, in workflow order: UNASSIGNED → ASSIGNED → IN_FABRICATION → VERIFICATION → VERIFIED → DEPLOYED. This mirrors the Design → Breakdown → Assignment → Review → Fabrication → Verification → Assembly → Testing → Deployment workflow in `NAWEDOAM_Manufacturing_Model.pdf`.
