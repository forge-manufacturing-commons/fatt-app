// ============================================================
// FORGE HUMAN LANGUAGE — vector industrial human system.
// Original engineering glyphs. Not photography. Not clip-art.
// The reading target is Siemens / Toyota / Airbus operating
// documentation — but unmistakably African through posture, PPE
// and work discipline. Identity is not encoded in facial detail;
// it lives in tools, stance and pride of craft.
//
// Every glyph is:
//   • Vector SVG (24-unit grid, scale-free)
//   • Two-line stroke language (structural + accent)
//   • Metadata-driven (name, role, workshop, task, status)
//   • Optionally animatable via CSS state classes
//   • Uses Forge palette tokens
//
// Glyph anatomy (shared across the library):
//   Head          — 3.5 radius neutral, no facial features
//   Torso         — tapered trapezoid, PPE-visible
//   Arms          — 2-segment kinematic
//   Tool          — role-specific, rendered in Forge gold or heat
//   PPE cue       — helmet / visor / hi-vis strip / lanyard
//   Stance line   — subtle floor / bench reference
//
// Naming (Codex constitution):
//   HUM_{role}_{identity}_{pose}_{variant}_{seq}
//   examples:
//     HUM_WELDER_AFR_ACTIVE_F_0001
//     HUM_ENGINEER_AFR_REVIEW_M_0001
// ============================================================
export const HUMAN_ROLES = {
  WELDER:    { label: "Welder",              tool: "Torch",        ppe: "Helmet + visor",    accent: "heat" },
  ENGINEER:  { label: "Mechanical Engineer", tool: "Drawing",      ppe: "Hi-vis + hard hat", accent: "gold" },
  INSPECTOR: { label: "Quality Inspector",   tool: "Calipers",     ppe: "Hard hat + clip",   accent: "cyan" },
};

// Shared palette hooks (map to CSS tokens)
const ACCENT = { heat: "var(--forge-heat)", gold: "var(--forge-gold)", cyan: "var(--forge-cyan)", emerald: "var(--forge-emerald)" };
const STROKE = "var(--cream)";
const PPE_HI = "var(--forge-heat)";

// ---------- SHARED PRIMITIVES ----------
// Head, torso and stance are drawn identically across glyphs.
// This keeps the "language" recognisable — the tool and PPE change.
function Head({ cx, cy, r = 3.4 }) {
  return <circle cx={cx} cy={cy} r={r} className="glyph-stroke" />;
}
function Torso({ x, y, w = 6, h = 8, ppe = false }) {
  const half = w / 2;
  return (
    <>
      <path d={`M ${x - half} ${y} L ${x - half - 1} ${y + h} L ${x + half + 1} ${y + h} L ${x + half} ${y} Z`}
            className="glyph-stroke" />
      {ppe && <line x1={x - half - .5} y1={y + h * 0.62} x2={x + half + .5} y2={y + h * 0.62}
                    className="glyph-ppe" />}
    </>
  );
}
function StanceLine({ y = 36 }) {
  return <line x1="4" y1={y} x2="44" y2={y} className="glyph-stance" />;
}

// ---------- WELDER (Female / Male variants share torso, differ in stance width) ----------
function Welder({ variant = "F", spark = true }) {
  const stanceW = variant === "F" ? 5.5 : 6.5;
  return (
    <>
      <StanceLine />
      {/* legs */}
      <line x1="21" y1="28" x2={24 - stanceW / 2} y2="36" className="glyph-stroke" />
      <line x1="27" y1="28" x2={24 + stanceW / 2} y2="36" className="glyph-stroke" />
      {/* torso in welding stance (slight forward lean) */}
      <path d="M 20 16 L 19 28 L 29 28 L 28 16 Z" className="glyph-stroke" />
      <line x1="19.5" y1="22" x2="28.5" y2="22" className="glyph-ppe" />  {/* apron strap */}
      {/* helmet — full welding hood */}
      <path d="M 20.5 8 Q 24 4 27.5 8 L 27.5 15 L 20.5 15 Z" className="glyph-helmet" />
      <rect x="21.5" y="10" width="5" height="2" className="glyph-visor" />
      {/* torch arm — extended forward */}
      <line x1="27" y1="18" x2="34" y2="21" className="glyph-stroke" />
      <line x1="34" y1="21" x2="38" y2="18" className="glyph-stroke" />
      <rect x="37" y="16.5" width="3" height="2.5" className="glyph-tool" />
      {/* spark */}
      {spark && (
        <g className="glyph-spark">
          <circle cx="41" cy="16" r=".7" className="glyph-spark-core" />
          <line x1="40" y1="15" x2="42.5" y2="14" className="glyph-spark-ray" />
          <line x1="40.5" y1="16" x2="43" y2="16" className="glyph-spark-ray" />
          <line x1="40" y1="17" x2="42.5" y2="18" className="glyph-spark-ray" />
        </g>
      )}
    </>
  );
}

