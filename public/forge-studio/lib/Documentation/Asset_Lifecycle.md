# Forge Studio — Asset Lifecycle

Every asset in the library carries exactly one lifecycle stage, tracked in `Asset_Registry.json` (`lifecycle` field) and stamped on every entry in `Asset_Registry.md`.

## Stages

1. **Draft** — concept only, not yet built to spec. (None currently in the library — every shipped asset has cleared this stage.)
2. **Prototype** — built and visually complete, but depends on placeholder/illustrative data (sample text, sample coordinates, sample values) that Software Engineering must bind to real data before it is truly production content. Structurally sound; not yet wired to a real data source.
3. **Engineering Review** — a schematic, spec, or reference diagram whose authoritative version requires further engineering work outside this vector library (Blender render, real survey data, etc.) — e.g. the Nigeria schematic map views, the vehicle camera/shot-list, the Motion Vocabulary demo clips. These are the brief, not the final artifact.
4. **QA Passed** — audited in the Forge Studio QA Pass, structurally valid, accurately documented, and does not depend on placeholder data — a generic reusable system asset (geometry pattern, material swatch, lighting effect, engineering overlay template) ready to be dropped into any surface as-is.
5. **Production** — QA Passed *and* explicitly load-bearing system state with zero data dependency and no further review needed — currently reserved for the 6 Status & Ownership badges, the literal visual vocabulary of the NAWEDOAM one-owner principle.
6. **Deprecated** — superseded or retired; kept for traceability only, must not be used in new work. (None currently.)

## Promotion rules
- **Draft → Prototype**: asset is built to the Forge palette/geometry system and passes a visual review.
- **Prototype → QA Passed**: the placeholder data dependency is resolved *in this library* (i.e. the asset no longer needs binding — rare, since most data-bearing assets will always need real data from SE) OR the asset is reclassified as a template whose placeholder-ness is the intended, permanent design (documented explicitly).
- **QA Passed → Production**: asset is confirmed load-bearing across ≥2 real portals with no outstanding data dependency and no anticipated visual change.
- **Any stage → Deprecated**: asset is superseded by a newer version in this library. Deprecated assets stay in the registry with a pointer to their replacement, never silently deleted.

## Current distribution
- Prototype: 27 (dashboard/identity/engineering assets carrying placeholder text or coordinates for SE to bind)
- Engineering Review: 16 (Nigeria schematics, vehicle shot-list, Motion Vocabulary demos)
- QA Passed: 63 (geometry, materials, hardware, lighting, particles, environment, most engineering overlays)
- Production: 6 (Status & Ownership badges)
- Draft / Deprecated: 0
