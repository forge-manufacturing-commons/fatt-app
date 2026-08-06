// ============================================================
// FORGE OS — STATE GRAPH STRIP
// The Manufacturing State Engine, made visible. The state the object holds
// glows; states it may reach next are illuminated; everything else is
// dimmed. A person understands the lifecycle without being taught it.
// ============================================================
const IVORY="#F5F1E9", TEAL="#0A7F73", AMBER="#F5A623", BLACK="#0D0D0F";
const BORDER="#1C2128", MUTED="#8899aa";
const UI="var(--forge-brand-font, 'Poppins', system-ui, sans-serif)";

export default function StateGraph({ machine, current, order }) {
  if (!machine || !current) return null;
  const seq = order ?? machine.states();
  const reachable = new Set(seq.filter((s) => machine.transitions(current)
    .map((t) => machine.next(current, t)).includes(s)));

  return (
    <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:0 }}>
      {seq.map((s, i) => {
        const isNow = s === current;
        const isNext = reachable.has(s);
        const color = isNow ? AMBER : isNext ? TEAL : BORDER;
        const text  = isNow ? BLACK : isNext ? IVORY : MUTED;
        return (
          <span key={s} style={{ display:"inline-flex", alignItems:"center" }}>
            <span title={machine.means(s) ?? s}
              style={{ fontFamily:UI, fontWeight:isNow?800:600, fontSize:10,
                letterSpacing:"0.1em", textTransform:"uppercase",
                padding:"7px 11px", background:isNow?AMBER:"transparent",
                color:text, boxShadow:`inset 0 0 0 1px ${color}`,
                clipPath:"polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 0 100%)",
                opacity: isNow || isNext ? 1 : .45 }}>
              {s}
            </span>
            {i < seq.length - 1 && (
              <span style={{ width:14, height:1, background: isNext || isNow ? TEAL : BORDER,
                opacity: isNext || isNow ? 1 : .4 }} />
            )}
          </span>
        );
      })}
    </div>
  );
}
