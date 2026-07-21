// ============================================================
// FORGE — PLATE INSTRUMENT OVERLAY
// The informational layer that turns the plate from a map into an
// operational instrument: controlled-document metadata, active datasets,
// survey status, and the Forge datum crosshair. Rendered as engraved
// panels framing the plate render — the "operations table" reading.
// ============================================================
import { PLATE, SECTORS, STATUS, PLATE_SYSTEM } from "./PlateSystem.js";
import "./PlateInstrument.css";

// the coordinate crosshair — permanent Forge design mark
export function ForgeDatum({ size = 34, className = "" }) {
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={`forge-datum ${className}`}>
      <circle cx={c} cy={c} r={c - 3} />
      <circle cx={c} cy={c} r={c * 0.28} />
      <line x1={c} y1="0" x2={c} y2={size} />
      <line x1="0" y1={c} x2={size} y2={c} />
    </svg>
  );
}

function Metadata() {
  const rows = [
    ["AUTHORITY", PLATE.authority],
    ["DATASET",   PLATE.id],
    ["REVISION",  PLATE.revision],
    ["STATUS",    PLATE.status],
    ["PROJECTION",PLATE.projection],
    ["DATUM",     PLATE.datum],
    ["SCALE",     PLATE.scale],
    ["DATE",      PLATE.date],
  ];
  return (
    <div className="pi-meta">
      <div className="pi-meta-head">
        <ForgeDatum size={26} />
        <div>
          <span className="pi-meta-org">{PLATE.authority}</span>
          <span className="pi-meta-title">{PLATE.platform}</span>
        </div>
      </div>
      <dl className="pi-meta-grid">
        {rows.map(([k,v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
      <div className="pi-meta-qr" aria-label="QR placeholder">
        <span className="forge-system">QR</span>
        <span className="pi-qr-note">CONTROLLED DOCUMENT</span>
      </div>
    </div>
  );
}

function ActiveDatasets() {
  return (
    <div className="pi-datasets">
      <span className="pi-panel-label forge-system">ACTIVE DATASETS</span>
      <ul>
        {SECTORS.map(s => (
          <li key={s.id} className={s.active ? "on" : "off"}>
            <span className="pi-check">{s.active ? "✓" : "□"}</span>{s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusPanel() {
  const item = (k) => STATUS[k];
  const fmt = (o) => o.value === null ? "—" : o.value.toLocaleString();
  return (
    <div className="pi-status">
      <span className="pi-panel-label forge-system">SYSTEM STATE</span>
      <div className="pi-status-grid">
        {[
          ["networkMapped","NETWORK"],
          ["surveyProgress","SURVEY"],
          ["smes","SMEs"],
          ["fabricators","FABRICATORS"],
          ["universities","UNIVERSITIES"],
          ["researchLabs","RESEARCH"],
        ].map(([k,label]) => {
          const o = item(k);
          return (
            <div key={k} className={o.verified ? "verified" : "pending"}>
              <span className="pi-stat-val">{fmt(o)}</span>
              <span className="pi-stat-lab">{label}</span>
              {!o.verified && o.value === null && <span className="pi-stat-flag">UNSURVEYED</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// wraps the plate render/cinematic with the instrument frame
export default function PlateInstrument({ children }) {
  return (
    <div className="pi">
      <div className="pi-frame">
        <ForgeDatum size={30} className="pi-corner tl" />
        <ForgeDatum size={30} className="pi-corner tr" />
        <ForgeDatum size={30} className="pi-corner bl" />
        <ForgeDatum size={30} className="pi-corner br" />

        <aside className="pi-left">
          <Metadata />
          <ActiveDatasets />
        </aside>

        <div className="pi-stage">{children}</div>

        <aside className="pi-right">
          <StatusPanel />
        </aside>
      </div>
      <div className="pi-baseline forge-technical">
        {PLATE_SYSTEM.family.toUpperCase()} · {PLATE.id} · REV {PLATE.revision} · {PLATE.status}
        {" · "}FIRST PLATE OF THE FORGE SYSTEM
      </div>
    </div>
  );
}
