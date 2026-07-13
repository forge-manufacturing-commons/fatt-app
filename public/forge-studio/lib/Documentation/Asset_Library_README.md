# Forge Studio — Homepage Asset Library (Phase 1)

## What this is
Reusable, code-native production assets for the Forge homepage's industrial language. Everything here is a standalone `.svg` (vector, transparent, infinitely-looping where animated) that Software Engineering can drop directly into the homepage, Manufacturing Cloud, Build Board, or any other Forge surface without modification.

## What this is NOT
This phase does not include 3D renders (truck environment layers, Nigeria billet/forged/CNC variants, human PPE renders, machinery renders) or seamless PBR material textures. Those require the Blender pipeline (`forge_foundry/`) and, for humans, real photography of African engineers/fabricators — not synthetic faces. See `Blender_Handoff_Naming.md` for how those future assets slot into this same library using the project's existing naming schema.

## Structure
```
ForgeStudio/
  Geometry/       — animated industrial network vectors (Ankara-as-infrastructure)
  Lighting/        — reusable light effects (welding, laser, LEDs, heat)
  Engineering/    — measurement/callout/verification overlay system
  Status/          — component lifecycle badges (one owner, one component)
  Exports/PNG/    — static raster export of every SVG (4x, transparent)
  Documentation/  — this file, tokens, naming handoff, full registry
```

## Asset index

### Geometry (loops forever, subtle — never flashy)
- **geo-ankara-weave** — grid of concentric-ring nodes pulsing in sequence. Represents the manufacturing network, not fabric decoration. Reuse: hero background, Build Board idle state, loading states.
- **geo-forged-lattice** — diagonal structural truss, slow traveling dash. Reuse: section dividers, panel backgrounds, Manufacturing Cloud shell.
- **geo-assembly-grid** — 8×8 node field with select nodes blinking gold (assigned components). Reuse: SME Portal, Build Board component map.
- **geo-routing-geometry** — orthogonal traces connecting nodes, animated flow. Reuse: Digital Twin, logistics/supply-chain views.
- **geo-verification-lines** — scanning line sweeping a stack of status bars. Reuse: verification/QA states across any portal.
- **geo-network-pulses** — radiating rings from a central node. Reuse: AI Manufacturing Assistant presence indicator, live-status badges.

### Lighting
- **lgt-welding-flash** — flickering hot-white/orange burst. Reuse: fabrication-in-progress states.
- **lgt-inspection-laser** — sweeping heat-orange scan line. Reuse: verification/QC moments.
- **lgt-status-leds** — 5-dot status row cycling all 5 accent tokens. Reuse: system status anywhere in the platform.
- **lgt-heat-glow** — soft pulsing radial glow. Reuse: highlight active/hot components.

### Engineering overlay
- **eng-ruler** — horizontal tick ruler with mm labels.
- **eng-dimension-arrow** — dimension line + arrowheads + measurement label.
- **eng-callout-box** — leader line + part-identifier box (monospace).
- **eng-crosshair** — rotating alignment reticle with static corner brackets.
- **eng-serial-plate** — steel nameplate: component, owner, verification status.
- **eng-coordinate-system** — XYZ axis gizmo, one accent color per axis.

Reuse across every portal wherever a component, screen region, or data point needs to read as *engineered and verified* rather than decorated.

### Status & Ownership (component lifecycle — cross-portal)
- **sta-unassigned / sta-assigned / sta-in-fabrication / sta-verification / sta-verified / sta-deployed** — the 6 states of the NAWEDOAM "one component, one owner" workflow. Only IN_FABRICATION and VERIFICATION animate (active work); everything else is a static, stable badge. Reuse identically across Build Board, SME Portal, Government Portal, Investor Portal — never build a page-specific status badge.

## Full registry
Every asset (ID, category, usage, animation behaviour, SVG/PNG paths, naming convention, engineering documentation) is catalogued in `Asset_Registry.md` / `Asset_Registry.json`. That file is the single source of truth — update it whenever an asset is added or changed.

## Integration notes for Software Engineering
- All files are plain `<svg>` — inline them directly (best for recoloring via `currentColor`/token swap later) or reference by `src`.
- Colors are currently hardcoded to the hex values in `Forge_Design_Tokens.md`. Recommend swapping to CSS custom properties (`--forge-gold` etc.) at integration time so the whole library stays bindable to one token source.
- Animations are CSS `@keyframes` scoped per file — safe to inline multiple copies on one page without collision (class names are locally scoped per instance via unique node index).
- Nothing here is a one-off: every asset is parameterized by the same 7 tokens and is safe to reuse verbatim across Homepage, Manufacturing Cloud, Build Board, SME Portal, University Portal, Government Portal, Investor Portal, Marketplace, Digital Twin, and the AI Manufacturing Assistant.

## Future reuse recommendations
- Extend `geo-assembly-grid` with real component/SME data for the live Build Board (swap the hardcoded `assigned` node list for a data-driven array).
- Extend `geo-routing-geometry` for the Digital Twin's live logistics view.
- Once real photography of engineers/fabricators exists, composite it using `eng-callout-box`/`eng-serial-plate` for identity + role captions — never synthetic faces.
