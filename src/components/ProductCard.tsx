import { Link, useNavigate } from 'react-router'
import type { Product } from '@/data/types'
import { formatNaira } from '@/lib/money'
import { useBox } from '@/stores/box'
import { useCompare } from '@/stores/compare'
import { Icon } from './Icon'
import { Photo } from './Photo'
import { ScentStrip } from './ScentStrip'
import { useToast } from './toast'
import styles from './ProductCard.module.css'

const BADGE = { new: 'New', bestseller: 'Loved', limited: 'Small batch' } as const

export function ProductCard({ product, sizes = '(min-width: 1100px) 25vw, (min-width: 700px) 33vw, 50vw', priority = false }: { product: Product; sizes?: string; priority?: boolean }) {
  const inBox = useBox((s) => s.slugs.includes(product.slug))
  const addToBox = useBox((s) => s.add)
  const removeFromBox = useBox((s) => s.remove)
  const comparing = useCompare((s) => s.slugs.includes(product.slug))
  const toggleCompare = useCompare((s) => s.toggle)
  const toast = useToast()
  const navigate = useNavigate()
  const soldOut = product.sizes.every((s) => s.stock === 0)
  const from = Math.min(...product.sizes.map((s) => s.price))

  return (
    <article className={styles.card}>
      <Link to={`/shop/${product.slug}`} className={styles.media} tabIndex={-1} aria-hidden>
        <Photo name={product.photos[0]!} alt="" sizes={sizes} ratio={4 / 5} priority={priority} />
        {product.photos[1] && <Photo name={product.photos[1]} alt="" sizes={sizes} ratio={4 / 5} className={styles.alt} />}
        {product.badge && <span className={`pill ${styles.badge}`}>{BADGE[product.badge]}</span>}
        {soldOut && <span className={`pill ${styles.badge}`}>Sold out</span>}
      </Link>
      <div className={styles.body}>
        <ScentStrip product={product} height={4} />
        <h3 className={styles.name}>
          <Link to={`/shop/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className={styles.tagline}>{product.tagline}</p>
        <p className={`${styles.price} num`}>
          {product.sizes.length > 1 && <span className="muted">from </span>}
          {formatNaira(from)}
          <span className="muted"> · {product.kind === 'fragrance' ? 'eau de parfum' : `${product.burnHours} hr candle`}</span>
        </p>
      </div>
      {product.kind === 'fragrance' && (
        <div className={styles.tools}>
          <button
            type="button"
            className={styles.tool}
            aria-pressed={inBox}
            onClick={() => {
              if (inBox) {
                removeFromBox(product.slug)
                return toast(`${product.name} taken out of your sample box`)
              }
              const r = addToBox(product.slug)
              if (!r.ok) toast('Your sample box is full. Swap one out on the box page.', { tone: 'danger', action: { label: 'Open box', onClick: () => void navigate('/box') } })
              else toast(`${product.name} added to your sample box (${r.slugs.length}/5)`, { tone: 'ok' })
            }}
          >
            <Icon name={inBox ? 'check' : 'vial'} size={16} />
            <span>{inBox ? 'In your box' : 'Sample'}</span>
            <span className="sr-only"> {product.name}</span>
          </button>
          <button
            type="button"
            className={styles.tool}
            aria-pressed={comparing}
            onClick={() => {
              const r = toggleCompare(product.slug)
              if (r.full && !comparing) toast('You can compare three at a time. Remove one first.', { tone: 'danger' })
            }}
          >
            <Icon name={comparing ? 'check' : 'compare'} size={16} />
            <span>Compare</span>
            <span className="sr-only"> {product.name}</span>
          </button>
        </div>
      )}
    </article>
  )
}