// ---------- ENGINEER — holds drawing, points at it ----------
function Engineer({ variant = "F" }) {
  const shoulderY = variant === "F" ? 15 : 14;
  return (
    <>
      <StanceLine />
      {/* legs — planted stance */}
      <line x1="22" y1="26" x2="20" y2="36" className="glyph-stroke" />
      <line x1="26" y1="26" x2="28" y2="36" className="glyph-stroke" />
      {/* torso — hi-vis waistcoat */}
      <path d="M 20 14 L 19 26 L 29 26 L 28 14 Z" className="glyph-stroke" />
      <line x1="20" y1="19" x2="28" y2="19" className="glyph-hivis" />
      <line x1="20" y1="22" x2="28" y2="22" className="glyph-hivis" />
      {/* head */}
      <Head cx={24} cy={10} r={3.2} />
      {/* hard hat */}
      <path d="M 20.5 8 Q 24 5.5 27.5 8 L 27.5 9 L 20.5 9 Z" className="glyph-helmet" />
      {/* left arm holds drawing */}
      <line x1="20" y1={shoulderY + 2} x2="15" y2="21" className="glyph-stroke" />
      <rect x="10" y="19" width="6" height="8" className="glyph-drawing" />
      <line x1="11" y1="21" x2="15" y2="21" className="glyph-drawing-mark" />
      <line x1="11" y1="23" x2="14" y2="23" className="glyph-drawing-mark" />
      <line x1="11" y1="25" x2="15" y2="25" className="glyph-drawing-mark" />
      {/* right arm points at drawing */}
      <g className="glyph-point-arm">
        <line x1="28" y1={shoulderY + 2} x2="20" y2="22" className="glyph-stroke" />
      </g>
    </>
  );
}

// ---------- INSPECTOR — reads calipers ----------
function Inspector({ variant = "F" }) {
  return (
    <>
      <StanceLine />
      <line x1="22" y1="26" x2="21" y2="36" className="glyph-stroke" />
      <line x1="26" y1="26" x2="27" y2="36" className="glyph-stroke" />
      <path d="M 20 14 L 19 26 L 29 26 L 28 14 Z" className="glyph-stroke" />
      <line x1="19.5" y1="20" x2="28.5" y2="20" className="glyph-hivis" />
      <Head cx={24} cy={10} r={3.2} />
      <path d="M 20.5 7.5 Q 24 5 27.5 7.5 L 27.5 8.5 L 20.5 8.5 Z" className="glyph-helmet" />
      {/* clipboard on left hip */}
      <rect x="12" y="20" width="5" height="7" className="glyph-drawing" />
      <line x1="14.5" y1="18.5" x2="14.5" y2="20" className="glyph-stroke" />
      <line x1="20" y1="17" x2="17" y2="21" className="glyph-stroke" />
      {/* calipers — right hand extended */}
      <g className="glyph-measure-arm">
        <line x1="28" y1="17" x2="35" y2="19" className="glyph-stroke" />
        <line x1="34" y1="17" x2="38" y2="17" className="glyph-tool" />
        <line x1="34" y1="19" x2="38" y2="19" className="glyph-tool" />
        <line x1="38" y1="16.5" x2="38" y2="19.5" className="glyph-tool" />
      </g>
    </>
  );
}

// ---------- MAIN GLYPH COMPONENT ----------
// Props:
//   role — WELDER | ENGINEER | INSPECTOR
//   variant — "F" | "M"
//   size — pixel size (default 48)
//   animate — trigger idle animation
//   metadata — { name, workshop, sme, task, status, location, availability }
//   onSelect — click handler if interactive
export function HumanGlyph({
  role = "WELDER",
  variant = "F",
  size = 48,
  animate = true,
  metadata = null,
  onSelect,
  className = "",
  title,
}) {
  const r = HUMAN_ROLES[role];
  const accessLabel = title
    || (metadata?.name ? `${metadata.name} — ${r.label}` : `${r.label} (${variant === "F" ? "female" : "male"})`);
  const Interactive = onSelect ? "button" : "span";
  return (
    <Interactive
      type={onSelect ? "button" : undefined}
      onClick={onSelect}
      className={`forge-glyph forge-glyph-${role.toLowerCase()} forge-glyph-${variant.toLowerCase()} ${animate ? "is-animate" : ""} ${className}`}
      style={{ width: size, height: size }}
      aria-label={accessLabel}
      title={accessLabel}
      data-role={role}
      data-variant={variant}
      data-workshop={metadata?.workshop}
      data-task={metadata?.task}
    >
      <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {role === "WELDER"    && <Welder    variant={variant} />}
        {role === "ENGINEER"  && <Engineer  variant={variant} />}
        {role === "INSPECTOR" && <Inspector variant={variant} />}
      </svg>
    </Interactive>
  );
}

// ---------- PANEL (for named human presence in cards) ----------
// A machined name-tag treatment for surfaces where the glyph
// stands alongside identity metadata: Build Board rows, hub panels,
// production stage cards. Reads as a fabrication-floor ID badge.
export function HumanTag({ role, variant, name, workshop, task, size = 36 }) {
  return (
    <div className="forge-humantag">
      <HumanGlyph role={role} variant={variant} size={size} animate metadata={{ name, workshop, task }} />
      <div className="forge-humantag-body">
        <div className="forge-humantag-name">{name}</div>
        <div className="forge-humantag-role">
          <span>{HUMAN_ROLES[role]?.label}</span>
          {workshop && <span className="forge-humantag-sep">·</span>}
          {workshop && <span className="forge-humantag-workshop">{workshop}</span>}
        </div>
        {task && <div className="forge-humantag-task">{task}</div>}
      </div>
    </div>
  );
}
