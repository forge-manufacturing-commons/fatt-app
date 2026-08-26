// ============================================================
// FORGE ELECTION — WEB SURFACE  (Loop 27)
//
// The FIRST real UI caller of src/os/electionWebAdapter.js. Deliberately
// small: it loads context, shows what the Canon actually says, offers
// campaign activation when none exists, and offers exactly ONE write
// action (already built, tested, unchanged — "Assign <org> to <ward>",
// src/domains/election/studio/write.js's own WARD_ASSIGN pattern). No
// second Election operation is added merely to make this screen look
// complete — Loop 27's own brief calls that out explicitly.
//
// WHAT THIS COMPONENT NEVER DOES. It imports nothing from
// src/domains/election/projections.js, src/domains/election/studio/
// readiness.js, src/os/electionScope.js, src/os/electionBootstrap.js, or
// executeElectionWrite — every one of those is reached, if at all, only
// through src/os/electionWebAdapter.js's five exported functions. This
// component reads `readiness`/`view`/`scope` off whatever the adapter
// returns and renders it; it computes none of it. `useIdentity()` supplies
// `configured`/`session` (the SAME identity surface Workspace.jsx already
// uses) — this file never touches `session.user.id` directly and never
// passes a userId anywhere; the adapter derives that itself from the real
// `supabase` client's own session.
//
// CANON HONESTY. UNKNOWN/INCOMPLETE/AT_RISK/COMPLETE are rendered as
// exactly those four words, in that vocabulary, never translated into a
// percentage or a colour-only signal that implies more than the Canon
// states. A RECOMMENDATION renders in its own labelled block, never merged
// visually into a CANON fact.
// ============================================================

import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isConfigured } from "../lib/supabase.js";
import { useIdentity } from "../os/ForgeIdentity.jsx";
import { T } from "../os/forge.js";
import { FORGE_CLIPS } from "../os/geometry.js";
import {
  readElectionCanon, activateElection, prepareElectionWrite, approveElectionWrite, WRITE_CHANNEL,
} from "../os/electionWebAdapter.js";
import { ACTIVATION } from "../os/electionContext.js";
import { ELECTION_SCOPE } from "../os/electionScope.js";
import { READINESS_DIMENSION_STATUS as STATUS } from "../domains/election/studio/readiness.js";

const { black: BLACK, ivory: IVORY, teal: TEAL, amber: AMBER, pink: PINK,
        surface: SURFACE, border: BORDER, grey: MUTED } = T;
const UI = "var(--forge-brand-font, 'Poppins', system-ui, sans-serif)";
const DISPLAY = "var(--forge-display-font, 'Poppins', system-ui, sans-serif)";

/** Only these four words, ever — the exact vocabulary deriveReadiness() uses. */
const STATUS_COLOR = Object.freeze({
  [STATUS.COMPLETE]: TEAL, [STATUS.INCOMPLETE]: MUTED, [STATUS.AT_RISK]: PINK, [STATUS.UNKNOWN]: AMBER,
});

function Label({ children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 10, letterSpacing: "0.2em",
        textTransform: "uppercase", color: TEAL }}>{children}</div>
      <div style={{ width: 40, height: 2, background: PINK, marginTop: 6 }} />
    </div>
  );
}

function Panel({ children, accent = TEAL }) {
  return (
    <div style={{ clipPath: FORGE_CLIPS.panelBR, background: SURFACE,
      borderTop: `2px solid ${accent}`, padding: "20px 22px" }}>{children}</div>
  );
}

function StatusChip({ status }) {
  const color = STATUS_COLOR[status] ?? MUTED;
  return (
    <span style={{ fontFamily: UI, fontWeight: 700, fontSize: 10, letterSpacing: "0.14em",
      textTransform: "uppercase", color, border: `1px solid ${color}`,
      padding: "4px 9px", clipPath: FORGE_CLIPS.buttonSm }}>{status}</span>
  );
}

/** One claim, exactly as deriveReadiness() produced it — dimension, status, and its own stated value. */
function ClaimRow({ claim }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
      padding: "9px 0", borderBottom: `1px solid ${BORDER}` }}>
      <div>
        <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 11.5, color: IVORY,
          letterSpacing: "0.04em" }}>{claim.dimension}</div>
        <div style={{ fontFamily: UI, fontSize: 11.5, color: MUTED, marginTop: 2 }}>{claim.value}</div>
      </div>
      <StatusChip status={claim.status} />
    </div>
  );
}

