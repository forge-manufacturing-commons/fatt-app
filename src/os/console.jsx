// ============================================================
// FORGE OS — SHARED CONSOLE PRIMITIVES
// Every room is a console in the same operating system. Spacing, panels,
// labels, badges and buttons come from here so moving between rooms never
// surprises the operator.
// ============================================================

import { T, FONT, S, FORGE_CLIPS, PRINCIPLES, stateColor } from "./forge.js";

/** Room shell: canvas, kicker, title in Poppins Black, and the operating principle. */
export function RoomShell({ roomId, kicker, title, accent, lede, meta, children }) {
  const principle = PRINCIPLES[roomId];
  return (
    <div className="forge-brand" style={{ background:T.black, color:T.ivory, minHeight:"100%",
      padding:"clamp(24px,4vw,48px)", fontFamily:FONT.ui, boxSizing:"border-box" }}>
      {kicker && (
        <div style={{ fontFamily:FONT.ui, fontWeight:600, fontSize:10, letterSpacing:"0.2em",
          textTransform:"uppercase", color:T.teal, borderLeft:`2px solid ${T.teal}`,
          paddingLeft:12, marginBottom:S.md }}>{kicker}</div>
      )}
      {title && (
        <h1 style={{ fontFamily:FONT.display, fontWeight:900, fontSize:"clamp(26px,3.6vw,40px)",
          letterSpacing:"-0.03em", lineHeight:0.98, margin:`0 0 ${S.sm}px` }}>
          {title}{accent && <span style={{ color:T.pink }}> {accent}</span>}
        </h1>
      )}
      {principle && (
        <div style={{ display:"flex", alignItems:"flex-start", gap:10, margin:`${S.md}px 0 ${S.sm}px`,
          maxWidth:700 }}>
          <span style={{ width:2, alignSelf:"stretch", background:T.pink, flexShrink:0 }} />
          <span style={{ fontFamily:FONT.ui, fontWeight:600, fontSize:13, lineHeight:1.5,
            color:T.ivory70, fontStyle:"italic" }}>{principle}</span>
        </div>
      )}
      {lede && (
        <p style={{ color:T.ivory70, fontSize:14.5, maxWidth:680, lineHeight:1.6,
          margin:`0 0 ${S.sm}px` }}>{lede}</p>
      )}
      {meta && (
        <div style={{ fontFamily:FONT.ui, fontWeight:700, fontSize:9, letterSpacing:"0.2em",
          textTransform:"uppercase", color:T.grey, marginBottom:S.xl }}>{meta}</div>
      )}
      {!meta && <div style={{ height:S.xl }} />}
      {children}
    </div>
  );
}

export function Label({ children, rule = T.pink }) {
  return (
    <div style={{ marginBottom:S.sm + 2 }}>
      <div style={{ fontFamily:FONT.ui, fontWeight:600, fontSize:10, letterSpacing:"0.2em",
        textTransform:"uppercase", color:T.teal }}>{children}</div>
      <div style={{ width:40, height:2, background:rule, marginTop:6 }} />
    </div>
  );
}

export function Panel({ children, variant = "panelBR", accent = T.teal, pad = 18, style = {} }) {
  return (
    <div style={{ clipPath:FORGE_CLIPS[variant], background:T.surface,
      borderTop:`2px solid ${accent}`, padding:`${pad - 2}px ${pad}px`, ...style }}>{children}</div>
  );
}

export function Badge({ children, color = T.teal, filled = false }) {
  return (
    <span style={{ fontFamily:FONT.ui, fontWeight:filled ? 800 : 700, fontSize:9.5,
      letterSpacing:"0.14em", textTransform:"uppercase",
      color: filled ? T.black : color, background: filled ? color : "transparent",
      border: filled ? "none" : `1px solid ${color}`, padding:"3px 7px",
      clipPath:FORGE_CLIPS.buttonSm, whiteSpace:"nowrap" }}>{children}</span>
  );
}

export function Button({ children, onClick, tone = "primary", disabled = false, small = false }) {
  const bg = disabled ? T.border : tone === "primary" ? T.amber : "transparent";
  const fg = disabled ? T.grey : tone === "primary" ? T.black : T.teal;
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      style={{ fontFamily:FONT.ui, fontWeight:700, fontSize: small ? 10.5 : 12,
        letterSpacing:"0.11em", textTransform:"uppercase",
        padding: small ? "9px 14px" : "12px 20px", border:"none",
        background:bg, color:fg,
        boxShadow: tone === "secondary" && !disabled ? `inset 0 0 0 1px ${T.teal}` : "none",
        clipPath: small ? FORGE_CLIPS.buttonSm : FORGE_CLIPS.button,
        cursor: disabled ? "not-allowed" : "pointer" }}>{children}</button>
  );
}

