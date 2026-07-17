// ============================================================
// FORGE INSPECTION SYSTEM — NMCP
// The plate is not a toy you spin. It is a precision instrument you
// INSPECT through authored Blender cameras. No orbit. No WebGL to break.
// Each view is a guaranteed-perfect Blender render; clicking/swiping moves
// the camera (crossfade). Works identically on desktop, tablet, mobile.
// The Blender camera system IS the interface. (RO direction.)
// ============================================================
import { useEffect, useState, useCallback } from "react";
import "./InspectionViewer.css";

const MANIFEST_URL = "/assets/NMCP/inspection/manifest.json";

export default function InspectionViewer() {
  const [views, setViews] = useState([]);
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState({});

  useEffect(() => {
    fetch(MANIFEST_URL).then(r => r.ok ? r.json() : null).then(d => {
      if (d?.views?.length) {
        setViews(d.views);
        d.views.forEach((v, i) => {
          const img = new Image();
          img.onload = () => setLoaded(p => ({ ...p, [i]: true }));
          img.src = v.image;
        });
      }
    }).catch(() => {});
  }, []);

  const go = useCallback((i) => {
    if (!views.length) return;
    setActive(((i % views.length) + views.length) % views.length);
  }, [views.length]);

  // swipe (mobile) + arrow keys (desktop)
  useEffect(() => {
    let x0 = null;
    const ts = (e) => { x0 = e.touches[0].clientX; };
    const te = (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
      x0 = null;
    };
    const kd = (e) => {
      if (e.key === "ArrowRight") go(active + 1);
      if (e.key === "ArrowLeft") go(active - 1);
    };
    window.addEventListener("keydown", kd);
    const el = document.querySelector(".nmcp-inspect-stage");
    el?.addEventListener("touchstart", ts, { passive: true });
    el?.addEventListener("touchend", te, { passive: true });
    return () => {
      window.removeEventListener("keydown", kd);
      el?.removeEventListener("touchstart", ts);
      el?.removeEventListener("touchend", te);
    };
  }, [active, go]);

  if (!views.length) {
    return <div className="nmcp-inspect-loading forge-system">[ LOADING INSPECTION SYSTEM ]</div>;
  }

  const cur = views[active];

  return (
    <div className="nmcp-inspect">
      <div className="nmcp-inspect-stage">
        {/* crossfade stack — all authored views, opacity-switched */}
        {views.map((v, i) => (
          <img
            key={v.id}
            src={v.image}
            alt={v.label}
            className={`nmcp-inspect-frame ${i === active ? "is-active" : ""}`}
            draggable="false"
          />
        ))}

        {/* HUD — reads like an engineering inspection module */}
        <div className="nmcp-inspect-hud">
          <span className="nmcp-inspect-cam forge-system">CAM_{String(active + 1).padStart(3, "0")}</span>
          <span className="nmcp-inspect-label">{cur.label}</span>
          <span className="nmcp-inspect-desc forge-technical">{cur.description}</span>
        </div>

        {/* prev / next */}
        <button className="nmcp-inspect-nav prev" onClick={() => go(active - 1)} aria-label="Previous view">‹</button>
        <button className="nmcp-inspect-nav next" onClick={() => go(active + 1)} aria-label="Next view">›</button>
      </div>

      {/* camera bookmark rail — the authored Blender cameras as an inspection index */}
      <div className="nmcp-inspect-rail">
        {views.map((v, i) => (
          <button
            key={v.id}
            className={`nmcp-inspect-bookmark ${i === active ? "is-active" : ""}`}
            onClick={() => go(i)}
          >
            <span className="bm-num forge-system">{String(i + 1).padStart(2, "0")}</span>
            <span className="bm-label">{v.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
