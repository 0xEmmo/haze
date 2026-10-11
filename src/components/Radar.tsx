import { familyInfo } from '@/data/notes'
import { FAMILIES } from '@/data/types'
import type { Vector } from '@/lib/profile'
import { polar } from '@/lib/wheel'

/** Eight-axis radar of a scent profile. Scaled so the strongest family touches the edge. */
export function Radar({ profile, size = 280, label }: { profile: Vector; size?: number; label: string }) {
  const c = 150
  const r = 110
  const max = Math.max(0.0001, ...FAMILIES.map((f) => profile[f]))
  const step = 360 / FAMILIES.length
  const pts = FAMILIES.map((f, i) => polar(c, c, (profile[f] / max) * r, i * step))
  return (
    <svg viewBox="0 0 300 300" width={size} height={size} role="img" aria-label={label} style={{ overflow: 'visible', maxWidth: '100%', height: 'auto' }}>
      {[0.33, 0.66, 1].map((k) => (
        <polygon
          key={k}
          points={FAMILIES.map((_, i) => polar(c, c, r * k, i * step)).map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="var(--line-strong)"
          strokeWidth={1}
        />
      ))}
      {FAMILIES.map((f, i) => {
        const o = polar(c, c, r, i * step)
        const l = polar(c, c, r + 22, i * step)
        return (
          <g key={f}>
            <line x1={c} y1={c} x2={o.x} y2={o.y} stroke="var(--line)" />
            <text x={l.x} y={l.y} textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight={600} fill="var(--ink-soft)">
              {familyInfo[f].label}
            </text>
          </g>
        )
      })}
      <polygon points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="rgb(165 72 42 / 0.22)" stroke="var(--ember)" strokeWidth={2} strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill={familyInfo[FAMILIES[i]!].colour} />
      ))}
    </svg>
  )
}
