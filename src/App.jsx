import { useEffect, useState } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import { isConfigured } from './lib/supabase'
import { LOGO } from './lib/assets'
import { ForgeActivityProvider } from './lib/ForgeActivityEngine.jsx'
import Showcase from './pages/Showcase.jsx'
import Board from './pages/Board.jsx'
import Join from './pages/Join.jsx'

export default function App() {
  const [deferred, setDeferred] = useState(null)

  useEffect(() => {
    // register service worker for PWA / installability
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {})
      })
    }
    const onPrompt = e => { e.preventDefault(); setDeferred(e) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  async function install() {
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  return (
    <ForgeActivityProvider>
    <>
      {!isConfigured && (
        <div className="demo-banner">Demo mode — seed data. Add Supabase keys in .env to go live.</div>
      )}
      <header>
        <div className="wrap nav">
          <NavLink to="/" className="brandlogo">
            <img src={LOGO} alt="Forge-A-Truck-Thon" onError={e => { e.target.style.display = 'none' }} />
            <span className="txt">FORGE-<span className="r">A</span>-TRUCK-THON</span>
          </NavLink>
          <nav className="tabs">
            <NavLink to="/" end className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>Showcase</NavLink>
            <NavLink to="/board" className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>Build board</NavLink>
            <NavLink to="/join" className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>Join</NavLink>
            {deferred && <button className="install-btn" onClick={install}>Install app</button>}
          </nav>
        </div>
      </header>

      <div className="page">
        <Routes>
          <Route path="/" element={<Showcase />} />
          <Route path="/board" element={<Board />} />
          <Route path="/join" element={<Join />} />
        </Routes>
      </div>

      <footer>
        <div className="wrap">
          <b>Forge-A-Truck-Thon</b> — a Nigerian distributed-manufacturing initiative building NAWEDOAM,
          a dual-energy street-food minitruck, through a keiretsu network of SMEs, polytechnic and university
          workshops, NYSC corps members, and diaspora engineers.
          <div className="attribution">Base 3D model: "Kei Truck" by grs (Sketchfab), CC-BY 4.0, modified.</div>
        </div>
      </footer>
    </>
    </ForgeActivityProvider>
  )
}
