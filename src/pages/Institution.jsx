// ============================================================
// FORGE — INSTITUTIONAL DOCUMENTS (Sprint 11, Epic 3)
// Controlled documents of the platform. Each exists as a numbered,
// revisioned specification with an explicit lifecycle state — so an
// outreach letter, a partner or a repository can reference it before
// its content is finalised. Draft state is declared, never implied.
// ============================================================
import { Link } from "react-router-dom";
import { PLATFORM } from "../constants/site.js";
import "./Institution.css";

export const DOCUMENTS = [
  { slug:"constitution", ref:"FORGE-CONST-001", title:"Forge Constitution",
    state:"DRAFT", revision:"—",
    purpose:"The founding instrument of the platform: what Forge is, what it will not do, and the obligations it accepts toward the engineers and enterprises that build on it.",
    contents:["Preamble and scope","Founding principles","Rights of contributing enterprises","Obligations of the platform","Amendment protocol"] },

  { slug:"governance", ref:"FORGE-GOV-001", title:"Governance Protocol",
    state:"DRAFT", revision:"—",
    purpose:"How decisions are made, recorded and reviewed across a distributed network of independent manufacturers, institutions and contributors.",
    contents:["Decision authority and escalation","Engineering review board","Component ownership under NAWEDOAM","Dispute resolution","Records and audit trail"] },

  { slug:"whitepaper", ref:"FORGE-WP-001", title:"Platform Whitepaper",
    state:"DRAFT", revision:"—",
    purpose:"The technical and industrial case for distributed manufacturing coordinated by an operating system: the keiretsu component model, the workforce pipeline, and the reference vehicle programme.",
    contents:["Problem: coordination cost in distributed manufacture","The NAWEDOAM component model","Forge OS architecture","Workforce and certification pipeline","Reference platform results"] },

  { slug:"licenses", ref:"FORGE-LIC-001", title:"Licensing Specification",
    state:"DRAFT", revision:"—",
    purpose:"Terms under which hardware designs, software, documentation and manufacturing data are published, reused and contributed back.",
    contents:["Hardware design licence","Software licence","Documentation licence","Contribution terms","Attribution requirements"] },

  { slug:"partners", ref:"FORGE-PART-001", title:"Partner Register",
    state:"DRAFT", revision:"—",
    purpose:"The controlled register of participating enterprises, workshops, institutions and engineering bodies, with the component classes each is qualified against.",
    contents:["Enterprise register","Institutional partners","Diaspora engineering bodies","Component qualification status","Onboarding protocol"] },

  { slug:"research", ref:"FORGE-RES-001", title:"Research Programme",
    state:"DRAFT", revision:"—",
    purpose:"Open engineering questions the platform intends to investigate with university and polytechnic partners, published as specifications rather than papers.",
    contents:["Dual-energy kitchen module","SME-scale panel forming without hydraulic stamping","Distributed quality assurance","Workforce certification methods"] },
];

export function docBySlug(slug) {
  return DOCUMENTS.find(d => d.slug === slug) || null;
}

// ------------------------------------------------------------
// Controlled-document frame — reads like a specification cover sheet.
// ------------------------------------------------------------
function DocFrame({ doc }) {
  if (!doc) return null;
  return (
    <section className="inst">
      <div className="inst-wrap">
        <nav className="inst-crumb forge-system">
          <Link to="/docs">DOCUMENTATION</Link>
          <span>/</span>
          <span>{doc.ref}</span>
        </nav>

        <header className="inst-head">
          <span className="inst-ref forge-system">{doc.ref}</span>
          <h1 className="inst-title">{doc.title}</h1>
          <p className="inst-purpose">{doc.purpose}</p>
        </header>

        <dl className="inst-plate">
          <div><dt>DOCUMENT</dt><dd>{doc.ref}</dd></div>
          <div><dt>STATE</dt><dd className="is-draft">{doc.state}</dd></div>
          <div><dt>REVISION</dt><dd>{doc.revision}</dd></div>
          <div><dt>AUTHORITY</dt><dd>{PLATFORM.institution}</dd></div>
        </dl>

        <div className="inst-notice">
          <span className="forge-system">[ SPECIFICATION IN DRAFT ]</span>
          <p>
            This document is declared and reserved. Its contents are under engineering
            review and will be published with a revision number when validated. The
            structure below is the agreed scope.
          </p>
        </div>

        <div className="inst-contents">
          <h2 className="forge-system">PLANNED SCOPE</h2>
          <ol>
            {doc.contents.map((c,i) => <li key={i}><span className="idx">{String(i+1).padStart(2,"0")}</span>{c}</li>)}
          </ol>
        </div>
      </div>
    </section>
  );
}

// index of all controlled documents
export function DocsIndex() {
  return (
    <section className="inst">
      <div className="inst-wrap">
        <header className="inst-head">
          <span className="inst-ref forge-system">DOCUMENTATION</span>
          <h1 className="inst-title">Controlled Documents</h1>
          <p className="inst-purpose">
            The specifications, protocols and registers of {PLATFORM.institution}. Each document
            carries a reference number and an explicit lifecycle state.
          </p>
        </header>

        <div className="inst-grid">
          {DOCUMENTS.map(d => (
            <Link key={d.slug} to={`/${d.slug}`} className="inst-card">
              <span className="inst-card-ref forge-system">{d.ref}</span>
              <span className="inst-card-title">{d.title}</span>
              <span className="inst-card-purpose">{d.purpose}</span>
              <span className="inst-card-state is-draft forge-system">{d.state}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export const Constitution = () => <DocFrame doc={docBySlug("constitution")} />;
export const Governance   = () => <DocFrame doc={docBySlug("governance")} />;
export const Whitepaper   = () => <DocFrame doc={docBySlug("whitepaper")} />;
export const Licenses     = () => <DocFrame doc={docBySlug("licenses")} />;
export const Partners     = () => <DocFrame doc={docBySlug("partners")} />;
export const Research     = () => <DocFrame doc={docBySlug("research")} />;
