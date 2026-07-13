# Known Issues — Forge Studio Vector Library

## CRITICAL (confirmed, root-caused): the save pipeline strips ALL active SVG content — CSS `<style>`, and SMIL `<animate>`/`<animateTransform>`/`<animateMotion>`

**Severity:** Every one of the 49 assets in this library that was authored to animate is, as shipped, a static SVG. This is not intermittent and not technique-specific — it was proven for both mechanisms:

1. **CSS approach (`<style>` + `@keyframes`):** used in the first ~40 assets built. Confirmed missing from every saved file (verified across the full library in the QA pass — 0 of 109 shipped SVGs contain a `<style>` tag).
2. **SMIL approach (`<animate>`, `<animateMotion>`):** adopted as the "fix" mid-project, believed to be more durable. **Also confirmed stripped** — `VEH_CAMERAPLAN_SHOTLIST_A_0001` and the first version of `NGA_MAP_INDUSTRIALHUBS_A_0001` were read back immediately after saving with SMIL children present, then re-verified missing on a later read of the same file. Empty `<circle>...</circle>` wrappers are left behind where the `<animate>` child used to be.

**Conclusion:** this is a platform-level sanitization step on saved SVG files, most likely stripping any element/attribute capable of executing behavior (style, script, animate-family) as an XSS precaution. It cannot be worked around by choosing a different in-file animation technique. **No technique produces a self-animating standalone SVG file in this pipeline.**

## Resolution (adopted library-wide in this QA pass)

Every asset that was designed to move now ships as a **static SVG** with the intended motion documented as a **runtime spec**, not baked into the file — matching the fallback the Forge Studio constitution specifies: *"Static asset with documented runtime animation."*

- The 16 canonical transitions have engine-agnostic CSS keyframe recipes in `Motion_Vocabulary.md` — Software Engineering implements these in the real rendering stack (React/CSS), using the shipped SVG as the static visual reference only.
- Every other asset's registry entry (`Asset_Registry.md`/`.json`) now states plainly: *"STATIC AS SHIPPED... Intended behaviour: [description]"* — no asset claims to animate out of the box.

## What this means for Software Engineering
- **Do not** expect any `.svg` file in this library to animate when dropped into a page as-is.
- **Do** implement the documented motion (keyframes/timing/easing already specified per asset) in your actual component/CSS layer, using the SVG as the static art.
- If a future export mechanism is found that preserves `<style>`/SMIL (e.g. inlining the SVG directly into HTML rather than referencing it as a file, which may bypass the sanitizer), re-test before assuming this limitation still applies — it may be specific to the file-save path in this authoring tool, not to SVG-in-browser generally.

## QA pass outcome
See `Forge_Studio_QA_Report.md` for the full per-category audit. Summary: 112/112 assets structurally valid (well-formed SVG, correct viewBox, no dangling references — one dangling-reference defect found in an early draft of `NGA_MAP_HEATMAPINDUSTRY_A_0001` and fixed same-session). 49/112 registry entries were corrected from a false "animates" claim to an accurate static-plus-spec description. 0 assets deprecated. 0 assets required a visual rebuild — the defect was entirely in documentation accuracy, not in the shipped graphics themselves.
