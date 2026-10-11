import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Icon } from '@/components/Icon'
import { Photo } from '@/components/Photo'
import { ScentStrip } from '@/components/ScentStrip'
import { fragrances } from '@/data/catalogue'
import { familyInfo, noteById } from '@/data/notes'
import type { Fragrance } from '@/data/types'
import { usePageTitle } from '@/hooks/usePageTitle'
import { MAX_COMPARE, parseCompare, pricePerMl, sharedNotes } from '@/lib/compare'
import { formatNaira } from '@/lib/money'
import { useCompare } from '@/stores/compare'
import styles from './ComparePage.module.css'

const TIME = { day: 'Day', night: 'Night', any: 'Day or night' } as const
const SEASON = { harmattan: 'Dry season', rainy: 'Rainy season', 'all-year': 'All year' } as const

export default function ComparePage() {
  usePageTitle('Compare')
  const [params, setParams] = useSearchParams()
  const stored = useCompare((s) => s.slugs)
  const setStored = useCompare((s) => s.set)
  const fromUrl = params.get('ids')
  const list = parseCompare(fromUrl ?? stored.join(','))

  // the URL wins (so links can be shared); keep the store in step with it
  useEffect(() => {
    if (fromUrl !== null) setStored(parseCompare(fromUrl).map((f) => f.slug))
  }, [fromUrl, setStored])

  const setList = (slugs: string[]) => {
    setStored(slugs)
    setParams(slugs.length ? { ids: slugs.join(',') } : {}, { replace: true })
  }
  const shared = sharedNotes(list)
  const others = fragrances.filter((f) => !list.some((x) => x.slug === f.slug))

  const rows: { label: string; render: (f: Fragrance) => React.ReactNode }[] = [
    { label: 'Families', render: (f) => <ScentStrip product={f} showLabels height={6} /> },
    {
      label: 'Notes',
      render: (f) => (
        <ul role="list" className={styles.notes}>
          {(['top', 'heart', 'base'] as const).flatMap((t) =>
            f.notes[t].map((n) => (
              <li key={n} data-shared={shared.has(n)}>
                <span className="dot" style={{ background: familyInfo[noteById(n).family].colour }} />
                {noteById(n).name}
                <span className={styles.tier}>{t}</span>
              </li>
            )),
          )}
        </ul>
      ),
    },
    {
      label: 'Strength',
      render: (f) => (
        <span className={styles.meter} role="img" aria-label={`${f.intensity} out of 5`}>
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} data-on={i <= f.intensity} />
          ))}
        </span>
      ),
    },
    { label: 'Lasts', render: (f) => <span className="num">~{f.longevityHours} hours</span> },
    { label: 'Best for', render: (f) => `${TIME[f.time]}, ${SEASON[f.season].toLowerCase()}` },
    {
      label: 'Price',
      render: (f) => (
        <ul role="list" className={styles.prices}>
          {f.sizes.map((s) => (
            <li key={s.id} className="num">
              {s.label}: {formatNaira(s.price)} <span className="muted">({formatNaira(pricePerMl(s.price, s.ml))}/ml)</span>
            </li>
          ))}
        </ul>
      ),
    },
  ]

  return (
    <div className={`wrap ${styles.page}`}>
      <header className={styles.head}>
        <p className="eyebrow">Compare</p>
        <h1 className="display">
          Side by <em>side</em>
        </h1>
        {list.length > 1 && shared.size > 0 && (
          <p className="muted">
            Shared notes are highlighted: {[...shared].map((n) => noteById(n).name).join(', ')}.
          </p>
        )}
      </header>

      {list.length === 0 ? (
        <div className={styles.empty}>
          <p className="display">Nothing to compare yet.</p>
          <p className="muted">Tap “Compare” on up to three perfumes in the shop, or start with two of our most worn.</p>
          <div className={styles.emptyActions}>
            <button type="button" className="btn" onClick={() => setList(['harmattan', 'oud-oba'])}>
              Harmattan vs Oud Oba
            </button>
            <Link to="/shop?kind=fragrance" className="btn btn-ghost">
              Go to the shop
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.scroller} role="region" aria-label="Comparison table" tabIndex={0}>
          <table className={styles.table} style={{ ['--cols' as string]: list.length }}>
            <thead>
              <tr>
                <td />
                {list.map((f) => (
                  <th key={f.slug} scope="col">
                    <Link to={`/shop/${f.slug}`} className={styles.colHead}>
                      <Photo name={f.photos[0]!} alt="" sizes="240px" ratio={1} />
                      <span className="display">{f.name}</span>
                    </Link>
                    <button type="button" className={styles.remove} onClick={() => setList(list.filter((x) => x.slug !== f.slug).map((x) => x.slug))}>
                      <Icon name="close" size={14} /> Remove<span className="sr-only"> {f.name}</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  {list.map((f) => (
                    <td key={f.slug}>{r.render(f)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {list.length > 0 && list.length < MAX_COMPARE && (
        <section className={styles.add} aria-labelledby="add-h">
          <h2 id="add-h" className="eyebrow">
            Add another
          </h2>
          <div className={styles.addList}>
            {others.map((f) => (
              <button key={f.slug} type="button" className="chip" onClick={() => setList([...list.map((x) => x.slug), f.slug])}>
                <Icon name="plus" size={14} /> {f.name}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
