import { useEffect, useRef } from 'react'

// Ambient drifting Ankara dots — fixed behind the page, never in flow.
export default function Ambient() {
  const ref = useRef(null)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const c = ref.current, ctx = c.getContext('2d')
    let raf, w, h
    const cols = ['#FF1E63', '#15C9AC', '#FFB01F', '#F3E9D2']
    let dots = []
    function resize() {
      w = c.width = window.innerWidth
      h = c.height = window.innerHeight
      dots = Array.from({ length: 46 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 2 + 0.6,
        vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15,
        c: cols[(Math.random() * 4) | 0], a: Math.random() * 0.4 + 0.1,
      }))
    }
    resize(); window.addEventListener('resize', resize)
    function tick() {
      ctx.clearRect(0, 0, w, h)
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy
        if (d.x < 0) d.x = w; if (d.x > w) d.x = 0
        if (d.y < 0) d.y = h; if (d.y > h) d.y = 0
        ctx.globalAlpha = d.a; ctx.fillStyle = d.c
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 7); ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        pointerEvents: 'none', opacity: 0.45,
        width: '100%', height: '100%',
      }}
    />
  )
}