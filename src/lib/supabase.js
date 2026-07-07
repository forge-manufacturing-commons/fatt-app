import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// If env vars aren't set yet, the app still runs on seed data (demo mode),
// so you can see it working before wiring Supabase.
export const isConfigured = Boolean(url && key && !url.includes('YOUR-PROJECT'))

export const supabase = isConfigured ? createClient(url, key) : null

// ---- seed data mirrors supabase/schema.sql, used in demo mode ----
export const SEED_JOBS = [
  { id: 1, name: 'Donor chassis',         detail: 'Kei-class vehicle, prepped and reinforced',          category: 'chassis',    owner_org: 'Automotive workshop',   stage: 'fabricating', safety_critical: true,  head_count: 5 },
  { id: 2, name: 'Body / facade panels',  detail: 'Folded cybertruck-style sheet-metal panels',         category: 'body',       owner_org: 'Sheet-metal SME',       stage: 'fabricating', safety_critical: false, head_count: 6 },
  { id: 3, name: 'Kitchen box shell',     detail: 'Six welded panels, no booleans',                     category: 'kitchen',    owner_org: 'Sheet-metal SME',       stage: 'done',        safety_critical: false, head_count: 4 },
  { id: 4, name: 'Gas locker + plumbing', detail: '12.5kg LPG cylinder, sealed, vented',                category: 'gas',        owner_org: 'Certified gas fitter',  stage: 'qa',          safety_critical: true,  head_count: 3 },
  { id: 5, name: 'House electrical',      detail: '24V bank, accessories only, separate from traction', category: 'electrical', owner_org: 'Solar / inverter SME',  stage: 'fabricating', safety_critical: false, head_count: 4 },
  { id: 6, name: 'Cook line + oven',      detail: 'Red-glass hob, SUGGAR burners, LPG oven',            category: 'kitchen',    owner_org: 'Stainless kitchen SME', stage: 'done',        safety_critical: false, head_count: 5 },
  { id: 7, name: 'Extraction / hood',     detail: 'Roof-ducted stack over the cook line',               category: 'kitchen',    owner_org: 'Ventilation SME',       stage: 'queued',      safety_critical: false, head_count: 3 },
  { id: 8, name: 'Ankara livery wrap',    detail: 'Wax-print graphics, both box sides',                 category: 'livery',     owner_org: 'Print / graphics SME',  stage: 'done',        safety_critical: false, head_count: 2 },
]

export async function fetchJobs() {
  if (!isConfigured) return SEED_JOBS
  const { data, error } = await supabase.from('component_jobs').select('*').order('created_at')
  if (error) { console.error(error); return SEED_JOBS }
  return data
}

export async function updateJobStage(id, stage, signed_off_by = null) {
  if (!isConfigured) return
  const patch = { stage }
  if (signed_off_by) patch.signed_off_by = signed_off_by
  const { error } = await supabase.from('component_jobs').update(patch).eq('id', id)
  if (error) console.error(error)
}

export async function submitLead(lead) {
  if (!isConfigured) return { demo: true }
  const { error } = await supabase.from('diaspora_leads').insert(lead)
  if (error) { console.error(error); return { error } }
  return { ok: true }
}
