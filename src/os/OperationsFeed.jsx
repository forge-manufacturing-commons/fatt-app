// ============================================================
// FORGE OS — OPERATIONS FEED
// Not a log. An operator reads the act, the object and the person; the
// event type is metadata, shown small. "inspection.completed" tells a
// developer something. "Inspection passed / COMP-001 / Amina Suleiman"
// tells the factory something.
// ============================================================
const IVORY="#F5F1E9", TEAL="#0A7F73", AMBER="#F5A623", PINK="#FF2E63";
const BORDER="#1C2128", MUTED="#8899aa", GREEN="#1a7a4a";
const UI="var(--forge-brand-font, 'Poppins', system-ui, sans-serif)";
const MONO="var(--forge-mono, ui-monospace, monospace)";

const tone = (row) => {
  if (/fault|failed|blocked/i.test(row.type)) return PINK;
  if (/passed|verified|approved|released/i.test(row.type)) return GREEN;
  if (/maintenance|revised/i.test(row.type)) return AMBER;
  return TEAL;
};
const clock = (at) => {
  try { return new Date(at).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", second:"2-digit" }); }
  catch { return ""; }
};

export default function OperationsFeed({ rows = [], limit = 12, empty = "No operations recorded yet." }) {
  if (!rows.length) {
    return <div style={{ fontFamily:UI, fontSize:12.5, color:MUTED, fontStyle:"italic" }}>{empty}</div>;
  }
  return (
    <div>
      {rows.slice(0, limit).map((r, i) => {
        const c = tone(r);
        return (
          <div key={`${r.at}-${i}`} style={{ display:"flex", gap:12, padding:"10px 0",
            borderBottom:`1px solid ${BORDER}`, alignItems:"flex-start" }}>
            <span style={{ width:3, alignSelf:"stretch", background:c, flexShrink:0 }} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", justifyContent:"space-between", gap:10, alignItems:"baseline" }}>
                <span style={{ fontFamily:UI, fontWeight:700, fontSize:13, color:IVORY }}>{r.title}</span>
                <span style={{ fontFamily:MONO, fontSize:10, color:MUTED, whiteSpace:"nowrap" }}>{clock(r.at)}</span>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginTop:4, alignItems:"baseline" }}>
                {r.subject && <span style={{ fontFamily:MONO, fontSize:11.5, color:c }}>{r.subject}</span>}
                {r.result && <span style={{ fontFamily:UI, fontWeight:600, fontSize:10,
                  letterSpacing:"0.12em", textTransform:"uppercase", color:c }}>{r.result}</span>}
                {r.actor && <span style={{ fontFamily:UI, fontSize:11.5, color:"rgba(245,241,233,.75)" }}>{r.actor}</span>}
                {r.hub && <span style={{ fontFamily:UI, fontSize:10.5, color:MUTED }}>{String(r.hub).toUpperCase()}</span>}
              </div>
              <div style={{ fontFamily:MONO, fontSize:9.5, color:MUTED, marginTop:5, opacity:.75 }}>{r.type}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
