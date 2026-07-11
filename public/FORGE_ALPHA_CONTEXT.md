# FORGE ALPHA 1.0 --- CODEX HANDOVER

**Status:** Authoritative product, design, and engineering handover\
**Project:** Forge-A-Truck-Thon / Forge Alpha 1.0\
**Repository:** `forgeatruck-ux/fatt-app`\
**Current focus:** Sprint 2 --- Forge Manufacturing Command Center /
Nigeria Digital Manufacturing Twin\
**Updated:** July 2026

## 1. Read this first

This document is the authoritative context for continuing Forge Alpha
1.0. Inspect the repository before changing code. Read this file
completely. Preserve working sections, routes, Supabase integration, and
the existing Forge identity. Do not rebuild the application from
scratch. Do not resurrect old placeholder-map implementations. Run build
validation after coherent changes.

The project has previously suffered from duplicate imports, incomplete
JSX fragments, malformed pasted files, placeholder SVG geometry, and
environment issues. Work against the actual repository state.

## 2. Product north star

Forge-A-Truck-Thon is not merely a vehicle website or a hackathon. Forge
is a coordination platform for distributed African manufacturing.

It connects Nigerian SMEs, fabricators, machine shops, welders,
engineers, polytechnics, universities, NYSC technical corps members,
diaspora engineers, investors, government institutions, and industrial
partners into a coordinated manufacturing network capable of designing,
fabricating, assembling, and commercialising vehicles and industrial
products.

The central thesis is:

> Nigeria already has many of the people, workshops, machines, skills,
> and institutions required to manufacture. The missing layer is
> coordination.

Forge is intended to become that coordination layer.

> **Nigeria builds together.**

> **Nigeria already has the pieces. Forge is connecting them.**

## 3. Emotional standard

Do not design Forge like a generic startup landing page. Avoid
decorative gradients, random floating cards, stock startup imagery, and
empty "future of Africa" language.

The intended emotional response is:

> **This makes me believe Africa can build.**

The experience should feel engineered, tactile, deliberate, industrial,
premium, and mission-critical. Reference qualities include premium
product launches, mission control, manufacturing intelligence, precision
machinery, and advanced engineering visualization. Do not literally
clone another company.

## 4. Forge design language

The interface should feel like controls on a machine: deliberate,
tactile, unmistakable, high-contrast, engineered, and information-dense
only when useful.

Core palette:

-   Near black: `#060606`
-   Deep glass/ocean: `#08131A`
-   Forge gold: `#D4AF37`
-   Emerald activity: `#00D26A`
-   Alert/heat: `#F7931A`
-   Information cyan: `#41E2FF`

Gold is a precision accent/material, not a blanket background.

Nothing moves randomly. Hub pulse means a manufacturing node is alive.
Flowing particles mean component, knowledge, or production movement.
Line activation means supply-chain relationship. Count-up reveals
network scale. Map reveal means a national manufacturing system is
coming online.

## 5. NAWEDOAM

NAWEDOAM is a core Forge vehicle project and proof point for the
distributed-manufacturing thesis. It is a dual-energy
street-food/utility minitruck concept developed around local
manufacturing participation.

Relevant direction includes Nigerian SME fabrication, modular OEM-style
thinking, tubular/ladder-hybrid chassis exploration, 15-inch wheels,
1.0L petrol engine direction, a 1000 kg target payload discussed in the
project, and future gas/EV/dual-use optimization.

The story is not that Forge merely sells a finished truck. The truck is
a coordination object around which a manufacturing network learns to
build together.

The NAWEDOAM 3D work established a project principle:

> Forge creates original project assets instead of relying entirely on
> generic stock assets.

The Nigeria Manufacturing Command Center follows the same principle.

## 6. Distributed manufacturing model

Forge draws strategic inspiration from coordinated supplier networks and
keiretsu-style industrial collaboration. It is not a literal copy of
Japanese keiretsu.

The Nigerian adaptation is based on standardized designs, distributed
component ownership, verified production partners, common engineering
specifications, shared build boards, capability discovery, production
coordination, engineering review, traceable component status,
institutional participation, and local industrial escalation.

