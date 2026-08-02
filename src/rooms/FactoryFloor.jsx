// ============================================================
// FORGE OS — FACTORY FLOOR  (living background)
//
// An engineered, animated line-art scene: a gantry crane traversing
// with a load bobbing, a welder throwing an arc and sparks, an
// inspector taking a caliper measurement, a conveyor carrying parts,
// and gears turning. Motion communicates machine behaviour — no
// particles, no glows. Teal line-work, Amber for heat/measurement,
// on Forge Black. Pure SVG/SMIL — no dependencies.
// ============================================================

const TEAL = "#0A7F73";
const AMBER = "#F5A623";
const IVORY = "#F5F1E9";
const FAINT = "rgba(10,127,115,0.35)";

// A simple stick worker with a helmet — readable at background scale.
function Worker({ x, y, s = 1, tealStroke = TEAL }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={tealStroke} strokeWidth="2" strokeLinecap="round">
      {/* helmet */}
      <path d="M-9 -46 a9 9 0 0 1 18 0 l0 4 l-18 0 z" fill={AMBER} stroke="none" opacity="0.9" />
      <circle cx="0" cy="-42" r="8" />
      {/* torso + legs */}
      <path d="M0 -34 L0 -12 M0 -12 L-8 6 M0 -12 L8 6" />
    </g>
  );
}

