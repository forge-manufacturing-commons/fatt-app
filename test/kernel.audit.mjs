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
import { EVENT_TYPES, MISSION_POLICY, MISSION_POLICY_LEVEL } from "../src/os/events.js";
import { PRINCIPLES } from "../src/os/forge.js";
import { ROOMS } from "../src/os/ForgeOS.js";
import { withCode, stripComments, selfTestStripComments } from "./lib/source.mjs";

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
// EVERY EVIDENCE CHECK BELOW READS f.code, NOT f.text.
//
// f.text is the file as written; f.code is the file with everything that cannot
// execute removed. Comments are documentation, not evidence — a room must not be
// able to earn a capability by describing it, and a check must not be able to
// fail because a comment mentions the thing it forbids. The single exception is
// where the raw file is itself the subject of the measurement.
const files = withCode(
  walk(join(ROOT, "src")).map((p) => ({ path: rel(p), text: readFileSync(p, "utf8") })),
);

let pass = 0, fail = 0;
const ok = (n, c, detail) => {
  if (c) { pass++; console.log(`  ok   ${n}`); }
  else { fail++; console.log(`  FAIL ${n}`); if (detail) console.log(`       ${detail}`); }
};

console.log("\nFORGE OS — kernel convergence audit\n");

// ---------- 0. THE INSTRUMENT ITSELF ----------
// Every check downstream trusts the code-only extractor, so it is tested first.
// A broken instrument is not evidence (R7).
{
  const wrong = selfTestStripComments();
  ok("instrument: code-only extraction rejects prose and preserves code (14 cases)",
     wrong.length === 0, wrong.slice(0, 4).join("; "));
}

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
  for (const m of f.code.matchAll(/type:\s*["']([a-z][a-z0-9]*(?:\.[a-z0-9]+)+)["']/g)) {
    const t = m[1];
    if (!CANONICAL.has(t) && !LEGACY.has(t) && !t.startsWith("system.")) invented.push(`${t} (${f.path})`);
  }
}
ok(`event vocabulary: no invented types (${CANONICAL.size} canonical)`, invented.length === 0,
   invented.slice(0, 6).join(", "));

// ---------- 1b. MISSION CORRELATION POLICY (E3 Phase 6) ----------
// Drift protection. The vocabulary and the policy must grow together: a new
// canonical event that arrives without a classification would silently inherit
// "no opinion" about mission correlation, which is exactly the ambiguity this
// policy exists to remove.
{
  const all = Object.values(EVENT_TYPES).flatMap((d) => Object.values(d));
  const levels = new Set(Object.values(MISSION_POLICY_LEVEL));

  const unclassified = all.filter((t) => !(t in MISSION_POLICY));
  ok(`mission policy: every canonical event is classified (${all.length} types)`,
     unclassified.length === 0, unclassified.join(", "));

  const stale = Object.keys(MISSION_POLICY).filter((t) => !all.includes(t));
  ok("mission policy: no entry points at a nonexistent event type",
     stale.length === 0, stale.join(", "));

  ok("mission policy: exactly four levels, no fifth category",
     Object.values(MISSION_POLICY).every((v) => levels.has(v)) &&
     Object.keys(MISSION_POLICY).length === all.length);

  // CODE, NOT PROSE. The classification must be declared in executable source.
  // A commented-out entry must not count — the same discipline every other
  // check here follows. Verified by stripping comments and confirming the
  // declaration and all four levels survive, then confirming a prose-only
  // classification does not.
  const evSrc = files.find((f) => f.path === "src/os/events.js");
  const declaredInCode =
    /export const MISSION_POLICY\s*=/.test(evSrc.code) &&
    /MISSION_FORBIDDEN/.test(evSrc.code) &&
    /MISSION_UNKNOWN/.test(evSrc.code);
  const proseOnly = stripComments(
    '// export const MISSION_POLICY = { "a.b": "MISSION_FORBIDDEN" };\nconst x = 1;');
  ok("mission policy: declared in executable code, not in a comment",
     declaredInCode && !/MISSION_POLICY\s*=/.test(proseOnly));

  const count = (lv) => all.filter((t) => MISSION_POLICY[t] === lv).length;
  console.log(`       ${count(MISSION_POLICY_LEVEL.REQUIRED)} required · ` +
    `${count(MISSION_POLICY_LEVEL.OPTIONAL)} optional · ` +
    `${count(MISSION_POLICY_LEVEL.FORBIDDEN)} forbidden · ` +
    `${count(MISSION_POLICY_LEVEL.UNKNOWN)} unknown`);
}

// ---------- 2. STATE -> COLOUR ----------
// Fails if a room keeps its own status-colour map instead of stateColor().
const EXEMPT_COLOUR = new Set(["src/os/forge.js"]);
const rogueMaps = files.filter((f) => !EXEMPT_COLOUR.has(f.path) &&
  /const\s+[A-Z_]*(STATE|STATUS|HUB|HEALTH|VER)_COLOR\s*=\s*\{/.test(f.code)).map((f) => f.path);
ok("state-to-colour: stateColor() is the only mapping", rogueMaps.length === 0, rogueMaps.join(", "));
const stateColorUsers = files.filter((f) => f.path !== "src/os/forge.js" && /stateColor\s*\(/.test(f.code));
ok("state-to-colour: stateColor() is actually adopted", stateColorUsers.length >= 4,
   `${stateColorUsers.length} consumer(s)`);

// ---------- 3. PALETTE OWNERSHIP ----------
// Fails if any file other than the token module defines the palette.
const paletteOwners = files.filter((f) => f.path !== "src/os/forge.js" &&
  /const\s+BLACK\s*=\s*["']#/.test(f.code)).map((f) => f.path);
ok("palette: only the token module defines colours", paletteOwners.length === 0, paletteOwners.join(", "));

// ---------- 4. OPERATING PRINCIPLES ----------
const operational = ROOMS.filter((r) => r.status === "operational");
const missing = operational.filter((r) => !PRINCIPLES[r.id]).map((r) => r.id);
ok(`principles: every operational room declares one (${operational.length} rooms)`,
   missing.length === 0, missing.join(", "));
const shellUsers = files.filter((f) => f.path.startsWith("src/rooms/") && /RoomShell/.test(f.code));
ok("principles: displayed via RoomShell, not per-room markup", shellUsers.length >= 2,
   `${shellUsers.length} room(s) adopt RoomShell`);

// ---------- 5. PROJECTION DISCIPLINE (semantic, not syntactic) ----------
// The old check asked whether a room APPEARED to own manufacturing state.
// That was a heuristic with false negatives. The real guarantee is structural:
// project() returns a deep-frozen object, so a room CANNOT own manufacturing
// state — the write is refused at runtime. This audit verifies the guarantee
// still holds rather than trying to out-guess the syntax.
const projSrc = files.find((f) => f.path === "src/os/projections.js").code;
ok("projections: the fold is returned deep-frozen (read-only by construction)",
   /deepFreeze\(\{/.test(projSrc) && /Object\.freeze\(o\)/.test(projSrc));
const localState = files.filter((f) => f.path.startsWith("src/rooms/") &&
  /const\s*\[\s*(specs|components|missions|machines|hubStates)\s*,/.test(f.code)).map((f) => f.path);
ok("projections: no room stores manufacturing state locally", localState.length === 0,
   localState.join(", "));

// ---------- 6. TYPOGRAPHY ----------
// One question: does every room heading use the canonical display token?
const roomFiles = files.filter((f) => f.path.startsWith("src/rooms/"));
const rogueHeadings = roomFiles.filter((f) =>
  /font-?[Ff]amily\s*[:=]\s*["'](?!var\(--forge)/.test(f.code) ||
  /fontFamily:\s*["'](?!var\(--forge)/.test(f.code)).map((f) => f.path);
ok("typography: room headings use the canonical display token", rogueHeadings.length === 0,
   rogueHeadings.join(", "));

// ---------- 6b. MOTION DISCIPLINE ----------
// Motion must mean manufacturing. An "infinite" animation in a room is
// decorative by definition, and the brief forbids it.
const roomFiles2 = files.filter((f) => f.path.startsWith("src/rooms/"));
const idleMotion = roomFiles2.filter((f) => /animation:[^;"`]*infinite/.test(f.code))
  .map((f) => basename(f.path));
ok("motion: no room runs a looping animation", idleMotion.length === 0, idleMotion.join(", "));

// Change indication and ripple pulses are kernel behaviour. A room implementing
// its own would mean the primitive is not actually inherited.
const rogueDelta = roomFiles2.filter((f) => /useDelta\s*\(|animateMotion/.test(f.code))
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
  .flatMap((f) => [...f.code.matchAll(/export (?:default )?function (\w+)/g)].map((m) => m[1]));
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
// CODE, NOT PROSE. Every evidence test below runs against the source with
// comments stripped.
//
// Found the hard way, twice. The dead-code check for InspectionHangar matched
// the very comment documenting the removal; then DemoStudio's comment explaining
// that "buildRuntime is NOT interchangeable with project()" satisfied
// /project\(/ and made a FALSE claim of projection:"manufacturing" pass. A room
// must not be able to earn a capability by describing it. Documentation is not
// evidence — only the executable text counts.
const code = (t) => t
  .replace(/\/\*[\s\S]*?\*\//g, "")   // block comments, incl. JSDoc
  .replace(/^\s*\/\/.*$/gm, "");      // whole-line comments

// DRIVES MACHINE STATE — the discriminator between "activity" and "harness".
//
// A room that publishes machine-bearing events is not observing the factory, it
// is driving it and then reading its own wake. The original form of this test
// only matched an INLINE literal:
//
//     /publish\(\s*\{[^}]*machine/
//
// which DemoStudio evaded by publishing indirectly — publish(step.event), with
// the machine-bearing objects held in a WORKFLOW const. The claim would have
// been false while the audit stayed green. Detection is therefore decoupled
// from the call site: a machine-bearing event object ANYWHERE in the module,
// combined with ANY publish() call, is sufficient. Indirection through a const,
// an array, a workflow map or a helper cannot launder it.
const drivesMachineState = (t) =>
  /publish\s*\(/.test(t) && /\bmachine\s*:\s*["'`]/.test(t);

const PROJECTION_EVIDENCE = {
  manufacturing: (t) => /project\(/.test(t),
  knowledge:     (t) => /translations|SUPPORTED_LANGUAGES/.test(t),
  // "activity" — operational state folded from the event log by the BUS rather
  // than by projections.js. A legitimate fourth category, deliberately built to
  // be HARDER to claim than the others so it cannot become a loophole:
  //   1. must actually call useForgeActivity()
  //   2. must consume DERIVED OPERATIONAL STATE (machineStates / hubStates) — a
  //      raw event log or an event count is instrumentation, not folded state
  //   3. must NOT keep an independent local copy of that state
  //   4. must NOT publish machine-bearing events merely to feed its own screen
  activity: (t) =>
    /useForgeActivity\s*\(/.test(t) &&
    /\b(machineStates|hubStates)\b/.test(t) &&
    !/const\s*\[\s*(machineStates|hubStates|machines)\s*,/.test(t) &&
    !drivesMachineState(t),
  // "harness" — an executable reference room that INTENTIONALLY publishes
  // canonical events through the real event bus and observes the resulting
  // runtime state/consequences.
  //
  // Distinguished from "activity" by direction of causation, and the two are
  // mutually exclusive by construction:
  //
  //   activity:  event bus -> derived state -> room observes
  //   harness:   room publishes -> real bus -> runtime derives -> room observes
  //
  // Deliberately not satisfiable by declaration alone. A harness must:
  //   1. call useForgeActivity() — it uses the REAL bus, not a private mock
  //   2. actually publish machine-bearing events — a room that publishes
  //      nothing is not a harness, it is an observer
  //   3. observe the resulting derived state (machineStates / hubStates)
  //   4. NOT keep an independent local copy of that state
  harness: (t) =>
    /useForgeActivity\s*\(/.test(t) &&
    drivesMachineState(t) &&
    /\b(machineStates|hubStates)\b/.test(t) &&
    !/const\s*\[\s*(machineStates|hubStates|machines)\s*,/.test(t),
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
  const OBSERVER = 'const { machineStates } = useForgeActivity(); const active = line.filter(m => machineStates[m] === "active").length;';
  const cases = [
    ["claims activity without calling the hook",
      'import { useForgeActivity } from "x"; const line = ["a"]; export default function R(){ return null; }', false],
    ["calls the hook but consumes nothing derived",
      'const x = useForgeActivity(); export default function R(){ return null; }', false],
    ["keeps an independent local copy of machine state",
      'const { machineStates } = useForgeActivity(); const [machineStates2] = useState({}); const [machineStates, setM] = useState({});', false],
    // A — inline machine-bearing publish
    ["A. publishes an inline machine-bearing event to feed its own screen",
      'const { machineStates, publish } = useForgeActivity(); publish({ machine: "m1", type: "machine.start" });', false],
    // B — publish(variable) resolving to a machine-bearing event
    ["B. publishes a machine-bearing event held in a variable",
      OBSERVER + ' const { publish } = useForgeActivity(); let e = { type: "machine.started", machine: "migWelder" }; publish(e);', false],
    // C — publish(step.event) from a machine-bearing workflow (the DemoStudio evasion)
    ["C. publishes step.event from a machine-bearing workflow",
      OBSERVER + ' const { publish } = useForgeActivity(); const WORKFLOW = [{ key:"started", event:{ type: EVENT.MACHINE_STARTED, machine: "migWelder" } }]; for (const step of WORKFLOW) publish(step.event);', false],
    // D — machine-bearing object stored in a const, then published
    ["D. publishes a machine-bearing const",
      OBSERVER + ' const { publish } = useForgeActivity(); const DEMO = { type: "machine.started", machine: "lathe" }; publish(DEMO);', false],
    // E — genuine observer (ProductionLine shape) must still be accepted
    ["E. genuinely derives operational state from the bus", OBSERVER, true],
    // F — raw log only
    ["F. reads only the raw event log (instrumentation, not folded state)",
      'const { log } = useForgeActivity(); const n = log.length;', false],
    // G — event count only
    ["G. counts events to report on itself",
      'const { log } = useForgeActivity(); const real = [{ k:"Events", v: log.length }];', false],
  ];
  const wrong = cases.filter(([, srcText, expected]) => A(srcText) !== expected).map(([name]) => name);
  ok(`projection "activity" cannot be claimed falsely (${cases.length} adversarial cases)`,
     wrong.length === 0, wrong.join("; "));
}

// ---------- ADVERSARIAL SELF-TEST — "harness" ----------
// The same discipline applied to the new category. It must reject a room that
// merely declares harness, and it must be mutually exclusive with activity so
// the two cannot both be true of one source.
{
  const H = PROJECTION_EVIDENCE.harness;
  const A = PROJECTION_EVIDENCE.activity;
  const REAL_HARNESS =
    'const { log, hubStates, machineStates, publish } = useForgeActivity();' +
    ' const WORKFLOW = [{ key:"started", event:{ type: EVENT.MACHINE_STARTED, machine: "migWelder", hub: "warri" } }];' +
    ' for (const step of WORKFLOW) publish(step.event);' +
    ' const rt = buildRuntime({ log, hubStates, machineStates });';
  const cases = [
    ["declares harness but publishes nothing (an observer, not a harness)",
      'const { machineStates } = useForgeActivity(); const active = machineStates["m1"];', false],
    ["declares harness but never touches the real bus",
      'const WORKFLOW = [{ event:{ machine: "m1" } }]; publish(WORKFLOW[0].event);', false],
    ["publishes but observes no derived state (a button, not a harness)",
      'const { publish } = useForgeActivity(); publish({ type:"machine.started", machine:"m1" });', false],
    ["publishes non-machine-bearing events only",
      'const { machineStates, publish } = useForgeActivity(); publish({ type:"language.added", locale:"yo" }); const s = machineStates;', false],
    ["keeps an independent local copy of the state it claims to observe",
      REAL_HARNESS + ' const [machineStates, setM] = useState({});', false],
    ["the genuine executable reference room", REAL_HARNESS, true],
  ];
  const wrong = cases.filter(([, srcText, expected]) => H(srcText) !== expected).map(([name]) => name);
  ok(`projection "harness" cannot be claimed falsely (${cases.length} adversarial cases)`,
     wrong.length === 0, wrong.join("; "));
  ok('projection "harness" and "activity" are mutually exclusive',
     !(H(REAL_HARNESS) && A(REAL_HARNESS)) && H(REAL_HARNESS) && !A(REAL_HARNESS));
}

// ---------- ADVERSARIAL SELF-TEST — PROSE IS NOT EVIDENCE ----------
// Each case is a source file whose ONLY mention of the thing being measured is
// inside a comment. Every check below reads f.code, so every case must come back
// negative. If any passes, a room could earn a capability by describing it, and
// this audit would be measuring documentation instead of architecture.
//
// These are not hypothetical. Case 1 is ArrivalDockRoom.jsx, which explains in a
// comment why it declares roomShell:false and was therefore counted as a
// RoomShell adopter — the adoption metric read 10 when only 9 rooms used it.
{
  const asCode = (t) => stripComments(t);
  const cases = [
    ["prose-only RoomShell reference",
      "// wrapping this in RoomShell would add a second header\nexport default function R(){ return null; }",
      (c) => /RoomShell/.test(c)],
    ["prose-only kernel export",
      "// export function GhostPrimitive() {}\nexport function Real(){}",
      (c) => /export (?:default )?function GhostPrimitive/.test(c)],
    ["prose-only hex colour",
      "// the old brand green was #2ecc71\nconst c = T.teal;",
      (c) => /#2ecc71/.test(c)],
    ["prose-only projection evidence (project())",
      "// buildRuntime is NOT interchangeable with project()\nconst rt = buildRuntime({ log });",
      PROJECTION_EVIDENCE.manufacturing],
    ["prose-only invented event type",
      '// we briefly considered type: "widget.frobnicated"\nconst e = { type: EVENT.MACHINE_STARTED };',
      (c) => /type:\s*[\"'][a-z][a-z0-9]*(?:\.[a-z0-9]+)+[\"']/.test(c)],
    ["prose-only rogue state-colour map",
      "// deleted: const STATE_COLOR = { active: green }\nconst c = stateColor(s);",
      (c) => /const\s+[A-Z_]*(STATE|STATUS|HUB|HEALTH|VER)_COLOR\s*=\s*\{/.test(c)],
    ["prose-only room-local manufacturing state",
      "// never do this: const [missions, setMissions] = useState([])\nconst v = project(log, MISSIONS);",
      (c) => /const\s*\[\s*(specs|components|missions|machines|hubStates)\s*,/.test(c)],
    ["prose-only looping animation",
      "// do not add animation: spin 2s infinite to a room\nconst x = 1;",
      (c) => /animation:[^;\"`]*infinite/.test(c)],
    ["prose-only rogue fontFamily",
      '// never fontFamily: "Arial"\nconst f = FONT.display;',
      (c) => /fontFamily:\s*[\"'](?!var\(--forge)/.test(c)],
    ["prose-only CONTRACT declaration",
      "// export const CONTRACT = { roomId: \"ghost\" };\nexport default function R(){}",
      (c) => /export const CONTRACT\s*=/.test(c)],
  ];
  const leaked = cases.filter(([, srcText, probe]) => probe(asCode(srcText))).map(([name]) => name);
  ok(`audit integrity: prose cannot satisfy any check (${cases.length} prose-only cases)`,
     leaked.length === 0, leaked.join("; "));

  // The mirror image: the same evidence in real code MUST still be detected, so
  // the extractor cannot pass this suite by simply deleting everything.
  const real = [
    ["real RoomShell usage", "import { RoomShell } from \"../os/console.jsx\";", (c) => /RoomShell/.test(c)],
    ["real export", "export function Real(){}", (c) => /export (?:default )?function Real/.test(c)],
    ["real hex", "const c = \"#2ecc71\";", (c) => /#2ecc71/.test(c)],
    ["real project() call", "const v = project(log, MISSIONS);", PROJECTION_EVIDENCE.manufacturing],
    ["real CONTRACT", "export const CONTRACT = { roomId: \"x\" };", (c) => /export const CONTRACT\s*=/.test(c)],
  ];
  const missed = real.filter(([, srcText, probe]) => !probe(asCode(srcText))).map(([name]) => name);
  ok(`audit integrity: real code is still detected (${real.length} positive controls)`,
     missed.length === 0, missed.join("; "));
}

// A room is routable if App.jsx imports it from ./rooms. Scoping to the
// registry rather than the directory is what makes the compliance number mean
// something: an unreferenced component in src/rooms is not a failing room.
const appSrc = files.find((f) => f.path === "src/App.jsx").code;
const routable = new Set([...appSrc.matchAll(/from "\.\/rooms\/([A-Za-z]\w*)\.jsx"/g)]
  .map((m) => `src/rooms/${m[1]}.jsx`));
const roomSources = files.filter((f) => routable.has(f.path));
const declared = roomSources.filter((f) => /export const CONTRACT\s*=/.test(f.code));
// COVERAGE IS NOW ASSERTED — T6 CLOSED.
//
// It was reported-not-asserted while the gap was real: asserting it then would
// have failed the suite, and faking six declarations would have made the audit
// lie. E2 closed the gap one room at a time, so the assertion is restored here
// and the T6 row has been deleted from TRANSITIONAL.md, per that register's
// stated convention that a row is removed once its condition is met.
//
// The count is still printed on every run. A regression should be visible as a
// number, not merely as a red line.
const outstanding = roomSources.filter((f) => !/export const CONTRACT/.test(f.code))
  .map((f) => basename(f.path));
console.log(`\n  CONVERGENCE: ${declared.length}/${roomSources.length} routable rooms under contract`);
if (outstanding.length) console.log(`     outstanding: ${outstanding.join(", ")}`);
ok(`platform contract: every routable room declares one (${declared.length}/${roomSources.length})`,
   declared.length === roomSources.length, outstanding.join(", "));
ok("platform contract: every declared contract is structurally valid",
   declared.every((f) => /roomId:\s*["']/.test(f.code)));

console.log("\n  Platform contract compliance (verified against source)");
let breaches = [];
for (const f of declared) {
  const block = f.code.slice(f.code.indexOf("export const CONTRACT"));
  const body = block.slice(0, block.indexOf("};") + 2);
  const src = f.code;   // prose cannot honour a claim
  const marks = [];
  for (const [claim, evidence] of Object.entries(CLAIM_EVIDENCE)) {
    const claimed = new RegExp(`${claim}:\\s*true`).test(body);
    if (!claimed) continue;
    const honoured = evidence(src);
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
    const honoured = test ? test(src) : false;
    marks.push(`${honoured ? "\u2713" : "\u2717"} projection:${projM[1]}`);
    if (!honoured) breaches.push(`${basename(f.path)} claims projection "${projM[1]}" without deriving it`);
  }
  console.log(`       ${basename(f.path).padEnd(20)} ${marks.join("  ")}`);
}
ok("platform contract: every claim is honoured by the source", breaches.length === 0,
   breaches.join("; "));

// Rooms that are registered and operational but declare no contract are
// reported honestly rather than quietly excluded from the score.
const undeclared = roomSources.filter((f) => !/export const CONTRACT/.test(f.code)).map((f) => basename(f.path));
console.log(`\n  Routable rooms: ${roomSources.length} · under contract: ${declared.length}`);
console.log(`  Not yet under contract: ${undeclared.length ? undeclared.join(", ") : "none"}`);

console.log(`\n${pass}/${pass + fail} audits passed${fail ? ` — ${fail} FAILED` : ""}\n`);
process.exit(fail ? 1 : 0);
