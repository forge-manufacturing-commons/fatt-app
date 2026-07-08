import { useEffect, useRef } from 'react'

// Living Keiretsu hero: nodes assemble into the truck silhouette.
// Truck sits top-right, clear of the headline text block.
export default function KeiretsuHero() {
  const ref = useRef(null)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const c = ref.current
    const ctx = c.getContext('2d')
    let W, H, raf
    const DPR = Math.min(window.devicePixelRatio || 1, 2)
    const cols = ['#FF1E63', '#15C9AC', '#FFB01F', '#F3E9D2']
    let parts = []

    function truckPoints() {
      const pts = []
      const narrow = W < 760
      // scale + position: top-right on wide screens, top-center on narrow,
      // always in the upper zone so it never collides with the headline below.
      const s = (narrow ? Math.min(W, H) * 0.0060 : Math.min(W, H) * 0.0052)
      const ox = narrow ? W * 0.14 : W * 0.56
      const oy = narrow ? H * 0.04 : H * 0.10
      const rectO = (x0, y0, x1, y1, st) => {
        for (let x = x0; x <= x1; x += st) { pts.push([ox + x * s, oy + y0 * s]); pts.push([ox + x * s, oy + y1 * s]) }
        for (let y = y0; y <= y1; y += st) { pts.push([ox + x0 * s, oy + y * s]); pts.push([ox + x1 * s, oy + y * s]) }
      }
      rectO(2, 4, 46, 27, 3)      // kitchen box
      rectO(46, 11, 66, 27, 3)    // cab
      rectO(5, 7, 22, 24, 4.5)    // hatch
      rectO(26, 7, 42, 24, 4.5)   // mural panel
      const wy = 31
      for (let a = 0; a < 6.283; a += 0.42) {
        pts.push([ox + 15 * s + Math.cos(a) * 6.4 * s, oy + wy * s + Math.sin(a) * 6.4 * s])
        pts.push([ox + 55 * s + Math.cos(a) * 6.4 * s, oy + wy * s + Math.sin(a) * 6.4 * s])
      }
      return pts
    }

    function build() {
      const t = truckPoints()
      parts = t.map(([tx, ty], i) => ({
        x: Math.random() * W, y: Math.random() * H, tx, ty,
        c: cols[i % 4], r: Math.random() * 1.7 + 1.1,
        vx: 0, vy: 0, ph: Math.random() * 6.28,
      }))
    }
    function size() {
      W = c.clientWidth; H = c.clientHeight
      c.width = W * DPR; c.height = H * DPR
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
      build()
    }
    size(); window.addEventListener('resize', size)

    if (reduce) {
      parts.forEach(p => { p.x = p.tx; p.y = p.ty })
      ctx.clearRect(0, 0, W, H)
      parts.forEach(p => { ctx.globalAlpha = 0.85; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill() })
      return () => window.removeEventListener('resize', size)
    }

    let t = 0, mode = 0, modeT = 0
    function frame() {
      t += 0.016; modeT += 0.016
      if (mode === 0 && modeT > 4.6) { mode = 1; modeT = 0 }
      else if (mode === 1 && modeT > 2.4) {
        mode = 0; modeT = 0
        parts.forEach(p => { p.vx += (Math.random() - 0.5) * 3.2; p.vy += (Math.random() - 0.5) * 3.2 })
      }
      ctx.clearRect(0, 0, W, H)
      for (const p of parts) {
        if (mode === 0) {
          p.vx = (p.vx + (p.tx - p.x) * 0.008) * 0.86
          p.vy = (p.vy + (p.ty - p.y) * 0.008) * 0.86
        } else { p.vx *= 0.99; p.vy *= 0.99 }
        p.x += p.vx; p.y += p.vy
        ctx.globalAlpha = mode === 0 ? 0.65 + 0.35 * Math.sin(t * 3 + p.ph) : 0.45
        ctx.fillStyle = p.c
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }
    frame()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', size) }
  }, [])
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true" />
}