/** A CANON-DERIVED GAP — never a recommendation, never a fact stronger than the Canon states. */
function GapRow({ gap }) {
  return (
    <div style={{ padding: "9px 0", borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ fontFamily: UI, fontSize: 12.5, color: IVORY }}>{gap.what}</div>
      <div style={{ fontFamily: UI, fontSize: 11, color: MUTED, marginTop: 3 }}>{gap.why_it_matters}</div>
      <div style={{ fontFamily: UI, fontSize: 10.5, color: TEAL, marginTop: 4 }}>
        Next: {gap.action} · owner {gap.owner} · deadline {gap.deadline}
      </div>
    </div>
  );
}

function ActivationPanel({ onActivate, busy, error }) {
  const [name, setName] = useState("");
  return (
    <Panel accent={AMBER}>
      <div style={{ fontFamily: UI, fontSize: 13, color: MUTED, lineHeight: 1.6, marginBottom: 14 }}>
        You are signed in, but no Election campaign is accessible to this account yet.
        Nothing can be recorded until one exists.
      </div>
      <input value={name} onChange={(e) => setName(e.target.value)}
        placeholder="Campaign name (e.g. Ada for LG Chair, Ward 7)" aria-label="Campaign name"
        style={{ width: "100%", boxSizing: "border-box", fontFamily: UI, fontSize: 13,
          padding: "11px 13px", background: BLACK, color: IVORY,
          border: `1px solid ${BORDER}`, outline: "none", marginBottom: 9 }} />
      <button onClick={() => onActivate(name)} disabled={busy || !name.trim()}
        style={{ fontFamily: UI, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em",
          textTransform: "uppercase", padding: "12px 20px", border: "none",
          background: busy || !name.trim() ? BORDER : AMBER, color: busy || !name.trim() ? MUTED : BLACK,
          cursor: busy || !name.trim() ? "not-allowed" : "pointer", clipPath: FORGE_CLIPS.button }}>
        {busy ? "Activating…" : "Activate Campaign"}
      </button>
      {error && <div style={{ fontFamily: UI, fontSize: 12.5, color: PINK, marginTop: 12 }}>{error}</div>}
    </Panel>
  );
}

/** Generic write surface (LOOP 38 truthfulness correction) — free text is
 *  matched against every Election write command `proposeElectionWrite()`
 *  (studio/write.js) currently recognises: candidate registration,
 *  ward assignment, ward status reporting, and observer assignment.
 *  This comment previously described the panel as supporting only the
 *  original (Loop 27) ward-assignment operation — that became stale once
 *  Loops 29/32 added the other three matchers to the SAME underlying
 *  function this panel already called; the panel itself needed no code
 *  change, only this comment and the placeholder below did. No new UI
 *  element, operation selector, or command catalog is added here — the
 *  panel remains exactly the free-text -> PREPARE -> APPROVAL -> EXECUTE
 *  box it always was. */
