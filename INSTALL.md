# Live 3D Truck Viewer — install

## Files in this package
- src/components/hero/TruckViewer.jsx   (new — the 3D viewer component)
- src/components/hero/HeroSection.jsx   (modified — one line: <img> swapped for <TruckViewer>)

## The ONE manual step you must do — place the GLB
Create the folder and copy the body-locked truck GLB into it, RENAMED:

    Desktop\case\NAWEDOAM_TRUCK_bodylocked.glb   →   public/models/nawedoam.glb

- Folder: public/models/  (create it if it doesn't exist)
- Name MUST be exactly: nawedoam.glb   (the code looks for /models/nawedoam.glb)

That's it. No npm install. No new dependency. model-viewer loads from a CDN script.

## What happens
- GLB present  → hero shows the live 3D truck: drag to rotate, auto-spins gently.
- GLB absent   → hero shows the static image /renders/02-front-quarter.jpg (never breaks).

So you can deploy this NOW; it just shows the image until the GLB is in place,
then becomes 3D the moment the file exists. No code change needed to switch over.

## Nothing else changed
The hero typography, activity band, subsystem (tzone) indicators, layout,
and every other section are untouched. Only the truck image became a 3D viewer.
