// ============================================================
// FORGE OS — MOTION SYSTEM
//
// Motion_Vocabulary.md ships 16 canonical transitions.
// Known_Issues.md: the SVGs ship STATIC — the save pipeline strips
// all in-file animation. Motion is authored HERE, in the runtime.
//
// "Nothing simply appears. Everything assembles." (tokens.json)
// Do not invent a 17th motion. Reach for one of these.
// ============================================================

export const MOTION = {
  laserSweep:       "fs-mot-scan",
  weldFlash:        "fs-mot-weld",
  blueprintReveal:  "fs-mot-fade",
  machineBoot:      "fs-mot-boot",
  componentLock:    "fs-mot-snap",
  mechanicalSlide:  "fs-mot-slide",
  industrialFade:   "fs-mot-fade",
  factoryPulse:     "fs-mot-pulse",
  beaconBlink:      "fs-mot-pulse",
  inspectionScan:   "fs-mot-scan",
  conveyorMotion:   "fs-mot-conveyor",
  assemblySnap:     "fs-mot-snap",
  heatPulse:        "fs-mot-pulse",
  grindingSparks:   "fs-mot-weld",
  smokeDrift:       "fs-mot-fade",
  ankaraMovement:   "fs-mot-conveyor",
  powerTravel:      "fs-mot-power-travel",
};

export function motion(name) {
  const m = MOTION[name];
  if (!m) { console.error(`[FORGE OS] Motion "${name}" is not in the Motion Vocabulary (16 canonical). Do not invent motion.`); return ""; }
  return m;
}
