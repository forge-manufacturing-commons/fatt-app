# Forge Design Tokens
Source of truth for Forge Studio production assets. Extracted from the actual NAWEDOAM vehicle render (`reference/05-mural-side.jpg`, `reference/forge Logo.png`) — not invented. Same lightness/chroma family across accents, hue varies per the Forge Design System PDF ("Forge Gold, Steel White, Forge Cyan, Emerald, Heat Orange").

## Core tokens

| Token | Hex | Role |
|---|---|---|
| Forge Gold | #C89B4A | primary accent — ownership, verification, ankara warm motif |
| Forge Cyan | #4FC7D6 | signal accent — network, inspection, wheel/edge lighting |
| Forge Emerald | #2E8F72 | secondary accent — growth, SME/component-assigned state |
| Forge Heat Orange | #E1602E | hot accent — fabrication, welding, alerts, heat states |
| Forge Steel | #7C8085 | primary neutral — body metal, structure |
| Forge Steel Dark | #2B2E33 | deep neutral — panels, backgrounds, shadow steel |
| Forge Cream (Steel White) | #F2EEE6 | light neutral — labels, edge highlights, plate text |

## Usage rules
- Never introduce hues outside this set without updating this file first.
- Accents are for signal/status/ownership — not decoration. Each accent maps to a real system state (see Asset_Library_README).
- Neutrals (Steel / Steel Dark / Cream) carry ~90% of any composition; accents are used sparingly, one at a time per state.
- All accents share comparable lightness/chroma — do not darken or brighten one accent relative to the others when extending.

## Typography (per Forge Design System PDF)
"Architecture, not decoration." Use a single geometric/grotesk sans for UI + a monospace for engineering callouts, labels, serial plates, and coordinate/measurement text (see Engineering/ assets — all use monospace). No display/script fonts.
