// ============================================================
// FORGE OS — CAUSAL CHAIN + INSPECTOR (kernel primitives)
//
// The chain builds itself as consequences are derived. The room passes
// consequences and understands nothing about the relationships between them.
//
// Motion rule: a node animates in once, when it first appears. Nothing loops.
// ============================================================
import { useState } from "react";
import { T, FONT, FORGE_CLIPS } from "../forge.js";
import { findCauses } from "./causalMap.js";

const LABEL = {
  "mission.opened":"Mission opened", "review.pending":"Review pending",
  "revision.required":"Revision required", "release.permitted":"Release permitted",
  "production.authorised":"Production authorised", "verification.required":"Verification required",
  "component.accepted":"Component accepted", "rework.required":"Rework required",
  "reverification.required":"Re-verification required", "production.halted":"Production halted",
};
const TONE = {
  "production.authorised":T.teal, "component.accepted":T.green, "release.permitted":T.teal,
  "revision.required":T.pink, "production.halted":T.pink,
  "rework.required":T.amber, "verification.required":T.amber,
  "reverification.required":T.amber, "review.pending":T.grey, "mission.opened":T.amber,
};
const label = (c) => LABEL[c] ?? String(c).replace(/\./g, " ");
const tone  = (c) => TONE[c] ?? T.grey;

export function CausalChain({ consequences = [], limit = 6, onInspect, correlationId }) {
  if (!consequences.length) return null;
  // oldest first, so the chain reads downward as causation ran
  const chain = [...consequences].slice(0, limit).reverse();
  return (
    <div style={{ clipPath:FORGE_CLIPS.panelBR, background:T.surface,
      borderTop:`2px solid ${T.teal}`, padding:"16px 18px" }}>
      <style>{`@keyframes forgeChainIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline",
        gap:10, marginBottom:12 }}>
        <span style={{ fontFamily:FONT.ui, fontWeight:700, fontSize:9.5, letterSpacing:"0.2em",
          textTransform:"uppercase", color:T.teal }}>Causal chain</span>
        {correlationId && <span style={{ fontFamily:FONT.mono, fontSize:9,
          color:T.greyDark }}>{correlationId}</span>}
      </div>
      {chain.map((c, i) => {
        const col = tone(c.consequence);
        return (
          <div key={`${c.eventId}-${c.consequence}-${i}`}
            onClick={() => onInspect?.(c)}
            style={{ cursor:onInspect ? "pointer" : "default",
              animation:"forgeChainIn .3s cubic-bezier(.16,1,.3,1)" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"5px 0" }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:col,
                marginTop:5, flexShrink:0 }} />
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily:FONT.ui, fontWeight:700, fontSize:12,
                  letterSpacing:"0.04em", color:col }}>{label(c.consequence)}</div>
                <div style={{ fontFamily:FONT.ui, fontSize:10.5, color:T.grey, marginTop:1 }}>
                  {c.subject}{c.actor ? ` · ${c.actor}` : ""}
                </div>
              </div>
            </div>
            {i < chain.length - 1 && (
              <div style={{ marginLeft:3.5, width:1, height:14, background:T.border }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Click any derived fact and the system explains why it believes it. */
export function CausalInspector({ consequence, onClose }) {
  if (!consequence) return null;
  const rows = [
    ["Origin event", consequence.causedBy],
    ["Object", consequence.subject],
    ["Actor", consequence.actor ?? "System"],
    ["Derived consequence", label(consequence.consequence)],
    ["Affected domain", consequence.affectedDomain],
    ["Mission impact", consequence.missionImpact ?? "none"],
    ["Correlation", consequence.correlationId ?? "none"],
    ["Event id", consequence.eventId ?? "—"],
    ["Also caused by", findCauses(consequence.consequence).join(", ") || "—"],
    ["Next", consequence.next ?? "—"],
  ];
  return (
    <div style={{ position:"fixed", bottom:24, right:24, width:340, zIndex:2000,
      clipPath:FORGE_CLIPS.panelBR, background:T.surface,
      boxShadow:`inset 0 0 0 1px ${T.teal}, 0 18px 40px rgba(0,0,0,.5)`, padding:"18px 20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        marginBottom:14 }}>
        <span style={{ fontFamily:FONT.ui, fontWeight:700, fontSize:9.5, letterSpacing:"0.2em",
          textTransform:"uppercase", color:T.teal }}>Causal trace</span>
        <button type="button" onClick={onClose} style={{ background:"none", border:"none",
          color:T.grey, cursor:"pointer", fontSize:16, lineHeight:1, padding:0 }}>×</button>
      </div>
      {rows.map(([k, v]) => (
        <div key={k} style={{ marginBottom:9 }}>
          <div style={{ fontFamily:FONT.ui, fontWeight:700, fontSize:8, letterSpacing:"0.16em",
            textTransform:"uppercase", color:T.greyDark }}>{k}</div>
          <div style={{ fontFamily: k === "Origin event" || k === "Event id" ? FONT.mono : FONT.ui,
            fontSize:11.5, color:T.ivory, marginTop:2, wordBreak:"break-word" }}>{v || "—"}</div>
        </div>
      ))}
    </div>
  );
}

export function useCausalInspector() {
  const [selected, setSelected] = useState(null);
  return { selected, inspect: setSelected, close: () => setSelected(null) };
}

export default { CausalChain, CausalInspector, useCausalInspector };
