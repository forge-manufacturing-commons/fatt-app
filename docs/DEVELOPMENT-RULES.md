# Forge OS — Development Rules

Process rules, not architecture. These govern how work is done; they are not
kernel primitives and they do not constrain the runtime.

---

## R1 — Visual verification

**After any layout, styling or component-composition change, hard-refresh the
route before diagnosing the rendered result. Never derive a structural or CSS
correction from an unverified HMR frame.**

Earned the hard way in E2.2. A BoardPreview alignment defect was diagnosed from
an HMR-rendered frame, a correct fix was applied, the frame did not change, and
a third layout authority was hypothesised that did not exist. A hard refresh
showed the fix had worked all along. Without the refresh the next step would
have been a fourth CSS override fighting three others — architectural complexity
added to solve a problem that existed only in stale browser state.

Two of the three defects reported that session were real. The third was a stale
frame.

---

## R2 — Existence is not adoption

A kernel capability is not delivered when it exists. It is delivered when rooms
use it, and an audit proves they use it.

From D.2.1: `RoomShell` and `stateColor()` sat with zero consumers while five
competing status-colour maps kept running. The design audit passed because no
off-palette hex existed; nothing checked that the primitives were *used*. Audits
now test adoption, not presence.

---

## R3 — Truthful architecture over green metrics

A `⊖ N/A` that describes reality is worth more than a `✓` obtained by inventing
functionality or declaring a hollow contract.

Applied in E2: contract coverage is *reported* rather than asserted (T6) because
asserting it would have failed the suite and faking five declarations would have
made the audit lie.

---

## R4 — Two metrics, not one

**T6 measures contract coverage. Visual verification measures room readiness.**
They are related and they are not the same. A room may hold a truthful contract
and still fail its visual gate — BuildBoard did, at `63b4a35`.

---

## R5 — One room at a time

Converge, verify, commit — then ask the six questions again for the next room.
Never batch wrapper changes across rooms because the edit looks identical; that
is how a padding or camera regression gets buried under four other diffs.

A validated room is a validated *pattern*, never a template to copy blindly.

---

## R6 — Find the owner, do not stack an override

When layout or state appears wrong, identify which authority owns it and remove
the obsolete one. Do not add a rule that fights the existing rules.

E2.2 had three horizontal layout authorities in one room:
`.forge-room-floor`, `.wrap`, and `RoomShell`. The correction removed two
constraints rather than adding a third.

---

## R7 — A broken instrument is not evidence

**A verification tool that fails is not a passing result. When the instrument
breaks, the check stays unverified.**

And source inspection is not a substitute. Confirming that an element exists in
the source does not establish that it is positioned correctly, unclipped,
correctly coloured, or undisplaced. Those are separate claims requiring separate
evidence.

From E2.2 InspectionHangar: the room was structurally converged and green on
tests, design audit, kernel audits and build — while screenshots failed on a CDP
parameter error and `Runtime.evaluate` timed out. The correct outcome was
`VISUAL VERIFICATION BLOCKED`, not a room marked closed. Application code must
never be modified to compensate for a broken verification instrument.

Corollary, for layout questions: prefer measurement over appearance.
`getBoundingClientRect()` and `offsetParent` answer "which ancestor establishes
this coordinate system" definitively, where a screenshot only suggests an answer.
