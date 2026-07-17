// ============================================================
// FORGE OS — NMCP PLATE VIEWER
// Desktop/Tablet: interactive Blender GLB (orbit/inspect/zoom).
// Mobile: a dedicated cinematic Blender hero render — same industrial
//   identity, no interaction, no scroll-trap. Optional button launches
//   the full interactive viewer only when explicitly requested.
// Presence is kept on every platform; only interaction changes. (RO directive.)
// ============================================================
import { useEffect, useRef, useState } from "react";

const GLB_URL = "/assets/NMCP/NMCP.glb";
const MOBILE_RENDER = "/assets/NMCP/renders/mobile-hero.png";
const MV_SCRIPT = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";

let mvLoading = null;
function loadModelViewer() {
  if (window.customElements?.get("model-viewer")) return Promise.resolve(true);
  if (mvLoading) return mvLoading;
  mvLoading = new Promise((resolve) => {
    const s = document.createElement("script");
    s.type = "module"; s.src = MV_SCRIPT;
    s.onload = () => resolve(true); s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
  return mvLoading;
}

function isMobileView() {
  return typeof window !== "undefined" &&
    (window.matchMedia?.("(max-width: 820px)")?.matches ||
     ("ontouchstart" in window && window.innerWidth < 900));
}

export default function PlateViewer({ poster, onUnavailable }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState(isMobileView());
  const [forceInteractive, setForceInteractive] = useState(false);

  useEffect(() => {
    const onResize = () => setMobile(isMobileView());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const wantInteractive = !mobile || forceInteractive;

  useEffect(() => {
    if (!wantInteractive) return;
    let cancelled = false;
    fetch(GLB_URL, { method: "HEAD" })
      .then((r) => {
        if (cancelled) return;
        if (!r.ok) { onUnavailable?.(); return; }
        loadModelViewer().then((ok) => { if (!cancelled) ok ? setReady(true) : onUnavailable?.(); });
      })
      .catch(() => !cancelled && onUnavailable?.());
    return () => { cancelled = true; };
  }, [wantInteractive, onUnavailable]);

  // MOBILE (default): the cinematic render. Presence kept, no interaction, no scroll-trap.
  if (mobile && !forceInteractive) {
    return (
      <div className="nmcp-mobile-hero">
        <img src={MOBILE_RENDER} alt="NAWEDOAM Manufacturing Command Plate — machined steel instrument" draggable="false" />
        <button className="nmcp-mobile-launch" onClick={() => setForceInteractive(true)}>
          Open Interactive Manufacturing View
        </button>
      </div>
    );
  }

  if (!ready) return null;

  return (
    <model-viewer
      ref={ref} src={GLB_URL} poster={poster || MOBILE_RENDER}
      alt="NAWEDOAM Manufacturing Command Plate"
      camera-controls="" auto-rotate="" auto-rotate-delay="800"
      rotation-per-second="14deg" interaction-prompt="none"
      shadow-intensity="1.0" shadow-softness="0.75" exposure="0.9"
      environment-image="neutral" camera-orbit="28deg 62deg 3.4m"
      min-camera-orbit="auto 40deg auto" max-camera-orbit="auto 82deg auto"
      style={{ width: "100%", height: "100%", background: "transparent", "--poster-color": "transparent", outline: "none" }}
    />
  );
}