/** A projection-driven statistic. Never hardcoded, and honest when unknown. */
export function Stat({ value, label, note, accent = T.teal }) {
  const unknown = value === null || value === undefined;
  return (
    <div style={{ clipPath:FORGE_CLIPS.panelBR, background:T.surface,
      borderTop:`2px solid ${accent}`, padding:"18px 20px", flex:"1 1 160px", minWidth:150 }}>
      <div style={{ fontFamily:FONT.display, fontWeight:900, fontSize:34, lineHeight:1,
        color: unknown ? T.grey : accent }}>{unknown ? "—" : value}</div>
      <div style={{ fontFamily:FONT.ui, fontWeight:600, fontSize:10, letterSpacing:"0.15em",
        textTransform:"uppercase", color:T.teal, marginTop:S.sm }}>{label}</div>
      {note && <div style={{ fontFamily:FONT.ui, fontSize:11, color:T.grey, marginTop:4 }}>{note}</div>}
      {unknown && <div style={{ fontFamily:FONT.ui, fontSize:9.5, letterSpacing:"0.12em",
        textTransform:"uppercase", color:T.grey, marginTop:4 }}>Not surveyed</div>}
    </div>
  );
}

/**
 * NETWORK SURFACE — kernel primitive.
 *
 * Added to the kernel rather than to the Grid, per the Kernel First Rule:
 * a capability network is not Grid-specific. Any room showing connected
 * nodes uses this.
 *
 * Deliberately NOT a map. Geography is one projection of a capability
 * graph; nodes are laid out radially so no coordinate is invented and no
 * claim is made about location. Colour comes from stateColor, never local.
 */
export function NetworkSurface({ nodes = [], height = 340, label }) {
  if (!nodes.length) {
    return (
      <Panel accent={T.border}>
        <div style={{ fontFamily:FONT.ui, fontSize:12.5, color:T.grey, fontStyle:"italic" }}>
          No hubs are reporting. The network surface renders what the runtime knows —
          it does not draw a map of what it hopes for.
        </div>
      </Panel>
    );
  }
  const W = 1000, H = height;
  const cx = W / 2, cy = H / 2;
  const R = Math.min(W, H) * 0.36;
  const placed = nodes.map((n, i) => {
    const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return { ...n, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  });
  return (
    <div style={{ position:"relative", background:T.surface, clipPath:FORGE_CLIPS.panelBR,
      borderTop:`2px solid ${T.teal}`, padding:14 }}>
      {label && (
        <div style={{ fontFamily:FONT.ui, fontWeight:600, fontSize:9.5, letterSpacing:"0.18em",
          textTransform:"uppercase", color:T.teal, marginBottom:6 }}>{label}</div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto" style={{ display:"block" }}>
        {/* every node relates to the interchange; relation lines are typed by state */}
        {placed.map((n) => (
          <line key={`e-${n.id}`} x1={cx} y1={cy} x2={n.x} y2={n.y}
            stroke={stateColor(n.state)} strokeOpacity="0.28" strokeWidth="1" />
        ))}
        <circle cx={cx} cy={cy} r="7" fill={T.amber} />
        <text x={cx} y={cy + 22} textAnchor="middle"
          style={{ fontFamily:FONT.ui, fontWeight:700, fontSize:10, letterSpacing:"0.14em",
            textTransform:"uppercase", fill:T.amber }}>Interchange</text>
        {placed.map((n) => {
          const c = stateColor(n.state);
          return (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r="6" fill={c} />
              <circle cx={n.x} cy={n.y} r="11" fill="none" stroke={c} strokeOpacity="0.35" />
              <text x={n.x} y={n.y - 17} textAnchor="middle"
                style={{ fontFamily:FONT.ui, fontWeight:700, fontSize:10.5,
                  letterSpacing:"0.08em", fill:T.ivory }}>{String(n.id).toUpperCase()}</text>
              <text x={n.x} y={n.y + 24} textAnchor="middle"
                style={{ fontFamily:FONT.ui, fontWeight:600, fontSize:8.5,
                  letterSpacing:"0.14em", textTransform:"uppercase", fill:c }}>{n.state}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default { RoomShell, Label, Panel, Badge, Button, Stat, NetworkSurface };
