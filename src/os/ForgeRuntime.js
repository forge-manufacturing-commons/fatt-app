// ============================================================
// FORGE OS — RUNTIME ENGINE
// Version 1.0
//
// The Runtime Engine does NOT generate events.
// It derives a complete runtime snapshot from the
// Activity Engine.
//
// Activity Engine = Event Bus
// Runtime Engine = Operating Picture
//
// Every Station reads this runtime.
// ============================================================

export const FORGE_OBJECT = {
  PERSON: "person",
  WORKSHOP: "workshop",
  MACHINE: "machine",
  SPECIFICATION: "specification",
  COMPONENT: "component",
  ASSEMBLY: "assembly",
  PROGRAM: "program",
  KNOWLEDGE: "knowledge",
  COMPETENCY: "competency",
  INSTITUTION: "institution",
};

export const STUDIO = {
  VEHICLE: "vehicle",
  SPECIFICATION: "specification",
  GEOMETRY: "geometry",
  KNOWLEDGE: "knowledge",
  AI: "ai",
  WORKSHOP: "workshop",
  DOCUMENT: "document",
  TRAINING: "training",
};

export const LANGUAGE = {
  EN: "English",
  YO: "Yorùbá",
  HA: "Hausa",
  IG: "Igbo",
  UR: "Urhobo",
  PI: "Pidgin",
  FR: "Français",
};

export function buildRuntime({
  event = null,
  log = [],
  hubStates = {},
  machineStates = {},
}) {

  const runtime = {

    online: true,

    bootedAt: Date.now(),

    event,

    recentEvents: log.slice(0, 10),

    hubStates,

    machineStates,

    forgeObjects: deriveForgeObjects(log),

    relationships: deriveRelationships(log),

    manufacturingStatus: deriveManufacturing(log),

    recommendations: deriveRecommendations(log),

    studios: buildStudios(),

    languages: buildLanguages(),

  };

  return runtime;

}

// ------------------------------------------------------------

function deriveForgeObjects(log) {

  return log.map((e, index) => ({

    id: `${e.component || e.machine || index}`,

    class:

      e.machine
        ? FORGE_OBJECT.MACHINE
        : FORGE_OBJECT.COMPONENT,

    state: e.type,

    hub: e.hub,

    workshop: e.workshop,

    owner: e.human,

    role: e.role,

    timestamp: e.at,

  }));

}

// ------------------------------------------------------------

function deriveRelationships(log) {

  return log.map((e, index) => ({

    id: `R-${index}`,

    from: e.human,

    to: e.machine,

    hub: e.hub,

    component: e.component,

    type: e.type,

  }));

}

// ------------------------------------------------------------

function deriveManufacturing(log) {

  return {

    activeEvents: log.length,

    workshops:

      new Set(log.map(e => e.workshop)).size,

    people:

      new Set(log.map(e => e.human)).size,

    machines:

      new Set(log.map(e => e.machine)).size,

    components:

      new Set(log.map(e => e.component)).size,

  };

}

// ------------------------------------------------------------

function deriveRecommendations(log) {

  if (!log.length) {

    return [];

  }

  return [

    {

      station: "engineering-bay",

      reason: log[0].text,

    }

  ];

}

// ------------------------------------------------------------

function buildStudios() {

  return [

    STUDIO.VEHICLE,

    STUDIO.SPECIFICATION,

    STUDIO.GEOMETRY,

    STUDIO.KNOWLEDGE,

    STUDIO.AI,

    STUDIO.WORKSHOP,

    STUDIO.DOCUMENT,

    STUDIO.TRAINING,

  ];

}

// ------------------------------------------------------------

function buildLanguages() {

  return Object.values(LANGUAGE);

}