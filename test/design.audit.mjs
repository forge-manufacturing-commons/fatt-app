// ============================================================
// FORGE OS — design system audit
// Run: node test/design.audit.mjs
//
// The canonical palette is a SPECIFICATION. This audit fails if any source
// file introduces a colour that is not a Forge token. It exists because the
// codebase previously accumulated THREE competing palettes — old Forge gold
// and cyan, a legacy app.css set, and BUILD-D001 — and 430 off-palette hex
// literals before convergence.
// ============================================================
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const SRC = join(ROOT, "src");

// The canonical seven, plus values derived from them (never new hues).
const ALLOWED = new Set([
  "#0d0d0f", "#111418", "#1c2128", "#f5f1e9",
  "#0a7f73", "#f5a623", "#ff2e63",
  "#1a7a4a", "#8899aa", "#3a4a5a",
]);
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

let violations = [];
for (const file of walk(SRC)) {
  const rel = relative(ROOT, file).split("\\").join("/");
  if (EXEMPT.has(rel)) continue;
  const text = readFileSync(file, "utf8");
  text.split("\n").forEach((line, i) => {
    for (const m of line.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
      if (!ALLOWED.has(m[0].toLowerCase())) {
        violations.push({ file: rel, line: i + 1, colour: m[0] });
      }
    }
  });
}

console.log("\nFORGE OS — design system audit\n");
if (violations.length === 0) {
  console.log(`  ok   every colour in src/ is a canonical Forge token`);
  console.log(`  ok   ${ALLOWED.size} tokens permitted, 0 violations\n`);
  process.exit(0);
}
console.log(`  FAIL ${violations.length} non-canonical colour(s):\n`);
for (const v of violations.slice(0, 40)) console.log(`       ${v.colour}  ${v.file}:${v.line}`);
console.log("\n  Use a token from src/os/forge.js. If a new hue is genuinely");
console.log("  required, it must be added to the canonical palette first.\n");
process.exit(1);
