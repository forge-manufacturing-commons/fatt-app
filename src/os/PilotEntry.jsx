// ============================================================
// FORGE OS — PILOT MANUFACTURING ENTRY  (E6 Alpha Activation)
//
// One authenticated surface through which a real organisation records one real
// manufacturing fact. It is deliberately not a portal, not a workflow builder
// and not a work order: it collects the single fact the operator knows — which
// part, and what happened to it — and lets the existing machinery do the rest.
//
// THE ORGANISATION IS NEVER TYPED. It is resolved:
//
//   authenticated session -> profiles.organisation_id -> organisations.name
//     -> pilot configuration -> the organisation identifier carried on the event
//
// There is no organisation input on this form, and adding one would be the
// single most damaging change anyone could make to this file: manufacturing
// responsibility would become a claim the client makes about itself. If the
// chain above does not resolve, the surface refuses to offer any action rather
// than falling back to something plausible.
//
// EVERYTHING ELSE COMES FROM CONFIGURATION OR THE GRAPH.
//   specification, componentClass, hub, mission   pilot configuration
//   which actions are offered                     the component state graph
//   the component's current state                 the event fold
//   the resulting state                           the event fold, after publish
//
// The only free-text field is the component identifier, because a physical part
// is the one thing no registry can know in advance — see src/os/pilot.js.
//
// NO PARALLEL WRITER. The action calls an existing emitter, which runs the
// pipeline (schema -> policy -> rules -> state) and publishes to the one bus.
// This file does not write to the database, does not touch component.state and
// does not touch mission.state. It reads the projection and it publishes events.
// ============================================================

import { useMemo, useState } from "react";
import { useForgeActivity } from "./ActivityEngine.jsx";
import { project } from "./projections.js";
import { MISSIONS } from "./missions.js";
import { useIdentity } from "./ForgeIdentity.jsx";
import { T, FONT, stateColor } from "./forge.js";
import { FORGE_CLIPS } from "./geometry.js";
import { pilotOrganisationByName, assignmentFor } from "./pilot.js";
import { componentState } from "../domains/production/state.js";
import { availableActions } from "../domains/production/entry.js";
import { createProductionEmitter } from "../domains/production/emitters.js";
import { createInspectionEmitter } from "../domains/inspection/emitters.js";
import { requireActor } from "./policy.js";

const Row = ({ k, v, color = T.ivory }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 12,
    padding: "6px 0", borderBottom: `1px solid ${T.border}` }}>
    <span style={{ fontFamily: FONT.ui, fontSize: 11, color: T.grey,
      letterSpacing: "0.08em", textTransform: "uppercase" }}>{k}</span>
    <span style={{ fontFamily: FONT.mono, fontSize: 11.5, color, textAlign: "right" }}>{v}</span>
  </div>
);

