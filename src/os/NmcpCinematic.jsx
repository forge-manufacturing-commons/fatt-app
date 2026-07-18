// ============================================================
// FORGE — NMCP CINEMATIC
// The machined command plate as a continuous cinematic loop:
//   REVEAL (close on the gold chamfer) -> ROTATE (specular travels
//   across the brushed steel) -> SETTLE (straight hero) -> loop.
// Rendered in Blender, encoded to mp4/webm. Not interactive: the object
// breathes on its own. pointer-events:none so page scroll is never trapped.
// Honours prefers-reduced-motion by showing the settle frame only.
// ============================================================
import { useEffect, useRef, useState } from "react";
import "./NmcpCinematic.css";

const MP4    = "/assets/NMCP/cinematic/nmcp.mp4";
const WEBM   = "/assets/NMCP/cinematic/nmcp.webm";
const POSTER = "/assets/NMCP/cinematic/poster.webp";

export default function NmcpCinematic() {
  const vref = useRef(null);
  const [reduced, setReduced] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    setReduced(!!mq?.matches);
    const onChange = (e) => setReduced(e.matches);
    mq?.addEventListener?.("change", onChange);
    return () => mq?.removeEventListener?.("change", onChange);
  }, []);

  // some browsers block autoplay until a gesture — retry quietly, never block the page
  useEffect(() => {
    const v = vref.current;
    if (!v || reduced) return;
    const tryPlay = () => v.play?.().catch(() => {});
    tryPlay();
    const onVis = () => { if (!document.hidden) tryPlay(); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [reduced]);

  if (reduced || failed) {
    return (
      <div className="nmcp-cine">
        <img className="nmcp-cine-still" src={POSTER} alt="NAWEDOAM Manufacturing Command Plate" draggable="false" />
      </div>
    );
  }

  return (
    <div className="nmcp-cine">
      <video
        ref={vref}
        className="nmcp-cine-video"
        poster={POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        onError={() => setFailed(true)}
        aria-label="NAWEDOAM Manufacturing Command Plate — cinematic inspection loop"
      >
        <source src={WEBM} type="video/webm" />
        <source src={MP4} type="video/mp4" />
      </video>
    </div>
  );
}
