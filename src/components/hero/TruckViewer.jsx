// ============================================================
// FORGE — LIVE 3D TRUCK VIEWER
//
// Loads the body-locked NAWEDOAM truck GLB as a rotatable 3D model.
// Uses <model-viewer> (Google) — no heavy 3D dependency, one CDN script.
//
// HONEST FALLBACK: if the GLB is missing or fails, it shows the same
// static hero image the site used before, so the hero never breaks.
// The GLB it expects: /models/nawedoam.glb  (the body-locked export,
// donor retired — the clean single-body vehicle).
// ============================================================

import { useEffect, useRef, useState } from "react";

const GLB_URL = "/models/nawedoam.glb";
const FALLBACK_IMG = "/renders/02-front-quarter.jpg";
const MV_SCRIPT = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";

let mvLoading = null;
function loadModelViewer() {
  if (window.customElements?.get("model-viewer")) return Promise.resolve(true);
  if (mvLoading) return mvLoading;
  mvLoading = new Promise((resolve) => {
    const s = document.createElement("script");
    s.type = "module";
    s.src = MV_SCRIPT;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
  return mvLoading;
}

export default function TruckViewer({ poster = FALLBACK_IMG, autoRotate = true }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // 1. is the GLB actually present? (HEAD request — no download if missing)
    fetch(GLB_URL, { method: "HEAD" })
      .then((r) => {
        if (cancelled) return;
        if (!r.ok) { setFailed(true); return; }
        // 2. load the web component
        loadModelViewer().then((ok) => {
          if (cancelled) return;
          ok ? setReady(true) : setFailed(true);
        });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => { cancelled = true; };
  }, []);

  // model-viewer load error → fall back to image
  useEffect(() => {
    const el = ref.current;
    if (!el || !ready) return;
    const onErr = () => setFailed(true);
    el.addEventListener("error", onErr);
    return () => el.removeEventListener("error", onErr);
  }, [ready]);

  if (failed || !ready) {
    // honest fallback: the static hero image (what the site showed before)
    return <img src={poster} alt="NAWEDOAM manufacturing vehicle" draggable="false" />;
  }

  return (
    <model-viewer
      ref={ref}
      src={GLB_URL}
      poster={poster}
      alt="NAWEDOAM — a Forge-manufactured compact commercial vehicle"
      camera-controls=""
      auto-rotate={autoRotate ? "" : undefined}
      auto-rotate-delay="600"
      rotation-per-second="18deg"
      interaction-prompt="none"
      shadow-intensity="0.9"
      shadow-softness="0.9"
      exposure="1.0"
      environment-image="neutral"
      camera-orbit="35deg 78deg 6.5m"
      min-camera-orbit="auto 60deg auto"
      max-camera-orbit="auto 95deg auto"
      style={{
        width: "100%",
        height: "100%",
        "--poster-color": "transparent",
        background: "transparent",
        outline: "none",
      }}
    />
  );
}
