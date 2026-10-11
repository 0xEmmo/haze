import { useState } from 'react'
import { Link } from 'react-router'
import { Photo } from '@/components/Photo'
import { familyInfo, noteById } from '@/data/notes'
import type { Fragrance } from '@/data/types'
import styles from './NotePyramid.module.css'

const TIERS = [
  { id: 'top', label: 'Top', when: 'First 15 minutes' },
  { id: 'heart', label: 'Heart', when: 'The next few hours' },
  { id: 'base', label: 'Base', when: 'What stays on skin' },
] as const

/** Top, heart and base notes. Tap a note for what it smells like. */
export function NotePyramid({ notes }: { notes: Fragrance['notes'] }) {
  const [active, setActive] = useState(notes.top[0]!)
  const note = noteById(active)

  return (
    <div className={styles.wrap}>
      <ol role="list" className={styles.tiers}>
        {TIERS.map((t, i) => (
          <li key={t.id} className={styles.tier} style={{ ['--w' as string]: `${70 + i * 15}%` }}>
            <p className={styles.tierHead}>
              <strong>{t.label}</strong> <span className="muted">{t.when}</span>
            </p>
            <div className={styles.chips}>
              {notes[t.id].map((id) => {
                const n = noteById(id)
                return (
                  <button key={id} type="button" className="chip" aria-pressed={id === active} onClick={() => setActive(id)}>
                    <span className="dot" style={{ background: familyInfo[n.family].colour }} />
                    {n.name}
                  </button>
                )
              })}
            </div>
          </li>
        ))}
      </ol>
      <aside className={styles.detail} aria-live="polite">
        {note.photo ? <Photo name={note.photo} alt="" sizes="(min-width: 960px) 20vw, 40vw" ratio={1} className={styles.photo} /> : <span className={styles.swatch} style={{ background: familyInfo[note.family].colour }} />}
        <div>
          <p className="eyebrow">{familyInfo[note.family].label}</p>
          <p className={styles.noteName}>{note.name}</p>
          <p>{note.smells}</p>
          <Link to={`/wheel?note=${note.id}`} className={styles.more}>
            Find it on the scent wheel →
          </Link>
        </div>
      </aside>
    </div>
  )
}
