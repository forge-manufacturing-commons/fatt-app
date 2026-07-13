// ============================================================
// Nigeria Manufacturing Command Center — hub data.
// SOURCE OF TRUTH: ForgeStudio_Alpha/Documentation/Hub_Industrial_Identity.md
// Do NOT edit coordinates or industrial identity here.
// If Nigeria data changes, ForgeStudio ships a new registry.
//
// This file adapts the studio's 18-hub registry into the shape
// the existing map/panel components expect.
// ============================================================
import { STUDIO_HUBS, projectHub } from "../../lib/ForgeStudio";

// Runtime, human-facing lifecycle state per hub (not part of the
// frozen studio — this is application state that reflects the live
// network). Marked "Alpha network model" throughout the UI.
const RUNTIME_STATE = {
  warri:     { status:"fabricating",  lastActivity:"Torch cooling · Engr. Adebayo",       featured:true  },
  nnewi:     { status:"fabricating",  lastActivity:"Fabrication in progress · 12min"                     },
  aba:       { status:"active",       lastActivity:"Component accepted · 3h"                             },
  ilorin:    { status:"verifying",    lastActivity:"Drawing check in review · Engr. Okonkwo"             },
  portharcourt:{ status:"standby",    lastActivity:"Awaiting material · pressure test"                    },
  lagos:     { status:"coordinating", lastActivity:"Supplier matched · 46min"                            },
  kaduna:    { status:"expanding",    lastActivity:"Onboarding new SME · today"                          },
  kano:      { status:"standby",      lastActivity:"Waiting for revision"                                },
  benin:     { status:"sleeping",     lastActivity:"Dormant · joining next cycle"                        },
  jos:       { status:"standby",      lastActivity:"Awaiting site survey"                                },
  makurdi:   { status:"standby",      lastActivity:"Onboarding queue"                                    },
  maiduguri: { status:"sleeping",     lastActivity:"Dormant · joining next cycle"                        },
  ibadan:    { status:"standby",      lastActivity:"Manufacturing capacity registered"                    },
  abeokuta:  { status:"standby",      lastActivity:"Agro-processing SME onboarded · 2d"                  },
  asaba:     { status:"active",       lastActivity:"Logistics link verified"                             },
  onitsha:   { status:"active",       lastActivity:"Distribution route active"                           },
  owerri:    { status:"standby",      lastActivity:"Services onboarding"                                 },
  enugu:     { status:"standby",      lastActivity:"Mineral supply capacity mapped"                       },
};

// Adapt studio hubs into the shape the map + panel expect.
// coordinates projected 0..100% via projectHub().
// specialty ← industrial identity from studio
// capabilities/projects ← illustrative Alpha network model content
export const HUBS = STUDIO_HUBS.map(h => {
  const rs = RUNTIME_STATE[h.id] || {};
  const p = projectHub(h.lat, h.lon);
  return {
    id: h.id,
    name: h.name,
    shortName: h.id === "portharcourt" ? "PH" : h.id.slice(0,3).toUpperCase(),
    coords: `${h.lat.toFixed(2)}°N, ${h.lon.toFixed(2)}°E`,
    x: p.x, y: p.y,
    accent: h.accent,             // studio accent bucket
    specialty: h.identity,        // industrial identity (frozen)
    capabilities: [h.identity],   // Alpha model — replaced by real registration data
    projects: [],                 // filled by activity engine or SME registrations
    builders: 0, smes: 0, institutions: 0,
    status: rs.status || "standby",
    lastActivity: rs.lastActivity,
    featured: h.featured || rs.featured || false,
  };
});

// Motion timing for hub/network reveal. Matches the shape the existing
// NetworkLines/NetworkNode/StatsPanel components already expect.
export const SEQUENCE = {
  boot:   0.4,
  lines:  1.2,
  nodes:  1.9,
  stats:  2.5,
};

// LINKS — manufacturing corridors between hubs, per ForgeStudio
// nga-transport-corridors + Command_Center_Spec.md §"Network channels".
// Each pair links a fabrication/assembly city to a review/distribution city.
// Edges kept sparse — the plate is engineered, not a spider-web.
export const LINKS = [
  // Chassis corridor (Warri Alpha → Nnewi automotive → Aba fabrication)
  ["warri", "nnewi"],
  ["nnewi", "aba"],
  // Engineering review corridor (Warri → Ilorin poly → Lagos coordination)
  ["warri", "ilorin"],
  ["ilorin", "lagos"],
  // Energy corridor (Warri → Port Harcourt → Aba)
  ["warri", "portharcourt"],
  ["portharcourt", "aba"],
  // Northern industrial corridor (Kaduna → Kano → Lagos coordination)
  ["kaduna", "kano"],
  ["kaduna", "lagos"],
  // Foundry loop (Benin → Warri)
  ["benin", "warri"],
];

// Aggregate stats — labels honest per §17 of Odogwu 80% pass
export const NETWORK_STATS = [
  { label:"Manufacturing cities in the network",   value: HUBS.length,       seed:false },
  { label:"Alpha model builder capacity (target)", value: 2500,              seed:true  },
  { label:"Alpha model SME capacity (target)",     value: 500,               seed:true  },
  { label:"Institutional participation target",    value: 120,               seed:true  },
];
