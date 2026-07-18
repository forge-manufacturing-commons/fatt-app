export const SITE = {
  name: "Forge A Truck Thon",

  tagline: "One Truck. Thousands of Builders.",

  mission:
    "Building Africa's distributed manufacturing ecosystem through SMEs, universities, engineers, students and innovators.",

  hero: {
    title: [
      "BUILD /",
      "VEHICLES. /",
      "TOGETHER."
    ],

    subtitle:
      "Forge coordinates Nigerian SMEs, engineers, universities, students, fabricators, diaspora, industry, investors and government to collaboratively manufacture vehicles."
  }
}

export const STATS = [
  {
    label: "SMEs",
    value: 120
  },

  {
    label: "Engineers",
    value: 500
  },

  {
    label: "Universities",
    value: 35
  },

  {
    label: "Vehicle Components",
    value: 96
  }
]

// ------------------------------------------------------------
// PLATFORM HIERARCHY (Epic 1 — Institutional Alpha)
// Forge is the institution. Forge OS is the software. Forge-A-Truck-Thon
// is the global challenge run ON the platform. NAWEDOAM is the reference
// platform — the first vehicle programme proving the model.
// ------------------------------------------------------------
export const PLATFORM = {
  institution: "FORGE",
  descriptor:  "Open Manufacturing Operating System",
  system:      "Forge OS",
  challenge:   "Forge-A-Truck-Thon",
  challengeDescriptor: "Global Challenge",
  referencePlatform:   "NAWEDOAM",
  referenceDescriptor: "Reference Platform",
  tiers: [
    { id:"forge",     label:"Forge",              role:"Institution" },
    { id:"forge-os",  label:"Forge OS",           role:"Operating System" },
    { id:"challenge", label:"Forge-A-Truck-Thon", role:"Global Challenge" },
  ],
};
