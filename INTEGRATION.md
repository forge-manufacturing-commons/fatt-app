# NMCP Integration — Forge Alpha Certified

## What's in this package
- src/os/NMCP.jsx + NMCP.css   -> runtime component (reads metadata.json, data-driven LED states)
- src/rooms/Rooms.jsx          -> NMCP wired as centerpiece of the National Manufacturing Grid room
- public/assets/NMCP/          -> the component's stable repo identity:
    metadata.json, docs/{specification,manufacturing,inspection,changelog}.md

## Two manual steps (Blender outputs are on your Desktop, not in this repo)
1. Copy from Desktop C:\Users\malco\Desktop\case\NMCP_export\NMCP.glb
   -> public/assets/NMCP/NMCP.glb
2. Copy your locked render Forge_v0.5_LOCK_NMCP_signature.png
   -> public/assets/NMCP/renders/signature.png
   (The component shows an honest "render socket" fallback until this file exists —
    no code change needed; it appears automatically once copied.)

## Status
NMCP-0001 · Rev A.02 · Forge Alpha Certified · Production Asset
Frozen. Further work only if functional requirements change.
