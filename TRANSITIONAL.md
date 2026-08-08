# Forge OS — Transitional Compatibility Register

Every entry here exists ONLY to keep the V1 runtime working while the canonical
model is adopted. Each states the condition under which it must be deleted.
Nothing may be added to this file without a removal condition.

| # | Bridge | Where | Exists because | Remove when |
|---|--------|-------|----------------|-------------|
| T1 | `human` mirrors `person` | `src/os/pipeline.js` `bridgeActor()` | `ForgeRuntime.deriveManufacturing` counts distinct `e.human`. An event carrying `person` alone increments the people metric by zero. | `deriveManufacturing` counts `e.person`. Then delete `human` from `bridgeActor`. |
| T2 | `text` mirrors `summary` | `src/os/events.js` `narrate()` | `ForgeRuntime.deriveRecommendations` reads `log[0].text`, and four UI components render `e.text`: `Room.jsx`, `ArrivalMasthead.jsx`, `DemoStudio.jsx`, `Rooms.jsx`. | All five consumers read `summary`. Then delete `text` from `narrate()`. |
| T3 | `LEGACY_EVENT` + `toLegacyType()` | `src/os/events.js` | The bus derives hub/machine state from eight legacy strings. Canonical types are now understood natively (additive), so this is only for producers still emitting legacy types. | No producer emits a legacy type. |
| T4 | `src/os/emitters/index.js` re-export shim | `src/os/emitters/` | Emitters moved to `src/domains/<domain>/emitters.js`. Shim keeps any older import path working. | No import references `os/emitters`. Currently: none. Safe to delete now. |
| T5 | Seed events on Arrival Dock mount | `src/rooms/ArrivalDock.jsx` | Metrics read 0 with an empty runtime. Fires only while the log is effectively empty. | Real events flow from real workshops. Self-disabling by design. |

| T6 | Contract coverage reported, not asserted | `test/kernel.audit.mjs` | Only 4 of 10 routable rooms declare a Platform Contract. Asserting it would fail the suite; faking six declarations would make the audit lie. So the gap is printed on every run. | All routable rooms declare a contract. Then restore the assertion and delete this row. |

## Tracked, not bridged

| # | Issue | Owner | Note |
|---|-------|-------|------|
| R1 | `deriveForgeObjects` classes any event with `machine` as MACHINE, so a production event with both `component` and `machine` is misclassified | registry | Deliberately NOT compensated in emitters. Producers stay truthful; the registry owns interpretation. |
| C6 | `activeThroughput` counts all events, not manufacturing events | runtime | `events.js` now provides the vocabulary to distinguish meta from domain events. |
