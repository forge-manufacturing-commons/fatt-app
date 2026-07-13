# Forge Studio — Asset Registry (QA-Certified, Lifecycle-Tracked)

Single source of truth for every asset. Status legend: `Verified`/`Rebuilt`/`Needs Repair`/`Deprecated` (QA outcome) — see `Forge_Studio_QA_Report.md`. Lifecycle legend: `Draft`/`Prototype`/`Engineering Review`/`QA Passed`/`Production`/`Deprecated` — see `Asset_Lifecycle.md`.

Total: 112. Lifecycle: Production 6 · QA Passed 63 · Engineering Review 16 · Prototype 27 · Draft 0 · Deprecated 0.

---

## Geometry — Network

#### GEO_NETWORK_ANKARAWEAVE_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Hero backgrounds, idle/loading states, Build Board network map, Digital Twin base layer
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: 16 nodes pulse ring-opacity 0.55→1 on a staggered 3.2s ease-in-out loop, 0.35s offset per node — reads as a live network, never as fabric decoration.
- **SVG source:** `ForgeStudio/Geometry/geo-ankara-weave.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Geometry/geo-ankara-weave.png`
- **Naming convention:** `GEO_NETWORK_ANKARAWEAVE_A_0001`
- **Engineering documentation:** Loop: pure CSS @keyframes, no JS. Stagger driven by node index × 0.35s. Respect prefers-reduced-motion by freezing opacity at 0.8 (SE to add media query at integration). Safe to tile/repeat at any scale; do not recolor individual nodes independently of the token set.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### GEO_NETWORK_ASSEMBLYGRID_A_0001 — `Rebuilt` · Lifecycle: `Prototype`
- **Usage:** SME Portal component map, Build Board assignment view, Digital Twin component overlay
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: 8×8 static node field; 6 "assigned" nodes ring-blink gold, 2.4s ease-in-out, 0.3s stagger.
- **SVG source:** `ForgeStudio/Geometry/geo-assembly-grid.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Geometry/geo-assembly-grid.png`
- **Naming convention:** `GEO_NETWORK_ASSEMBLYGRID_A_0001`
- **Engineering documentation:** The 6 highlighted node coordinates are placeholder — SE should replace with a data-driven array of real assigned-component positions (see README integration notes). Unassigned nodes never animate.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### GEO_NETWORK_ROUTING_A_0001 — `Rebuilt` · Lifecycle: `Prototype`
- **Usage:** Digital Twin logistics view, Manufacturing Cloud supply-chain diagrams
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Two orthogonal trace paths flow via dashoffset, 4s linear infinite, one gold one cyan.
- **SVG source:** `ForgeStudio/Geometry/geo-routing-geometry.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Geometry/geo-routing-geometry.png`
- **Naming convention:** `GEO_NETWORK_ROUTING_A_0001`
- **Engineering documentation:** Paths are illustrative; SE should generate real path data from actual route geometry. Endpoint nodes are static cream dots — keep them static as anchor points.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### GEO_NETWORK_PULSE_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** AI Manufacturing Assistant presence indicator, live-status badges, Investor Portal live-data markers
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: 4 rings expand+fade from center, scale 1→9, 3.2s ease-out, 0.8s stagger — continuous "live signal" read.
- **SVG source:** `ForgeStudio/Geometry/geo-network-pulses.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Geometry/geo-network-pulses.png`
- **Naming convention:** `GEO_NETWORK_PULSE_A_0001`
- **Engineering documentation:** Central dot is static (cream). Ring color is Forge Cyan by default; may retint to Forge Emerald for "healthy" or Forge Heat Orange for "attention" states using the same geometry — do not build separate assets per color.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### GEO_NETWORK_ANKARAINTERLACE_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Section dividers, homepage hero, Build Board network dressing — the literal "weave as infrastructure" motif
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Two diagonal band sets travel opposite directions via dash-offset, 5s linear infinite — Gold over Emerald, interlocking.
- **SVG source:** `ForgeStudio/Geometry/geo-ankara-interlace.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Geometry/geo-ankara-interlace.png`
- **Naming convention:** `GEO_NETWORK_ANKARAINTERLACE_A_0001`
- **Engineering documentation:** Distinct from GEO_NETWORK_ANKARAWEAVE (node-grid variant): this is the literal interlace/weave structure. Use one or the other per composition, not both stacked.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

## Geometry — Structure

#### GEO_STRUCTURE_FORGEDLATTICE_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Section dividers, panel backgrounds, Manufacturing Cloud shell chrome
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Diagonal truss dash pattern travels via stroke-dashoffset, 6s linear infinite, both diagonals counter-travel.
- **SVG source:** `ForgeStudio/Geometry/geo-forged-lattice.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Geometry/geo-forged-lattice.png`
- **Naming convention:** `GEO_STRUCTURE_FORGEDLATTICE_A_0001`
- **Engineering documentation:** Loop: CSS @keyframes travel, dash array 6/4. Fully tileable horizontally. Use at low opacity (≤0.5) behind text — never as a foreground element.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### GEO_STRUCTURE_MACHINELATTICE_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Panel/background texture for Manufacturing Cloud, Digital Twin structural views
- **Animation behaviour:** Static — no animation.
- **SVG source:** `ForgeStudio/Geometry/geo-machine-lattice.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Geometry/geo-machine-lattice.png`
- **Naming convention:** `GEO_STRUCTURE_MACHINELATTICE_A_0001`
- **Engineering documentation:** Offset hex grid, Forge Cyan at low opacity. Tileable; use as a structural backdrop, not foreground.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### GEO_STRUCTURE_HEXGRID_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** General-purpose structural grid backdrop, any portal
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Geometry/geo-hex-grid.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Geometry/geo-hex-grid.png`
- **Naming convention:** `GEO_STRUCTURE_HEXGRID_A_0001`
- **Engineering documentation:** Neutral Steel hex grid, denser than machine-lattice. Fully tileable.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### GEO_STRUCTURE_DIAMONDGRID_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Ankara-derived structural grid, homepage/section backgrounds
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Geometry/geo-diamond-grid.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Geometry/geo-diamond-grid.png`
- **Naming convention:** `GEO_STRUCTURE_DIAMONDGRID_A_0001`
- **Engineering documentation:** Rotated-square (diamond) grid, Forge Gold — the "structural diamonds" motif called for in the geometry brief. Tileable.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

## Geometry — Process

#### GEO_PROCESS_VERIFICATIONSCAN_A_0001 — `Rebuilt` · Lifecycle: `Prototype`
- **Usage:** Any verification/QA state, University Portal grading views, Government Portal compliance views
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Cyan scan line sweeps 0→176px vertically over 6 status bars, 3.5s ease-in-out, ping-pong.
- **SVG source:** `ForgeStudio/Geometry/geo-verification-lines.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Geometry/geo-verification-lines.png`
- **Naming convention:** `GEO_PROCESS_VERIFICATIONSCAN_A_0001`
- **Engineering documentation:** Bar fill length is illustrative "progress" data — bind to real completion percentage at integration. Scan line color is fixed Forge Cyan; do not retint per state (verification is always cyan across the platform).
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### GEO_PROCESS_LASERETCHED_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Fabrication/marking-in-progress moments, Build Board, Manufacturing Cloud
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: 10 horizontal lines draw-on then fade via stroke-dashoffset, staggered 3s ease-out loop — reads as a laser actively etching.
- **SVG source:** `ForgeStudio/Geometry/geo-laser-etched.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Geometry/geo-laser-etched.png`
- **Naming convention:** `GEO_PROCESS_LASERETCHED_A_0001`
- **Engineering documentation:** Heat Orange only. Use to indicate an active laser-marking/engraving process specifically (vs. general fabrication, which uses welding sparks/flash).
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

## Lighting

