# Forge Studio — Motion Vocabulary

The complete, durable set of Forge's reusable transitions. This is the "Engineering motion vocabulary" referenced in the Forge constitution — implementation-agnostic keyframe recipes, not one-off animations baked into a single asset. Any of these can be applied to any element on any surface (Homepage, Manufacturing Cloud, Build Board, SME/University/Government/Investor Portals, Digital Twin, AI Assistant, Mobile).

## Implementation mandate
**Update (QA pass):** neither CSS `@keyframes` nor SMIL `<animate>` survives this project's SVG save pipeline — both were tested and both are confirmed stripped (see `Known_Issues.md`). Every reference SVG in this library is therefore a **static** asset. The CSS recipes below are the authoritative, engine-agnostic spec for the motion — Software Engineering implements them directly in the real rendering stack (React/CSS, or SMIL re-added at runtime if inlining bypasses the sanitizer) using the shipped SVG as static art only. Do not expect any `.svg` file here to animate on its own.

## Rules
1. **Motion signals state, never decorates.** Every transition below maps to a real system condition (active work, verification, alert, boot, assembly). Do not apply a transition where no such condition exists.
2. **Terminal/stable states never animate** (see STA_COMPONENT_VERIFIED, ENG_OVERLAY_INSPECTIONSTAMP) — only active/in-progress states move.
3. **One motion per meaning.** Do not invent a new transition for a case already covered here — extend this vocabulary deliberately, don't fork.
4. **Timing functions and durations are fixed per entry** — SE may retarget which element they apply to, but should not alter easing/duration without updating this document first (this is what "usable ten years from now" requires: one documented physics, everywhere).

---

### MOT_LASERSWEEP — Laser Sweep
- **Reference implementation:** `ForgeStudio/Lighting/lgt-inspection-laser.svg`
- **Duration:** 2.4s
- **Easing:** ease-in-out (ping-pong)
- **Usage:** Active verification/scan moment.
- **CSS recipe:**
```css
@keyframes forge-laser-sweep { 0%,100% { transform: translateY(0); } 50% { transform: translateY(160px); } }
```

### MOT_WELDFLASH — Weld Flash
- **Reference implementation:** `ForgeStudio/Lighting/lgt-welding-flash.svg`
- **Duration:** 1.6s
- **Easing:** irregular flicker (non-uniform keyframes)
- **Usage:** Active fabrication/hot-work moment.
- **CSS recipe:**
```css
@keyframes forge-weld-flash { 0%,100%{opacity:.7} 8%{opacity:1} 12%{opacity:.4} 20%{opacity:1} 45%{opacity:.6} 60%{opacity:1} 80%{opacity:.5} }
```

### MOT_BLUEPRINTREVEAL — Blueprint Reveal
- **Reference implementation:** `ForgeStudio/Animation/mot-blueprint-reveal.svg`
- **Duration:** 3s
- **Easing:** ease-out
- **Usage:** Introduce a new technical/CAD view — grid fades in as a traced outline draws on.
- **CSS recipe:**
```css
@keyframes forge-grid-in { 0%{opacity:0} 30%{opacity:.5} 80%{opacity:.5} 100%{opacity:0} }
@keyframes forge-trace-on { 0%{stroke-dashoffset:300} 70%{stroke-dashoffset:0} 100%{stroke-dashoffset:0} }
```

### MOT_MACHINEBOOT — Machine Boot
- **Reference implementation:** `ForgeStudio/Animation/mot-machine-boot.svg`
- **Duration:** 2.4s
- **Easing:** staggered 0.3s per element
- **Usage:** System/page initial-load sequence — sequential power-on, not a spinner.
- **CSS recipe:**
```css
@keyframes forge-boot { 0%{opacity:.1} 10%{opacity:1} 90%{opacity:1} 100%{opacity:.1} }  /* apply with increasing animation-delay per element */
```

### MOT_COMPONENTLOCK — Component Lock
- **Reference implementation:** `ForgeStudio/Animation/mot-component-lock.svg`
- **Duration:** 2.4s
- **Easing:** ease-in-out, settles at rest
- **Usage:** Confirm an assignment/commit action — a bracket closing into place.
- **CSS recipe:**
```css
@keyframes forge-lock { 0%,20%{transform:rotate(-24deg)} 40%,100%{transform:rotate(0deg)} }  /* transform-origin: center of the pivot */
```

### MOT_MECHANICALSLIDE — Mechanical Slide
- **Reference implementation:** `ForgeStudio/Animation/mot-mechanical-slide.svg`
- **Duration:** 3s
- **Easing:** ease-in-out, hold-slide-hold
- **Usage:** Panel/drawer/modal open transition.
- **CSS recipe:**
```css
@keyframes forge-slide { 0%,15%{transform:translateX(0)} 50%,85%{transform:translateX(90px)} 100%{transform:translateX(0)} }
```

