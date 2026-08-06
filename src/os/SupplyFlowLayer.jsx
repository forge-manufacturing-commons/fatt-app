// ============================================================
// FORGE — SUPPLY-CHAIN FLOW ANIMATION
// The signature visual. A component token travels the manufacturing
// network, transformed at each cell, leaving as a finished export.
// Motion communicates the Forge concept: distributed manufacture,
// one component per cell, assembled into a vehicle.
//
// This is an overlay ON the intelligence surface — it reads the same
// hub positions the graph uses, so the flow traces the real network.
// Motion is informational, not decorative (per FOC motion spec).
// ============================================================
import { useEffect, useRef, useState } from "react";
import { SUPPLY_FLOWS } from "./ManufacturingGraph.js";
import { STUDIO_HUBS, projectHub } from "../lib/ForgeStudio.js";
import { NIGERIA_BBOX as BB } from "./nigeriaOutline.js";

const place = (id) => {
  const h = STUDIO_HUBS.find(x => x.id === id); if (!h) return null;
  const p = projectHub(h.lat, h.lon);
  return { x: BB.x0 + (p.x/100)*(BB.x1-BB.x0), y: BB.y0 + (p.y/100)*(BB.y1-BB.y0) };
};

// ease along a stage
const ease = (u) => u<0.5 ? 2*u*u : 1-Math.pow(-2*u+2,2)/2;

// one travelling component token
function useFlow(stages, speed = 0.00045, offset = 0) {
  const [state, setState] = useState({ x:0, y:0, act:"", visible:false, leg:0, u:0 });
  const raf = useRef(null); const t0 = useRef(null);
  useEffect(() => {
    const pts = stages.map(s => ({ ...place(s.at), act:s.act })).filter(p => p.x!=null);
    if (pts.length < 2) return;
    const legs = pts.length - 1;
    const tick = (t) => {
      if (t0.current == null) t0.current = t + offset;
      const elapsed = (t - t0.current) * speed;
      const total = elapsed % legs;            // loop across all legs
      const leg = Math.floor(total);
      const u = ease(total - leg);
      const a = pts[leg], b = pts[leg+1];
      setState({
        x: a.x + (b.x-a.x)*u,
        y: a.y + (b.y-a.y)*u,
        act: u < 0.5 ? a.act : b.act,          // show the act of the cell we're nearest
        atCell: u > 0.82 || u < 0.18,          // "arrived" pulse near a cell
        visible:true, leg, u,
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []); // eslint-disable-line
  return state;
}

function FlowToken({ stages, speed, offset, tone }) {
  const s = useFlow(stages, speed, offset);
  if (!s.visible) return null;
  return (
    <g className="flow-token" transform={`translate(${s.x},${s.y})`}>
      <circle className={`flow-dot ${s.atCell?"at-cell":""}`} r={s.atCell?13:9} style={{fill:tone}} />
      <circle className="flow-dot-core" r={4} />
      {s.atCell && (
        <g className="flow-act">
          <rect x="16" y="-16" width={s.act.length*10+16} height="24" rx="1" />
          <text x="24" y="0" dominantBaseline="central">{s.act}</text>
        </g>
      )}
    </g>
  );
}

// draws the full route faintly so the path is legible even between tokens
function FlowRoute({ stages, tone }) {
  const pts = stages.map(s => place(s.at)).filter(Boolean);
  if (pts.length < 2) return null;
  const d = pts.map((p,i) => `${i?"L":"M"}${p.x},${p.y}`).join(" ");
  return <path className="flow-route" d={d} style={{stroke:tone}} />;
}

export default function SupplyFlowLayer() {
  const tones = ["#F5A623", "#0A7F73", "#F5A623"];
  return (
    <g className="supply-flow">
      {SUPPLY_FLOWS.map((f,i) => <FlowRoute key={f.id} stages={f.stages} tone={tones[i%3]} />)}
      {SUPPLY_FLOWS.map((f,i) => (
        <FlowToken key={f.id} stages={f.stages} speed={0.00040} offset={i*1400} tone={tones[i%3]} />
      ))}
    </g>
  );
}
