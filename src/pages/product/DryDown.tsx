import { useId, useState } from 'react'
import { familyInfo, noteById } from '@/data/notes'
import type { Fragrance } from '@/data/types'
import { describeHour, tierStrength, type Tier } from '@/lib/drydown'
import styles from './DryDown.module.css'

/** Drag through the day and watch the notes fade in and out. */
export function DryDown({ fragrance }: { fragrance: Fragrance }) {
  const [hour, setHour] = useState(0)
  const id = useId()
  const L = fragrance.longevityHours
  const tiers: Tier[] = ['top', 'heart', 'base']
  const clock = (h: number) => {
    const t = new Date(2026, 0, 1, 8, 0)
    t.setMinutes(t.getMinutes() + h * 60)
    return t.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.stage} aria-hidden>
        {tiers.flatMap((t) =>
          fragrance.notes[t].map((n, i) => {
            const note = noteById(n)
            const s = tierStrength(t, hour, L)
            return (
              <span
                key={n}
                className={styles.blob}
                data-tier={t}
                style={{
                  background: `radial-gradient(circle, ${familyInfo[note.family].colour} 0%, ${familyInfo[note.family].colour}00 68%)`,
                  opacity: 0.15 + s * 0.75,
                  transform: `scale(${0.55 + s * 0.6})`,
                  left: `${12 + ((tiers.indexOf(t) * 3 + i) * 29) % 76}%`,
                  top: `${t === 'top' ? 18 : t === 'heart' ? 42 : 66}%`,
                }}
              >
                <span style={{ opacity: s > 0.25 ? 1 : 0 }}>{note.name}</span>
              </span>
            )
          }),
        )}
      </div>
      <div className={styles.controls}>
        <label htmlFor={id} className={styles.label}>
          <span className={styles.phase}>{describeHour(hour, L)}</span>
          <span className="muted num">
            {hour === 0 ? 'Sprayed at 8:00 am' : `${clock(hour)}, ${hour} ${hour === 1 ? 'hour' : 'hours'} in`}
          </span>
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={L + 1}
          step={1}
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          className={styles.range}
          aria-valuetext={`${hour} hours after spraying: ${describeHour(hour, L)}`}
        />
        <ul role="list" className={styles.levels}>
          {tiers.map((t) => (
            <li key={t}>
              <span className={styles.tier}>{t}</span>
              <span className={styles.bar}>
                <span style={{ transform: `scaleX(${tierStrength(t, hour, L)})` }} />
              </span>
              <span className="muted">{fragrance.notes[t].map((n) => noteById(n).name).join(', ')}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