## 7. Current application context

The repository is a Vite + React application. Known technologies include
React, Vite, React Router, Framer Motion, Supabase, and possibly GSAP in
dependencies or experiments.

A previous `esbuild` failure was repaired by cleaning dependencies and
reinstalling. The known working environment was Node.js `v22.23.1`, npm
`10.9.8`, and Vite `v5.4.21`. Do not unnecessarily change the toolchain
during Sprint 2.

Known routes include `/` for Showcase, `/board` for Build Board, and
`/join` for Join.

Known files include `src/pages/Showcase.jsx`, `src/pages/Board.jsx`,
`src/pages/Join.jsx`, `src/lib/assets.js`, and `src/lib/supabase.js`.
Inspect the repository to confirm current reality.

## 8. Current Showcase direction

The Showcase has been modularized or partially modularized. Known
working or recently implemented components include Hero components,
`WhyForge.jsx`, `ImpactStats.jsx`, `HowItWorks.jsx`, and Nigeria
manufacturing components.

Known folders have included `src/components/hero`, `keiretsu`,
`manufacturing`, `showcase`, `ui`, `mission`, `timeline`, and `stats`.

Do not assume every historical file remains authoritative. Inspect
`Showcase.jsx`. A previous duplicate `NigeriaMap` import caused a
Vite/Babel error. Avoid duplicate imports.

## 9. Sprint 2 flagship

The flagship is the **FORGE MANUFACTURING COMMAND CENTER**, also
described internally as the Nigeria Digital Manufacturing Twin, Forge
Manufacturing Intelligence Network, or Forge Constellation.

It is not a map with dots. It is the visual explanation of Forge's
industrial thesis.

The visitor should understand:

> **Forge connects manufacturing communities into one coordinated
> production network.**

## 10. Command Center experience

The intended sequence is:

1.  The page transitions into a darker command-center environment.
2.  A custom Forge-designed Nigeria asset appears.
3.  The forged Nigeria plate reveals with restrained cinematic motion.
4.  Manufacturing hubs activate one by one.
5.  Network paths connect the hubs.
6.  Energy/production particles begin flowing.
7.  Network statistics count into view.
8.  Hovering, focusing, or selecting a hub reveals manufacturing
    intelligence.
9.  Effurun/Warri is identified as a critical Forge Alpha fabrication
    hub.
10. The system feels alive because production is coordinated, not
    because decorative animation is playing.

> **Forge is not building one truck. Forge is building the network that
> can build trucks.**

## 11. Blender-built Nigeria digital twin

A custom Nigeria asset has been created locally in Blender using the
same original-asset philosophy as NAWEDOAM.

The design is a precision-machined Nigeria plate: stylized silhouette,
thin extruded body, machined/forged character, subtle bevel, Forge gold
perimeter edge, recessed hub/socket points, and product-render
presentation.

The plate should feel like a precision-machined industrial object cut
from a single billet rather than a school atlas.

Important caveat: the Blender silhouette is stylized and may not be
GIS-perfect. Hub placement must not be casually guessed from earlier
percentage coordinates. The web implementation must calibrate hub
positions against the actual rendered plate coordinate plane.

## 12. Nigeria asset pipeline

Expected assets:

``` text
src/assets/nigeria/
├── hero_render_3quarter.png
├── hero_render_top_orthographic.png
├── nigeria_ao_map.png
├── nigeria_manufacturing_centerpiece.glb
├── nigeria_normal_map.png
├── nigeria_outline.svg
└── transparent_overlay_top.png
```

Codex must verify which files actually exist. Do not invent missing
assets or silently replace them with placeholders.

`hero_render_3quarter.png` is the premium three-quarter product render.

`hero_render_top_orthographic.png` is the preferred coordinate master
for the initial 2.5D implementation.

`transparent_overlay_top.png` is useful for layering the plate in a
responsive command-center coordinate system.

`nigeria_outline.svg` may support clipping, outline glow, masks, or hit
areas after its quality is inspected.

`nigeria_ao_map.png` and `nigeria_normal_map.png` are reserved for
advanced material compositing or WebGL.

