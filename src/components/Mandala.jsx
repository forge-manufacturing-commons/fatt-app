export default function Mandala() {
  const cols = ['#E01A5A', '#D98C0F', '#0E7360', '#EDE0C4']
  const circles = []
  for (let ring = 1; ring < 26; ring++) {
    const rad = ring * 10
    const n = Math.max(8, Math.floor(rad / 3.5))
    for (let k = 0; k < n; k++) {
      const a = (2 * Math.PI * k) / n + ring * 0.12
      const x = 260 + rad * Math.cos(a)
      const y = 260 + rad * Math.sin(a)
      circles.push(
        <circle key={`${ring}-${k}`} cx={x.toFixed(1)} cy={y.toFixed(1)}
          r={(2.4 - ring * 0.02).toFixed(1)} fill={cols[ring % 4]} />
      )
    }
  }
  return (
    <svg className="mandala" viewBox="0 0 520 520" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {circles}
    </svg>
  )
}
