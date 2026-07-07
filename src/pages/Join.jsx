import { useState } from 'react'
import { submitLead } from '../lib/supabase'

const LANES = [
  { k: 'mentor',  ic: '◇', c: '#0E7360', h: 'Technical mentorship', p: 'Design-review calls, materials-sourcing advice, remote engineering guidance for the workshops doing the build.', cta: 'Offer mentorship', extra: 'Your engineering field (e.g. mechanical, gas systems)' },
  { k: 'inkind',  ic: '⚙', c: '#E5A812', h: 'In-kind support', p: 'Tools, machinery, or equipment donated to the SME and student workshops. A brake press, a welder, a CNC — real capacity.', cta: 'Pledge equipment', extra: 'What you can donate' },
  { k: 'capital', ic: '₦', c: '#E4231F', h: 'Capital backing', p: 'Investment or grant support for the build event and the record attempt. Investment memo available on request.', cta: 'Discuss capital', extra: "Backing range you're exploring" },
]

export default function Join() {
  const [lane, setLane] = useState(null)
  const [form, setForm] = useState({ full_name: '', email: '', location: '', field: '', message: '' })
  const [sent, setSent] = useState(false)
  const L = LANES.find(x => x.k === lane)
  function pick(k) { setLane(k); setSent(false); setForm({ full_name: '', email: '', location: '', field: '', message: '' }) }
  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }
  async function submit() {
    if (!form.full_name || !form.email) return
    await submitLead({ lane, ...form }); setSent(true)
  }
  return (
    <section>
      <div className="wrap">
        <div className="kick">Three ways to back the build</div>
        <h2 className="sec">Diaspora engineers — this is your lane</h2>
        <p className="sub">Mentorship, in-kind support, and capital are three different asks — different
          commitment, different conversation. Pick the one that fits. We keep them separate on purpose.</p>
        <div className="lanes">
          {LANES.map(x => (
            <div className={'lane' + (lane === x.k ? ' pick' : '')} key={x.k}>
              <div className="li" style={{ background: x.c + '22', color: x.c }}>{x.ic}</div>
              <h4>{x.h}</h4><p>{x.p}</p>
              <button onClick={() => pick(x.k)}>{lane === x.k ? 'Selected ✓' : x.cta}</button>
            </div>
          ))}
        </div>
        {L && (
          <div className="form">
            <h4>{L.h}</h4>
            <input placeholder="Full name" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
            <input placeholder="name@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            <input placeholder="Where you're based (city, country)" value={form.location} onChange={e => set('location', e.target.value)} />
            <input placeholder={L.extra} value={form.field} onChange={e => set('field', e.target.value)} />
            <textarea placeholder="Anything you want the team to know" value={form.message} onChange={e => set('message', e.target.value)} />
            <button className="btn btn-red" onClick={submit}>Send interest</button>
            {sent && <div className="done-msg">Logged. The Forge-A-Truck-Thon team will reach out about {L.h.toLowerCase()}.</div>}
          </div>
        )}
      </div>
    </section>
  )
}
