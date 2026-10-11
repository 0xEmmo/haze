import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { ProductCard } from '@/components/ProductCard'
import { products } from '@/data/catalogue'
import { familyInfo } from '@/data/notes'
import { FAMILIES, type Family } from '@/data/types'
import { usePageTitle } from '@/hooks/usePageTitle'
import { filterProducts, parseShopQuery, SORTS, toSearchParams, type ShopQuery } from '@/lib/shop'
import styles from './ShopPage.module.css'

export default function ShopPage() {
  const [params, setParams] = useSearchParams()
  const query = useMemo(() => parseShopQuery(params), [params])
  const results = useMemo(() => filterProducts(products, query), [query])
  const update = (patch: Partial<ShopQuery>) => setParams(toSearchParams({ ...query, ...patch }), { replace: true, preventScrollReset: true })
  const toggleFamily = (f: Family) => update({ families: query.families.includes(f) ? query.families.filter((x) => x !== f) : [...query.families, f] })
  const filtered = query.kind !== 'all' || query.families.length > 0 || query.time !== 'any' || !!query.q

  const title = query.kind === 'candle' ? 'Candles' : query.kind === 'fragrance' ? 'Perfume' : 'Everything'
  usePageTitle(title)

  return (
    <div className="wrap">
      <header className={styles.head}>
        <p className="eyebrow">The shop</p>
        <h1 className="display">
          {query.q ? (
            <>
              Smells like “<em>{query.q}</em>”
            </>
          ) : (
            title
          )}
        </h1>
      </header>

      <div className={styles.controls}>
        <div className={styles.row} role="group" aria-label="Type">
          {(['all', 'fragrance', 'candle'] as const).map((k) => (
            <button key={k} type="button" className="chip" aria-pressed={query.kind === k} onClick={() => update({ kind: k, time: k === 'candle' ? 'any' : query.time })}>
              {k === 'all' ? 'All' : k === 'fragrance' ? 'Perfume' : 'Candles'}
            </button>
          ))}
          {query.kind !== 'candle' && (
            <>
              <span className={styles.sep} aria-hidden />
              {(['day', 'night'] as const).map((t) => (
                <button key={t} type="button" className="chip" aria-pressed={query.time === t} onClick={() => update({ time: query.time === t ? 'any' : t })}>
                  {t === 'day' ? 'For the day' : 'For the night'}
                </button>
              ))}
            </>
          )}
        </div>
        <div className={styles.row} role="group" aria-label="Scent family">
          {FAMILIES.map((f) => (
            <button key={f} type="button" className="chip" aria-pressed={query.families.includes(f)} onClick={() => toggleFamily(f)}>
              <span className="dot" style={{ background: familyInfo[f].colour }} />
              {familyInfo[f].label}
            </button>
          ))}
        </div>
        <div className={styles.meta}>
          <p role="status" className="muted">
            {results.length} {results.length === 1 ? 'scent' : 'scents'}
            {filtered && (
              <>
                {' · '}
                <button type="button" className="link-btn" onClick={() => setParams({}, { replace: true })}>
                  Clear filters
                </button>
              </>
            )}
          </p>
          <label className={styles.sort}>
            <span className="sr-only">Sort by</span>
            <select className="input" value={query.sort} onChange={(e) => update({ sort: e.target.value as ShopQuery['sort'] })}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {results.length ? (
        <ul role="list" className={styles.grid}>
          {results.map((p, i) => (
            <li key={p.slug}>
              <ProductCard product={p} priority={i < 2} />
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <p className="display">Nothing quite like that.</p>
          <p className="muted">Try fewer families, or let the quiz suggest something.</p>
          <button type="button" className="btn" onClick={() => setParams({}, { replace: true })}>
            Show everything
          </button>
        </div>
      )}
    </div>
  )
}
