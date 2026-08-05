// ============================================================
// FORGE OS — ROLE REGISTRY (Phase 1)
//
// The twelve kinds of actor that constitute the manufacturing network.
// This file MIRRORS supabase/migrations/002_identity.sql — the database
// is the enforcement point (row level security), this is the interface
// vocabulary. If you add a role, add it in both places.
//
// Capabilities are declarative. UI asks can(capability), never
// role === 'sme', so permissions stay auditable and role changes do not
// require hunting conditionals through components.
// ============================================================

export const CAPABILITIES = {
  'mission.view':        'See manufacturing missions and their progress',
  'mission.create':      'Declare a manufacturing mission',
  'mission.fund':        'Commit funding to a mission',
  'capability.publish':  'Publish what this organisation can manufacture',
  'equipment.register':  'Register machinery and its specifications',
  'job.accept':          'Accept manufacturing work',
  'job.track':           'Track production against a job',
  'invoice.issue':       'Issue invoices for completed work',
  'engineering.author':  'Author specifications, BOMs and drawings',
  'engineering.approve': 'Approve a design for manufacture',
  'research.publish':    'Publish research and test results',
  'student_team.submit': 'Enter student teams into missions',
  'advisory.offer':      'Offer technical advisory to the network',
  'volunteer.enrol':     'Enrol on placements and training',
  'oversight.view':      'View national oversight and statistics',
  'report.download':     'Export reports and performance data',
};

// kind: 'organisation' registrants describe an institution and are
// verification-gated; 'individual' registrants describe a person.
export const ROLES = [
  { id:'sme',                label:'SME',                 kind:'organisation', glyph:'▣',
    purpose:'A small or medium enterprise that manufactures components.',
    capabilities:['capability.publish','equipment.register','job.accept','job.track','invoice.issue','mission.view'] },
  { id:'manufacturer',       label:'Manufacturer',        kind:'organisation', glyph:'▤',
    purpose:'A manufacturing firm able to take whole assemblies.',
    capabilities:['capability.publish','equipment.register','job.accept','job.track','invoice.issue','mission.create','mission.view'] },
  { id:'component_supplier', label:'Component Supplier',  kind:'organisation', glyph:'▥',
    purpose:'Supplies parts, materials and sub-assemblies.',
    capabilities:['capability.publish','equipment.register','job.accept','job.track','invoice.issue','mission.view'] },
  { id:'logistics_partner',  label:'Logistics Partner',   kind:'organisation', glyph:'▧',
    purpose:'Moves materials and finished goods across the corridors.',
    capabilities:['capability.publish','job.accept','job.track','invoice.issue','mission.view'] },
  { id:'university',         label:'University',          kind:'organisation', glyph:'◈',
    purpose:'Laboratories, departments, research and student teams.',
    capabilities:['capability.publish','equipment.register','research.publish','student_team.submit','engineering.author','mission.view'] },
  { id:'polytechnic',        label:'Polytechnic',         kind:'organisation', glyph:'◇',
    purpose:'Workshops, technical training and student teams.',
    capabilities:['capability.publish','equipment.register','research.publish','student_team.submit','engineering.author','mission.view'] },
  { id:'research_institute', label:'Research Institute',  kind:'organisation', glyph:'◉',
    purpose:'Applied research, testing and standards work.',
    capabilities:['capability.publish','equipment.register','research.publish','engineering.author','advisory.offer','mission.view'] },
  { id:'government_agency',  label:'Government Agency',   kind:'organisation', glyph:'⬢',
    purpose:'Oversight, policy and public investment.',
    capabilities:['mission.view','mission.create','mission.fund','oversight.view','report.download'] },
  { id:'investor',           label:'Investor',            kind:'organisation', glyph:'◆',
    purpose:'Reviews and funds manufacturing programmes.',
    capabilities:['mission.view','mission.fund','report.download'] },
  { id:'engineer',           label:'Engineer',            kind:'individual',   glyph:'✦',
    purpose:'Authors and approves the engineering package.',
    capabilities:['engineering.author','engineering.approve','mission.create','mission.view','job.track'] },
  { id:'nysc_volunteer',     label:'NYSC Volunteer',      kind:'individual',   glyph:'✧',
    purpose:'Serves on placement within the network.',
    capabilities:['volunteer.enrol','mission.view'] },
  { id:'diaspora_expert',    label:'Diaspora Expert',     kind:'individual',   glyph:'✶',
    purpose:'Contributes expertise from outside Nigeria.',
    capabilities:['advisory.offer','engineering.author','mission.view'] },
];

export const roleById = (id) => ROLES.find(r => r.id === id) || null;
export const isOrganisation = (id) => roleById(id)?.kind === 'organisation';

export const capabilitiesFor = (id) => roleById(id)?.capabilities || [];

export const VERIFICATION = {
  unverified: { label:'Unverified', note:'Self-declared. Not checked by Forge.' },
  pending:    { label:'Pending',    note:'Submitted for verification.' },
  verified:   { label:'Verified',   note:'Checked against submitted evidence.' },
  rejected:   { label:'Rejected',   note:'Evidence did not support the claim.' },
};

// Capabilities that stay closed until an organisation is verified.
// Registration must never be a route to unearned authority.
export const VERIFICATION_GATED = [
  'job.accept', 'invoice.issue', 'engineering.approve', 'mission.fund', 'oversight.view',
];

export default { ROLES, CAPABILITIES, roleById, capabilitiesFor, VERIFICATION, VERIFICATION_GATED };
