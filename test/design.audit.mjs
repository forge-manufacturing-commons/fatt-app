// ============================================================
// FORGE OS — design system audit
// Run: node test/design.audit.mjs
//
// The canonical palette is a SPECIFICATION. This audit fails if any source
// file introduces a colour that is not a Forge token. It exists because the
// codebase previously accumulated THREE competing palettes — old Forge gold
// and cyan, a legacy app.css set, and BUILD-D001 — and 430 off-palette hex
// literals before convergence.
//
// TWO METHODOLOGY DEFECTS WERE FIXED AFTER E2 (both found by measurement, not
// by reading the audit):
//
//   1. FALSE NEGATIVE — it matched only #rrggbb, so rgb()/rgba() literals
//      escaped entirely. DemoStudio carried a non-canonical
//      rgba(47,158,68,.16) through the whole of E2 while this audit reported
//      "0 violations". An audit with a known blind spot is worse than no
//      audit, because it is trusted.
//   2. FALSE POSITIVE — it scanned comments, so a colour named in prose
//      ("the old brand green was #2ecc71") would fail the build. Documenting
//      what a colour used to be is not the same as using it.
//
// Both directions now go through the shared code-only extractor, so this audit
// measures declarations rather than text. R7.
// ============================================================
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { stripComments, isCss } from "./lib/source.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const SRC = join(ROOT, "src");

// The canonical seven, plus values derived from them (never new hues).
const ALLOWED = new Set([
  "#0d0d0f", "#111418", "#1c2128", "#f5f1e9",
  "#0a7f73", "#f5a623", "#ff2e63",
  "#1a7a4a", "#8899aa", "#3a4a5a",
]);
// The same set expressed as rgb triples, so rgb()/rgba() forms of a canonical
// colour are permitted. Alpha is free: opacity is composition, not a new hue.
const ALLOWED_RGB = new Set([...ALLOWED].map((h) => {
  const n = parseInt(h.slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}));
// Neutral rgba() built from pure black or pure white is a scrim, not a hue.
// forge.js itself expresses ivory70/55/12 as rgba(245,241,233,...), which is
// canonical because 245,241,233 IS #f5f1e9 and is already in ALLOWED_RGB.
const NEUTRAL_RGB = new Set(["0,0,0", "255,255,255"]);

// forge.js IS the definition; the audit does not police the dictionary.
const EXEMPT = new Set(["src/os/forge.js"]);

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(css|js|jsx)$/.test(e)) out.push(p);
  }
  return out;
};

// WHAT IS ASSERTED VERSUS WHAT IS REPORTED.
//
// Turning on rgb()/rgba() detection surfaced 336 non-canonical colours that the
// hex-only audit never saw: the old Forge gold (212,175,55) and cyan
// (65,226,255) palettes survived the E1 hex convergence in rgba() form. So the
// "430 literals converged" result was true but incomplete — the audit had been
// measuring one notation.
//
// Two things must both stay true, and they pull in opposite directions:
//   - the blind spot must close (these colours must be detected), and
//   - the design system must not be rewritten to make an audit go green.
//
// So: ASSERT where convergence actually happened, REPORT the rest with a
// removal condition. This is the same instrument T6 used while contract
// coverage was genuinely incomplete. Nothing that previously passed now passes
// falsely; a previously invisible number is now counted and printed on every
// run. Tracked as T7 in TRANSITIONAL.md.
//
// Measured at the time of writing: src/rooms = 0 (all ten converged rooms are
// clean in every notation), non-canonical hex anywhere = 0, and the remaining
// rgba debt is concentrated in stylesheets — src/styles 257, src/os/*.css 32,
// src/components 29, src/humans 14, src/pages 4. The kernel's JS/JSX modules
// carry none of it.
const ASSERTED = (rel) => rel.startsWith("src/rooms/");

const violations = [];
const scan = (rel, text) => {
  // Code-only: a colour mentioned in a comment is documentation, not a
  // declaration. Line numbers survive because the extractor keeps newlines.
  const code = stripComments(text, { css: isCss(rel) });
  code.split("\n").forEach((line, i) => {
    // HEX — asserted everywhere. This is the original guarantee and it holds.
    for (const m of line.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
      if (!ALLOWED.has(m[0].toLowerCase())) {
        violations.push({ file: rel, line: i + 1, colour: m[0], kind: "hex" });
      }
    }
    // rgb()/rgba(), integer channels. Percentage and modern space-separated
    // syntax are not used anywhere in this codebase; if that changes, this
    // pattern must grow with it rather than silently stop matching.
    for (const m of line.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,[^)]*)?\)/g)) {
      const triple = `${m[1]},${m[2]},${m[3]}`;
      if (!ALLOWED_RGB.has(triple) && !NEUTRAL_RGB.has(triple)) {
        violations.push({ file: rel, line: i + 1, colour: m[0], kind: "rgb" });
      }
    }
  });
};

