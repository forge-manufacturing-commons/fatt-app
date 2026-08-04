// ============================================================
// FORGE — NATIONAL MANUFACTURING GRAPH (view)
// Not a map. A graph of manufacturing capability, projected onto
// geography. Boundaries are substrate; relationships are the subject.
// Every metric shown is provenance-gated — see ManufacturingGraph.js.
// ============================================================
import { useState } from "react";
import { STUDIO_HUBS, projectHub } from "../lib/ForgeStudio.js";
import { NODES, EDGES, ADVISORY, CAPABILITY, RELATION, CELL_STATE, platformTotals }
  from "./ManufacturingGraph.js";
import { NIGERIA_PATH, NIGERIA_BBOX as BB } from "./nigeriaOutline.js";
import SupplyFlowLayer from "./SupplyFlowLayer.jsx";
import "./NationalGraph.css";

const hub = (id) => STUDIO_HUBS.find(h => h.id === id);
// map the lat/lon projection into the silhouette's own coordinate space
const place = (id) => {
  const h = hub(id); if (!h) return null;
  const p = projectHub(h.lat, h.lon);
  return { x: BB.x0 + (p.x/100)*(BB.x1-BB.x0), y: BB.y0 + (p.y/100)*(BB.y1-BB.y0) };
};

function Edge({ e }) {
  const a = place(e.from), b = place(e.to);
  if (!a || !b) return null;
  const rel = RELATION[e.relation];
  const common = { x1:a.x, y1:a.y, x2:b.x, y2:b.y, className:`ng-edge rel-${e.relation.toLowerCase()}` };
  if (rel.stroke === "double") {
    return (<g>
      <line {...common} strokeWidth={rel.weight*3.2} />
      <line {...common} className="ng-edge-core" strokeWidth={rel.weight*1.1} />
    </g>);
  }
  return <line {...common} strokeWidth={rel.weight*1.8} />;
}

function Node({ n, onPick, active }) {
  const p = place(n.id); if (!p) return null;
  const h = hub(n.id);
  const cap = CAPABILITY[n.capability];
  const k = n.hub ? 1.6 : 1;            // central hub renders larger
  return (
    <g className={`ng-node state-${n.state.toLowerCase()} ${active?"is-active":""} ${n.hub?"is-hub":""}`}
       transform={`translate(${p.x},${p.y})`} onClick={() => { onPick(n); }}>
      {n.hub && <circle className="ng-node-hubring" r={64} />}
      <circle className="ng-node-halo" r={46*k} />
      <circle className="ng-node-ring" r={26*k} />
      <text className="ng-node-glyph" textAnchor="middle" dominantBaseline="central"
            style={{fontSize:`${26*k}px`}}>{cap.glyph}</text>
      <text className="ng-node-label" x="0" y={58*k} textAnchor="middle">{h.name.toUpperCase()}</text>
      <text className="ng-node-cell"  x="0" y={78*k} textAnchor="middle">{n.cell}</text>
      {n.hub && <text className="ng-node-hublabel" x="0" y={-44} textAnchor="middle">CENTRAL INTERCHANGE</text>}
    </g>
  );
}