`nigeria_manufacturing_centerpiece.glb` is the 3D digital twin asset. Do
not immediately force Three.js into Sprint 2 merely because the GLB
exists.

Agreed sequence: Alpha 1.0 first receives a stable premium 2.5D
command-center experience. A later phase may use the GLB for controlled
camera drift, plate tilt, emissive hub sockets, and 3D energy paths.

## 13. Manufacturing hubs

The strategic hub set is:

1.  Lagos
2.  Ilorin
3.  Abuja
4.  Kaduna
5.  Kano
6.  Benin City
7.  Effurun / Warri
8.  Port Harcourt
9.  Aba
10. Nnewi

Hub positions must be calibrated against the actual top orthographic
Forge plate. Particular care is required for Benin City, Effurun/Warri,
Port Harcourt, Aba, and Nnewi. Do not reuse old percentage coordinates
without verification.

## 14. Hub narratives

Lagos: mega manufacturing, logistics, commercial coordination,
engineering ecosystem.

Ilorin: technical education, fabrication, skills development.

Abuja: national coordination, policy, institutional engagement.

Kaduna: heavy industry, engineering, northern industrial capacity.

Kano: northern manufacturing and production ecosystem.

Benin City: engineering, machining, fabrication.

Effurun/Warri: **Forge Alpha Fabrication Hub**. Priority narrative
capabilities include heavy fabrication, industrial welding, energy
engineering, marine/oil-and-gas-adjacent fabrication, chassis, and
structural manufacturing.

Port Harcourt: energy, marine engineering, oil-and-gas industrial
capability.

Aba: dense SME production and manufacturing entrepreneurship.

Nnewi: automotive and industrial manufacturing capability.

These are product-storytelling classifications. Do not present invented
metrics as audited live national statistics.

## 15. Hub intelligence interaction

Hovering, focusing, or selecting a hub should reveal a premium
intelligence surface.

Example:

``` text
EFFURUN / WARRI
FORGE ALPHA FABRICATION HUB

NETWORK CAPABILITY
Heavy Fabrication
Industrial Welding
Energy Engineering
Marine Engineering

ACTIVE FORGE SYSTEMS
NAWEDOAM
Steel Chassis
Structural Frames

NETWORK STATUS
ACTIVE
```

If builder, SME, institution, or capacity numbers are seed/demo data,
make that status clear. Do not fabricate false precision. Long-term data
may connect to verified Supabase records.

## 16. Network layer

Network lines represent supply chains, component movement, engineering
collaboration, knowledge transfer, logistics, and shared production.

A conceptual storytelling graph previously explored:

-   Lagos → Ilorin
-   Ilorin → Abuja
-   Abuja → Kaduna
-   Kaduna → Kano
-   Lagos → Benin
-   Benin → Effurun/Warri
-   Effurun/Warri → Port Harcourt
-   Port Harcourt → Aba
-   Aba → Nnewi

This is a storytelling graph, not a literal road map. Animation should
use meaningful directional energy or particle flow. Avoid random glowing
spaghetti lines.

## 17. Command Center information architecture

**Scale intelligence** answers "How large is the network?" Potential
metrics include builders, SMEs, universities/institutions, and strategic
hubs. Count-up animation is appropriate. Mark seed/demo values
appropriately.

**Digital Nigeria** is the center. The forged Nigeria plate must remain
visually dominant. Nodes and energy paths live on the same coordinate
plane.

**Hub intelligence** answers "What can this place build?" The panel
updates from the active hub. On mobile it may become a bottom sheet or
stacked card.

## 18. Responsive and accessibility requirements

The Command Center must work on desktop, laptop, tablet, and mobile.
Mobile must not be a tiny desktop dashboard. Keep the plate central,
reduce/select labels, use tap instead of hover, move hub intelligence
into a bottom panel/card, compact the stats, and reduce effects when
needed.

Respect `prefers-reduced-motion`.

Interactive hubs must support keyboard focus, accessible labels, visible
focus states, click/tap behavior, and semantic interactive elements. The
map must remain understandable without animation.

## 19. Performance

Initial implementation preference: React, CSS, Framer Motion, custom
PNG/SVG assets, and one responsive coordinate plane.

