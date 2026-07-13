# Forge Studio — Quality Assurance Report

**Pass type:** Full manufacturing-pipeline QA audit, all categories.
**Trigger:** CSS `@keyframes` animation loss discovered during Mission 001 (Nigeria hub map rebuild) — escalated to a manufacturing defect per Forge Studio doctrine. Expansion halted pending this report.
**Scope:** all 112 previously-manufactured assets across Engineering, Environment, Geometry, Dashboard, Identity, Motion, Nigeria, Vehicle, plus Hardware, Lighting, Materials, Particles, Status (full library — no category excluded).

## Verification performed, per asset
- ✓ **SVG valid** — well-formed markup, single root `<svg>`, properly closed. Checked all 112.
- ✓ **Registry entry valid** — every shipped file has a corresponding `Asset_Registry.json`/`.md` entry with ID, category, usage, animation behaviour, SVG/PNG paths, naming, engineering docs.
- ✓ **Naming valid** — every ID conforms to the FGF naming schema (`docs/naming_conventions.md` + `Naming_Convention_Addendum.md`).
- ✓ **Animation survives export** — tested directly. **Result: FAILS for 100% of animated assets** (see Critical Finding below).
- ✓ **PNG export valid** — all 112 assets have a corresponding 4x-scale PNG in `Exports/PNG/`, spot-checked for correct dimensions and non-blank content.
- ✓ **Transparent export valid** — SVG source files have no forced background outside their own design (each design intentionally fills its own background per the token system); PNG exports carry through whatever the SVG defines. No unintended opaque backgrounds found.
- ✓ **Browser compatible** — all markup uses standard SVG 1.1 elements (rect/circle/path/text/line/polygon/defs/gradients); no vendor-prefixed or experimental features. One dangling `clip-path` id reference found and fixed (see below).

## CRITICAL FINDING — animation does not survive export
Full root-cause and resolution: `Known_Issues.md`. Summary: **neither CSS `@keyframes` nor SMIL `<animate>` survives this save pipeline.** Both were tested directly and both are confirmed stripped from the saved `.svg` file. This is a platform-level constraint, not fixable by choosing a different in-file technique.

**Resolution adopted:** every asset that was designed to move now ships as a static SVG with the motion documented as a runtime spec (per-asset in the registry; the 16 canonical transitions also have a full CSS-recipe spec in `Motion_Vocabulary.md`). No asset in this library claims to animate out of the box anymore.

## Other defects found and fixed
- `NGA_MAP_HEATMAPINDUSTRY_A_0001` had a dangling `clip-path="url(#clip)"` reference to an undefined clip path (harmless — rendered unclipped rather than broken — but incorrect). **Fixed** during this pass.
- `Lighting/lgt-industrial-monitor.svg` uses `clip-path="inset(0)"` (CSS Basic Shape syntax) — valid, no defect, noted for completeness.
- No other dangling `url(#...)` references found across the library (all gradient/defs references verified matched).

## Per-category audit summary

| Category | Assets | Verified | Rebuilt | Needs Repair | Deprecated |
|---|---|---|---|---|---|
| Geometry — Network | 5 | 0 | 5 | 0 | 0 |
| Geometry — Structure | 4 | 3 | 1 | 0 | 0 |
| Geometry — Process | 2 | 0 | 2 | 0 | 0 |
| Lighting | 8 | 0 | 8 | 0 | 0 |
| Engineering Overlay | 24 | 17 | 7 | 0 | 0 |
| Status & Ownership | 6 | 4 | 2 | 0 | 0 |
| Particles & Atmosphere | 7 | 1 | 6 | 0 | 0 |
| Environment | 14 | 12 | 2 | 0 | 0 |
| Forge Material | 8 | 8 | 0 | 0 | 0 |
| Hardware | 2 | 2 | 0 | 0 | 0 |
| Dashboard & Data | 10 | 6 | 4 | 0 | 0 |
| Identity & Verification | 6 | 6 | 0 | 0 | 0 |
| Animation — Motion Vocabulary | 8 | 0 | 8 | 0 | 0 |
| Nigeria — Schematic | 7 | 4 | 3 | 0 | 0 |
| Vehicle — Schematic | 1 | 0 | 1 | 0 | 0 |

| **Total** | **112** | **63** | **49** | **0** | **0** |

**Rebuilt** here means: the registry's animation-behaviour claim was corrected from "this animates" to "static as shipped, intended behaviour documented below" — not that the visual artwork itself changed. No asset needed its actual graphic redrawn; the defect was entirely a documentation-accuracy gap between what the file does and what the registry claimed.

## Certification
The Forge Studio Asset Library (112 assets) is **production-certified** as of this QA pass, under the following binding conditions for Software Engineering:
1. No shipped `.svg` animates on its own — implement documented motion in the real rendering stack.
2. Every registry entry's "Animation behaviour" field is now accurate to what the file actually contains.
3. Re-run this audit (or equivalent) after any future bulk asset addition before claiming production-ready status again.

Quality gate: **PASSED.** Asset library expansion may resume.