export default function NationalGraph({ onSelect } = {}) {
  const [picked, setPicked] = useState(null);
  const pick = (n) => { setPicked(n); onSelect?.(n?.id ?? null); };
  const t = platformTotals();
  const vb = `0 0 ${BB.x1 + BB.x0} ${BB.y1 + BB.y0}`;

  return (
    <section className="ng">
      <header className="ng-head">
        <span className="ng-kicker forge-system">NATIONAL MANUFACTURING GRAPH</span>
        <h2 className="ng-title">Nigeria's manufacturing<br/>nervous system.</h2>
      </header>

      {/* dual-column truth: what is designed vs what is producing */}
      <div className="ng-stats">
        {[
          ["MANUFACTURING CELLS", t.cellsDeclared, t.cellsOnline],
          ["CAPABILITY CLASSES",  t.capabilities,  t.capabilities],
          ["NETWORK RELATIONS",   t.relations,     0],
          ["ADVISORY BODIES",     ADVISORY.length, 0],
        ].map(([label, dec, on]) => (
          <div className="ng-stat" key={label}>
            <span className="ng-stat-label forge-system">{label}</span>
            <span className="ng-stat-row">
              <span className="ng-stat-dec"><b>{dec}</b><i>DECLARED</i></span>
              <span className="ng-stat-on"><b>{on}</b><i>ONLINE</i></span>
            </span>
          </div>
        ))}
      </div>
      <p className="ng-survey forge-technical">
        NETWORK SURVEY {t.smes.surveyed} / {t.smes.of} CELLS · capability counts are unsurveyed and
        are reported as null rather than estimated.
      </p>

      <div className="ng-stage">
        <svg viewBox={vb} className="ng-svg" role="img" aria-label="National manufacturing graph">
          <path d={NIGERIA_PATH} className="ng-substrate" />
          <g className="ng-edges">{EDGES.map((e,i) => <Edge key={i} e={e} />)}</g>
          <SupplyFlowLayer />
          <g className="ng-nodes">
            {NODES.map(n => <Node key={n.id} n={n} onPick={pick} active={picked?.id===n.id} />)}
          </g>
        </svg>

        {picked && (() => {
          const h = hub(picked.id); const cap = CAPABILITY[picked.capability];
          const rel = EDGES.filter(e => e.from===picked.id || e.to===picked.id);
          return (
            <aside className="ng-card">
              <button className="ng-card-x" onClick={()=>setPicked(null)} aria-label="Close">×</button>
              <span className="ng-card-kicker forge-system">MANUFACTURING CELL</span>
              <h3 className="ng-card-name">{h.name}</h3>
              <dl className="ng-card-plate">
                <div><dt>CELL ID</dt><dd>{picked.cell}</dd></div>
                <div><dt>STATE</dt><dd className={`st-${picked.state.toLowerCase()}`}>{picked.state}</dd></div>
                <div><dt>CAPABILITY</dt><dd>{cap.glyph} {cap.label}</dd></div>
                <div><dt>RELATIONS</dt><dd>{rel.length}</dd></div>
                <div><dt>SMEs</dt><dd className="unk">UNSURVEYED</dd></div>
                <div><dt>CAPACITY</dt><dd className="unk">UNSURVEYED</dd></div>
              </dl>
              <ul className="ng-card-rel">
                {rel.map((e,i) => {
                  const other = e.from===picked.id ? e.to : e.from;
                  return <li key={i}><span className={`sw rel-${e.relation.toLowerCase()}`} />
                    {hub(other)?.name} <em>{RELATION[e.relation].label}</em></li>;
                })}
              </ul>
            </aside>
          );
        })()}
      </div>

      <div className="ng-legend">
        <div className="ng-legend-col">
          <span className="forge-system">RELATION TYPES</span>
          {Object.values(RELATION).map(r => (
            <span className="ng-leg" key={r.id}><i className={`sw rel-${r.id.toLowerCase()}`} />{r.label}</span>
          ))}
        </div>
        <div className="ng-legend-col">
          <span className="forge-system">CAPABILITY CLASSES</span>
          <div className="ng-caps">
            {Object.values(CAPABILITY).map(c => (
              <span className="ng-cap" key={c.id}><b>{c.glyph}</b>{c.label}</span>
            ))}
          </div>
        </div>
        <div className="ng-legend-col">
          <span className="forge-system">ADVISORY — ENGAGED</span>
          {ADVISORY.map(a => (
            <span className="ng-leg" key={a.id}><i className="sw rel-transfer" />{a.name}<em>{a.state}</em></span>
          ))}
        </div>
      </div>
    </section>
  );
}
