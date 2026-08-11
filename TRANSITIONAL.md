# Forge OS — Transitional Compatibility Register

Every entry here exists ONLY to keep the V1 runtime working while the canonical
model is adopted. Each states the condition under which it must be deleted.
Nothing may be added to this file without a removal condition.

| # | Bridge | Where | Exists because | Remove when |
|---|--------|-------|----------------|-------------|
| T1 | `human` mirrors `person` | `src/os/pipeline.js` `bridgeActor()` | `ForgeRuntime.deriveManufacturing` counts distinct `e.human`. An event carrying `person` alone increments the people metric by zero. | `deriveManufacturing` counts `e.person`. Then delete `human` from `bridgeActor`. |
| T2 | `text` mirrors `summary` | `src/os/events.js` `narrate()` | Five live consumers, verified at `cb3e85f`: `ForgeRuntime.js:184` (`reason: log[0].text`), `Room.jsx:63`, `ArrivalMasthead.jsx:150`, `DemoStudio.jsx:147`, and `projections.js:287` — the last already prefers `summary` (`e.summary \|\| e.text`), so it is partially migrated. | All five consumers read `summary`. Then delete `text` from `narrate()`. |
| T3 | `LEGACY_EVENT` + `toLegacyType()` | `src/os/events.js` | The bus derives hub/machine state from eight legacy strings. Canonical types are now understood natively (additive), so this is only for producers still emitting legacy types. | No producer emits a legacy type. |
| T4 | `src/os/emitters/index.js` re-export shim | `src/os/emitters/` | Emitters moved to `src/domains/<domain>/emitters.js`. Shim keeps any older import path working. **NOT safe to delete:** `test/emitters.consumer.mjs:10` imports `../src/os/emitters/index.js`, and that suite carries 35 assertions. The previous claim of "Currently: none" was false. | `test/emitters.consumer.mjs` imports from `src/domains/<domain>/emitters.js`, and no other import references `os/emitters`. Verify with a repo-wide search, not by assumption. |
| T5 | Seed events on Arrival Dock mount | `src/rooms/ArrivalDock.jsx` | Metrics read 0 with an empty runtime. Fires only while the log is effectively empty. | Real events flow from real workshops. Self-disabling by design. |
| T7 | Legacy colour debt detected, not asserted | `test/design.audit.mjs` | Enabling `rgb()`/`rgba()` detection surfaced 336 non-canonical literals the hex-only audit never saw — the old Forge gold `212,175,55` and cyan `65,226,255` palettes survived E1 in `rgba()` form. Asserting immediately would fail the build on ~336 stylesheet lines; suppressing the check would restore the blind spot. So the count is printed on every run, split by area. Measured at `cb3e85f`: src/styles 257, src/os/*.css 32, src/components 29, src/humans 14, src/pages 4. `src/rooms` is 0 and non-canonical hex anywhere is 0 — both asserted. | Every `rgb()`/`rgba()` literal in `src/` resolves to a canonical token. Then extend `ASSERTED` in `test/design.audit.mjs` to all of `src/` and delete this row. |

## Tracked, not bridged

| # | Issue | Owner | Note |
|---|-------|-------|------|
| R1 | `deriveForgeObjects` classes any event with `machine` as MACHINE, so a production event with both `component` and `machine` is misclassified | registry | Deliberately NOT compensated in emitters. Producers stay truthful; the registry owns interpretation. |
| C6 | `activeThroughput` counts all events, not manufacturing events | runtime | `events.js` now provides the vocabulary to distinguish meta from domain events. |

## Architectural decisions

These are settled boundaries, not bridges. They are recorded so a future
contributor does not re-open a question that has already been answered with
evidence, and so the absences below are understood as deliberate.

### D1 — WORK ORDER NOT NEEDED — CURRENT MODEL

`Mission → Specification → Component` is sufficient for current manufacturing
truth. Measured, not assumed: a mission aggregates across multiple
specifications; two missions sharing one specification stay isolated; a
component belongs to exactly one mission, first-writer-wins, and a later event
cannot reassign it.

Component membership is authoritative through the event-derived projection —
`event.mission` → `component.mission` → mission progress — with specification
matching retained only as a fallback for legacy uncorrelated components.

`component_jobs` is commercial/catalogue workflow data, **not** manufacturing
authority: its rows are component *families*, it shares no key with the fold,
and its only writer (`pages/Board.jsx`) is unrouted. `component_jobs.stage`
must never become component lifecycle authority — a single family-level value
provably cannot describe components that have diverged, and `componentState`
already owns that lifecycle with eleven event-backed states.

`builds` / `build_id` is vehicle identity ("one row per truck", for the record
attempt), not work execution. Declared, never read in executable source.

A Work Order would today duplicate the mission/component relationship without
adding a justified domain fact. **It may only be introduced if a real
work-package or assignment requirement emerges that the existing model cannot
represent** — see D2.

### D4 — SAFETY-CRITICAL ENFORCEMENT — dormant by construction

`inspection.criticalRequiresLevelThree` (QC-003) is correct and tested but can
never fire, because nothing can truthfully populate `component.safetyCritical`:
**zero of the 32 canonical events and zero fields in the event vocabulary
mention safety or criticality**, and the folded component is exactly
`{ id, state, specification, mission, history }`.

The only source in the repository is `component_jobs.safety_critical` —
family-level commercial catalogue data with no join key to a component (D1/D3).
Deriving criticality from it would attach a safety claim to the wrong object
through an inferred link, which is worse than the capability being absent.

The rule is therefore retained unfired rather than deleted or faked, and a
regression assertion in `test/projections.consumer.mjs` prevents any future
change from claiming safety-critical enforcement the system does not have.
**Revisit when** an authoritative source for component criticality exists —
which is a domain decision, not a derivation.

### D2 — COMPONENT MANUFACTURING ASSIGNMENT — deferred domain decision

The repository cannot currently express:

> organisation X is responsible for producing component Y

None of the 32 canonical event types represents assignment: zero mention
assignment, ownership, order or package. The 32-event freeze is intact and this
absence is **deliberate**, not an oversight. There is no authoritative
assignment relation in the system today.

Before any assignment vocabulary is added, the future decision must answer
whether responsibility attaches to the component, the specification, the
mission, the hub, the organisation, a capability, or some combination. Those
questions are open and must not be answered by assumption.

### D3 — COMMERCIAL CATALOGUE STATUS — unverified

`component_jobs` is treated as a commercial/demo catalogue in the application
architecture: `/join` reads `partnership_open`, `owner_org`, `name` and
`stake_range` to present partnership opportunities, and persists intent to
`diaspora_leads` (whose `target_sme` is documented as "which SME/component
class").

**Its deployed data reality is unverified.** `isConfigured` gates every call and
`SEED_JOBS` substitutes silently, so this environment cannot observe whether
`partnership_open` and `stake_range` describe real commercial commitments. No
claim is made either way.

Not to be migrated into event sourcing, given no organisation foreign key, and
`owner_org` holds role descriptions ("Certified gas fitter", "Sheet-metal SME"
twice) rather than organisation names. Converting it to an authoritative
organisation relation requires a separate commercial-domain decision.