Do not install a major 3D stack merely because a GLB exists. Before
React Three Fiber/Three.js, inspect bundle/dependencies, confirm GLB
optimization, define the 3D interaction benefit, consider lazy loading,
and protect mobile performance.

## 20. Historical map components

Files may include `NigeriaMap.jsx`, `NigeriaMap.css`, `NigeriaSVG.jsx`,
`NetworkNode.jsx`, `NetworkTooltip.jsx`, `NetworkLines.jsx`, and
`nigeriaData.js`.

The earlier architecture proved that React rendering, labels, Framer
Motion, and network lines work. However, it used a rough/placeholder SVG
and percentage-based placement. Inspect these files. Reuse good logic
where appropriate. Do not preserve bad geometry merely to avoid
refactoring, and do not delete files blindly before checking imports.

## 21. Immediate Sprint 2 objective

Implement the first production-quality 2.5D Forge Manufacturing Command
Center using the existing Blender-generated Nigeria assets.

Target:

-   custom forged Nigeria plate visible
-   responsive top-view coordinate plane
-   calibrated manufacturing hubs
-   Effurun/Warri correctly positioned relative to the custom plate
-   animated hub activation
-   meaningful network connections
-   directional energy/particle flow
-   active hub intelligence panel
-   network stats panel
-   premium Forge command-center styling
-   mobile behavior
-   reduced-motion support
-   no placeholder red block
-   no rough polygon map
-   no duplicate NigeriaMap imports
-   no broken JSX
-   successful production build

The custom plate is the centerpiece.

## 22. Recommended implementation approach

Inspect the repository first. A likely focused architecture may
resemble:

``` text
src/components/manufacturing/
├── NigeriaMap.jsx
├── NigeriaMap.css
├── MapCanvas.jsx
├── NetworkLayer.jsx
├── NetworkNode.jsx
├── NetworkLines.jsx
├── ParticleFlow.jsx
├── HubPanel.jsx
├── StatsPanel.jsx
└── nigeriaData.js
```

This is guidance, not architecture theatre. Create only files that
clarify responsibility.

A hub data model should be capable of supporting `id`, `name`,
`shortName`, `region`, `x`, `y`, `type`, `status`, `specialty`,
`capabilities[]`, `projects[]`, `builders`, `smes`, `institutions`, and
`featured`.

Coordinates should be normalized against the actual plate coordinate
plane.

## 23. Coordinate calibration rule

This is critical.

The earlier implementation failed because nodes were positioned against
an abstract container rather than the actual visible map silhouette.

The new implementation must inspect `hero_render_top_orthographic.png`
and/or `transparent_overlay_top.png`, determine the visible plate bounds
inside the image, use one responsive aspect-ratio container, render the
plate without independent cropping, render network SVG and nodes inside
the same coordinate system, calibrate each city visually, and verify
Benin, Effurun/Warri, Port Harcourt, Aba, and Nnewi carefully.

Do not fix city placement with random CSS nudges across multiple files.
Coordinate data is the source of truth.

## 24. Visual detail direction

The environment may include a near-black background, faint radial
industrial glow, subtle grid, restrained glass panels, gold plate edge,
emerald active hubs, cyan informational details, subtle vignette, fine
technical labels, and status indicators.

Avoid excessive neon, cyberpunk cliché, giant glowing blobs, game-HUD
clutter, random scanlines, unreadable microtext, and overused
glassmorphism.

The plate must still feel like a real Forge-designed object.

## 25. Future phase --- true 3D digital twin

After the stable 2.5D Command Center is approved, evaluate
`nigeria_manufacturing_centerpiece.glb`.

Potential future experience: controlled camera drift, slight plate tilt,
subtle pointer parallax, emissive 3D hub sockets, 3D energy paths,
selective zoom, and digital-factory hub views.

A future hub page may contain Overview, Engineering Partners, SMEs,
Universities/Polytechnics, Forge Projects, Manufacturing Capacity,
Gallery, Current Production, and Contact/Join Hub.

Do not implement the whole future phase during the immediate Sprint 2
task unless explicitly requested.

## 26. Working rules for Codex