function WriteActionPanel({ campaignId, refresh }) {
  const [message, setMessage] = useState("");
  const [prepared, setPrepared] = useState(null);   // { draft, confirmationId }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const doPrepare = useCallback(async () => {
    setBusy(true); setError(null);
    const result = await prepareElectionWrite({ client: supabase, requestedCampaign: campaignId, message });
    setBusy(false);
    if (result.status !== "PREPARED") {
      setError(result.reason ?? `could not prepare: ${result.status}`);
      return;
    }
    // The confirmationId is generated ONCE here and RETAINED across however
    // many approval attempts this same draft gets — never regenerated on
    // retry, which is what makes a repeated Approve click idempotent rather
    // than a second event.
    setPrepared({ draft: result.draft, confirmationId: crypto.randomUUID() });
  }, [campaignId, message]);

  const doApprove = useCallback(async () => {
    if (!prepared) return;
    setBusy(true); setError(null);
    const result = await approveElectionWrite({
      client: supabase, requestedCampaign: campaignId,
      draft: prepared.draft.draft, confirmationId: prepared.confirmationId,
    });
    setBusy(false);
    if (!result.success) { setError(result.error ?? "approval failed"); return; }
    // NEVER patch state locally. The only honest next state is whatever a
    // FRESH read of the Canon says — see readElectionCanon() in refresh().
    setPrepared(null); setMessage("");
    await refresh();
  }, [campaignId, prepared, refresh]);

  return (
    <Panel accent={TEAL}>
      <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em",
        textTransform: "uppercase", color: TEAL, marginBottom: 10 }}>Record a campaign action</div>
      {!prepared ? (
        <>
          <input value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder='e.g. "Assign Team 6 to Ward 6" or "Report Ward 6 as on-track"' aria-label="Action"
            style={{ width: "100%", boxSizing: "border-box", fontFamily: UI, fontSize: 13,
              padding: "11px 13px", background: BLACK, color: IVORY,
              border: `1px solid ${BORDER}`, outline: "none", marginBottom: 9 }} />
          <button onClick={doPrepare} disabled={busy || !message.trim()}
            style={{ fontFamily: UI, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em",
              textTransform: "uppercase", padding: "11px 18px", border: "none",
              background: busy || !message.trim() ? BORDER : TEAL, color: BLACK,
              cursor: busy || !message.trim() ? "not-allowed" : "pointer", clipPath: FORGE_CLIPS.button }}>
            {busy ? "Preparing…" : "Prepare"}
          </button>
        </>
      ) : (
        <>
          <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 10, letterSpacing: "0.14em",
            textTransform: "uppercase", color: AMBER, marginBottom: 6 }}>Proposed action — not yet recorded</div>
          <div style={{ fontFamily: UI, fontSize: 13, color: IVORY, marginBottom: 6 }}>
            {prepared.draft.summary}
          </div>
          <div style={{ fontFamily: UI, fontSize: 11, color: MUTED, marginBottom: 14 }}>
            {prepared.draft.notice}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={doApprove} disabled={busy}
              style={{ fontFamily: UI, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em",
                textTransform: "uppercase", padding: "11px 18px", border: "none",
                background: busy ? BORDER : TEAL, color: BLACK,
                cursor: busy ? "not-allowed" : "pointer", clipPath: FORGE_CLIPS.button }}>
              {busy ? "Recording…" : "Approve"}
            </button>
            <button onClick={() => setPrepared(null)} disabled={busy}
              style={{ fontFamily: UI, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em",
                textTransform: "uppercase", padding: "11px 18px", cursor: "pointer",
                background: "transparent", color: MUTED, border: `1px solid ${BORDER}`,
                clipPath: FORGE_CLIPS.button }}>Cancel</button>
          </div>
        </>
      )}
      {error && <div style={{ fontFamily: UI, fontSize: 12.5, color: PINK, marginTop: 12 }}>{error}</div>}
    </Panel>
  );
}

const SCOPE_MESSAGE = Object.freeze({
  [ELECTION_SCOPE.NONE]: null, // handled by ActivationPanel instead
  [ELECTION_SCOPE.AMBIGUOUS]: "You belong to more than one campaign — this screen does not yet let you choose which.",
  [ELECTION_SCOPE.REFUSED]: "That campaign is not accessible to this account.",
  [ELECTION_SCOPE.READ_FAILED]: "Campaign membership could not be read right now.",
});