### MOT_INDUSTRIALFADE — Industrial Fade
- **Reference implementation:** `ForgeStudio/Animation/mot-industrial-fade.svg`
- **Duration:** 3s
- **Easing:** ease-in-out
- **Usage:** Scene/route transition — a steel-toned wipe rather than a plain opacity crossfade.
- **CSS recipe:**
```css
@keyframes forge-wipe { 0%{transform:translateX(-100%)} 50%{transform:translateX(0)} 100%{transform:translateX(100%)} }
```

### MOT_FACTORYPULSE — Factory Pulse
- **Reference implementation:** `ForgeStudio/Animation/mot-factory-pulse.svg`
- **Duration:** 3.5s
- **Easing:** ease-in-out
- **Usage:** Ambient "the facility is alive" background breathing — very low amplitude, continuous.
- **CSS recipe:**
```css
@keyframes forge-facility-pulse { 0%,100%{opacity:0} 50%{opacity:.35} }
```

### MOT_BEACONBLINK — Beacon Blink
- **Reference implementation:** `ForgeStudio/Lighting/lgt-beacon.svg`
- **Duration:** 1.2s (core) / 2.4s (sweep)
- **Easing:** linear sweep + eased flash
- **Usage:** Active-alert indicator.
- **CSS recipe:**
```css
@keyframes forge-beacon-flash { 0%,100%{opacity:.6} 50%{opacity:1} }
@keyframes forge-beacon-sweep { to { transform: rotate(360deg); } }
```

### MOT_INSPECTIONSCAN — Inspection Scan
- **Reference implementation:** `ForgeStudio/Geometry/geo-verification-lines.svg`
- **Duration:** 3.5s
- **Easing:** ease-in-out (ping-pong)
- **Usage:** Verification/QA process — a line sweeping down a stack, revealing pass/fail state.
- **CSS recipe:**
```css
@keyframes forge-scan { 0%{transform:translateY(0)} 50%{transform:translateY(176px)} 100%{transform:translateY(0)} }
```

### MOT_CONVEYORMOTION — Conveyor Motion
- **Reference implementation:** `ForgeStudio/Animation/mot-conveyor-motion.svg`
- **Duration:** 3s per item, staggered
- **Easing:** linear
- **Usage:** Continuous production-flow indicator — items moving along a line.
- **CSS recipe:**
```css
@keyframes forge-conveyor { 0%{transform:translateX(-30px)} 100%{transform:translateX(230px)} }  /* stagger animation-delay per item */
```

### MOT_ASSEMBLYSNAP — Assembly Snap
- **Reference implementation:** `ForgeStudio/Animation/mot-assembly-snap.svg`
- **Duration:** 2.6s
- **Easing:** ease-in-out, settles at rest
- **Usage:** Two parts/views coming together and locking — assembly-complete moment.
- **CSS recipe:**
```css
@keyframes forge-snap-l { 0%,20%{transform:translateX(-40px)} 50%,100%{transform:translateX(0)} }
@keyframes forge-snap-r { 0%,20%{transform:translateX(40px)} 50%,100%{transform:translateX(0)} }
```

### MOT_HEATPULSE — Heat Pulse
- **Reference implementation:** `ForgeStudio/Lighting/lgt-heat-glow.svg`
- **Duration:** 3s
- **Easing:** ease-in-out
- **Usage:** Highlight an active/hot component.
- **CSS recipe:**
```css
@keyframes forge-heat-pulse { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:.9;transform:scale(1.12)} }
```

### MOT_GRINDINGSPARKS — Grinding Sparks
- **Reference implementation:** `ForgeStudio/Particles/par-grinding-sparks.svg`
- **Duration:** 0.9s, staggered 0.04s per spark
- **Easing:** ease-out
- **Usage:** Surface-finishing process indicator.
- **CSS recipe:**
```css
@keyframes forge-spark-fan { 0%{opacity:1;stroke-width:1.5} 100%{opacity:0;stroke-width:.4} }
```

### MOT_SMOKEDRIFT — Smoke Drift
- **Reference implementation:** `ForgeStudio/Particles/par-smoke-volume.svg`
- **Duration:** 6s, staggered 0.6s per blob
- **Easing:** ease-in-out
- **Usage:** Ambient factory-atmosphere layer.
- **CSS recipe:**
```css
@keyframes forge-smoke-rise { 0%{transform:translateY(0);opacity:.22} 100%{transform:translateY(-30px);opacity:0} }
```

### MOT_ANKARAMOVEMENT — Ankara Movement
- **Reference implementation:** `ForgeStudio/Geometry/geo-ankara-interlace.svg`
- **Duration:** 5s
- **Easing:** linear, counter-directional
- **Usage:** The network/weave motif — background life for hero and section-divider moments.
- **CSS recipe:**
```css
@keyframes forge-weave { to { stroke-dashoffset: -56; } }  /* apply in reverse direction to the second band set */
```