export default function FactoryFloor() {
  return (
    <svg viewBox="0 0 1200 420" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"
         role="img" aria-label="Live factory floor — crane, welding, inspection, conveyor">
      {/* ---- coordinate floor grid (perspective-ish) ---- */}
      <g stroke={FAINT} strokeWidth="1">
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={"v" + i} x1={100 * i} y1="0" x2={100 * i} y2="420" opacity="0.5" />
        ))}
        {[300, 340, 380, 420].map((yy, i) => (
          <line key={"h" + i} x1="0" y1={yy} x2="1200" y2={yy} opacity="0.5" />
        ))}
      </g>

      {/* ---- structural gantry ---- */}
      <g stroke={TEAL} strokeWidth="3" fill="none" opacity="0.75">
        <line x1="120" y1="60" x2="120" y2="300" />
        <line x1="1080" y1="60" x2="1080" y2="300" />
        <line x1="110" y1="66" x2="1090" y2="66" />
        <line x1="110" y1="78" x2="1090" y2="78" />
      </g>
      {/* rail travelling indicator dots */}
      {[0, 1, 2].map((i) => (
        <circle key={"rd" + i} r="2.5" fill={AMBER} opacity="0.8">
          <animateMotion dur="6s" begin={`${i * 2}s`} repeatCount="indefinite" path="M120 72 H 1080" />
        </circle>
      ))}

      {/* ---- gantry crane trolley (traverses) ---- */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          values="0 0; 760 0; 0 0" keyTimes="0;0.5;1" dur="16s" repeatCount="indefinite" calcMode="spline"
          keySplines="0.45 0 0.2 1; 0.45 0 0.2 1" />
        {/* trolley body */}
        <rect x="150" y="70" width="60" height="26" fill="none" stroke={AMBER} strokeWidth="2" />
        {/* hook + load bobbing */}
        <g>
          <animateTransform attributeName="transform" type="translate"
            values="0 0; 0 46; 0 0" keyTimes="0;0.5;1" dur="4.5s" repeatCount="indefinite" calcMode="spline"
            keySplines="0.4 0 0.3 1; 0.4 0 0.3 1" />
          <line x1="180" y1="96" x2="180" y2="150" stroke={TEAL} strokeWidth="2" />
          {/* the load — a cut-corner steel part */}
          <path d="M162 150 h30 l6 6 v22 h-42 v-28 z" fill="none" stroke={AMBER} strokeWidth="2" />
          <circle cx="180" cy="150" r="3" fill={AMBER} />
        </g>
      </g>

      {/* ---- WELDING station ---- */}
      <g transform="translate(250 300)">
        {/* bench */}
        <path d="M-70 0 h140 M-60 0 v22 M60 0 v22" stroke={TEAL} strokeWidth="2" fill="none" />
        {/* workpiece */}
        <rect x="-30" y="-14" width="60" height="14" fill="none" stroke={TEAL} strokeWidth="2" />
        {/* welder */}
        <Worker x="-40" y="-14" s="1" />
        {/* torch arm to the joint */}
        <line x1="-40" y1="-26" x2="-4" y2="-14" stroke={AMBER} strokeWidth="2" />
        {/* the arc — flashes */}
        <circle cx="-2" cy="-14" r="6" fill={AMBER}>
          <animate attributeName="opacity" values="0;1;0.2;1;0.1" dur="0.45s" repeatCount="indefinite" />
          <animate attributeName="r" values="4;7;4" dur="0.45s" repeatCount="indefinite" />
        </circle>
        {/* sparks */}
        {[[-2, -14, 16, 8], [-2, -14, 20, -4], [-2, -14, 10, 14], [-2, -14, 24, 2]].map((s, i) => (
          <line key={"sp" + i} x1={s[0]} y1={s[1]} x2={s[0] + s[2]} y2={s[1] + s[3]} stroke={AMBER} strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0;1;0" dur="0.5s" begin={`${i * 0.12}s`} repeatCount="indefinite" />
          </line>
        ))}
        <text x="-70" y="44" fontFamily="'Sora', sans-serif" fontSize="11" fontWeight="600" letterSpacing="0.14em" fill={IVORY} opacity="0.5">WELD · WARRI</text>
      </g>

      {/* ---- INSPECTION station ---- */}
      <g transform="translate(720 300)">
        {/* pedestal + part being measured */}
        <path d="M-14 0 h28 M0 0 v-16" stroke={TEAL} strokeWidth="2" fill="none" />
        <circle cx="0" cy="-28" r="14" fill="none" stroke={TEAL} strokeWidth="2" />
        {/* inspector */}
        <Worker x="60" y="-14" s="1" />
        {/* caliper measuring the part — jaws open & close */}
        <g stroke={AMBER} strokeWidth="2" fill="none">
          <line x1="-22" y1="-46" x2="22" y2="-46" />
          <line x1="-16" y1="-46" x2="-16" y2="-30">
            <animate attributeName="x1" values="-16;-14;-16" dur="3s" repeatCount="indefinite" />
            <animate attributeName="x2" values="-16;-14;-16" dur="3s" repeatCount="indefinite" />
          </line>
          <line x1="16" y1="-46" x2="16" y2="-30">
            <animate attributeName="x1" values="16;14;16" dur="3s" repeatCount="indefinite" />
            <animate attributeName="x2" values="16;14;16" dur="3s" repeatCount="indefinite" />
          </line>
        </g>
        {/* measurement readout */}
        <text x="34" y="-52" fontFamily="'Sora', sans-serif" fontSize="12" fontWeight="700" fill={AMBER}>
          Ø 82.
          <tspan>
            <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />4
          </tspan>
        </text>
        <text x="-40" y="44" fontFamily="'Sora', sans-serif" fontSize="11" fontWeight="600" letterSpacing="0.14em" fill={IVORY} opacity="0.5">INSPECT · LAGOS</text>
      </g>

      {/* ---- CONVEYOR ---- */}
      <g transform="translate(0 392)">
        <line x1="900" y1="0" x2="1180" y2="0" stroke={TEAL} strokeWidth="2" />
        {[920, 960, 1000, 1040, 1080, 1120, 1160].map((cxp, i) => (
          <circle key={"rl" + i} cx={cxp} cy="8" r="6" fill="none" stroke={FAINT} strokeWidth="1.5" />
        ))}
        {[0, 1, 2].map((i) => (
          <g key={"pt" + i}>
            <animateMotion dur="6s" begin={`${i * 2}s`} repeatCount="indefinite" path="M900 -8 H 1180" />
            <path d="M0 0 h18 l4 4 v10 h-22 z" fill="none" stroke={AMBER} strokeWidth="2" transform="translate(-11 -14)" />
          </g>
        ))}
      </g>

      {/* ---- GEARS ---- */}
      {[{ cx: 1000, cy: 150, r: 22, dur: 8, dir: 1 }, { cx: 1044, cy: 182, r: 16, dur: 6, dir: -1 }].map((g, gi) => (
        <g key={"g" + gi}>
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${g.cx} ${g.cy}`} to={`${g.dir * 360} ${g.cx} ${g.cy}`} dur={`${g.dur}s`} repeatCount="indefinite" />
          <circle cx={g.cx} cy={g.cy} r={g.r} fill="none" stroke={TEAL} strokeWidth="2" />
          <circle cx={g.cx} cy={g.cy} r={g.r * 0.35} fill="none" stroke={TEAL} strokeWidth="2" />
          {Array.from({ length: 8 }).map((_, t) => {
            const a = (t / 8) * Math.PI * 2;
            return (
              <line key={t}
                x1={g.cx + Math.cos(a) * g.r} y1={g.cy + Math.sin(a) * g.r}
                x2={g.cx + Math.cos(a) * (g.r + 6)} y2={g.cy + Math.sin(a) * (g.r + 6)}
                stroke={TEAL} strokeWidth="2" />
            );
          })}
        </g>
      ))}

      {/* ---- registration marks (geometry system, amber) ---- */}
      {[[16, 16], [1184, 16], [16, 404], [1184, 404]].map(([mx, my], i) => (
        <g key={"reg" + i} stroke={AMBER} strokeWidth="1" opacity="0.6">
          <line x1={mx - 10} y1={my} x2={mx + 10} y2={my} />
          <line x1={mx} y1={my - 10} x2={mx} y2={my + 10} />
        </g>
      ))}
    </svg>
  );
}