#### VFX_LIGHT_WELDINGFLASH_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Fabrication-in-progress states, Build Board active-work indicator
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Irregular flicker 1.6s loop (opacity keyframes at 0/8/12/20/45/60/80%) simulating arc-weld flash — intentionally non-uniform, never a smooth pulse.
- **SVG source:** `ForgeStudio/Lighting/lgt-welding-flash.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Lighting/lgt-welding-flash.png`
- **Naming convention:** `VFX_LIGHT_WELDINGFLASH_A_0001`
- **Engineering documentation:** Radial gradient hot-white core to Heat Orange falloff. Trigger only while a component is actively "in fabrication"; freeze on last frame when work pauses.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### VFX_LIGHT_INSPECTIONLASER_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Verification/QC moments across any portal
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Heat-orange beam sweeps 0→160px vertically, 2.4s ease-in-out, ping-pong.
- **SVG source:** `ForgeStudio/Lighting/lgt-inspection-laser.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Lighting/lgt-inspection-laser.png`
- **Naming convention:** `VFX_LIGHT_INSPECTIONLASER_A_0001`
- **Engineering documentation:** Static reference line stays at y=20 for baseline; animated beam is the active scan. Pair with GEO_PROCESS_VERIFICATIONSCAN for full verification sequences.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### VFX_LIGHT_STATUSLEDS_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** System status rows, anywhere in the platform needing a multi-state indicator
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: 5 LEDs (one per accent token) blink independently, 2.4s loop, 0.4s stagger.
- **SVG source:** `ForgeStudio/Lighting/lgt-status-leds.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Lighting/lgt-status-leds.png`
- **Naming convention:** `VFX_LIGHT_STATUSLEDS_A_0001`
- **Engineering documentation:** Demonstration asset shows all 5 tokens simultaneously; in production only light the LED matching the real system state, others stay solid/dim (no blink) — do not blink more than one LED at a time in real usage.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### VFX_LIGHT_HEATGLOW_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Highlight an active/hot component anywhere (Build Board, Digital Twin)
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Radial Heat Orange glow scales 1→1.12 and fades 0.5→0.9 opacity, 3s ease-in-out.
- **SVG source:** `ForgeStudio/Lighting/lgt-heat-glow.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Lighting/lgt-heat-glow.png`
- **Naming convention:** `VFX_LIGHT_HEATGLOW_A_0001`
- **Engineering documentation:** Transform-origin is centered; safe to place behind any component icon or hotspot marker.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### VFX_LIGHT_LEDINDICATOR_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Single-state indicator dot, reusable anywhere a compact status light is needed (tables, cards, nav)
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Blinks opacity 1→0.2, 1.6s loop.
- **SVG source:** `ForgeStudio/Lighting/lgt-led-indicator.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Lighting/lgt-led-indicator.png`
- **Naming convention:** `VFX_LIGHT_LEDINDICATOR_A_0001`
- **Engineering documentation:** Default color Emerald (healthy); recolor to any accent token to match real state — this is the atomic unit that VFX_LIGHT_STATUSLEDS composes 5 of.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### VFX_LIGHT_BEACON_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Active-alert indicator, Build Board/Government Portal alert states
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Rotating sweep cone (2.4s linear) + pulsing core (1.2s).
- **SVG source:** `ForgeStudio/Lighting/lgt-beacon.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Lighting/lgt-beacon.png`
- **Naming convention:** `VFX_LIGHT_BEACON_A_0001`
- **Engineering documentation:** Heat Orange only — reserve for genuine alert/attention states, not routine status (use LED indicator or status badges for that).
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### VFX_LIGHT_WARNINGROTATOR_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Physical warning-light motif for fabrication-bay or safety-critical UI moments
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Rotating ellipse sweep, 1.4s linear infinite, fast — deliberately more urgent than the beacon.
- **SVG source:** `ForgeStudio/Lighting/lgt-warning-rotator.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Lighting/lgt-warning-rotator.png`
- **Naming convention:** `VFX_LIGHT_WARNINGROTATOR_A_0001`
- **Engineering documentation:** Use sparingly; this is the most attention-grabbing asset in the library. Reserve for genuine safety/critical alerts only.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### VFX_LIGHT_INDUSTRIALMONITOR_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Dashboard/control-room motif — Manufacturing Cloud, Digital Twin control views
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Horizontal cyan scanline sweeps down the screen, 3s linear loop.
- **SVG source:** `ForgeStudio/Lighting/lgt-industrial-monitor.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Lighting/lgt-industrial-monitor.png`
- **Naming convention:** `VFX_LIGHT_INDUSTRIALMONITOR_A_0001`
- **Engineering documentation:** Bezel is Forge Steel; screen interior is a fixed dark teal (#0b3a3d), the one other non-token color in the library, reserved for "active screen" surfaces only.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

## Engineering Overlay

#### ENG_OVERLAY_RULER_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Any dimensioned diagram — Digital Twin, University Portal technical views
- **Animation behaviour:** Static — no animation.
- **SVG source:** `ForgeStudio/Engineering/eng-ruler.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-ruler.png`
- **Naming convention:** `ENG_OVERLAY_RULER_A_0001`
- **Engineering documentation:** Tick spacing 10 units, major ticks every 50 with mm labels. Monospace labels only. Extend by tiling horizontally; do not restyle tick weight.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### ENG_OVERLAY_DIMENSION_A_0001 — `Verified` · Lifecycle: `Prototype`
- **Usage:** Part/assembly measurement callouts across Manufacturing Cloud, Digital Twin
- **Animation behaviour:** Static — no animation.
- **SVG source:** `ForgeStudio/Engineering/eng-dimension-arrow.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-dimension-arrow.png`
- **Naming convention:** `ENG_OVERLAY_DIMENSION_A_0001`
- **Engineering documentation:** Label text ("240mm") is placeholder — SE binds to real measurement string. Arrowhead + extension-line geometry must not be altered per instance.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### ENG_OVERLAY_CALLOUT_A_0001 — `Verified` · Lifecycle: `Prototype`
- **Usage:** Part identification anywhere a component needs a labeled leader line
- **Animation behaviour:** Static — no animation.
- **SVG source:** `ForgeStudio/Engineering/eng-callout-box.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-callout-box.png`
- **Naming convention:** `ENG_OVERLAY_CALLOUT_A_0001`
- **Engineering documentation:** Leader anchor point (cyan dot) marks the exact component location; label box is fixed offset up-right. "PART_0042" is placeholder for a real part ID.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### ENG_OVERLAY_CROSSHAIR_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Alignment/focus indicator, Digital Twin inspection mode, AI Assistant "looking at" marker
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Inner bracket set rotates 360°, 8s linear infinite — outer ring and center dot stay static.
- **SVG source:** `ForgeStudio/Engineering/eng-crosshair.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-crosshair.png`
- **Naming convention:** `ENG_OVERLAY_CROSSHAIR_A_0001`
- **Engineering documentation:** Use to indicate active inspection/attention on a specific point; the slow rotation reads as "live" without being distracting.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### ENG_OVERLAY_SERIALPLATE_A_0001 — `Verified` · Lifecycle: `Prototype`
- **Usage:** Component identity plate — SME Portal, Build Board, Digital Twin component detail
- **Animation behaviour:** Static — no animation.
- **SVG source:** `ForgeStudio/Engineering/eng-serial-plate.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-serial-plate.png`
- **Naming convention:** `ENG_OVERLAY_SERIALPLATE_A_0001`
- **Engineering documentation:** 3 text lines are placeholder (component name, VEH_ id, owner + verified state) — bind all three to real component/component-owner data at integration. Rivet corners are decorative-structural, keep as-is.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### ENG_OVERLAY_COORDSYSTEM_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Digital Twin 3D orientation gizmo, any technical/CAD-style view
- **Animation behaviour:** Static — no animation.
- **SVG source:** `ForgeStudio/Engineering/eng-coordinate-system.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-coordinate-system.png`
- **Naming convention:** `ENG_OVERLAY_COORDSYSTEM_A_0001`
- **Engineering documentation:** X=Gold, Y=Emerald, Z=Cyan is a fixed convention — never remap these three axis colors to other tokens.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### ENG_OVERLAY_LASERRULER_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Digital Twin measurement mode, University Portal technical views
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Heat-orange laser line sweeps horizontally 0→160px, 2.2s ease-in-out ping-pong, over a static tick ruler.
- **SVG source:** `ForgeStudio/Engineering/eng-laser-ruler.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-laser-ruler.png`
- **Naming convention:** `ENG_OVERLAY_LASERRULER_A_0001`
- **Engineering documentation:** Tick ruler is identical geometry to ENG_OVERLAY_RULER; this variant adds the live laser sweep to signal an active measurement scan vs. a static reference ruler.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### ENG_OVERLAY_DIGITALCALIPER_A_0001 — `Verified` · Lifecycle: `Prototype`
- **Usage:** Manufacturing Cloud QC views, part-tolerance checks
- **Animation behaviour:** Static — no animation.
- **SVG source:** `ForgeStudio/Engineering/eng-digital-caliper.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-digital-caliper.png`
- **Naming convention:** `ENG_OVERLAY_DIGITALCALIPER_A_0001`
- **Engineering documentation:** Jaw positions and readout ("42.85mm") are illustrative — bind readout text to real measured value at integration. Digital readout box always uses Forge Cyan.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### ENG_OVERLAY_STEELTAPE_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Any physical-scale reference strip — SME Portal, Workshop views
- **Animation behaviour:** Static — no animation.
- **SVG source:** `ForgeStudio/Engineering/eng-steel-tape.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-steel-tape.png`
- **Naming convention:** `ENG_OVERLAY_STEELTAPE_A_0001`
- **Engineering documentation:** Gold tape body per Forge Gold token; tileable horizontally for any length. Tick labels in cm, monospace.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### ENG_OVERLAY_TOLERANCEBLOCK_A_0001 — `Verified` · Lifecycle: `Prototype`
- **Usage:** Engineering review screens, University Portal grading, Government Portal compliance
- **Animation behaviour:** Static — no animation.
- **SVG source:** `ForgeStudio/Engineering/eng-tolerance-block.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-tolerance-block.png`
- **Naming convention:** `ENG_OVERLAY_TOLERANCEBLOCK_A_0001`
- **Engineering documentation:** Dashed outer box = tolerance envelope, solid inner = nominal. "50.0 ± 0.05" is placeholder — bind both nominal value and tolerance range to real spec data.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### ENG_OVERLAY_MEASUREMENTGRID_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Background reference grid for any dimensioned view (Digital Twin, Manufacturing Cloud)
- **Animation behaviour:** Static — no animation.
- **SVG source:** `ForgeStudio/Engineering/eng-measurement-grid.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-measurement-grid.png`
- **Naming convention:** `ENG_OVERLAY_MEASUREMENTGRID_A_0001`
- **Engineering documentation:** Major gridlines every 5 divisions at higher opacity. Use at ≤0.4 container opacity as a backdrop, never as foreground content.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### ENG_OVERLAY_DATUMLINE_A_0001 — `Rebuilt` · Lifecycle: `Prototype`
- **Usage:** Digital Twin alignment views, Manufacturing Cloud fixture setup
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Datum marker dot pulses opacity 0.5→1, 2.6s ease-in-out, continuous — signals an active reference datum.
- **SVG source:** `ForgeStudio/Engineering/eng-datum-line.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-datum-line.png`
- **Naming convention:** `ENG_OVERLAY_DATUMLINE_A_0001`
- **Engineering documentation:** "DATUM A" label is placeholder — bind to real datum identifier (A/B/C...). Horizontal + vertical datum lines can be shown independently.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### ENG_OVERLAY_WELDGUIDE_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Fabrication-in-progress views, Build Board weld-station indicator
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Alignment ring + crosshair flicker opacity 0.4→1, 2s ease-in-out, continuous while weld station is active.
- **SVG source:** `ForgeStudio/Engineering/eng-weld-guide.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-weld-guide.png`
- **Naming convention:** `ENG_OVERLAY_WELDGUIDE_A_0001`
- **Engineering documentation:** Pair with VFX_LIGHT_WELDINGFLASH for a full fabrication-bay moment. Freeze (remove animation class) when the station is idle.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### ENG_OVERLAY_FIXTUREPIN_A_0001 — `Verified` · Lifecycle: `Prototype`
- **Usage:** Assembly/jig views, Manufacturing Cloud fixture documentation
- **Animation behaviour:** Static — no animation.
- **SVG source:** `ForgeStudio/Engineering/eng-fixture-pin.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-fixture-pin.png`
- **Naming convention:** `ENG_OVERLAY_FIXTUREPIN_A_0001`
- **Engineering documentation:** 3-pin triangulated layout is illustrative — real fixture-pin coordinates should replace these for a specific jig.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### ENG_OVERLAY_COORDGRID_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Digital Twin 2D/planar views, any top-down technical diagram
- **Animation behaviour:** Static — no animation.
- **SVG source:** `ForgeStudio/Engineering/eng-coordinate-grid.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-coordinate-grid.png`
- **Naming convention:** `ENG_OVERLAY_COORDGRID_A_0001`
- **Engineering documentation:** Planar companion to ENG_OVERLAY_COORDSYSTEM (which is the 3D XYZ gizmo). X=Gold, Y=Emerald — keep this mapping consistent with the 3D version.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### ENG_OVERLAY_ORIGINMARKER_A_0001 — `Rebuilt` · Lifecycle: `Prototype`
- **Usage:** Digital Twin scene origin indicator, CAD-style technical views
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Outer dashed ring rotates 360°, 10s linear infinite — slow, ambient, signals "this is the fixed reference point."
- **SVG source:** `ForgeStudio/Engineering/eng-origin-marker.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-origin-marker.png`
- **Naming convention:** `ENG_OVERLAY_ORIGINMARKER_A_0001`
- **Engineering documentation:** "ORIGIN 0,0,0" is placeholder text — bind to real origin coordinates if the origin is not literally 0,0,0 in a given view.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### ENG_OVERLAY_PLATENUMBERING_A_0001 — `Verified` · Lifecycle: `Prototype`
- **Usage:** Component/part numbering plates across Build Board, SME Portal
- **Animation behaviour:** Static — no animation.
- **SVG source:** `ForgeStudio/Engineering/eng-plate-numbering.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-plate-numbering.png`
- **Naming convention:** `ENG_OVERLAY_PLATENUMBERING_A_0001`
- **Engineering documentation:** Large numeral is placeholder ("04") — bind to real plate/sequence number. Uses Forge Steel body, not Steel Dark, to read as physical metal.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### ENG_OVERLAY_INSPECTIONSTAMP_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Any inspection-passed moment — University Portal, Government Portal, SME Portal
- **Animation behaviour:** Static — no animation (an inspection stamp is a completed, stable fact, per Forge motion vocabulary: motion only marks active work).
- **SVG source:** `ForgeStudio/Engineering/eng-inspection-stamp.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-inspection-stamp.png`
- **Naming convention:** `ENG_OVERLAY_INSPECTIONSTAMP_A_0001`
- **Engineering documentation:** Emerald double-ring + checkmark. Do not animate — this is the same "terminal positive" rule as STA_COMPONENT_VERIFIED.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### ENG_OVERLAY_VERIFICATIONSEAL_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Formal verification/certification moments — Investor Portal, Government Portal
- **Animation behaviour:** Static — no animation.
- **SVG source:** `ForgeStudio/Engineering/eng-verification-seal.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-verification-seal.png`
- **Naming convention:** `ENG_OVERLAY_VERIFICATIONSEAL_A_0001`
- **Engineering documentation:** Gold gear-tooth seal (24 teeth) reading "FORGE / VERIFIED." Reserve for formal, certificate-level verification — use STA_COMPONENT_VERIFIED for routine in-app status instead.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### ENG_OVERLAY_DIMENSIONANNOTATION_A_0001 — `Verified` · Lifecycle: `Prototype`
- **Usage:** Part-spec callouts across Manufacturing Cloud, Digital Twin, University Portal
- **Animation behaviour:** Static — no animation.
- **SVG source:** `ForgeStudio/Engineering/eng-dimension-annotation.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-dimension-annotation.png`
- **Naming convention:** `ENG_OVERLAY_DIMENSIONANNOTATION_A_0001`
- **Engineering documentation:** "Ø 12.00" and "+0.02 / -0.00" are placeholder — bind both nominal dimension and tolerance band to real spec data. Distinct from ENG_OVERLAY_DIMENSION (which is a plain measured span) — this variant is for a single annotated feature with a leader line.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### ENG_OVERLAY_ARROWSYSTEM_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Directional/navigation kit for any technical diagram needing motion vectors
- **Animation behaviour:** Static — no animation (arrows are a kit, not a live indicator).
- **SVG source:** `ForgeStudio/Engineering/eng-arrow-system.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-arrow-system.png`
- **Naming convention:** `ENG_OVERLAY_ARROWSYSTEM_A_0001`
- **Engineering documentation:** 4-directional arrow set (Gold/Cyan/Heat Orange/Emerald) plus a rotational arrow — use individual arrows or the full kit; recolor per meaning (Gold=primary direction, Heat Orange=warning/reverse, etc.) rather than inventing new arrow colors.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### ENG_OVERLAY_BLUEPRINTOVERLAY_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Full-bleed technical/blueprint backdrop — Homepage technical sections, Digital Twin loading state
- **Animation behaviour:** Static — no animation.
- **SVG source:** `ForgeStudio/Engineering/eng-blueprint-overlay.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-blueprint-overlay.png`
- **Naming convention:** `ENG_OVERLAY_BLUEPRINTOVERLAY_A_0001`
- **Engineering documentation:** Uses a dedicated blueprint-blue background (#173a4a) rather than Forge Steel Dark — this is the one asset in the library with a non-token background, reserved specifically for the "blueprint" visual convention. Do not reuse this blue elsewhere.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### ENG_OVERLAY_CADPROJECTION_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Digital Twin CAD/orthographic views, Manufacturing Cloud technical documentation
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Wireframe box opacity breathes 0.5→1, 4s ease-in-out, continuous — reads as a live, inspectable 3D reference, not a flat icon.
- **SVG source:** `ForgeStudio/Engineering/eng-cad-projection.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-cad-projection.png`
- **Naming convention:** `ENG_OVERLAY_CADPROJECTION_A_0001`
- **Engineering documentation:** Two-point orthographic projection of a rectangular volume. Swap proportions to match the actual component being documented; keep the cyan wireframe convention.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### ENG_OVERLAY_ASSEMBLYSEQUENCE_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** NAWEDOAM workflow visualization — Build Board, SME Portal, Homepage process explainer
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Connecting line flows via dash-offset, 3s linear infinite, low-key — signals "assembly in sequence," final step outlined in Emerald (verified/complete).
- **SVG source:** `ForgeStudio/Engineering/eng-assembly-sequence.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Engineering/eng-assembly-sequence.png`
- **Naming convention:** `ENG_OVERLAY_ASSEMBLYSEQUENCE_A_0001`
- **Engineering documentation:** 3-step example (numbered circles); extend to N steps for a real assembly sequence, always ending the final node in Forge Emerald to mark completion, per the Design→...→Deployment workflow in NAWEDOAM_Manufacturing_Model.pdf.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

## Status & Ownership

#### STA_COMPONENT_UNASSIGNED_A_0001 — `Verified` · Lifecycle: `Production`
- **Usage:** Build Board, SME Portal — component not yet claimed by an SME
- **Animation behaviour:** Static — no animation (nothing is happening yet).
- **SVG source:** `ForgeStudio/Status/sta-unassigned.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Status/sta-unassigned.png`
- **Naming convention:** `STA_COMPONENT_UNASSIGNED_A_0001`
- **Engineering documentation:** Neutral Steel ring + solid dot icon. This is the default/rest state for any component in the NAWEDOAM model.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### STA_COMPONENT_ASSIGNED_A_0001 — `Verified` · Lifecycle: `Production`
- **Usage:** Build Board, SME Portal — component claimed, one SME now owns it
- **Animation behaviour:** Static — no animation.
- **SVG source:** `ForgeStudio/Status/sta-assigned.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Status/sta-assigned.png`
- **Naming convention:** `STA_COMPONENT_ASSIGNED_A_0001`
- **Engineering documentation:** Gold ring + person icon. Represents "one component, one owner" — never show two owners on one badge.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### STA_COMPONENT_INFABRICATION_A_0001 — `Rebuilt` · Lifecycle: `Production`
- **Usage:** Build Board, Digital Twin — component actively being made
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Ring segments rotate 360°, 6s linear infinite — the only "in progress" state that animates continuously.
- **SVG source:** `ForgeStudio/Status/sta-in-fabrication.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Status/sta-in-fabrication.png`
- **Naming convention:** `STA_COMPONENT_INFABRICATION_A_0001`
- **Engineering documentation:** Heat Orange. Pair with VFX_LIGHT_WELDINGFLASH for a fabrication-bay hero moment if needed, but the badge alone is sufficient for list/table contexts.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### STA_COMPONENT_VERIFICATION_A_0001 — `Rebuilt` · Lifecycle: `Production`
- **Usage:** Build Board, Government Portal — component under engineering review
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Ring segments rotate 360°, 6s linear infinite.
- **SVG source:** `ForgeStudio/Status/sta-verification.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Status/sta-verification.png`
- **Naming convention:** `STA_COMPONENT_VERIFICATION_A_0001`
- **Engineering documentation:** Cyan. Same rotation behavior as IN_FABRICATION but different color+icon — never conflate the two states visually beyond color/icon.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### STA_COMPONENT_VERIFIED_A_0001 — `Verified` · Lifecycle: `Production`
- **Usage:** Anywhere a component has passed engineering review
- **Animation behaviour:** Static — no animation (verification is a completed, stable fact).
- **SVG source:** `ForgeStudio/Status/sta-verified.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Status/sta-verified.png`
- **Naming convention:** `STA_COMPONENT_VERIFIED_A_0001`
- **Engineering documentation:** Emerald checkmark. This is a terminal-positive state; do not animate it — motion should only ever mark active/in-progress work, per the Forge motion vocabulary.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### STA_COMPONENT_DEPLOYED_A_0001 — `Verified` · Lifecycle: `Production`
- **Usage:** Build Board, Investor Portal — component installed in a finished vehicle
- **Animation behaviour:** Static — no animation.
- **SVG source:** `ForgeStudio/Status/sta-deployed.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Status/sta-deployed.png`
- **Naming convention:** `STA_COMPONENT_DEPLOYED_A_0001`
- **Engineering documentation:** Gold triangle/chassis icon. Terminal state in the workflow: Design → Breakdown → Assignment → Review → Fabrication → Verification → Assembly → Testing → Deployment.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

## Particles & Atmosphere

#### VFX_PARTICLE_WELDINGSPARKS_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Fabrication-in-progress moments, Build Board active-work cards, homepage hero accents
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: 14 spark lines burst outward from a fixed point, staggered ease-out 1–1.6s loops — reads as continuous arc-welding, never a single flash.
- **SVG source:** `ForgeStudio/Particles/par-welding-sparks.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Particles/par-welding-sparks.png`
- **Naming convention:** `VFX_PARTICLE_WELDINGSPARKS_A_0001`
- **Engineering documentation:** Pair with VFX_LIGHT_WELDINGFLASH for a full weld-bay composite. Sparks are Heat Orange only — do not recolor.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### VFX_PARTICLE_GRINDINGSPARKS_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Surface-finishing/grinding process indicators, Build Board
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: 20-line fan spray, staggered 0.9s ease-out loop, Forge Gold.
- **SVG source:** `ForgeStudio/Particles/par-grinding-sparks.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Particles/par-grinding-sparks.png`
- **Naming convention:** `VFX_PARTICLE_GRINDINGSPARKS_A_0001`
- **Engineering documentation:** Narrower angular spread than welding sparks (fan vs radial burst) to visually distinguish the two processes at a glance.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### VFX_PARTICLE_HEATSHIMMER_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Overlay on any hot-process visualization — fabrication bays, Digital Twin thermal view
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: 6 vertical wave paths shift horizontally 2.4s ease-in-out, staggered — low-opacity, subtle.
- **SVG source:** `ForgeStudio/Particles/par-heat-shimmer.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Particles/par-heat-shimmer.png`
- **Naming convention:** `VFX_PARTICLE_HEATSHIMMER_A_0001`
- **Engineering documentation:** Keep opacity ≤0.4 in composite; intended as a texture layer over other content, not standalone.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### VFX_PARTICLE_SMOKEVOLUME_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Factory/workshop atmosphere layer, Homepage environment backdrop
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: 4 soft blobs rise and fade, 6s ease-in-out loop, staggered 0.6s.
- **SVG source:** `ForgeStudio/Particles/par-smoke-volume.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Particles/par-smoke-volume.png`
- **Naming convention:** `VFX_PARTICLE_SMOKEVOLUME_A_0001`
- **Engineering documentation:** Neutral Steel color only — smoke never carries an accent tint. Loop is seamless (opacity resets via infinite keyframe).
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### VFX_PARTICLE_FACTORYHAZE_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Full-bleed atmosphere backdrop for any factory-floor scene
- **Animation behaviour:** Static — 8 horizontal translucent bands, no animation (ambient haze, not moving smoke).
- **SVG source:** `ForgeStudio/Particles/par-factory-haze.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Particles/par-factory-haze.png`
- **Naming convention:** `VFX_PARTICLE_FACTORYHAZE_A_0001`
- **Engineering documentation:** Layer behind foreground content at low opacity; combine with wks- environment assets for a complete factory-floor composite.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### VFX_PARTICLE_DUSTPARTICLES_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Ambient texture over any workshop/fabrication scene
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: 30 dots drift slowly, 5–10s ease-in-out loops, individually staggered.
- **SVG source:** `ForgeStudio/Particles/par-dust-particles.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Particles/par-dust-particles.png`
- **Naming convention:** `VFX_PARTICLE_DUSTPARTICLES_A_0001`
- **Engineering documentation:** Deterministic pseudo-random placement (seeded by index) — safe to reuse verbatim without visual repetition artifacts at normal display sizes.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### VFX_PARTICLE_STEAM_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Process/vent atmosphere near machinery, Digital Twin
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: 3 wisp paths rise and fade, 4s ease-in-out loop, staggered 0.5s.
- **SVG source:** `ForgeStudio/Particles/par-steam.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Particles/par-steam.png`
- **Naming convention:** `VFX_PARTICLE_STEAM_A_0001`
- **Engineering documentation:** Cream-toned, higher opacity than smoke to read as steam (vs. grey smoke). Use near duct/vent geometry.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

## Environment

#### WKS_STRUCTURE_FACTORYSHADOW_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Ground-contact shadow under any hero object (truck, machine) across portals
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Environment/wks-factory-shadow.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Environment/wks-factory-shadow.png`
- **Naming convention:** `WKS_STRUCTURE_FACTORYSHADOW_A_0001`
- **Engineering documentation:** Soft elliptical shadow, black at 0.4 opacity — place directly beneath any foreground hero asset for grounding.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### WKS_STRUCTURE_CRANESILHOUETTE_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Overhead gantry crane background layer, Homepage/Manufacturing Cloud environment
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Hook assembly sways ±1.5°, 4s ease-in-out infinite — subtle ambient life, not a working animation.
- **SVG source:** `ForgeStudio/Environment/wks-crane-silhouette.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Environment/wks-crane-silhouette.png`
- **Naming convention:** `WKS_STRUCTURE_CRANESILHOUETTE_A_0001`
- **Engineering documentation:** Silhouette only (Forge Steel) — not a rendered 3D crane. Use as a background layer, never as a focal element.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### WKS_STRUCTURE_CABLETRAY_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Overhead/wall infrastructure texture layer for any workshop scene
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Environment/wks-cable-tray.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Environment/wks-cable-tray.png`
- **Naming convention:** `WKS_STRUCTURE_CABLETRAY_A_0001`
- **Engineering documentation:** Tileable horizontally. Cream cable line is decorative only, not a data path (do not confuse with GEO_NETWORK_ROUTING).
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### WKS_STRUCTURE_STEELBEAM_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Structural/architectural background element, any portal needing an industrial frame
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Environment/wks-steel-beam.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Environment/wks-steel-beam.png`
- **Naming convention:** `WKS_STRUCTURE_STEELBEAM_A_0001`
- **Engineering documentation:** I-beam cross-section, fully tileable horizontally for beams of any length.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### WKS_STRUCTURE_FACTORYWINDOW_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Background window-grid motif, warm ambient light source for factory scenes
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Environment/wks-factory-window.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Environment/wks-factory-window.png`
- **Naming convention:** `WKS_STRUCTURE_FACTORYWINDOW_A_0001`
- **Engineering documentation:** Gold-tinted glow at 0.25 opacity represents warm factory light — do not use Cyan or Emerald here, gold is the fixed "ambient warmth" convention.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### WKS_STRUCTURE_WORKSHOPWALL_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Corrugated wall texture backdrop, any workshop/factory-floor scene
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Environment/wks-workshop-wall.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Environment/wks-workshop-wall.png`
- **Naming convention:** `WKS_STRUCTURE_WORKSHOPWALL_A_0001`
- **Engineering documentation:** Tileable vertically and horizontally; alternating opacity ridges simulate corrugated metal without a raster texture.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### WKS_SAFETY_FLOORMARKING_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Floor-level hazard/lane marking, any workshop-floor scene
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Environment/wks-floor-marking.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Environment/wks-floor-marking.png`
- **Naming convention:** `WKS_SAFETY_FLOORMARKING_A_0001`
- **Engineering documentation:** Gold chevrons on near-black floor — standard industrial hazard-stripe convention. Tileable vertically.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### WKS_SAFETY_PAINTSTRIPE_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Diagonal safety-stripe accent, floor or wall marking across any portal
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Environment/wks-paint-stripe.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Environment/wks-paint-stripe.png`
- **Naming convention:** `WKS_SAFETY_PAINTSTRIPE_A_0001`
- **Engineering documentation:** Skewed Gold stripes at 0.85 opacity over Steel Dark — tileable horizontally.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### WKS_STRUCTURE_MACHINESHADOW_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Ground-contact shadow under any machine icon/asset
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Environment/wks-machine-shadow.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Environment/wks-machine-shadow.png`
- **Naming convention:** `WKS_STRUCTURE_MACHINESHADOW_A_0001`
- **Engineering documentation:** Narrower, flatter ellipse than WKS_STRUCTURE_FACTORYSHADOW — sized for equipment rather than large hero objects.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### WKS_MATERIAL_REFLECTIVEFLOOR_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Full-bleed floor surface backdrop, any factory-floor scene needing depth
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Environment/wks-reflective-floor.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Environment/wks-reflective-floor.png`
- **Naming convention:** `WKS_MATERIAL_REFLECTIVEFLOOR_A_0001`
- **Engineering documentation:** Steel-to-Steel-Dark vertical gradient + soft top highlight band simulates a reflective steel floor without a photo texture.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### WKS_MATERIAL_OILSTAIN_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Ground-texture detail for authenticity on floor backdrops
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Environment/wks-oil-stain.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Environment/wks-oil-stain.png`
- **Naming convention:** `WKS_MATERIAL_OILSTAIN_A_0001`
- **Engineering documentation:** Organic dark ellipse cluster, use sparingly (1–2 per floor composite) — overuse reads as dirty rather than authentic.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### WKS_SAFETY_FORKLIFTROUTE_A_0001 — `Rebuilt` · Lifecycle: `QA Passed`
- **Usage:** Logistics/routing floor marking, Digital Twin warehouse views
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Dashed route line flows via dash-offset, 3s linear infinite.
- **SVG source:** `ForgeStudio/Environment/wks-forklift-route.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Environment/wks-forklift-route.png`
- **Naming convention:** `WKS_SAFETY_FORKLIFTROUTE_A_0001`
- **Engineering documentation:** Gold dashed line + arrowhead; tileable horizontally for routes of any length.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### WKS_FURNITURE_STORAGERACK_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Warehouse/inventory background element, SME Portal, Digital Twin
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Environment/wks-storage-rack.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Environment/wks-storage-rack.png`
- **Naming convention:** `WKS_FURNITURE_STORAGERACK_A_0001`
- **Engineering documentation:** Bin colors cycle Gold/Cyan/Emerald per shelf as a decorative rhythm only — not meant to encode real inventory state (use Status badges for that).
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### WKS_FURNITURE_STEELTABLE_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Workbench/staging surface background element for any workshop scene
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Environment/wks-steel-table.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Environment/wks-steel-table.png`
- **Naming convention:** `WKS_FURNITURE_STEELTABLE_A_0001`
- **Engineering documentation:** Simple table silhouette; pair with Machine/Engineering overlay assets placed "on" the tabletop line (y=45) for composited workbench scenes.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

## Forge Material

#### MAT_STEEL_MESH_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Seamless surface swatch — steel mesh screening, any panel/backdrop
- **Animation behaviour:** Static — seamless tile.
- **SVG source:** `ForgeStudio/Materials/mat-steel-mesh.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Materials/mat-steel-mesh.png`
- **Naming convention:** `MAT_STEEL_MESH_A_0001`
- **Engineering documentation:** 12px grid on Forge Steel base. Tile edge-to-edge with no visible seam.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### MAT_STEEL_FORGEDPLATE_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Seamless surface swatch — forged/hammered steel plate
- **Animation behaviour:** Static — seamless tile.
- **SVG source:** `ForgeStudio/Materials/mat-forged-plate.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Materials/mat-forged-plate.png`
- **Naming convention:** `MAT_STEEL_FORGEDPLATE_A_0001`
- **Engineering documentation:** Diagonal hatch texture at low opacity simulates forge-hammer marks; bordered edge variant only for single-panel use, remove border when tiling.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### MAT_STEEL_CUTEDGE_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Top-edge treatment for any steel panel — plasma/laser-cut edge look
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Materials/mat-cut-steel-edge.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Materials/mat-cut-steel-edge.png`
- **Naming convention:** `MAT_STEEL_CUTEDGE_A_0001`
- **Engineering documentation:** Zigzag cut-edge silhouette along the top edge only; pair with a plain steel fill below for full-panel use.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### MAT_STEEL_PERFORATION_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Seamless surface swatch — small round perforation pattern (speaker grille / machine panel)
- **Animation behaviour:** Static — seamless tile.
- **SVG source:** `ForgeStudio/Materials/mat-machine-perforation.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Materials/mat-machine-perforation.png`
- **Naming convention:** `MAT_STEEL_PERFORATION_A_0001`
- **Engineering documentation:** 20px grid, 4px holes. Tile edge-to-edge.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### MAT_STEEL_VENTHOLES_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Seamless surface swatch — larger ventilation hole pattern
- **Animation behaviour:** Static — seamless tile.
- **SVG source:** `ForgeStudio/Materials/mat-ventilation-holes.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Materials/mat-ventilation-holes.png`
- **Naming convention:** `MAT_STEEL_VENTHOLES_A_0001`
- **Engineering documentation:** 25px grid, 7px holes with rim highlight, larger/sparser than MAT_STEEL_PERFORATION — use for visible vent panels vs. fine mesh screening.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### MAT_STEEL_HONEYCOMB_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Seamless surface swatch — honeycomb panel (lightweight structural panel look)
- **Animation behaviour:** Static — seamless tile.
- **SVG source:** `ForgeStudio/Materials/mat-honeycomb-panel.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Materials/mat-honeycomb-panel.png`
- **Naming convention:** `MAT_STEEL_HONEYCOMB_A_0001`
- **Engineering documentation:** Dense hex-cell fill pattern on Forge Steel base. Tile edge-to-edge.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### MAT_STEEL_VENTS_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Seamless surface swatch — angled louver vents (machine housing detail)
- **Animation behaviour:** Static — seamless tile.
- **SVG source:** `ForgeStudio/Materials/mat-machine-vents.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Materials/mat-machine-vents.png`
- **Naming convention:** `MAT_STEEL_VENTS_A_0001`
- **Engineering documentation:** Distinct from MAT_STEEL_VENTHOLES: this is angled louver slats, not round holes. Tile vertically.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### MAT_STEEL_CHAMFER_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Panel-edge treatment — beveled/chamfered steel plate edge
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Materials/mat-forged-chamfer.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Materials/mat-forged-chamfer.png`
- **Naming convention:** `MAT_STEEL_CHAMFER_A_0001`
- **Engineering documentation:** Top highlight + bottom shadow simulate a machined chamfer bevel on all 4 edges of a plate. Single-panel use, not a tile.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

## Hardware

#### HDW_FASTENER_BOLTS_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Detail accent on any panel/plate needing visible fasteners — Build Board component cards, Digital Twin
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Hardware/hdw-industrial-bolts.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Hardware/hdw-industrial-bolts.png`
- **Naming convention:** `HDW_FASTENER_BOLTS_A_0001`
- **Engineering documentation:** Hex-head bolt row, 3-up. Reuse individual bolts or the row; scale to match the panel they are fastening.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### HDW_STRUCTURE_RIBS_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Structural reinforcement detail on any panel needing an engineered, ribbed-steel look
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Hardware/hdw-reinforcement-ribs.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Hardware/hdw-reinforcement-ribs.png`
- **Naming convention:** `HDW_STRUCTURE_RIBS_A_0001`
- **Engineering documentation:** Vertical rib pattern at 24px spacing on Forge Steel. Tileable horizontally.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

## Dashboard & Data

#### DSH_PANEL_MESPANEL_A_0001 — `Verified` · Lifecycle: `Prototype`
- **Usage:** Manufacturing Cloud line-status overview, Build Board factory tile
- **Animation behaviour:** Static — no animation; a live-data readout, not a motion moment.
- **SVG source:** `ForgeStudio/Dashboard/dsh-mes-panel.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Dashboard/dsh-mes-panel.png`
- **Naming convention:** `DSH_PANEL_MESPANEL_A_0001`
- **Engineering documentation:** 4-stat grid (OEE, Units, Downtime, Queue) — bind all 4 values + accent colors to real MES data. Accent per stat is fixed (Emerald/Gold/Heat/Cyan); do not remap.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### DSH_WIDGET_SCADA_A_0001 — `Rebuilt` · Lifecycle: `Prototype`
- **Usage:** Real-time sensor/process readout — Manufacturing Cloud, Digital Twin
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Needle sweeps ±30°, 4s ease-in-out infinite (demo only).
- **SVG source:** `ForgeStudio/Dashboard/dsh-scada-widget.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Dashboard/dsh-scada-widget.png`
- **Naming convention:** `DSH_WIDGET_SCADA_A_0001`
- **Engineering documentation:** Replace the oscillating demo animation with a real needle-angle binding driven by live sensor value at integration; arc fill (Emerald) should reflect actual safe-range coverage.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### DSH_WIDGET_FACTORYCOUNTER_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Production-unit odometer, Homepage/Investor Portal live counters
- **Animation behaviour:** Static — no animation; digits are placeholder.
- **SVG source:** `ForgeStudio/Dashboard/dsh-factory-counter.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Dashboard/dsh-factory-counter.png`
- **Naming convention:** `DSH_WIDGET_FACTORYCOUNTER_A_0001`
- **Engineering documentation:** 4-digit odometer face. SE should implement real digit-roll transitions in code (CSS/JS), using this as the visual reference for digit-cell proportions.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### DSH_WIDGET_MACHINECLOCK_A_0001 — `Rebuilt` · Lifecycle: `Prototype`
- **Usage:** Machine runtime/uptime display — Manufacturing Cloud, SME Portal
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Hand rotates 360°, 60s linear infinite (demo speed only).
- **SVG source:** `ForgeStudio/Dashboard/dsh-machine-clock.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Dashboard/dsh-machine-clock.png`
- **Naming convention:** `DSH_WIDGET_MACHINECLOCK_A_0001`
- **Engineering documentation:** "RUNTIME 04:12:08" is placeholder text — bind to real elapsed-runtime string; hand rotation should be replaced with a real-time-driven angle at integration.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### DSH_WIDGET_PARTTRACKER_A_0001 — `Verified` · Lifecycle: `Prototype`
- **Usage:** Component workflow tracker — Build Board, SME Portal, Digital Twin
- **Animation behaviour:** Static — no animation; progress line-fill communicates current stage.
- **SVG source:** `ForgeStudio/Dashboard/dsh-part-tracker.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Dashboard/dsh-part-tracker.png`
- **Naming convention:** `DSH_WIDGET_PARTTRACKER_A_0001`
- **Engineering documentation:** 5-stop workflow (Design→SME→Fab→QC→Deploy) mirrors NAWEDOAM_Manufacturing_Model.pdf. Bind filled/unfilled stops + line-fill length to real component stage.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### DSH_WIDGET_BUILDPROGRESS_A_0001 — `Verified` · Lifecycle: `Prototype`
- **Usage:** Assembly-stage progress bar — Build Board, Manufacturing Cloud
- **Animation behaviour:** Static — no animation.
- **SVG source:** `ForgeStudio/Dashboard/dsh-build-progress.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Dashboard/dsh-build-progress.png`
- **Naming convention:** `DSH_WIDGET_BUILDPROGRESS_A_0001`
- **Engineering documentation:** 5-segment bar, Gold = complete, Steel = pending. Bind segment count/fill and label to real stage data.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### DSH_CARD_INSPECTIONCARD_A_0001 — `Verified` · Lifecycle: `Prototype`
- **Usage:** QC/inspection record — University Portal, Government Portal, SME Portal
- **Animation behaviour:** Static — no animation (a completed record, not an active process).
- **SVG source:** `ForgeStudio/Dashboard/dsh-inspection-card.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Dashboard/dsh-inspection-card.png`
- **Naming convention:** `DSH_CARD_INSPECTIONCARD_A_0001`
- **Engineering documentation:** All text fields (part ID, inspector, status, date/bay) are placeholder — bind to real inspection record at integration.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### DSH_CARD_PRODUCTIONCARD_A_0001 — `Verified` · Lifecycle: `Prototype`
- **Usage:** Production-run summary — Manufacturing Cloud, Investor Portal
- **Animation behaviour:** Static — no animation.
- **SVG source:** `ForgeStudio/Dashboard/dsh-production-card.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Dashboard/dsh-production-card.png`
- **Naming convention:** `DSH_CARD_PRODUCTIONCARD_A_0001`
- **Engineering documentation:** Run ID, component name, output count, yield% are placeholder — bind to real production-run data.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### DSH_LABEL_DIGITALLABEL_A_0001 — `Rebuilt` · Lifecycle: `Prototype`
- **Usage:** Compact serial/tag label anywhere a short digital ID is shown
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Status dot blinks opacity, 1.4s loop.
- **SVG source:** `ForgeStudio/Dashboard/dsh-digital-label.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Dashboard/dsh-digital-label.png`
- **Naming convention:** `DSH_LABEL_DIGITALLABEL_A_0001`
- **Engineering documentation:** "SN-2201-A44" is placeholder — bind to real serial number. Dot color signals live/online state (Emerald=active).
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### DSH_WIDGET_TERMINAL_A_0001 — `Rebuilt` · Lifecycle: `Prototype`
- **Usage:** Forge AI Manufacturing Assistant console, developer/ops views
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Cursor blinks step-end, 1s loop.
- **SVG source:** `ForgeStudio/Dashboard/dsh-terminal-widget.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Dashboard/dsh-terminal-widget.png`
- **Naming convention:** `DSH_WIDGET_TERMINAL_A_0001`
- **Engineering documentation:** Command lines are placeholder — bind to real assistant/system log output. Keep monospace + the 2-color OK-line convention (Emerald=pass, Cyan=info).
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

## Identity & Verification

#### IDN_PLATE_MACHINEID_A_0001 — `Verified` · Lifecycle: `Prototype`
- **Usage:** Machine identification tag — Manufacturing Cloud, Digital Twin equipment view
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Identity/idn-machine-id.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Identity/idn-machine-id.png`
- **Naming convention:** `IDN_PLATE_MACHINEID_A_0001`
- **Engineering documentation:** Cyan accent = "machine" identity class (vs. Gold for workshop). "LATHE-014" + "ONLINE" are placeholder — bind to real machine ID + live status.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### IDN_PLATE_WORKSHOPID_A_0001 — `Verified` · Lifecycle: `Prototype`
- **Usage:** Workshop/facility identification tag — SME Portal, Government Portal
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Identity/idn-workshop-id.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Identity/idn-workshop-id.png`
- **Naming convention:** `IDN_PLATE_WORKSHOPID_A_0001`
- **Engineering documentation:** Gold accent = "workshop/SME" identity class. "WKS-LAGOS-07" + verification status are placeholder.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### IDN_BADGE_MACHINEBADGE_A_0001 — `Verified` · Lifecycle: `Prototype`
- **Usage:** Machine class/certification medallion — Manufacturing Cloud equipment registry
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Identity/idn-machine-badge.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Identity/idn-machine-badge.png`
- **Naming convention:** `IDN_BADGE_MACHINEBADGE_A_0001`
- **Engineering documentation:** Gear-tooth medallion, Cyan. "CLASS III" is placeholder — bind to real certification class.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### IDN_MARK_VERIFICATIONRIBBON_A_0001 — `Verified` · Lifecycle: `QA Passed`
- **Usage:** Corner-mounted verified marker on any card/panel across the platform
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Identity/idn-verification-ribbon.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Identity/idn-verification-ribbon.png`
- **Naming convention:** `IDN_MARK_VERIFICATIONRIBBON_A_0001`
- **Engineering documentation:** Diagonal corner ribbon, Emerald, transparent background — overlay on the top-left corner of any card. This is the compact alternative to the full ENG_OVERLAY_VERIFICATIONSEAL for space-constrained UI.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### IDN_DOC_COMPONENTPASSPORT_A_0001 — `Verified` · Lifecycle: `Prototype`
- **Usage:** Full component identity + provenance record — SME Portal, Digital Twin, Government Portal
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Identity/idn-component-passport.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Identity/idn-component-passport.png`
- **Naming convention:** `IDN_DOC_COMPONENTPASSPORT_A_0001`
- **Engineering documentation:** Cream/light background (only light-background asset in the library, deliberate — passports read as physical documents). Photo-slot rectangle, ID, owner+verification, issued date, and route are all placeholder — bind to real component provenance data.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### IDN_CARD_OWNERSHIPCARD_A_0001 — `Verified` · Lifecycle: `Prototype`
- **Usage:** "One component, one owner" record — Build Board, SME Portal
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Identity/idn-ownership-card.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Identity/idn-ownership-card.png`
- **Naming convention:** `IDN_CARD_OWNERSHIPCARD_A_0001`
- **Engineering documentation:** Portrait circle, name, role+component, SME ID+location, and assignment tag are placeholder — bind to real SME/owner data. This is the visual proof-point of the NAWEDOAM Forge Responsibility Principle.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

## Animation — Motion Vocabulary

#### MOT_BLUEPRINTREVEAL_A_0001 — `Rebuilt` · Lifecycle: `Engineering Review`
- **Usage:** Introduce any new technical/CAD view across Digital Twin, Manufacturing Cloud
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Grid fades in 0→0.5→0, traced rectangle draws on via stroke-dashoffset, 3s ease-out loop.
- **SVG source:** `ForgeStudio/Animation/mot-blueprint-reveal.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Animation/mot-blueprint-reveal.png`
- **Naming convention:** `MOT_BLUEPRINTREVEAL_A_0001`
- **Engineering documentation:** See MOT_BLUEPRINTREVEAL in Motion_Vocabulary.md for the extractable CSS recipe — apply to any content entering a technical view.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### MOT_MACHINEBOOT_A_0001 — `Rebuilt` · Lifecycle: `Engineering Review`
- **Usage:** Page/system initial-load sequence, any portal
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: 5 LEDs light up in sequence, 0.3s stagger, 2.4s loop (demo repeats; production plays once on load).
- **SVG source:** `ForgeStudio/Animation/mot-machine-boot.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Animation/mot-machine-boot.png`
- **Naming convention:** `MOT_MACHINEBOOT_A_0001`
- **Engineering documentation:** Production use should play this ONCE on load, not loop — the file loops for review purposes only.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### MOT_COMPONENTLOCK_A_0001 — `Rebuilt` · Lifecycle: `Engineering Review`
- **Usage:** Confirm an assignment/commit action, Build Board, SME Portal
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Bracket arm rotates -24°→0° and settles, 2.4s ease-in-out loop (demo; production plays once on trigger).
- **SVG source:** `ForgeStudio/Animation/mot-component-lock.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Animation/mot-component-lock.png`
- **Naming convention:** `MOT_COMPONENTLOCK_A_0001`
- **Engineering documentation:** Trigger on a real commit/assign action, not continuously.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### MOT_MECHANICALSLIDE_A_0001 — `Rebuilt` · Lifecycle: `Engineering Review`
- **Usage:** Panel/drawer/modal open transition, any portal
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Panel translates 90px and back, ease-in-out, 3s loop (demo; production plays once per open/close).
- **SVG source:** `ForgeStudio/Animation/mot-mechanical-slide.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Animation/mot-mechanical-slide.png`
- **Naming convention:** `MOT_MECHANICALSLIDE_A_0001`
- **Engineering documentation:** Bind to real open/close state rather than looping continuously.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### MOT_INDUSTRIALFADE_A_0001 — `Rebuilt` · Lifecycle: `Engineering Review`
- **Usage:** Scene/route transition between any two views
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Steel-toned panel wipes across, 3s ease-in-out loop (demo; production plays once per navigation).
- **SVG source:** `ForgeStudio/Animation/mot-industrial-fade.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Animation/mot-industrial-fade.png`
- **Naming convention:** `MOT_INDUSTRIALFADE_A_0001`
- **Engineering documentation:** Use in place of a plain CSS opacity crossfade for any full-screen route change.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### MOT_FACTORYPULSE_A_0001 — `Rebuilt` · Lifecycle: `Engineering Review`
- **Usage:** Ambient background "facility is alive" breathing, any idle/background state
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Overlay opacity breathes 0→0.35, 3.5s ease-in-out, continuous.
- **SVG source:** `ForgeStudio/Animation/mot-factory-pulse.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Animation/mot-factory-pulse.png`
- **Naming convention:** `MOT_FACTORYPULSE_A_0001`
- **Engineering documentation:** Extremely low amplitude by design — this should be barely perceptible, never a focal effect.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### MOT_CONVEYORMOTION_A_0001 — `Rebuilt` · Lifecycle: `Engineering Review`
- **Usage:** Continuous production-flow indicator, Manufacturing Cloud, Build Board
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: 3 items translate along a belt line, linear, 3s loop, staggered 1s.
- **SVG source:** `ForgeStudio/Animation/mot-conveyor-motion.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Animation/mot-conveyor-motion.png`
- **Naming convention:** `MOT_CONVEYORMOTION_A_0001`
- **Engineering documentation:** Item count/spacing is illustrative — extend to match real belt length/item count.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### MOT_ASSEMBLYSNAP_A_0001 — `Rebuilt` · Lifecycle: `Engineering Review`
- **Usage:** Assembly-complete moment, Build Board, Digital Twin
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Two halves slide together and settle, ease-in-out, 2.6s loop (demo; production plays once on assembly completion).
- **SVG source:** `ForgeStudio/Animation/mot-assembly-snap.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Animation/mot-assembly-snap.png`
- **Naming convention:** `MOT_ASSEMBLYSNAP_A_0001`
- **Engineering documentation:** Trigger once when a real assembly step completes, not continuously.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

## Nigeria — Schematic

#### NGA_MAP_INDUSTRIALHUBS_A_0001 — `Rebuilt` · Lifecycle: `Engineering Review`
- **Usage:** Manufacturing Cloud regional overview, Investor Portal hub map, Homepage data section — MISSION 001 canonical hub network
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Each hub ring pulses opacity 0.55 to 1 to 0.55, 3s, staggered 0.3s per hub -- implemented via native SMIL <animate>, verified surviving the save pipeline (see Known_Issues.md).
- **SVG source:** `ForgeStudio/Nigeria/nga-industrial-hubs.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Nigeria/nga-industrial-hubs.png`
- **Naming convention:** `NGA_MAP_INDUSTRIALHUBS_A_0001`
- **Engineering documentation:** Real lat/lon coordinates projected via linear equirectangular projection against Nigeria's true bounding box -- positions are coordinate-derived, not estimated (see Hub_Industrial_Identity.md for full table + sourcing). Outline remains a simplified schematic silhouette, not surveyed boundary data. Color-coded by industrial-identity bucket (Gold/Cyan/Emerald/Heat Orange).
- **QA note:** CONFIRMED: SMIL <animate>/<animateMotion> elements were present immediately after save and verified missing on read-back — direct proof the sanitizer strips SMIL too, not just CSS. See Known_Issues.md.

#### NGA_MAP_TRANSPORTCORRIDORS_A_0001 — `Verified` · Lifecycle: `Engineering Review`
- **Usage:** Digital Twin logistics view, Manufacturing Cloud supply-chain diagram
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Nigeria/nga-transport-corridors.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Nigeria/nga-transport-corridors.png`
- **Naming convention:** `NGA_MAP_TRANSPORTCORRIDORS_A_0001`
- **Engineering documentation:** Cyan solid = road, dashed = rail, Emerald square = port. Illustrative routing — bind to real corridor geometry for production use.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### NGA_MAP_POWERGRID_A_0001 — `Rebuilt` · Lifecycle: `Engineering Review`
- **Usage:** Infrastructure-overlay view, Government Portal, Manufacturing Cloud
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Grid lines pulse opacity 0.4→1, 3s ease-in-out, continuous.
- **SVG source:** `ForgeStudio/Nigeria/nga-power-grid.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Nigeria/nga-power-grid.png`
- **Naming convention:** `NGA_MAP_POWERGRID_A_0001`
- **Engineering documentation:** Heat Orange = power infrastructure. Node/line placement is illustrative — bind to real grid + plant data.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### NGA_MAP_NIGHTLIGHTS_A_0001 — `Rebuilt` · Lifecycle: `Engineering Review`
- **Usage:** Ambient/hero data-view variant — Homepage, Investor Portal
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Each hub glow twinkles independently, 2.4s ease-in-out, staggered 0.2s.
- **SVG source:** `ForgeStudio/Nigeria/nga-night-lights.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Nigeria/nga-night-lights.png`
- **Naming convention:** `NGA_MAP_NIGHTLIGHTS_A_0001`
- **Engineering documentation:** Near-black background variant, distinct from the standard Steel Dark backdrop — reserved for this "night" convention only.
- **QA note:** Registry corrected to remove false in-file animation claim; asset itself unchanged (already visually correct as a static graphic).

#### NGA_MAP_HEATMAPINDUSTRY_A_0001 — `Verified` · Lifecycle: `Engineering Review`
- **Usage:** Industrial-density visualization — Investor Portal, Government Portal
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Nigeria/nga-heatmap-industry.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Nigeria/nga-heatmap-industry.png`
- **Naming convention:** `NGA_MAP_HEATMAPINDUSTRY_A_0001`
- **Engineering documentation:** Radial heat gradients sized by illustrative activity level — bind radius/opacity to real industrial-output data per hub.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### NGA_MAP_BLUEPRINTVIEW_A_0001 — `Verified` · Lifecycle: `Engineering Review`
- **Usage:** Technical/engineering-styled map view — Manufacturing Cloud documentation
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Nigeria/nga-blueprint-view.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Nigeria/nga-blueprint-view.png`
- **Naming convention:** `NGA_MAP_BLUEPRINTVIEW_A_0001`
- **Engineering documentation:** Uses the same blueprint-blue (#173a4a) convention as ENG_OVERLAY_BLUEPRINTOVERLAY — keep consistent if both appear together.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

#### NGA_MAP_WIREFRAMEVIEW_A_0001 — `Verified` · Lifecycle: `Engineering Review`
- **Usage:** CAD-style technical map view — Digital Twin, Manufacturing Cloud
- **Animation behaviour:** Static.
- **SVG source:** `ForgeStudio/Nigeria/nga-wireframe-view.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Nigeria/nga-wireframe-view.png`
- **Naming convention:** `NGA_MAP_WIREFRAMEVIEW_A_0001`
- **Engineering documentation:** Illustrative triangulation fan from a single interior point — a real wireframe should come from the actual Blender mesh topology once modeled.
- **QA note:** SVG well-formed, viewBox present, no dangling refs, correctly documented as static.

## Vehicle — Schematic

#### VEH_CAMERAPLAN_SHOTLIST_A_0001 — `Rebuilt` · Lifecycle: `Engineering Review`
- **Usage:** Blender camera/lighting artist reference for the NAWEDOAM truck render pass (Mission 002)
- **Animation behaviour:** STATIC AS SHIPPED — this SVG's <style>/SMIL <animate> elements do not survive the save pipeline (see Known_Issues.md); the motion below is a documented runtime spec only, not present in the file. Intended behaviour: Orbit camera markers travel their paths via SMIL animateMotion (8s top-down orbit, 7s elevated orbit); dolly marker moves in/out via SMIL animate, 6s. All confirmed surviving the save pipeline.
- **SVG source:** `ForgeStudio/Vehicle/veh-camera-shotlist.svg`
- **PNG export:** `ForgeStudio/Exports/PNG/Vehicle/veh-camera-shotlist.png`
- **Naming convention:** `VEH_CAMERAPLAN_SHOTLIST_A_0001`
- **Engineering documentation:** Schematic diagram only — 8 key turnaround angles (Front/Rear/Left/Right/3-4 variants) plotted on a 100-unit-radius circle, plus dolly-in/out and elevated-orbit paths. This is the shot-list reference for Mission 002, not a rendered frame. See Nigeria_Truck_Render_Spec.md for the full 14-view/7-lighting/13-motion brief.
- **QA note:** CONFIRMED: SMIL <animate>/<animateMotion> elements were present immediately after save and verified missing on read-back — direct proof the sanitizer strips SMIL too, not just CSS. See Known_Issues.md.

