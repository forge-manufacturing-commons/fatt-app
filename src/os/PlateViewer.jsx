// ============================================================
// FORGE OS — NMCP 3D PLATE VIEWER
// The NAWEDOAM Manufacturing Command Plate as a rotatable 3D model.
// Same pattern as the truck viewer: <model-viewer>, one CDN script.
// Fallback: GLB present -> 3D; absent -> signature render; both absent -> socket.
// ============================================================
import { useEffect, useRef, useState } from "react";

const GLB_URL = "/assets/NMCP/NMCP.glb";
const MV_SCRIPT = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";

let mvLoading = null;
function loadModelViewer() {
  if (window.customElements?.get("model-viewer")) return Promise.resolve(true);
  if (mvLoading) return mvLoading;
  mvLoading = new Promise((resolve) => {
    const s = document.createElement("script");
    s.type = "module"; s.src = MV_SCRIPT;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
  return mvLoading;
}

export default function PlateViewer({ poster, onUnavailable }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(GLB_URL, { method: "HEAD" })
      .then((r) => {
        if (cancelled) return;
        if (!r.ok) { onUnavailable?.(); return; }
        loadModelViewer().then((ok) => {
          if (cancelled) return;
          ok ? setReady(true) : onUnavailable?.();
        });
      })
      .catch(() => !cancelled && onUnavailable?.());
    return () => { cancelled = true; };
  }, [onUnavailable]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !ready) return;
    const onErr = () => onUnavailable?.();
    el.addEventListener("error", onErr);
    return () => el.removeEventListener("error", onErr);
  }, [ready, onUnavailable]);

  if (!ready) return null;

  return (
    <model-viewer
      ref={ref}
      src={GLB_URL}
      poster={poster}
      alt="NAWEDOAM Manufacturing Command Plate — machined steel, 18 hubs"
      camera-controls=""
      auto-rotate=""
      auto-rotate-delay="800"
      rotation-per-second="14deg"
      interaction-prompt="none"
      shadow-intensity="1.0"
      shadow-softness="0.75"
      exposure="0.9"
      environment-image="neutral"
      camera-orbit="28deg 62deg 3.4m"
      min-camera-orbit="auto 40deg auto"
      max-camera-orbit="auto 82deg auto"
      style={{ width: "100%", height: "100%", background: "transparent", "--poster-color": "transparent", outline: "none" }}
    />
  );
}