export default function Election() {
  const nav = useNavigate();
  const { configured, loading: identityLoading, session } = useIdentity();

  const [ctx, setCtx] = useState(null);
  const [ctxLoading, setCtxLoading] = useState(false);
  const [activateBusy, setActivateBusy] = useState(false);
  const [activateError, setActivateError] = useState(null);

  // THE ONE READ PATH. Every render of Canon/readiness on this page comes
  // from calling this function again — never from mutating `ctx` in place.
  const refresh = useCallback(async () => {
    if (!session?.user) return;
    setCtxLoading(true);
    const result = await readElectionCanon({ client: supabase });
    setCtx(result);
    setCtxLoading(false);
  }, [session?.user]);

  useEffect(() => { refresh(); }, [refresh]);

  const doActivate = useCallback(async (name) => {
    setActivateBusy(true); setActivateError(null);
    const result = await activateElection({ client: supabase, name });
    setActivateBusy(false);
    if (result.outcome !== ACTIVATION.CREATED && result.outcome !== ACTIVATION.ALREADY_MEMBER) {
      setActivateError(result.error ?? `could not activate: ${result.outcome}`);
      return;
    }
    // Never build the resulting screen from `result` — the newly returned
    // ACTIVATION outcome names an id, nothing else; the Canon itself is
    // read fresh, exactly as an existing-campaign visit would.
    await refresh();
  }, [refresh]);

  const shell = (inner) => (
    <div className="forge-brand" style={{ background: BLACK, color: IVORY, minHeight: "100vh",
      padding: "clamp(28px,5vw,60px)", fontFamily: UI }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>{inner}</div>
    </div>
  );

  if (!configured) {
    return shell(
      <Panel accent={PINK}>
        <h1 style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 28, letterSpacing: "-0.03em", margin: "0 0 10px" }}>
          Election unavailable
        </h1>
        <p style={{ color: "rgba(245,241,233,.75)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          This deployment has no database credentials, so there is no Election Canon to show.
        </p>
      </Panel>
    );
  }

  if (identityLoading) return shell(<div style={{ color: MUTED, fontSize: 13 }}>Resolving identity…</div>);

  if (!session) {
    return shell(
      <>
        <h1 style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(26px,3.6vw,40px)",
          letterSpacing: "-0.03em", margin: "0 0 12px" }}>Not signed in.</h1>
        <p style={{ color: "rgba(245,241,233,.72)", fontSize: 15, maxWidth: 560, lineHeight: 1.6 }}>
          Forge Election attributes every campaign action to an accountable actor.
          Register or sign in to open your Election Canon.
        </p>
        <button onClick={() => nav("/access")} style={{ marginTop: 20, fontFamily: UI, fontWeight: 700,
          fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", padding: "13px 24px",
          border: "none", background: AMBER, color: BLACK, cursor: "pointer", clipPath: FORGE_CLIPS.button }}>
          Register or sign in →
        </button>
      </>
    );
  }

  if (ctxLoading && !ctx) return shell(<div style={{ color: MUTED, fontSize: 13 }}>Loading Election Canon…</div>);

  const scopeOutcome = ctx?.scope?.outcome ?? null;

  return shell(
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        flexWrap: "wrap", gap: 16, marginBottom: 30 }}>
        <div>
          <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 10, letterSpacing: "0.2em",
            textTransform: "uppercase", color: TEAL, borderLeft: `2px solid ${TEAL}`,
            paddingLeft: 12, marginBottom: 14 }}>Forge Election · Canon</div>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: "clamp(26px,3.8vw,44px)",
            letterSpacing: "-0.03em", lineHeight: 0.98, margin: 0 }}>Campaign Readiness</h1>
        </div>
        <button onClick={refresh} disabled={ctxLoading} style={{ fontFamily: UI, fontWeight: 700,
          fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", padding: "10px 18px",
          cursor: ctxLoading ? "not-allowed" : "pointer", background: "transparent", color: MUTED,
          border: `1px solid ${BORDER}`, clipPath: FORGE_CLIPS.button }}>
          {ctxLoading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {scopeOutcome === ELECTION_SCOPE.NONE && (
        <ActivationPanel onActivate={doActivate} busy={activateBusy} error={activateError} />
      )}

      {scopeOutcome && SCOPE_MESSAGE[scopeOutcome] && (
        <Panel accent={PINK}><div style={{ fontFamily: UI, fontSize: 13, color: IVORY }}>
          {SCOPE_MESSAGE[scopeOutcome]}
        </div></Panel>
      )}

      {scopeOutcome === ELECTION_SCOPE.SCOPED && ctx.readiness && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 18 }}>
          <div>
            <Label>Readiness claims (CANON)</Label>
            <Panel>
              {ctx.readiness.claims.map((c, i) => <ClaimRow key={i} claim={c} />)}
            </Panel>
          </div>

          <div>
            <Label>Known ward coverage</Label>
            <Panel accent={AMBER}>
              <div style={{ fontFamily: UI, fontSize: 13, color: IVORY }}>
                {ctx.readiness.knownWardCoverage.knownWards} known ·{" "}
                {ctx.readiness.knownWardCoverage.assignedWards} assigned ·{" "}
                {ctx.readiness.knownWardCoverage.healthyWards} healthy ·{" "}
                {ctx.readiness.knownWardCoverage.atRiskWards} at-risk ·{" "}
                {ctx.readiness.knownWardCoverage.unreportedWards} unreported
              </div>
              {/* The disclosure is rendered VERBATIM — never summarised away,
                  because it is the one sentence that stops this box from
                  being read as full-constituency coverage. */}
              <div style={{ fontFamily: UI, fontSize: 11.5, color: MUTED, marginTop: 8, lineHeight: 1.5 }}>
                {ctx.readiness.knownWardCoverage.note}
              </div>
            </Panel>
          </div>

          {ctx.readiness.gaps.length > 0 && (
            <div>
              <Label>Gaps (CANON-derived)</Label>
              <Panel accent={PINK}>
                {ctx.readiness.gaps.map((g, i) => <GapRow key={i} gap={g} />)}
              </Panel>
            </div>
          )}

          <div>
            <WriteActionPanel campaignId={ctx.scope.campaignId} refresh={refresh} />
          </div>
        </div>
      )}
    </>
  );
}
