// ============================================================
// FORGE OS — kernel convergence audit
// Run: node test/kernel.audit.mjs
//
// The two-question test: every canonical concept needs a single source AND
// an automated audit. This file is the audit for four of them.
//
// It exists because a design system was built and then not adopted: RoomShell
// had zero consumers, stateColor had zero consumers, and five competing
// state-colour maps stayed live. Nothing caught it, because nothing checked
// ADOPTION. Existence is not adoption.
// ============================================================
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, basename } from "node:path";
import { EVENT_TYPES } from "../src/os/events.js";
import { PRINCIPLES } from "../src/os/forge.js";
import { ROOMS } from "../src/os/ForgeOS.js";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const rel = (p) => relative(ROOT, p).split("\\").join("/");
const walk = (dir, out = []) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(js|jsx)$/.test(e)) out.push(p);
  }
  return out;
};
const files = walk(join(ROOT, "src")).map((p) => ({ path: rel(p), text: readFileSync(p, "utf8") }));

let pass = 0, fail = 0;
const ok = (n, c, detail) => {
  if (c) { pass++; console.log(`  ok   ${n}`); }
  else { fail++; console.log(`  FAIL ${n}`); if (detail) console.log(`       ${detail}`); }
};

console.log("\nFORGE OS — kernel convergence audit\n");

// ---------- 1. EVENT VOCABULARY ----------
// Fails if a source file invents an event type that is not canonical.
const CANONICAL = new Set(Object.values(EVENT_TYPES).flatMap((d) => Object.values(d)));
const LEGACY = new Set(["drawing.approved","component.received","inspection.completed",
  "machine.started","machine.stopped","quality.verified","shipment.dispatched","maintenance.opened",
  "system.language.changed","identity.registered","identity.welcome"]);
