import { useEffect, useState } from 'react'
import { fetchJobs, updateJobStage } from '../lib/supabase'

const STAGES = [['queued','Queued'],['fabricating','Fabricating'],['qa','QA / sign-off'],['done','Done']]
const ROLES = [['all','Everyone'],['sme','SME partners'],['hod','Workshop HODs'],['student','Students / NYSC'],['mentor','Diaspora mentors']]

export default function Board() {
  const [jobs, setJobs] = useState([])
  const [role, setRole] = useState('all')
  useEffect(() => { fetchJobs().then(setJobs) }, [])

  function view() {
    if (role === 'hod') return jobs.filter(j => j.safety_critical || j.stage === 'qa')
    if (role === 'student') return jobs.filter(j => j.stage !== 'done')
    if (role === 'mentor') return jobs.filter(j => j.stage === 'qa' || j.stage === 'fabricating')
    return jobs
  }
  async function setStage(id, stage) {
    const job = jobs.find(j => j.id === id); if (!job) return
    let signed = null
    if (stage === 'done' && job.safety_critical && !job.signed_off_by)
      signed = 'Eng. sign-off ' + new Date().toLocaleDateString()
    setJobs(js => js.map(j => j.id === id ? { ...j, stage, signed_off_by: signed || j.signed_off_by } : j))
    await updateJobStage(id, stage, signed)
  }
  function advance(id) {
    const j = jobs.find(x => x.id === id)
    const i = STAGES.findIndex(s => s[0] === j.stage)
    setStage(id, STAGES[Math.min(i + 1, 3)][0])
  }
  const v = view()
  const people = jobs.reduce((a, j) => a + j.head_count, 0)
  const safety = jobs.filter(j => j.safety_critical).length
  const signed = jobs.filter(j => j.safety_critical && j.stage === 'done').length
  const doneCount = jobs.filter(j => j.stage === 'done').length

  return (
    <section>
      <div className="wrap">
        <div className="kick">Private partner workspace</div>
        <h2 className="sec">The build, live</h2>
        <p className="sub">Each role sees its own slice of the work. Safety-critical parts — gas systems,
          structural welds, chassis — can't close without a named engineer's sign-off. The builder head count
          is the record count: it sums itself from the teams doing the work.</p>
        <div className="roles">
          {ROLES.map(([k, l]) => (
            <button key={k} className={'role' + (role === k ? ' active' : '')} onClick={() => setRole(k)}>{l}</button>
          ))}
        </div>
        <div className="stats">
          <div className="stat"><div className="n">{people}</div><div className="l">Builders · record count</div></div>
          <div className="stat"><div className="n">{signed}<span className="u">/{safety}</span></div><div className="l">Safety sign-offs</div></div>
          <div className="stat"><div className="n">{doneCount}<span className="u">/{jobs.length}</span></div><div className="l">Parts complete</div></div>
        </div>
        <div className="board">
          {STAGES.map(([s, lbl]) => {
            const items = v.filter(j => j.stage === s)
            return (
              <div className="col" key={s} onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); setStage(Number(e.dataTransfer.getData('id')), s) }}>
                <div className="colh"><span>{lbl}</span><span>{items.length}</span></div>
                {items.length === 0 && <div className="js" style={{textAlign:'center',padding:8,color:'#b0a596'}}>—</div>}
                {items.map(j => (
                  <div className="job" key={j.id} draggable
                    onDragStart={e => e.dataTransfer.setData('id', j.id)} onClick={() => advance(j.id)}>
                    <div className="jt">{j.name}</div>
                    <div className="js">{j.owner_org} · {j.head_count} {j.head_count > 1 ? 'builders' : 'builder'}</div>
                    {j.safety_critical && j.stage !== 'done' && <span className="badge b-safety" style={{marginTop:6}}>⚠ needs sign-off</span>}
                    {j.safety_critical && j.stage === 'done' && <span className="badge b-done" style={{marginTop:6}}>✓ engineer signed</span>}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
        <p className="attribution">Drag a part between stages, or tap it to advance. Safety-critical parts stamp an engineer sign-off when they reach Done.</p>
      </div>
    </section>
  )
}
