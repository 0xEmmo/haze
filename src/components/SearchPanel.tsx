import { useEffect, useId, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { searchProducts } from '@/api/client'
import type { Product } from '@/data/types'
import { formatNaira } from '@/lib/money'
import { Dialog } from './Dialog'
import { Icon } from './Icon'
import { Photo } from './Photo'
import styles from './SearchPanel.module.css'

const SUGGESTIONS = ['oud', 'vanilla', 'sea salt', 'incense', 'candle']

export function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Product[] | null>(null)
  const [active, setActive] = useState(-1)
  const listId = useId()

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) return
    let live = true
    const t = window.setTimeout(() => {
      void searchProducts(term).then((h) => {
        if (!live) return
        setHits(h)
        setActive(-1)
      })
    }, 140)
    return () => {
      live = false
      window.clearTimeout(t)
    }
  }, [q])

  const shown = q.trim().length >= 2 ? hits : null

  const go = (href: string) => {
    onClose()
    setQ('')
    setHits(null)
    void navigate(href)
  }

  return (
    <Dialog open={open} onClose={onClose} title="Search" placement="top" hideTitle>
      <form
        role="search"
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault()
          const hit = shown && active >= 0 ? shown[active] : null
          if (hit) go(`/shop/${hit.slug}`)
          else if (q.trim()) go(`/shop?q=${encodeURIComponent(q.trim())}`)
        }}
      >
        <Icon name="search" size={22} />
        <input
          autoFocus
          type="search"
          role="combobox"
          aria-label="Search scents, notes or candles"
          aria-expanded={!!shown?.length}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-autocomplete="list"
          placeholder="Try “oud” or “sea salt”"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (!shown?.length) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((i) => (i + 1) % shown.length)
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((i) => (i <= 0 ? shown.length - 1 : i - 1))
            }
          }}
        />
      </form>

      {shown === null ? (
        <div className={styles.suggest}>
          <p className="eyebrow">People look for</p>
          <ul role="list">
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <button type="button" onClick={() => setQ(s)}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : shown.length === 0 ? (
        <p className={styles.none} role="status">
          Nothing matches “{q.trim()}”. Try a note like vetiver or jasmine.
        </p>
      ) : (
        <>
          <ul id={listId} role="listbox" aria-label="Suggestions" className={styles.hits}>
            {shown.map((h, i) => (
              <li key={h.slug} id={`${listId}-${i}`} role="option" aria-selected={i === active} className={styles.hit} data-active={i === active}>
                <Link to={`/shop/${h.slug}`} onClick={(e) => (e.preventDefault(), go(`/shop/${h.slug}`))} tabIndex={-1}>
                  <Photo name={h.photos[0]!} alt="" sizes="56px" ratio={1} className={styles.thumb} />
                  <span>
                    <span className={styles.brand}>{h.kind === 'fragrance' ? 'Eau de parfum' : 'Candle'}</span>
                    <span className={styles.name}>{h.name}</span>
                  </span>
                  <span className="num">{formatNaira(h.sizes[0]!.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <button type="button" className={`link-btn ${styles.all}`} onClick={() => go(`/shop?q=${encodeURIComponent(q.trim())}`)}>
            See all results for “{q.trim()}”
          </button>
        </>
      )}
    </Dialog>
  )
}
