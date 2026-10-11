import { useId, useState } from 'react'
import styles from './Quiz.module.css'

const SLIDERS = [
  { key: 'warmth', q: 'Fresh or cosy?', left: 'Cool and fresh', right: 'Warm and cosy' },
  { key: 'boldness', q: 'How much should people notice?', left: 'Only up close', right: 'Across the room' },
  { key: 'night', q: 'When would you wear it most?', left: 'Daytime', right: 'Nights out' },
] as const

type Values = { warmth: number; boldness: number; night: number }

export function SliderStep({ onDone, onBack }: { onDone: (v: Values) => void; onBack: () => void }) {
  const [v, setV] = useState<Values>({ warmth: 50, boldness: 50, night: 50 })
  const id = useId()
  return (
    <form
      className={`wrap ${styles.sliders}`}
      onSubmit={(e) => {
        e.preventDefault()
        onDone(v)
      }}
    >
      <p className="eyebrow">Last bit</p>
      <h1 className="display">Three dials</h1>
      {SLIDERS.map((s) => (
        <div key={s.key} className={styles.slider}>
          <label htmlFor={`${id}-${s.key}`} className={styles.sliderQ}>
            {s.q}
          </label>
          <input
            id={`${id}-${s.key}`}
            type="range"
            min={0}
            max={100}
            step={5}
            value={v[s.key]}
            onChange={(e) => setV({ ...v, [s.key]: Number(e.target.value) })}
            aria-valuetext={v[s.key] < 40 ? s.left : v[s.key] > 60 ? s.right : 'Somewhere in between'}
            style={{ ['--p' as string]: `${v[s.key]}%` }}
          />
          <div className={styles.ends} aria-hidden>
            <span>{s.left}</span>
            <span>{s.right}</span>
          </div>
        </div>
      ))}
      <div className={styles.sliderActions}>
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          Back
        </button>
        <button type="submit" className="btn btn-ember">
          Show my matches
        </button>
      </div>
    </form>
  )
}