-   Inspect before editing.
-   Preserve working product sections.
-   Use existing assets.
-   Do not create fake asset paths.
-   Do not replace the app with a template.
-   Do not remove Supabase integration casually.
-   Do not alter routes without need.
-   Do not introduce duplicate imports.
-   Do not leave placeholder text.
-   Do not finish with partial JSX fragments.
-   Make coherent multi-file changes.
-   Run build validation.
-   Report files changed.
-   Report assumptions.
-   Report missing assets.
-   Keep the visual standard aligned with Forge.
-   Treat Effurun/Warri as a strategic Forge Alpha fabrication hub.
-   Treat the map as product storytelling, not decoration.

## 27. Validation checklist

-   [ ] Repository inspected
-   [ ] Existing Showcase structure understood
-   [ ] Nigeria asset folder verified
-   [ ] Custom plate asset rendered
-   [ ] Plate is responsive
-   [ ] Node layer shares the plate coordinate plane
-   [ ] Lagos placement visually credible
-   [ ] Benin City placement visually credible
-   [ ] Effurun/Warri placement visually credible
-   [ ] Port Harcourt placement visually credible
-   [ ] Aba placement visually credible
-   [ ] Nnewi placement visually credible
-   [ ] Northern hubs visually credible
-   [ ] Intended network graph rendered
-   [ ] Directional particle/energy motion has meaning
-   [ ] Hub activation is visible
-   [ ] Hub panel updates
-   [ ] Effurun/Warri has featured treatment
-   [ ] Stats panel exists
-   [ ] Seed metrics are not misrepresented as verified live data
-   [ ] Keyboard interaction works
-   [ ] Tap interaction works
-   [ ] Reduced motion supported
-   [ ] Mobile layout checked
-   [ ] No console-breaking errors
-   [ ] `npm run build` succeeds
-   [ ] Existing Showcase sections still render

## 28. First Codex task

Use this exact instruction:

> Read `FORGE_ALPHA_CONTEXT.md` completely. Inspect the existing
> repository before making changes. Continue Sprint 2 from the current
> implementation state. Your immediate objective is to implement the
> first production-quality 2.5D Forge Manufacturing Command Center using
> the existing Blender-generated Nigeria digital twin assets in
> `src/assets/nigeria`. Preserve all working sections and routes. Do not
> rebuild the project from scratch. Calibrate manufacturing hub
> coordinates against the actual top orthographic plate asset, with
> particular care for Benin City, Effurun / Warri, Port Harcourt, Aba,
> and Nnewi. Use the custom forged Nigeria plate as the visual
> centerpiece. Implement meaningful network motion, hub intelligence,
> responsive behavior, accessibility, and reduced-motion support. Treat
> unverified counts as demo/seed data. Run `npm run build` before
> finishing. Report the files changed, implementation decisions,
> assumptions, and build result.

## 29. Leadership and workflow model

The user/founder continues working with ChatGPT as product and design
lead, systems architect, and engineering reviewer.

Codex is the repository execution engineer.

``` text
USER / FOUNDER
      │
      ▼
CHATGPT — PRODUCT + DESIGN + SYSTEMS LEAD
      │
      ├── defines experience
      ├── protects Forge vision
      ├── reviews screenshots/results
      ├── decides architecture direction
      ├── writes implementation briefs
      └── diagnoses product/design problems
      │
      ▼
CODEX — REPOSITORY EXECUTION ENGINEER
      │
      ├── inspects actual files
      ├── edits the repository
      ├── runs build checks
      ├── handles multi-file implementation
      └── reports changes and technical issues
      │
      ▼
RUNNING FORGE PRODUCT
```

Bring screenshots, Codex summaries, diffs, build errors, and visual
results back to ChatGPT for review. ChatGPT then issues the next clear
product/design/engineering directive.

Codex should not independently redefine the Forge product vision.

## 30. Final product principle

Forge should not merely claim that African manufacturing is possible.

The product should make the network visible.

The interface should make coordination tangible.

The vehicle should make the thesis physical.

The platform should make participation possible.

> **Nigeria already has the pieces. Forge is connecting them.**

That is the product.
