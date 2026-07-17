// ============================================================
// FORGE — NMCP CINEMATIC DISPLAY
// A slow cinematic loop of the machined command plate — real Blender
// motion (parallax, specular travel across brushed steel), played as a
// preloaded frame sequence. Not interactive: the object breathes on its
// own, like an Apple / Tesla product hero. No orbit, no scroll-trap.
// ============================================================
import { useEffect, useRef, useState } from "react";
import "./NmcpCinematic.css";

const MANIFEST = "/assets/NMCP/cinematic/cinematic.json";

export default function NmcpCinematic() {
  const [frames, setFrames] = useState([]);
  const [ready, setReady] = useState(false);
  const [idx, setIdx] = useState(0);
  const raf = useRef(null);
  const last = useRef(0);
  const fps = useRef(14);

  useEffect(() => {
    fetch(MANIFEST).then(r => r.ok ? r.json() : null).then(d => {
      if (!d?.frames?.length) return;
      fps.current = d.fps || 14;
      // preload all frames before playing (no flicker)
      let loaded = 0;
      d.frames.forEach(src => {
        const img = new Image();
        img.onload = () => { if (++loaded === d.frames.length) setReady(true); };
        img.src = src;
      });
      setFrames(d.frames);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!ready || !frames.length) return;
    const interval = 1000 / fps.current;
    const tick = (t) => {
      if (t - last.current >= interval) {
        setIdx(i => (i + 1) % frames.length);
        last.current = t;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [ready, frames.length]);

  if (!frames.length) {
    return <div className="nmcp-cine-load forge-system">[ LOADING COMMAND PLATE ]</div>;
  }

  return (
    <div className="nmcp-cine">
      {/* stacked frames, only current visible — preloaded, no flicker */}
      {frames.map((src, i) => (
        <img key={i} src={src} alt="" className={`nmcp-cine-frame ${i === idx ? "on" : ""}`} draggable="false" />
      ))}
      {!ready && <div className="nmcp-cine-load forge-system">[ LOADING ]</div>}
    </div>
  );
}
