# Arrival Dock background — bay render integrated

## Changed file
- src/styles/app.css  (the .hero-os background)

## What it does
The "00" Arrival Dock hero now shows the real Blender manufacturing-bay render
(/renders/bay/hero.png — the truck in the workshop) as a background layer,
BEHIND the live network lines, actors, and 3D truck viewer.

- opacity 0.34 + vignette mask + dark gradient overlay
  → the workshop reads as depth/environment without drowning the live animation
- all interactive layers forced to z-index 2 (above the backdrop)

## Deploy
git add -A && git commit -m "Integrate bay render as Arrival Dock background"
git push
# then hard-refresh (Ctrl+Shift+R)

## NOTE — still outstanding (needs Blender)
The 3D truck GLB is missing the NAWEDOAM badge + wheels (only ring light shows).
That requires re-exporting the GLB from Blender with those objects visible.
Restart Blender MCP server and it can be fixed + re-exported in ~2 min.
