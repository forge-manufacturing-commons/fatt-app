// ============================================================
// FORGE OS — ENGINEERING LIBRARY  (directive Phase 5)
//
// "Laser rulers, datum marks, coordinate systems, inspection stamps,
//  tolerance blocks, assembly arrows, blueprint overlays, CAD overlays.
//  Use them as reusable runtime components."
//
// All 24 Engineering assets, addressable. These are the grammar a
// room uses to say "this is measured", not decoration.
// ============================================================

import { motion } from "./MotionSystem.js";

const E = "/forge-studio/lib/Engineering";

export const ENGINEERING = {
  arrowSystem:        `${E}/eng-arrow-system.svg`,
  assemblySequence:   `${E}/eng-assembly-sequence.svg`,
  blueprintOverlay:   `${E}/eng-blueprint-overlay.svg`,
  cadProjection:      `${E}/eng-cad-projection.svg`,
  calloutBox:         `${E}/eng-callout-box.svg`,
  coordinateGrid:     `${E}/eng-coordinate-grid.svg`,
  coordinateSystem:   `${E}/eng-coordinate-system.svg`,
  crosshair:          `${E}/eng-crosshair.svg`,
  datumLine:          `${E}/eng-datum-line.svg`,
  digitalCaliper:     `${E}/eng-digital-caliper.svg`,
  dimensionAnnotation:`${E}/eng-dimension-annotation.svg`,
  dimensionArrow:     `${E}/eng-dimension-arrow.svg`,
  fixturePin:         `${E}/eng-fixture-pin.svg`,
  inspectionStamp:    `${E}/eng-inspection-stamp.svg`,
  laserRuler:         `${E}/eng-laser-ruler.svg`,
  measurementGrid:    `${E}/eng-measurement-grid.svg`,
  originMarker:       `${E}/eng-origin-marker.svg`,
  plateNumbering:     `${E}/eng-plate-numbering.svg`,
  ruler:              `${E}/eng-ruler.svg`,
  serialPlate:        `${E}/eng-serial-plate.svg`,
  steelTape:          `${E}/eng-steel-tape.svg`,
  toleranceBlock:     `${E}/eng-tolerance-block.svg`,
  verificationSeal:   `${E}/eng-verification-seal.svg`,
  weldGuide:          `${E}/eng-weld-guide.svg`,
};

function Overlay({ asset, className = "", motionName = null, style }) {
  const src = ENGINEERING[asset];
  if (!src) { console.error(`[FORGE OS] Engineering asset "${asset}" not in the library.`); return null; }
  return (
    <img src={src} alt="" aria-hidden="true" style={style}
         className={`forge-eng forge-eng--${asset} ${motionName ? motion(motionName) : ""} ${className}`} />
  );
}

export const LaserRuler      = p => <Overlay asset="laserRuler"       motionName="laserSweep" {...p} />;
export const Datum           = p => <Overlay asset="datumLine"        {...p} />;
export const CoordinateSystem= p => <Overlay asset="coordinateSystem" {...p} />;
export const Crosshair       = p => <Overlay asset="crosshair"        {...p} />;
export const InspectionStamp = p => <Overlay asset="inspectionStamp"  {...p} />;
export const ToleranceBlock  = p => <Overlay asset="toleranceBlock"   {...p} />;
export const AssemblyArrow   = p => <Overlay asset="arrowSystem"      {...p} />;
export const BlueprintOverlay= p => <Overlay asset="blueprintOverlay" motionName="blueprintReveal" {...p} />;
export const CADProjection   = p => <Overlay asset="cadProjection"    motionName="blueprintReveal" {...p} />;
export const VerificationSeal= p => <Overlay asset="verificationSeal" {...p} />;
export const MeasurementGrid = p => <Overlay asset="measurementGrid"  {...p} />;
export const PlateNumbering  = p => <Overlay asset="plateNumbering"   {...p} />;

// A camera's declared overlay grammar, mounted automatically by <Room>.
const BY_CAMERA_TOKEN = {
  grid:            MeasurementGrid,
  datum:           Datum,
  dimension:       p => <Overlay asset="dimensionAnnotation" {...p} />,
  cad:             CADProjection,
  scanline:        LaserRuler,
  tolerance:       ToleranceBlock,
  stamp:           InspectionStamp,
  crosshair:       Crosshair,
  callout:         p => <Overlay asset="calloutBox" {...p} />,
  "assembly-arrow":AssemblyArrow,
  registration:    p => <Overlay asset="originMarker" {...p} />,
};

export function CameraOverlays({ tokens = [] }) {
  return (
    <div className="forge-eng-layer" aria-hidden="true">
      {tokens.map(t => {
        const C = BY_CAMERA_TOKEN[t];
        return C ? <C key={t} className={`forge-eng-slot forge-eng-slot--${t}`} /> : null;
      })}
    </div>
  );
}

// Serial plate — how Forge OS labels any real thing.
export function SerialPlate({ component, owner, status = "VERIFIED" }) {
  return (
    <div className="forge-serial" data-component={component}>
      <img src={ENGINEERING.serialPlate} alt="" aria-hidden="true" className="forge-serial-bg" />
      <div className="forge-serial-txt">
        <span className="forge-technical">{component}</span>
        <span className="forge-serial-owner">{owner}</span>
        <span className="forge-serial-status">{status}</span>
      </div>
    </div>
  );
}
