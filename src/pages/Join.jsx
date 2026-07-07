import { useEffect, useState } from 'react'
import { submitLead, fetchJobs } from '../lib/supabase'

const LANES = [
  { k: 'mentor',  ic: '◇', c: '#15C9AC', h: 'Technical mentorship', p: 'Design-review calls, materials-sourcing advice, remote engineering guidance for the workshops doing the build.', cta: 'Offer mentorship', extra: 'Your engineering field (e.g. mechanical, gas systems)' },
  { k: 'inkind',  ic: '⚙', c: '#FFB01F', h: 'In-kind support', p: 'Tools, machinery, or equipment donated to the SME and student workshops. A brake press, a welder, a CNC — real capacity.', cta: 'Pledge equipment', extra: 'What you can donate' },
  { k: 'capital', ic: '₦', c: '#FF1E63', h: 'Program capital', p: 'Grant or sponsorship support for the build event and the record attempt. Investment memo available on request.', cta: 'Discuss capital', extra: "Backing range you're exploring" },
  { k: 'partner', ic: '⬢', c: '#F3E9D2', h: 'SME partnership', p: 'Own a stake in a member SME. Diaspora partners become co-owners inside the keiretsu — capital, mentorship, and networks fused into one aligned relationship.', cta: 'Explore ownership', extra: 'Ticket range + hands-on or passive' },
]

export default function Join() {
  const [lane, setLane] = useState(null)
  const [jobs, setJobs] = useState([])
  const [form, setForm] = useState({ full_name: '', email: '', location: '', field: '', target_sme: '', message: '' })
  const [sent, setSent] = useState(false)

  useEffect(() => { fetchJobs().then(setJobs) }, [])

  const L = LANES.find(x => x.k === lane)
  const openSMEs = jobs.filter(j => j.partnership_open)

  function pick(k) { setLane(k); setSent(false); setForm({ full_name: '', email: '', location: '', field: '', target_sme: '', message: '' }) }
  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function submit() {
    if (!form.full_name || !form.email) return
    await submitLead({ lane, ...form })
    setSent(true)
  }

  return (
    <section>
      <div className="wrap">
        <div className="sec-head">
          <div className="kick">Four ways to back the build</div>
          <h2 className="sec">Diaspora engineers —<br />this is your lane.</h2>
          <p className="sub">
            Mentorship, in-kind support, program capital, and SME partnership are four different asks —
            different commitment, different conversation. Pick the one that fits. We keep them separate
            on purpose.
          </p>
        </div>

        <div className="lanes">
          {LANES.map(x => (
            <div className={'lane' + (lane === x.k ? ' pick' : '')} key={x.k}>
              <div className="li" style={{ background: x.c, color: '#0A0807' }}>{x.ic}</div>
              <h4>{x.h}</h4>
              <p>{x.p}</p>
              <button onClick={() => pick(x.k)}>{lane === x.k ? 'Selected ✓' : x.cta}</button>
            </div>
          ))}
        </div>

        {lane === 'partner' && openSMEs.length > 0 && (
          <div className="form" style={{ maxWidth: 'none', marginBottom: 0 }}>
            <h4>SMEs currently open to partnership</h4>
            <div className="kgrid" style={{ margin: 0, borderTop: '3px solid var(--rule)', borderLeft: '3px solid var(--rule)' }}>
              {openSMEs.map(j => (
                <div className="kcard" key={j.id}>
                  <div className="cn">{j.owner_org}</div>
                  <div className="co">{j.name} · stake sought: {j.stake_range}</div>
                  <span className="badge b-fab">Open to partnership</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {L && (
          <div className="form">
            <h4>{L.h} — tell us about you</h4>
            <input placeholder="Full name" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
            <input placeholder="name@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            <input placeholder="Where you're based (city, country)" value={form.location} onChange={e => set('location', e.target.value)} />
            <input placeholder={L.extra} value={form.field} onChange={e => set('field', e.target.value)} />
            {lane === 'partner' && (
              <input placeholder="Which SME / component class interests you (optional)" value={form.target_sme} onChange={e => set('target_sme', e.target.value)} />
            )}
            <textarea placeholder="Anything you want the team to know" value={form.message} onChange={e => set('message', e.target.value)} />
            <button className="btn btn-pink" onClick={submit}>Send interest</button>
            {sent && <div className="done-msg">Thank you — your interest is logged. The Forge-A-Truck-Thon team will reach out about {L.h.toLowerCase()}.</div>}
            {lane === 'partner' && (
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 12, fontStyle: 'italic' }}>
                Forge-A-Truck-Thon acts as matchmaker and standard-setter only. Partnership agreements are
                made directly between you and the SME, using program templates, with independent legal advice.
                This page connects parties — it is not an offer or solicitation of securities.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
