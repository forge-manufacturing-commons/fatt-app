import { useReducedMotion } from "framer-motion";

// ============================================================
// FACTORY ATMOSPHERE
// A restrained ambient layer that suggests distant industrial life
// behind the Forge interface. Not a video game, not cyberpunk, not
// a particle demo. The reading the visitor should almost subconsciously
// have: "people are working somewhere beyond this interface".
//
// Composition (all CSS, small DOM primitives):
//   1. Slow atmospheric haze pan across the section
//   2. Two distant weld stations that fire cold blue-white bloom
//      events at irregular intervals with long quiet gaps
//   3. One occasional warm fabrication glow that swells and fades
//   4. A small set of asynchronously blinking machine status lights
//   5. A subtle depth-parallax industrial shadow slowly drifting
//
// Discipline:
//   • Every event has a long CSS `animation-delay` gap so activity is
//     rare, not continuous.
//   • No two effects share a rhythm.
//   • Reduced motion collapses to a static, atmospheric composition:
//     haze + shadow + lights remain, no bloom, no flashes, no drift.
//   • aria-hidden, pointer-events: none — decorative, accessibility-safe.
//   • Palette drawn from the Forge tokens already defined on .hero-os.
// ============================================================
export default function FactoryAtmosphere() {
  const reduce = useReducedMotion();
  return (
    <div className={"forge-atmo" + (reduce ? " atmo-still" : "")} aria-hidden="true">
      <div className="atmo-haze" />
      <div className="atmo-shadow" />

      {/* Two distant weld stations. Irregular intervals, quiet gaps. */}
      <div className="atmo-weld atmo-weld-a">
        <span className="atmo-weld-bloom" />
        <span className="atmo-weld-core" />
      </div>
      <div className="atmo-weld atmo-weld-b">
        <span className="atmo-weld-bloom" />
        <span className="atmo-weld-core" />
      </div>

      {/* Occasional warm fabrication glow (foundry ambience). */}
      <div className="atmo-forge-glow" />

      {/* Asynchronous machine status lights along the far edge. */}
      <div className="atmo-status atmo-status-1" />
      <div className="atmo-status atmo-status-2" />
      <div className="atmo-status atmo-status-3" />
      <div className="atmo-status atmo-status-4" />
      <div className="atmo-status atmo-status-5" />
    </div>
  );
}
