import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchJobs } from '../lib/supabase'
import { GALLERY } from '../lib/assets'
import KeiretsuHero from '../components/KeiretsuHero.jsx'

function badge(stage) {
  if (stage === 'done') return <span className="badge b-done">Done</span>
  if (stage === 'qa') return <span className="badge b-qa">QA / sign-off</span>
  if (stage === 'fabricating') return <span className="badge b-fab">Fabricating</span>
  return <span className="badge b-queue">Queued</span>
}

export default function Showcase() {
  const [jobs, setJobs] = useState([])
  const nav = useNavigate()
  useEffect(() => { fetchJobs().then(setJobs) }, [])

  const people = jobs.reduce((a, j) => a + j.head_count, 0)
  const done = jobs.filter(j => j.stage === 'done').length
  const captions = ['NAWEDOAM — front', 'On the street', 'The build', 'Detail', 'Interior', 'Livery', 'Rear', 'Profile', 'Hero', 'Night']

  return (
    <>
      <div className="hero">
        <div className="hero-canvas-slot"><KeiretsuHero /></div>
        <div className="hero-content">
          <div className="wrap">
            <div className="hero-eyebrow">Built by Nigerian SMEs — assembling live</div>
            <h1 className="giant" style={{ fontSize: 'clamp(48px,9.5vw,124px)' }}>
              <span className="row"><span>One <span className="tl">truck.</span></span></span>
              <span className="row"><span>Many <span className="hl">hands.</span></span></span>
              <span className="row"><span>One <span className="ol">record.</span></span></span>
            </h1>
            <p className="hero-sub">
              NAWEDOAM — a dual-energy street-food minitruck, fabricated across a keiretsu of Nigerian
              workshops, students, and corps members. Each builds one part. Watch them assemble.
            </p>
            <div className="btnrow">
              <button className="btn btn-pink" onClick={() => nav('/join')}>Join the build →</button>
              <button className="btn btn-line" onClick={() => nav('/board')}>See it live</button>
            </div>
          </div>
        </div>
      </div>

      <div className="statband">
        <div className="stat"><div className="n">{jobs.length}</div><div className="l">Component families</div></div>
        <div className="stat"><div className="n">{people}</div><div className="l">Builders counted</div></div>
        <div className="stat"><div className="n">{done}<span className="u">/{jobs.length}</span></div><div className="l">Parts complete</div></div>
        <div className="stat"><div className="n">4</div><div className="l">Ways to back it</div></div>
      </div>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <div className="kick">The keiretsu</div>
            <h2 className="sec">Eight families,<br />one network.</h2>
            <p className="sub">
              Independent workshops each own one component class — the Japanese keiretsu model adapted
              for Nigerian SME fabrication. No exotic tooling: shear, brake, weld, and locally-sourced
              LPG components certified to NIS/SON standards.
            </p>
          </div>
          <div className="kgrid">
            {jobs.map(c => (
              <div className="kcard" key={c.id}>
                <div className="cn">{c.name}</div>
                <div className="co">{c.detail}<br />{c.owner_org}</div>
                {badge(c.stage)}
                {c.safety_critical && <span className="badge b-safety">Safety sign-off</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {GALLERY.length > 0 && (
        <section>
          <div className="wrap">
            <div className="sec-head">
              <div className="kick">The vehicle</div>
              <h2 className="sec">NAWEDOAM.</h2>
              <p className="sub">The truck as it will be built — angular sheet-metal panels, Ankara livery, a dual-energy galley.</p>
            </div>
          </div>
          <div className="gallery">
            {GALLERY.map((src, i) => (
              <div className={'gal ' + (i === 0 ? 'big' : i === 1 ? 'small' : 'half')} key={src}>
                <img src={src} alt={captions[i] || 'NAWEDOAM render'} loading="lazy" />
                <div className="gal-cap">{captions[i] || 'NAWEDOAM'}</div>
              </div>
            ))}
          </div>
          <div className="wrap">
            <p className="attribution">Base 3D model: "Kei Truck" by grs (Sketchfab), CC-BY 4.0, modified.</p>
          </div>
        </section>
      )}

      <div className="ctaband">
        <div className="wrap inner">
          <h3>Ready to<br />back it?</h3>
          <button className="btn" onClick={() => nav('/join')}>Join the build →</button>
        </div>
      </div>
    </>
  )
}