const EXEMPT_EVENT = new Set(["src/os/events.js","src/os/projections.js","src/os/ActivityEngine.jsx"]);
const invented = [];
for (const f of files) {
  if (EXEMPT_EVENT.has(f.path)) continue;
  for (const m of f.text.matchAll(/type:\s*["']([a-z][a-z0-9]*(?:\.[a-z0-9]+)+)["']/g)) {
    const t = m[1];
    if (!CANONICAL.has(t) && !LEGACY.has(t) && !t.startsWith("system.")) invented.push(`${t} (${f.path})`);
  }
}
ok(`event vocabulary: no invented types (${CANONICAL.size} canonical)`, invented.length === 0,
   invented.slice(0, 6).join(", "));

// ---------- 2. STATE -> COLOUR ----------
// Fails if a room keeps its own status-colour map instead of stateColor().
const EXEMPT_COLOUR = new Set(["src/os/forge.js"]);
const rogueMaps = files.filter((f) => !EXEMPT_COLOUR.has(f.path) &&
  /const\s+[A-Z_]*(STATE|STATUS|HUB|HEALTH|VER)_COLOR\s*=\s*\{/.test(f.text)).map((f) => f.path);
ok("state-to-colour: stateColor() is the only mapping", rogueMaps.length === 0, rogueMaps.join(", "));
const stateColorUsers = files.filter((f) => f.path !== "src/os/forge.js" && /stateColor\s*\(/.test(f.text));
ok("state-to-colour: stateColor() is actually adopted", stateColorUsers.length >= 4,
   `${stateColorUsers.length} consumer(s)`);

// ---------- 3. PALETTE OWNERSHIP ----------
// Fails if any file other than the token module defines the palette.
const paletteOwners = files.filter((f) => f.path !== "src/os/forge.js" &&
  /const\s+BLACK\s*=\s*["']#/.test(f.text)).map((f) => f.path);
ok("palette: only the token module defines colours", paletteOwners.length === 0, paletteOwners.join(", "));

// ---------- 4. OPERATING PRINCIPLES ----------
const operational = ROOMS.filter((r) => r.status === "operational");
const missing = operational.filter((r) => !PRINCIPLES[r.id]).map((r) => r.id);
ok(`principles: every operational room declares one (${operational.length} rooms)`,
   missing.length === 0, missing.join(", "));
const shellUsers = files.filter((f) => f.path.startsWith("src/rooms/") && /RoomShell/.test(f.text));
ok("principles: displayed via RoomShell, not per-room markup", shellUsers.length >= 2,
   `${shellUsers.length} room(s) adopt RoomShell`);

// ---------- 5. PROJECTION DISCIPLINE (semantic, not syntactic) ----------
// The old check asked whether a room APPEARED to own manufacturing state.
// That was a heuristic with false negatives. The real guarantee is structural:
// project() returns a deep-frozen object, so a room CANNOT own manufacturing
// state — the write is refused at runtime. This audit verifies the guarantee
// still holds rather than trying to out-guess the syntax.
const projSrc = files.find((f) => f.path === "src/os/projections.js").text;
ok("projections: the fold is returned deep-frozen (read-only by construction)",
   /deepFreeze\(\{/.test(projSrc) && /Object\.freeze\(o\)/.test(projSrc));
const localState = files.filter((f) => f.path.startsWith("src/rooms/") &&
  /const\s*\[\s*(specs|components|missions|machines|hubStates)\s*,/.test(f.text)).map((f) => f.path);
ok("projections: no room stores manufacturing state locally", localState.length === 0,
   localState.join(", "));

// ---------- 6. TYPOGRAPHY ----------
// One question: does every room heading use the canonical display token?
const roomFiles = files.filter((f) => f.path.startsWith("src/rooms/"));
const rogueHeadings = roomFiles.filter((f) =>
  /font-?[Ff]amily\s*[:=]\s*["'](?!var\(--forge)/.test(f.text) ||
  /fontFamily:\s*["'](?!var\(--forge)/.test(f.text)).map((f) => f.path);
ok("typography: room headings use the canonical display token", rogueHeadings.length === 0,
   rogueHeadings.join(", "));

// ---------- 6b. MOTION DISCIPLINE ----------
// Motion must mean manufacturing. An "infinite" animation in a room is
// decorative by definition, and the brief forbids it.
const roomFiles2 = files.filter((f) => f.path.startsWith("src/rooms/"));
const idleMotion = roomFiles2.filter((f) => /animation:[^;"`]*infinite/.test(f.text))
  .map((f) => basename(f.path));
ok("motion: no room runs a looping animation", idleMotion.length === 0, idleMotion.join(", "));

// Change indication and ripple pulses are kernel behaviour. A room implementing
// its own would mean the primitive is not actually inherited.
const rogueDelta = roomFiles2.filter((f) => /useDelta\s*\(|animateMotion/.test(f.text))
  .map((f) => basename(f.path));
ok("motion: change indication and pulses are inherited, not re-implemented",
   rogueDelta.length === 0, rogueDelta.join(", "));

// ---------- 6c. KERNEL FREEZE (D.2.1) ----------
// The kernel is frozen as of D.2.1. This records the primitive surface so a
// new one cannot be added quietly during product convergence. Growing this
// list is an architecture decision, not an implementation detail.
const FROZEN_PRIMITIVES = [
  "RoomShell","Label","Panel","Badge","Button","Stat","NetworkSurface",
  "Recommendation","useDelta","CausalChain","CausalInspector",
  "ConsequenceDeparture","useCausalInspector","OperationsFeed","StateGraph",
  "RippleIndicator","useEventRipple","useRippleListener","notifyRipple",
];
const kernelExports = files
  .filter((f) => /^src\/os\/(console\.jsx|causality\/CausalChain\.jsx|ripple\/[^/]+\.jsx?|OperationsFeed\.jsx|StateGraph\.jsx)$/.test(f.path))
  .flatMap((f) => [...f.text.matchAll(/export (?:default )?function (\w+)/g)].map((m) => m[1]));
const added = kernelExports.filter((e) => !FROZEN_PRIMITIVES.includes(e));
ok(`kernel freeze: primitive surface unchanged (${FROZEN_PRIMITIVES.length} frozen)`,
   added.length === 0, added.length ? `new: ${added.join(", ")} — requires architecture review` : "");

// ---------- 7. PLATFORM CONTRACT ----------
// Compliance is verified from each room's OWN declaration, not from a list
// maintained here. A hardcoded list silently omits new rooms; a declaration
// cannot, because the audit also fails a room that declares nothing.
//
// Crucially the audit does not TRUST the declaration — it checks each claim
// against the source. A room that claims roomShell:true without importing
// RoomShell fails. Self-description is not self-certification.
const CLAIM_EVIDENCE = {
  roomShell:       (t) => /RoomShell/.test(t),
  principle:       (t) => /RoomShell|PRINCIPLES/.test(t),
  feed:            (t) => /OperationsFeed/.test(t),
  recommendations: (t) => /recommendations/.test(t),
  stateEngine:     (t) => /State\.(next|transitions|impossible)|specificationState|componentState/.test(t),
  rules:           (t) => /Rules\.(evaluate|assert)|engineeringRules|productionRules/.test(t),
  policy:          (t) => /createPolicy|requireActor/.test(t),
};
const PROJECTION_EVIDENCE = {
  manufacturing: (t) => /project\(/.test(t),
  knowledge:     (t) => /translations|SUPPORTED_LANGUAGES/.test(t),
  // "activity" — operational state folded from the event log by the BUS rather
  // than by projections.js. A legitimate fourth category, deliberately built to
  // be HARDER to claim than the others so it cannot become a loophole:
  //   1. must actually call useForgeActivity()
  //   2. must consume derived operational state from it, not merely import it
  //   3. must NOT keep an independent local copy of that state
  //   4. must NOT publish machine-bearing events merely to feed its own screen
  activity: (t) =>
    /useForgeActivity\s*\(/.test(t) &&
    /\b(machineStates|hubStates|log)\b/.test(t) &&
    !/const\s*\[\s*(machineStates|hubStates|machines)\s*,/.test(t) &&
    !/publish\(\s*\{[^}]*machine/.test(t),
  // A room may honestly declare that it derives nothing — a thin wrapper that
  // mounts a screen holds no manufacturing state and should say so.
  none:          () => true,
};

// ---------- ADVERSARIAL SELF-TEST ----------
// A new audit category must be able to reject work that merely claims it. These
// synthetic sources exercise the four conditions above. If any passes, the
// category is a loophole and this audit fails.
{
  const A = PROJECTION_EVIDENCE.activity;
  const cases = [
    ["claims activity without calling the hook",
      'import { useForgeActivity } from "x"; const line = ["a"]; export default function R(){ return null; }', false],
    ["calls the hook but consumes nothing derived",
      'const x = useForgeActivity(); export default function R(){ return null; }', false],
    ["keeps an independent local copy of machine state",
      'const { machineStates } = useForgeActivity(); const [machineStates2] = useState({}); const [machineStates, setM] = useState({});', false],
    ["publishes machine-bearing events to feed its own screen",
      'const { machineStates, publish } = useForgeActivity(); publish({ machine: "m1", type: "machine.start" });', false],
    ["genuinely derives operational state from the bus",
      'const { machineStates } = useForgeActivity(); const active = line.filter(m => machineStates[m] === "active").length;', true],
  ];
  const wrong = cases.filter(([, srcText, expected]) => A(srcText) !== expected).map(([name]) => name);
  ok(`projection "activity" cannot be claimed falsely (${cases.length} adversarial cases)`,
     wrong.length === 0, wrong.join("; "));
}

// A room is routable if App.jsx imports it from ./rooms. Scoping to the
// registry rather than the directory is what makes the compliance number mean
// something: an unreferenced component in src/rooms is not a failing room.
const appSrc = files.find((f) => f.path === "src/App.jsx").text;
const routable = new Set([...appSrc.matchAll(/from "\.\/rooms\/([A-Za-z]\w*)\.jsx"/g)]
  .map((m) => `src/rooms/${m[1]}.jsx`));
const roomSources = files.filter((f) => routable.has(f.path));
const declared = roomSources.filter((f) => /export const CONTRACT\s*=/.test(f.text));
// COVERAGE IS REPORTED, NOT ASSERTED — tracked as T6 in TRANSITIONAL.md with an
// explicit removal condition. E2 exists to close this; the number must stay
// visible in the meantime rather than being hidden behind a passing suite or
// faked with six hollow declarations.
const outstanding = roomSources.filter((f) => !/export const CONTRACT/.test(f.text))
  .map((f) => basename(f.path));
console.log(`\n  \u26A0 CONVERGENCE (T6): ${declared.length}/${roomSources.length} routable rooms under contract`);
if (outstanding.length) console.log(`     outstanding: ${outstanding.join(", ")}`);
ok("platform contract: every declared contract is structurally valid",
   declared.every((f) => /roomId:\s*["']/.test(f.text)));

console.log("\n  Platform contract compliance (verified against source)");
let breaches = [];
for (const f of declared) {
  const block = f.text.slice(f.text.indexOf("export const CONTRACT"));
  const body = block.slice(0, block.indexOf("};") + 2);
  const marks = [];
  for (const [claim, evidence] of Object.entries(CLAIM_EVIDENCE)) {
    const claimed = new RegExp(`${claim}:\\s*true`).test(body);
    if (!claimed) continue;
    const honoured = evidence(f.text);
    marks.push(`${honoured ? "\u2713" : "\u2717"} ${claim}`);
    if (!honoured) breaches.push(`${basename(f.path)} claims ${claim} but the source does not honour it`);
  }
  // Declared exceptions are legitimate, but they are printed so an exception
  // can never quietly become the norm.
  const waived = Object.keys(CLAIM_EVIDENCE).filter((k) =>
    new RegExp(`${k}:\\s*false`).test(body));
  if (waived.length) marks.push(`\u2296 ${waived.join(" ")}`);

  const projM = body.match(/projection:\s*["'](\w+)["']/);
  if (projM) {
    const test = PROJECTION_EVIDENCE[projM[1]];
    const honoured = test ? test(f.text) : false;
    marks.push(`${honoured ? "\u2713" : "\u2717"} projection:${projM[1]}`);
    if (!honoured) breaches.push(`${basename(f.path)} claims projection "${projM[1]}" without deriving it`);
  }
  console.log(`       ${basename(f.path).padEnd(20)} ${marks.join("  ")}`);
}
ok("platform contract: every claim is honoured by the source", breaches.length === 0,
   breaches.join("; "));

// Rooms that are registered and operational but declare no contract are
// reported honestly rather than quietly excluded from the score.
const undeclared = roomSources.filter((f) => !/export const CONTRACT/.test(f.text)).map((f) => basename(f.path));
console.log(`\n  Routable rooms: ${roomSources.length} · under contract: ${declared.length}`);
console.log(`  Not yet under contract: ${undeclared.length ? undeclared.join(", ") : "none"}`);

console.log(`\n${pass}/${pass + fail} audits passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
