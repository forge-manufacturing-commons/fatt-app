// ============================================================
// FORGE OS — DECLARED MISSIONS
// A mission is the unit of work: a real manufacturing objective that
// everything else derives from. Progress is COUNTED from components that
// reached assembly, never asserted.
// ============================================================
export const MISSIONS = [
  { id: "FORGE-ALPHA", title: "Manufacture 50 chassis rails",
    specification: "FTT-CR-001", target: 50, state: "planning" },
  { id: "FORGE-HUB",   title: "Manufacture 200 wheel hubs",
    specification: "FTT-HB-001", target: 200, state: "planning" },
];
export default MISSIONS;
