// ============================================================
// FORGE OS — RIPPLE INDICATOR
// Invisible until the room is touched by something that happened elsewhere.
// This is what makes rooms feel like stations in one control room rather than
// separate pages — a significant event is visible from every station.
// ============================================================
import { useCallback, useState } from "react";
import { useRippleListener } from "./useEventRipple.js";
import { T, FONT, FORGE_CLIPS } from "../forge.js";

const TONE = { teal:T.teal, amber:T.amber, pink:T.pink };

export default function RippleIndicator({ domain }) {
  const [active, setActive] = useState(null);
  const onRipple = useCallback((r) => {
    if (!r.affects?.includes(domain)) return;
    setActive(r);
    setTimeout(() => setActive((cur) => (cur && cur.id === r.id ? null : cur)), 3200);
  }, [domain]);
  useRippleListener(onRipple);
  if (!active) return null;

  const bg = TONE[active.color] ?? T.teal;
  const fg = active.color === "amber" ? T.black : T.ivory;
  return (
    <div aria-live="polite" style={{ position:"fixed", top:16, right:16, zIndex:1000,
      background:bg, color:fg, padding:"9px 15px", clipPath:FORGE_CLIPS.button,
      fontFamily:FONT.ui, fontWeight:700, fontSize:10.5, letterSpacing:"0.12em",
      textTransform:"uppercase", display:"flex", alignItems:"center", gap:9,
      animation:"forgeRippleIn .28s cubic-bezier(.16,1,.3,1)" }}>
      <style>{`@keyframes forgeRippleIn{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
@keyframes forgeRipplePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(1.5)}}`}</style>
      <span style={{ width:6, height:6, borderRadius:"50%", background:fg,
        animation:"forgeRipplePulse 1.1s ease-in-out infinite" }} />
      {active.label}
      {active.subject && <span style={{ opacity:.75, fontWeight:600 }}>· {active.subject}</span>}
    </div>
  );
}