export default function PilotEntry() {
  const { organisation } = useIdentity();
  const { log, publish } = useForgeActivity();
  const [componentId, setComponentId] = useState("");
  const [operator, setOperator] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);   // { event, from, to } | { error }

  const view = useMemo(() => project(log, MISSIONS), [log]);

  // The resolution chain, in one place so a failure at any link is visible.
  const pilot = useMemo(
    () => pilotOrganisationByName(organisation?.name), [organisation?.name]);
  const assignment = useMemo(
    () => (pilot ? assignmentFor(pilot.id) : null), [pilot]);

  // WHO vs WHICH ORGANISATION — two different Forge Objects, two different fields.
  //
  // This previously read `profile?.display_name || session?.user?.email`. For the
  // pilot that produced person="SOLC", human="SOLC", organisation="SOLC": an
  // institution's name sitting in a FORGE_OBJECT.PERSON field, so the log could
  // not say who actually did the work. The email fallback was worse — a local-part
  // is not a person's name either, it is a mailbox.
  //
  // The profile holds NO human name for an organisation-kind actor. There is no
  // people table and this pass does not create one, so the honest options were
  // "ask" or "invent". It asks. `requireActor` in the pipeline refuses an
  // unattributable production record, so the actions stay closed until it is
  // given — the operator is required by the event contract, not by preference.
  //
  // The organisation is NOT affected by this field. It continues to resolve
  // through: authenticated session -> profile -> organisation -> pilot config.
  const operatorName = operator.trim();

  const trimmed = componentId.trim();
  const folded = trimmed ? view.components[trimmed] : null;
  const current = folded?.state ?? componentState.initial;
  const actions = useMemo(
    () => (trimmed ? availableActions(current) : []), [trimmed, current]);

  // A profile with no organisation is a real state and gets an honest panel,
  // not a hidden one — the person needs to know why they cannot record anything.
  if (!organisation) {
    return (
      <div style={{ clipPath: FORGE_CLIPS.panelBR, background: T.surface,
        borderTop: `2px solid ${T.border}`, padding: "20px 22px" }}>
        <div style={{ fontFamily: FONT.ui, fontSize: 13, color: T.grey, lineHeight: 1.6 }}>
          No organisation is linked to this account, so there is nobody for a
          manufacturing fact to be attributed to. Establish your organisation
          first — Forge OS will not record production against a person.
        </div>
      </div>
    );
  }

  if (!pilot || !assignment) {
    return (
      <div style={{ clipPath: FORGE_CLIPS.panelBR, background: T.surface,
        borderTop: `2px solid ${T.border}`, padding: "20px 22px" }}>
        <Row k="Organisation" v={organisation.name} />
        <Row k="Provenance" v="UNKNOWN" color={T.grey} />
        <div style={{ fontFamily: FONT.ui, fontSize: 12.5, color: T.grey,
          marginTop: 12, lineHeight: 1.6 }}>
          This organisation holds no pilot assignment, so there is no
          specification, mission or component class it is admitted to record
          against. Manufacturing entry stays closed rather than defaulting to
          somebody else's drawing.
        </div>
      </div>
    );
  }

  const run = async (action) => {
    if (!trimmed || !operatorName || busy) return;
    setBusy(true);
    setResult(null);
    try {
      // Actor is required by policy: an unattributable production record is
      // refused at the pipeline rather than stored and explained later.
      // `actor` is the HUMAN. bridgeActor() puts it in person + human, both of
      // which are FORGE_OBJECT.PERSON fields. It is never the organisation.
      const common = {
        publish, actor: operatorName, hub: assignment.hub, policy: requireActor,
        correlationId: `pilot-${pilot.id}-${trimmed}`,
      };
      const emitter = action.domain === "inspection"
        ? createInspectionEmitter(common)
        : createProductionEmitter(common);

      const from = current;
      const event = emitter[action.command]({
        component: trimmed,
        specification: assignment.specification,
        mission: assignment.mission,
        // WHO. From the resolved pilot identity, never from this form.
        organisation: pilot.id,
      });
      setResult({ event, from });
      setComponentId(trimmed);
    } catch (err) {
      setResult({ error: err?.message ?? String(err) });
    } finally {
      setBusy(false);
    }
  };

  const after = result?.event ? view.components[trimmed]?.state : null;

  return (
    <div style={{ clipPath: FORGE_CLIPS.panelBR, background: T.surface,
      borderTop: `2px solid ${T.teal}`, padding: "20px 22px" }}>

      {/* DERIVED — none of these is an input. The organisation in particular is
          resolved from the authenticated profile and is deliberately not
          editable: letting a form set it would turn manufacturing
          responsibility into a claim the client makes about itself. */}
      <div style={{ fontFamily: FONT.ui, fontSize: 10, color: T.greyDark,
        letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
        Derived from your account · not editable
      </div>
      <Row k="Organisation" v={organisation.name} color={T.amber} />
      <Row k="Provenance" v={pilot.provenance} color={T.amber} />
      <Row k="Role" v={organisation.role} />
      <Row k="Hub" v={assignment.hub} />
      <Row k="Specification" v={assignment.specification} />
      <Row k="Component class" v={assignment.componentClass} />
      <Row k="Mission" v={assignment.mission} />

      {/* THE HUMAN. Separate from the organisation, and required. */}
      <div style={{ fontFamily: FONT.ui, fontSize: 11, color: T.grey,
        margin: "14px 0 8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Operator · who is recording this
      </div>
      <input
        value={operator}
        onChange={(e) => setOperator(e.target.value)}
        placeholder="Your name, e.g. Adaeze Okoro"
        aria-label="Operator name"
        style={{ width: "100%", boxSizing: "border-box", fontFamily: FONT.ui,
          fontSize: 13, padding: "11px 13px", background: T.black, color: T.ivory,
          border: `1px solid ${operatorName ? T.border : T.amber}`, outline: "none" }}
      />
      <div style={{ fontFamily: FONT.ui, fontSize: 10.5, color: T.grey, marginTop: 5, lineHeight: 1.5 }}>
        A person, not the company. {organisation.name} is the organisation
        accountable for the part; this is who performed the work. Forge OS will
        not record production against an organisation alone.
      </div>

      <div style={{ fontFamily: FONT.ui, fontSize: 11, color: T.grey,
        margin: "14px 0 8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Which part
      </div>
      <input
        value={componentId}
        onChange={(e) => setComponentId(e.target.value)}
        placeholder="Component identifier, e.g. HUB-014"
        aria-label="Component identifier"
        style={{ width: "100%", boxSizing: "border-box", fontFamily: FONT.mono,
          fontSize: 13, padding: "11px 13px", background: T.black, color: T.ivory,
          border: `1px solid ${T.border}`, outline: "none" }}
      />

      {trimmed && (
        <div style={{ marginTop: 12 }}>
          <Row k="Current state" v={current} color={stateColor(current)} />
          {/* THE TWO RELATIONSHIPS, NEVER MERGED. (P0-2)
              Responsibility answers "who answers for this part". Hub answers
              "where the work happened". They are read from two different fold
              fields and displayed on two different lines, because a hub confers
              no responsibility and no authority over the component. */}
          <Row k="Responsibility (organisation)" v={folded?.organisation ?? "— not yet claimed"}
               color={folded?.organisation ? T.amber : T.grey} />
          <Row k="Manufacturing hub (location)" v={folded?.hub ?? "— not yet recorded"}
               color={folded?.hub ? T.teal : T.grey} />
          {folded?.organisation && folded.organisation !== pilot.id && (
            <div style={{ fontFamily: FONT.ui, fontSize: 12, color: T.pink,
              marginTop: 10, lineHeight: 1.55 }}>
              {trimmed} is already the responsibility of “{folded.organisation}”.
              Recording against it will not reassign it — the fold keeps the first
              authoritative claim and reports the conflict as an anomaly.
            </div>
          )}
        </div>
      )}

      <div style={{ fontFamily: FONT.ui, fontSize: 11, color: T.grey,
        margin: "16px 0 8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        What happened
      </div>

      {!operatorName ? (
        <div style={{ fontFamily: FONT.ui, fontSize: 12.5, color: T.amber, lineHeight: 1.55 }}>
          Enter the operator's name first. Every manufacturing record must be
          attributable to a person — the pipeline refuses one that is not.
        </div>
      ) : !trimmed ? (
        <div style={{ fontFamily: FONT.ui, fontSize: 12.5, color: T.grey, fontStyle: "italic" }}>
          Name the part next. Actions are offered from its lifecycle, so the
          system has to know which part before it can say what may happen next.
        </div>
      ) : actions.length === 0 ? (
        <div style={{ fontFamily: FONT.ui, fontSize: 12.5, color: T.amber, lineHeight: 1.55 }}>
          Nothing can be recorded against a component in “{current}” —{" "}
          {componentState.means(current) ?? "the lifecycle permits no manual step from here"}.
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {actions.map((a) => (
            <button key={a.id} onClick={() => run(a)} disabled={busy} title={a.help}
              style={{ fontFamily: FONT.ui, fontWeight: 700, fontSize: 10.5,
                letterSpacing: "0.12em", textTransform: "uppercase",
                padding: "11px 16px", cursor: busy ? "wait" : "pointer",
                background: "transparent", color: T.ivory,
                border: `1px solid ${stateColor(a.to)}`, clipPath: FORGE_CLIPS.button }}>
              {a.label}
              <span style={{ color: T.grey, marginLeft: 8, letterSpacing: "0.06em" }}>
                → {a.to}
              </span>
            </button>
          ))}
        </div>
      )}

      {result?.error && (
        <div style={{ fontFamily: FONT.ui, fontSize: 12.5, color: T.pink,
          marginTop: 14, lineHeight: 1.55 }}>
          Refused: {result.error}
        </div>
      )}

      {result?.event && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: FONT.ui, fontSize: 11, color: T.teal,
            letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            Recorded
          </div>
          <Row k="Event" v={result.event.type} color={T.teal} />
          <Row k="Event id" v={result.event.eventId} />
          {/* The two attributions, side by side, so they can never be confused. */}
          <Row k="Operator (person)" v={result.event.person} color={T.teal} />
          <Row k="Organisation" v={result.event.organisation} color={T.amber} />
          {/* Carried on the event since V1, projected onto the component only now. */}
          <Row k="Hub (where)" v={result.event.hub ?? "—"} color={T.teal} />
          <Row k="Mission" v={result.event.mission ?? "—"} />
          <Row k="State" v={`${result.from} → ${after ?? "…"}`}
               color={stateColor(after ?? result.from)} />
          <div style={{ fontFamily: FONT.ui, fontSize: 11.5, color: T.grey,
            marginTop: 10, lineHeight: 1.55 }}>
            This event is now in the log the whole system reads. The state above
            was not written by this form — it is what the projection derived.
          </div>
        </div>
      )}
    </div>
  );
}