/** Split into what fails the build and what is carried as tracked debt (T7). */
const partition = () => {
  const asserted = violations.filter((v) => v.kind === "hex" || ASSERTED(v.file));
  const tracked = violations.filter((v) => !(v.kind === "hex" || ASSERTED(v.file)));
  const byArea = {};
  for (const v of tracked) {
    const a = v.file.startsWith("src/os/") ? "src/os"
      : v.file.startsWith("src/styles/") ? "src/styles"
      : v.file.startsWith("src/components/") ? "src/components"
      : v.file.startsWith("src/humans/") ? "src/humans"
      : v.file.startsWith("src/pages/") ? "src/pages" : "other";
    byArea[a] = (byArea[a] || 0) + 1;
  }
  return { asserted, tracked, byArea };
};

for (const file of walk(SRC)) {
  const rel = relative(ROOT, file).split("\\").join("/");
  if (EXEMPT.has(rel)) continue;
  scan(rel, readFileSync(file, "utf8"));
}

// ---------- ADVERSARIAL SELF-TEST ----------
// The audit must reject rogue colour in every supported form, accept canonical
// colour in every supported form, and ignore all of it inside comments.
const selfTest = () => {
  const probe = (src, opts = {}) => {
    const saved = violations.length;
    const code = stripComments(src, opts);
    let hits = 0;
    code.split("\n").forEach((line) => {
      for (const m of line.matchAll(/#[0-9a-fA-F]{6}\b/g)) if (!ALLOWED.has(m[0].toLowerCase())) hits++;
      for (const m of line.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,[^)]*)?\)/g)) {
        const t = `${m[1]},${m[2]},${m[3]}`;
        if (!ALLOWED_RGB.has(t) && !NEUTRAL_RGB.has(t)) hits++;
      }
    });
    violations.length = saved;
    return hits;
  };
  const cases = [
    // must be CLEAN
    ["canonical token",              "color: var(--forge-teal);",              0],
    ["canonical hex",                "color: #0A7F73;",                       0],
    ["canonical hex as rgb()",       "color: rgb(10, 127, 115);",             0],
    ["canonical ivory as rgba()",    "color: rgba(245,241,233,0.70);",        0],
    ["neutral white scrim",          "background: rgba(255,255,255,.06);",    0],
    ["neutral black scrim",          "background: rgba(0,0,0,.5);",           0],
    // must be VIOLATIONS
    ["rogue hex",                    "color: #2ecc71;",                       1],
    ["rogue rgb()",                  "color: rgb(112, 72, 232);",             1],
    ["rogue rgba()",                 "color: rgba(47,158,68,.16);",           1],
    // must be CLEAN because they are prose, not declarations
    ["rogue hex in a line comment",  "// used to be #2ecc71\ncolor: var(--forge-teal);", 0],
    ["rogue rgba in a block comment","/* was rgba(47,158,68,.16) */\ncolor: var(--forge-pink);", 0],
    ["rogue rgb in a JSX comment",   "{/* rgb(112,72,232) */}\n<Panel />",    0],
    ["rogue hex in a CSS comment",   "/* old #2ecc71 */ a{ color:#0A7F73; }", 0],
  ];
  const wrong = cases
    .filter(([, src, expected]) => probe(src, { css: false }) !== expected)
    .map(([name]) => name);
  return wrong;
};

console.log("\nFORGE OS — design system audit\n");

const wrong = selfTest();
if (wrong.length) {
  console.log(`  FAIL audit self-test: ${wrong.length} case(s) misbehaved`);
  for (const w of wrong) console.log(`       ${w}`);
  console.log("");
  process.exit(1);
}
console.log(`  ok   audit self-test: 13 cases — hex, rgb(), rgba(), and prose`);

const { asserted, tracked, byArea } = partition();

if (asserted.length === 0) {
  console.log(`  ok   no non-canonical hex anywhere in src/ (${ALLOWED.size} tokens permitted)`);
  console.log(`  ok   converged rooms are canonical in every notation (src/rooms: 0)`);
} else {
  console.log(`  FAIL ${asserted.length} non-canonical colour(s) on the asserted surface:\n`);
  for (const v of asserted.slice(0, 40)) console.log(`       ${v.colour}  ${v.file}:${v.line}`);
  console.log("\n  Use a token from src/os/forge.js. If a new hue is genuinely");
  console.log("  required, it must be added to the canonical palette first.\n");
  process.exit(1);
}

// Reported, not asserted — visible on every run so it cannot be forgotten.
if (tracked.length) {
  console.log(`\n  LEGACY COLOUR DEBT (T7): ${tracked.length} non-canonical rgb()/rgba() literal(s)`);
  for (const [a, n] of Object.entries(byArea).sort((x, y) => y[1] - x[1])) {
    console.log(`     ${String(n).padStart(4)}  ${a}`);
  }
  console.log("     Detected, not asserted. Stylesheet-only; the old Forge gold");
  console.log("     (212,175,55) and cyan (65,226,255) palettes in rgba() form.");
  console.log("     Removal condition: see T7 in TRANSITIONAL.md.");
}
console.log("");
process.exit(0);
