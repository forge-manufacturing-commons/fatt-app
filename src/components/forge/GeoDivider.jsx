// TEXTILE WEAVE DIVIDER — the interlocking rhythm of a hand-woven cloth
// abstracted into structural interface language. Two interleaved zigzag
// warps that overlap in a fine cross. Reads as woven, not printed.
// Six variants alternate via the flip prop; tone selects Forge gold or
// system cyan for section-scoped moments.
export default function GeoDivider({ flip = false, tone = "gold" }) {
  const col = tone === "cyan" ? "#0A7F73" : "#F5A623";
  const N = 30;
  const W = 900;
  const step = W / N;
  const warp = Array.from({ length: N + 1 }, (_, i) => [i * step, i % 2 === 0 ? 4 : 20]);
  const weft = Array.from({ length: N + 1 }, (_, i) => [i * step, i % 2 === 0 ? 20 : 4]);
  const toPath = pts => pts.map((p, i) => (i === 0 ? "M" : "L") + p[0] + " " + p[1]).join(" ");
  return (
    <div className={"geo-divider" + (flip ? " geo-flip" : "")} aria-hidden="true">
      <svg viewBox={`0 0 ${W} 24`} preserveAspectRatio="none">
        <path d={toPath(warp)} fill="none" stroke={col} strokeWidth="1" opacity="0.42" />
        <path d={toPath(weft)} fill="none" stroke={col} strokeWidth="1" opacity="0.22" />
        {Array.from({ length: N }, (_, i) => (
          <line key={i}
            x1={i * step + step / 2} y1="0"
            x2={i * step + step / 2} y2="24"
            stroke={col} strokeWidth="0.5" opacity="0.12" />
        ))}
      </svg>
    </div>
  );
}
