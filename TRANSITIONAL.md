# Forge OS — Transitional Compatibility Register

Every entry here exists ONLY to keep the V1 runtime working while the canonical
model is adopted. Each states the condition under which it must be deleted.
Nothing may be added to this file without a removal condition.

| # | Bridge | Where | Exists because | Remove when |
|---|--------|-------|----------------|-------------|
| T1 | `human` mirrors `person` | `src/os/pipeline.js` `bridgeActor()` | `ForgeRuntime.deriveManufacturing` counts distinct `e.human`. An event carrying `person` alone increments the people metric by zero. | `deriveManufacturing` counts `e.person`. Then delete `human` from `bridgeActor`. |
| T2 | `text` mirrors `summary` | `src/os/events.js` `narrate()` | Five live consumers, verified at `cb3e85f`: `ForgeRuntime.js:184` (`reason: log[0].text`), `Room.jsx:63`, `ArrivalMasthead.jsx:150`, `DemoStudio.jsx:147`, and `projections.js:176` — the last already prefers `summary` (`e.summary \|\| e.text`), so it is partially migrated. | All five consumers read `summary`. Then delete `text` from `narrate()`. |
| T3 | `LEGACY_EVENT` + `toLegacyType()` | `src/os/events.js` | The bus derives hub/machine state from eight legacy strings. Canonical types are now understood natively (additive), so this is only for producers still emitting legacy types. | No producer emits a legacy type. |
| T4 | `src/os/emitters/index.js` re-export shim | `src/os/emitters/` | Emitters moved to `src/domains/<domain>/emitters.js`. Shim keeps any older import path working. **NOT safe to delete:** `test/emitters.consumer.mjs:10` imports `../src/os/emitters/index.js`, and that suite carries 35 assertions. The previous claim of "Currently: none" was false. | `test/emitters.consumer.mjs` imports from `src/domains/<domain>/emitters.js`, and no other import references `os/emitters`. Verify with a repo-wide search, not by assumption. |
| T5 | Seed events on Arrival Dock mount | `src/rooms/ArrivalDock.jsx` | Metrics read 0 with an empty runtime. Fires only while the log is effectively empty. | Real events flow from real workshops. Self-disabling by design. |
| T7 | Legacy colour debt detected, not asserted | `test/design.audit.mjs` | Enabling `rgb()`/`rgba()` detection surfaced 336 non-canonical literals the hex-only audit never saw — the old Forge gold `212,175,55` and cyan `65,226,255` palettes survived E1 in `rgba()` form. Asserting immediately would fail the build on ~336 stylesheet lines; suppressing the check would restore the blind spot. So the count is printed on every run, split by area. Measured at `cb3e85f`: src/styles 257, src/os/*.css 32, src/components 29, src/humans 14, src/pages 4. `src/rooms` is 0 and non-canonical hex anywhere is 0 — both asserted. | Every `rgb()`/`rgba()` literal in `src/` resolves to a canonical token. Then extend `ASSERTED` in `test/design.audit.mjs` to all of `src/` and delete this row. |

## Tracked, not bridged

| # | Issue | Owner | Note |
|---|-------|-------|------|
| R1 | `deriveForgeObjects` classes any event with `machine` as MACHINE, so a production event with both `component` and `machine` is misclassified | registry | Deliberately NOT compensated in emitters. Producers stay truthful; the registry owns interpretation. |
| C6 | `activeThroughput` counts all events, not manufacturing events | runtime | `events.js` now provides the vocabulary to distinguish meta from domain events. |
