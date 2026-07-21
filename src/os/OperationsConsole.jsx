// ============================================================
// FORGE OPERATIONS CONSOLE (FOC) — three operational layers.
//   SITUATION (top)  · INTELLIGENCE SURFACE (centre) · DECISIONS (right)
// NMCP runs inside the console. Specimen intelligence is shown behind a
// persistent, non-removable SPECIMEN watermark so partners see the full
// instrument without mistaking illustrative data for surveyed fact.
// ============================================================
import { useState } from "react";
import { FOC, DATA_STATE } from "./FOC.js";
import { PLATE } from "./PlateSystem.js";
import {
  NODES, EDGES, CAPABILITY, RELATION, CELL_STATE,
  NODE_INTEL, INTEL_DEFAULT, CELL_ACTIONS, platformTotals,
} from "./ManufacturingGraph.js";
import { STUDIO_HUBS } from "../lib/ForgeStudio.js";
import NationalGraph from "./NationalGraph.jsx";
import { ForgeDatum } from "./PlateInstrument.jsx";
import "./OperationsConsole.css";

const hubName = (id) => STUDIO_HUBS.find(h => h.id === id)?.name || id;

// specimen-tagged value — renders the number plus its data-state chip
function Val({ v, suffix }) {
  if (v == null) return <span className="foc-val pending">—</span>;
  return <span className="foc-val">{v}{suffix||""}</span>;
}

export default function OperationsConsole() {
  const [picked, setPicked] = useState(null);
  const t = platformTotals();

  const intel = picked ? (NODE_INTEL[picked.id] || INTEL_DEFAULT) : null;

  return (
    <div className="foc">
      {/* persistent, non-removable specimen watermark */}
      <div className="foc-specimen" aria-hidden="true">
        <span>ILLUSTRATIVE · SPECIMEN DATA · NOT SURVEYED</span>
        <span>ILLUSTRATIVE · SPECIMEN DATA · NOT SURVEYED</span>
      </div>

      {/* ---------- LAYER 1 — SITUATION ---------- */}
      <header className="foc-situation">
        <div className="foc-sit-mission">
          <ForgeDatum size={28} />
          <div>
            <h1 className="foc-sit-title">{PLATE.platform}</h1>
            <span className="foc-sit-sub forge-system">{FOC.name} · {PLATE.short}</span>
          </div>
        </div>
        <dl className="foc-sit-meta">
          <div><dt>REGION</dt><dd>NIGERIA</dd></div>
          <div><dt>STATE</dt><dd className="ok">OPERATIONAL</dd></div>
          <div><dt>REVISION</dt><dd>{PLATE.revision}</dd></div>
          <div><dt>SURVEY</dt><dd className="warn">{t.smes.surveyed}/{t.smes.of}</dd></div>
        </dl>
      </header>

      <div className="foc-body">
        {/* ---------- LEFT — WORKSPACE ---------- */}
        <aside className="foc-left">
          <section>
            <span className="foc-panel-label forge-system">INTELLIGENCE LAYERS</span>
            <ul className="foc-layers">
              {Object.values(CAPABILITY).map(c => (
                <li key={c.id}><b>{c.glyph}</b>{c.label}</li>
              ))}
            </ul>
          </section>
          <section>
            <span className="foc-panel-label forge-system">CONSOLE MODULES</span>
            <ul className="foc-modules">
              {FOC.modules.map(m => (
                <li key={m.id} className={`st-${m.state.toLowerCase()}`}>
                  <span className="foc-mod-id">{m.id}</span>
                  <span className="foc-mod-label">{m.label}</span>
                  <span className="foc-mod-state">{m.state}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        {/* ---------- CENTRE — INTELLIGENCE SURFACE ---------- */}
        <main className="foc-surface">
          <div className="foc-surface-head">
            <span className="foc-panel-label forge-system">MANUFACTURING INTELLIGENCE SURFACE</span>
            <span className="foc-surface-hint forge-technical">SELECT A CELL TO QUERY CAPABILITY</span>
          </div>
          <NationalGraph onSelect={setPicked} />
        </main>

        {/* ---------- RIGHT — DECISIONS ---------- */}
        <aside className="foc-right">
          {!picked ? (
            <div className="foc-summary">
              <span className="foc-panel-label forge-system">OPERATIONAL SUMMARY</span>
              <div className="foc-metric"><Val v={t.cellsDeclared} /><i>CELLS DECLARED</i></div>
              <div className="foc-metric"><Val v={t.capabilities} /><i>CAPABILITY CLASSES</i></div>
              <div className="foc-metric"><Val v={t.relations} /><i>NETWORK RELATIONS</i></div>
              <div className="foc-metric pending"><Val v={null} /><i>PRODUCTION CAPACITY</i></div>
              <p className="foc-summary-note forge-technical">
                Capacity, supplier and readiness indices populate per cell on selection.
                All shown values are SPECIMEN until surveyed.
              </p>
            </div>
          ) : (() => {
            const cap = CAPABILITY[picked.capability];
            const rel = EDGES.filter(e => e.from===picked.id || e.to===picked.id);
            return (
              <div className="foc-cell">
                <button className="foc-cell-x" onClick={()=>setPicked(null)}>×</button>
                <span className="foc-panel-label forge-system">MANUFACTURING CELL</span>
                <h2 className="foc-cell-name">{hubName(picked.id)}</h2>
                <span className="foc-cell-disc">{cap.glyph} {intel.discipline}</span>

                <div className="foc-cell-grid">
                  <div><span className="foc-cell-v">{intel.capacity!=null?intel.capacity+"%":"—"}</span><i>CAPACITY <em>SPEC</em></i></div>
                  <div><span className="foc-cell-v">{intel.suppliers ?? "—"}</span><i>SUPPLIERS <em>SPEC</em></i></div>
                  <div><span className="foc-cell-v">{intel.universities ?? "—"}</span><i>UNIVERSITIES <em>SPEC</em></i></div>
                  <div><span className="foc-cell-v">{intel.projects ?? "—"}</span><i>PROJECTS <em>SPEC</em></i></div>
                  <div><span className="foc-cell-v">{intel.readiness}</span><i>READINESS <em>SPEC</em></i></div>
                  <div><span className="foc-cell-v">{picked.cell}</span><i>CELL ID</i></div>
                </div>

                <span className="foc-panel-label forge-system">REQUIRED ACTIONS</span>
                <div className="foc-actions">
                  {CELL_ACTIONS.map(a => (
                    <button key={a.id} className={`foc-action ${a.kind}`}>{a.label}</button>
                  ))}
                </div>

                <span className="foc-panel-label forge-system">CONNECTED</span>
                <ul className="foc-cell-rel">
                  {rel.map((e,i) => {
                    const other = e.from===picked.id ? e.to : e.from;
                    return <li key={i}><span className={`sw rel-${e.relation.toLowerCase()}`} />
                      {hubName(other)}<em>{RELATION[e.relation].label}</em></li>;
                  })}
                </ul>
              </div>
            );
          })()}
        </aside>
      </div>

      {/* ---------- BOTTOM — PERSISTENT METADATA ---------- */}
      <footer className="foc-metabar forge-technical">
        <span>DATASET {PLATE.id}</span>
        <span>REV {PLATE.revision}</span>
        <span>STATUS {PLATE.status}</span>
        <span>CLASS SPECIMEN</span>
        <span>PROJECTION {PLATE.projection}</span>
        <span>DATUM {PLATE.datum}</span>
        <span>SYNC —</span>
        <span>AUTHORITY {PLATE.authority}</span>
        <span className="foc-meta-qr">QR</span>
      </footer>
    </div>
  );
}
