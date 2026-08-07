// ============================================================
// FORGE OS — RIPPLE TRIGGERS
// Which events are significant enough to be felt in another room, and which
// domains they touch. Pure data: no React, no bus. Kept separate from the
// hook so it can be audited and tested without a component tree.
//
// Keyed on CANONICAL event types only — the kernel audit refuses invented ones.
// ============================================================
export const RIPPLE_TRIGGERS = Object.freeze({
  "engineering.specification.approved": { label:"Specification approved", affects:["engineering","operations","grid"], color:"teal",  intensity:"high" },
  "engineering.specification.released": { label:"Manufacturing unlocked", affects:["engineering","operations","grid"], color:"teal",  intensity:"high" },
  "engineering.specification.revised":  { label:"Specification revised",  affects:["engineering"],                     color:"amber", intensity:"medium" },
  "engineering.specification.drafted":  { label:"Specification drafted",  affects:["engineering"],                     color:"amber", intensity:"low" },
  "production.component.produced":      { label:"Component produced",     affects:["operations","grid"],               color:"teal",  intensity:"medium" },
  "production.stage.advanced":          { label:"Stage advanced",         affects:["operations","grid"],               color:"teal",  intensity:"low" },
  "production.assembly.joined":         { label:"Assembly joined",        affects:["operations","grid"],               color:"teal",  intensity:"medium" },
  "inspection.passed":                  { label:"Component accepted",     affects:["engineering","operations","grid"], color:"teal",  intensity:"medium" },
  "inspection.failed":                  { label:"Component returned",     affects:["operations","grid"],               color:"pink",  intensity:"high" },
  "inspection.reworked":                { label:"Component reworked",     affects:["operations"],                      color:"amber", intensity:"medium" },
  "machine.fault":                      { label:"Machine fault",          affects:["operations","grid"],               color:"pink",  intensity:"critical" },
  "machine.start":                      { label:"Machine started",        affects:["operations"],                      color:"teal",  intensity:"low" },
  "machine.complete":                   { label:"Machine available",      affects:["operations"],                      color:"teal",  intensity:"low" },
  "mission.created":                    { label:"Mission created",        affects:["operations","grid"],               color:"amber", intensity:"high" },
});
export default RIPPLE_TRIGGERS;
