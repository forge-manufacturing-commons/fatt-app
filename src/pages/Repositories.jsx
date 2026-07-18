// ============================================================
// FORGE — REPOSITORY REGISTER (Sprint 11, Epic 4)
// The platform's source of record. Static register for now; the shape
// matches the GitHub API response so live data can replace REGISTRY
// without touching the presentation layer.
// ============================================================
import { PLATFORM } from "../constants/site.js";
import "./Institution.css";

const ORG = "forgeatruck-ux";

export const REGISTRY = [
  { name:"forge-os", scope:"Software",
    description:"The manufacturing operating system: room kernel, activity engine, camera system, material system.",
    stack:"React · Vite", state:"ACTIVE", licence:"Pending FORGE-LIC-001" },

  { name:"forge-hardware", scope:"Hardware",
    description:"Component specifications, engineering drawings and fabrication data for the reference vehicle.",
    stack:"CAD · Blender · PDF", state:"DRAFT", licence:"Pending FORGE-LIC-001" },

  { name:"forge-network", scope:"Network",
    description:"The distributed enterprise register, component ownership map and hub coordinates.",
    stack:"JSON · GeoJSON", state:"DRAFT", licence:"Pending FORGE-LIC-001" },

  { name:"forge-ai", scope:"Research",
    description:"Engineering assistance tooling: drawing review, specification checking, build-data analysis.",
    stack:"Python", state:"RESERVED", licence:"Pending FORGE-LIC-001" },

  { name:"forge-docs", scope:"Documentation",
    description:"Controlled documents: constitution, governance protocol, whitepaper, licensing specification.",
    stack:"Markdown", state:"DRAFT", licence:"Pending FORGE-LIC-001" },

  { name:"governance", scope:"Governance",
    description:"Decision records, engineering review minutes and amendment history.",
    stack:"Markdown", state:"RESERVED", licence:"Pending FORGE-LIC-001" },

  { name:"nawedoam-reference-platform", scope:"Reference Platform",
    description:"The NAWEDOAM vehicle programme: assembly definition, component register, validation records.",
    stack:"Blender · CAD · JSON", state:"ACTIVE", licence:"Pending FORGE-LIC-001" },
];

export default function Repositories() {
  return (
    <section className="inst">
      <div className="inst-wrap">
        <header className="inst-head">
          <span className="inst-ref forge-system">REPOSITORY REGISTER</span>
          <h1 className="inst-title">Repositories</h1>
          <p className="inst-purpose">
            Source of record for {PLATFORM.institution}. Each repository is scoped to one
            domain of the platform and carries an explicit lifecycle state.
          </p>
        </header>

        <div className="repo-grid">
          {REGISTRY.map(r => (
            <a key={r.name}
               className="repo-card"
               href={`https://github.com/${ORG}/${r.name}`}
               target="_blank" rel="noreferrer">
              <div className="repo-card-top">
                <span className="repo-scope forge-system">{r.scope}</span>
                <span className={`repo-state forge-system state-${r.state.toLowerCase()}`}>{r.state}</span>
              </div>
              <span className="repo-name">{ORG}/<b>{r.name}</b></span>
              <span className="repo-desc">{r.description}</span>
              <dl className="repo-meta">
                <div><dt>STACK</dt><dd>{r.stack}</dd></div>
                <div><dt>LICENCE</dt><dd>{r.licence}</dd></div>
              </dl>
            </a>
          ))}
        </div>

        <p className="inst-foot forge-technical">
          Repositories marked RESERVED are declared and namespaced but not yet populated.
          Contribution terms are specified in FORGE-LIC-001.
        </p>
      </div>
    </section>
  );
}
