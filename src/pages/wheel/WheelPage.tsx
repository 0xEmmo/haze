import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Photo } from '@/components/Photo'
import { ScentStrip } from '@/components/ScentStrip'
import { products } from '@/data/catalogue'
import { familyInfo, noteById, notes, notesByFamily } from '@/data/notes'
import { FAMILIES, type Family } from '@/data/types'
import { usePageTitle } from '@/hooks/usePageTitle'
import { formatNaira } from '@/lib/money'
import { notesOf } from '@/lib/notesOf'
import { ScentWheel } from './ScentWheel'
import styles from './WheelPage.module.css'

const isFamily = (f: string | null): f is Family => !!f && (FAMILIES as string[]).includes(f)

export default function WheelPage() {
  usePageTitle('Scent wheel')
  const [params, setParams] = useSearchParams()
  const noteParam = params.get('note')
  const note = noteParam ? notes.find((n) => n.id === noteParam) : undefined
  const family: Family = note?.family ?? (isFamily(params.get('family')) ? (params.get('family') as Family) : 'amber')

  const select = (f: Family, n?: string) => setParams(n ? { note: n } : { family: f }, { replace: true, preventScrollReset: true })

  const matches = useMemo(() => {
    if (note) return products.filter((p) => notesOf(p).includes(note.id))
    return products
      .filter((p) => (p.profile[family] ?? 0) >= 0.5)
      .sort((a, b) => (b.profile[family] ?? 0) - (a.profile[family] ?? 0))
  }, [note, family])

  const info = familyInfo[family]

  return (
    <div className={`wrap ${styles.page}`}>
      <header className={styles.head}>
        <p className="eyebrow">Scent wheel</p>
        <h1 className="display">
          Every note, <em>in its place</em>
        </h1>
        <p className="muted">Turn the wheel or tap a family. The outer ring is the notes we use; tap one to see what it smells like and where you’ll find it.</p>
      </header>

      <div className={styles.layout}>
        <div className={styles.wheelCol}>
          <ScentWheel family={family} note={note?.id ?? null} onSelect={select} />
          <div className={styles.chips} role="group" aria-label="Families">
            {FAMILIES.map((f) => (
              <button key={f} type="button" className="chip" aria-pressed={f === family && !note} onClick={() => select(f)}>
                <span className="dot" style={{ background: familyInfo[f].colour }} />
                {familyInfo[f].label}
              </button>
            ))}
          </div>
        </div>

        <section className={styles.panel} aria-live="polite" aria-labelledby="panel-title" style={{ ['--fam' as string]: info.colour }}>
          {note ? (
            <>
              <div className={styles.noteHead}>
                {note.photo ? <Photo name={note.photo} alt="" sizes="160px" ratio={1} className={styles.notePhoto} /> : <span className={styles.noteSwatch} />}
                <div>
                  <button type="button" className={`link-btn ${styles.back}`} onClick={() => select(family)}>
                    ← {info.label}
                  </button>
                  <h2 id="panel-title" className="display">
                    {note.name}
                  </h2>
                </div>
              </div>
              <p className={styles.blurb}>{note.smells}</p>
            </>
          ) : (
            <>
              <p className={styles.famTag}>
                <span className="dot" style={{ background: info.colour }} /> Family
              </p>
              <h2 id="panel-title" className="display">
                {info.label}
              </h2>
              <p className={styles.blurb}>{info.blurb}</p>
              <div className={styles.noteList}>
                {notesByFamily(family).map((n) => (
                  <button key={n.id} type="button" className="chip" onClick={() => select(family, n.id)}>
                    {n.name}
                  </button>
                ))}
              </div>
            </>
          )}

          <h3 className={styles.subhead}>{matches.length ? (note ? `In ${matches.length} of ours` : `Where ${info.label.toLowerCase()} leads`) : 'Not in anything yet'}</h3>
          <ul role="list" className={styles.matches}>
            {matches.map((p) => (
              <li key={p.slug}>
                <Link to={`/shop/${p.slug}`} className={styles.match}>
                  <Photo name={p.photos[0]!} alt="" sizes="72px" ratio={1} />
                  <span className={styles.matchText}>
                    <strong>{p.name}</strong>
                    <span className="muted">
                      {p.kind === 'fragrance'
                        ? note
                          ? (['top', 'heart', 'base'] as const).find((t) => p.notes[t].includes(note.id)) + ' note'
                          : [...p.notes.top, ...p.notes.heart].slice(0, 3).map((n) => noteById(n).name.toLowerCase()).join(' · ')
                        : 'Candle'}
                    </span>
                    <ScentStrip product={p} height={4} />
                  </span>
                  <span className="num">{formatNaira(p.sizes[0]!.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
