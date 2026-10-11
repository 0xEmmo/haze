import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Icon } from '@/components/Icon'
import { Photo } from '@/components/Photo'
import { ProductCard } from '@/components/ProductCard'
import { QuantityStepper } from '@/components/QuantityStepper'
import { ScentStrip } from '@/components/ScentStrip'
import { Stars } from '@/components/Stars'
import { useToast } from '@/components/toast'
import { productBySlug, products } from '@/data/catalogue'
import { noteById } from '@/data/notes'
import type { Product } from '@/data/types'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ENGRAVING_MAX, ENGRAVING_PRICE, MAX_QTY, validEngraving } from '@/lib/cart'
import { formatNaira } from '@/lib/money'
import { similarTo } from '@/lib/similar'
import { useBox } from '@/stores/box'
import { useCart } from '@/stores/cart'
import { useCompare } from '@/stores/compare'
import { useUi } from '@/stores/ui'
import NotFoundPage from '../NotFoundPage'
import { DryDown } from './DryDown'
import { NotePyramid } from './NotePyramid'
import styles from './ProductPage.module.css'

const SEASON = { harmattan: 'Best in the dry season', rainy: 'Best in the rains', 'all-year': 'Any time of year' } as const
const TIME = { day: 'Daytime', night: 'Evenings', any: 'Day or night' } as const
const INTENSITY = ['', 'Skin scent', 'Soft', 'Moderate', 'Strong', 'Fills the room'] as const

export default function ProductPage() {
  const { slug = '' } = useParams()
  const product = productBySlug(slug)
  usePageTitle(product?.name ?? 'Not found')
  if (!product) return <NotFoundPage />
  return <ProductView key={product.slug} product={product} />
}

function ProductView({ product }: { product: Product }) {
  const firstInStock = product.sizes.find((s) => s.stock > 0) ?? product.sizes[0]!
  const [sizeId, setSizeId] = useState(firstInStock.id)
  const [qty, setQty] = useState(1)
  const [engrave, setEngrave] = useState(false)
  const [text, setText] = useState('')
  const [touched, setTouched] = useState(false)
  const addItem = useCart((s) => s.addItem)
  const openBag = useUi((s) => s.openBag)
  const inBox = useBox((s) => s.slugs.includes(product.slug))
  const addToBox = useBox((s) => s.add)
  const comparing = useCompare((s) => s.slugs.includes(product.slug))
  const toggleCompare = useCompare((s) => s.toggle)
  const toast = useToast()

  const size = product.sizes.find((s) => s.id === sizeId)!
  const engravingError = engrave ? validEngraving(text) : null
  const unit = size.price + (engrave ? ENGRAVING_PRICE : 0)
  const rating = product.reviews.reduce((s, r) => s + r.rating, 0) / Math.max(1, product.reviews.length)
  const similar = similarTo(product, products.filter((p) => p.kind === product.kind))

  const add = () => {
    if (engrave && engravingError) {
      setTouched(true)
      return document.getElementById('engraving')?.focus()
    }
    addItem({ type: 'item', slug: product.slug, sizeId, qty, engraving: engrave ? text.trim() : undefined })
    toast(`${product.name}, ${size.label} added to your bag`, { tone: 'ok', action: { label: 'View bag', onClick: openBag } })
    setQty(1)
  }

  return (
    <article>
      <div className={`wrap ${styles.top}`}>
        <nav aria-label="Breadcrumb" className={styles.crumbs}>
          <Link to="/shop">Shop</Link>
          <span aria-hidden>/</span>
          <Link to={`/shop?kind=${product.kind}`}>{product.kind === 'fragrance' ? 'Perfume' : 'Candles'}</Link>
        </nav>

        <div className={styles.gallery} tabIndex={0} aria-label={`${product.name} photos`} role="region">
          {product.photos.map((p, i) => (
            <Photo key={p} name={p} alt={i === 0 ? `${product.name} ${product.kind === 'fragrance' ? 'bottle' : 'candle'}` : ''} sizes="(min-width: 960px) 50vw, 88vw" ratio={4 / 5} priority={i === 0} />
          ))}
        </div>

        <div className={styles.buy}>
          <p className="eyebrow">{product.kind === 'fragrance' ? `Eau de parfum · ${product.year}` : `Scented candle · ${product.wax}`}</p>
          <h1 className={`display ${styles.name}`}>{product.name}</h1>
          <p className={styles.tagline}>{product.tagline}</p>
          {product.reviews.length > 0 && (
            <a href="#reviews" className={styles.rating}>
              <Stars value={rating} count={product.reviews.length} />
            </a>
          )}
          <ScentStrip product={product} showLabels height={8} />

          <fieldset className={styles.sizes}>
            <legend className="label">Size</legend>
            <div>
              {product.sizes.map((s) => (
                <label key={s.id} className={styles.size} data-out={s.stock === 0}>
                  <input type="radio" name="size" value={s.id} checked={s.id === sizeId} disabled={s.stock === 0} onChange={() => (setSizeId(s.id), setQty(1))} />
                  <span className={styles.sizeLabel}>{s.label}</span>
                  <span className="num">{s.stock === 0 ? 'Sold out' : formatNaira(s.price)}</span>
                </label>
              ))}
            </div>
            {size.stock > 0 && size.stock <= 10 && <p className={styles.low}>Only {size.stock} left from this batch</p>}
          </fieldset>

          {product.kind === 'fragrance' && (
            <div className={styles.engrave}>
              <label className={styles.engraveToggle}>
                <input type="checkbox" checked={engrave} onChange={(e) => setEngrave(e.target.checked)} />
                <span>
                  Engrave the cap <span className="muted">+{formatNaira(ENGRAVING_PRICE)}</span>
                </span>
              </label>
              {engrave && (
                <div className={styles.engraveBody}>
                  <div className={styles.plate} aria-hidden>
                    <span>{text.trim() || 'Your words'}</span>
                  </div>
                  <div className="field">
                    <label htmlFor="engraving">Up to {ENGRAVING_MAX} characters</label>
                    <input
                      id="engraving"
                      className="input"
                      value={text}
                      maxLength={ENGRAVING_MAX + 4}
                      onChange={(e) => setText(e.target.value)}
                      onBlur={() => setTouched(true)}
                      aria-invalid={touched && !!engravingError}
                      aria-describedby="engraving-msg"
                      autoComplete="off"
                    />
                    <p id="engraving-msg" className={touched && engravingError ? 'error' : 'hint'}>
                      {touched && engravingError ? engravingError : `${Math.max(0, ENGRAVING_MAX - text.trim().length)} left. Engraved bottles can’t be returned.`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={styles.addRow}>
            <QuantityStepper value={qty} onChange={setQty} max={Math.min(MAX_QTY, size.stock || 1)} label={`Quantity of ${product.name}`} />
            <button type="button" className="btn btn-ember" onClick={add} disabled={size.stock === 0}>
              Add to bag · <span className="num">{formatNaira(unit * qty)}</span>
            </button>
          </div>

          {product.kind === 'fragrance' && (
            <div className={styles.side}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={inBox}
                onClick={() => {
                  const r = addToBox(product.slug)
                  toast(r.ok ? `Vial added to your sample box (${r.slugs.length}/5)` : 'Your sample box is full', { tone: r.ok ? 'ok' : 'danger' })
                }}
              >
                <Icon name={inBox ? 'check' : 'vial'} size={16} /> {inBox ? 'In your sample box' : 'Add a 2 ml vial to my box'}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                aria-pressed={comparing}
                onClick={() => {
                  const r = toggleCompare(product.slug)
                  if (r.full && !comparing) toast('You can compare three at a time', { tone: 'danger' })
                }}
              >
                <Icon name={comparing ? 'check' : 'compare'} size={16} /> {comparing ? 'Comparing' : 'Compare'}
              </button>
            </div>
          )}

          <ul role="list" className={styles.perks}>
            <li>
              <Icon name="truck" size={18} /> Lagos in 1 to 2 days. Free over {formatNaira(100000)}.
            </li>
            <li>
              <Icon name="gift" size={18} /> Gift wrap with a handwritten card at checkout.
            </li>
          </ul>
        </div>
      </div>

      <section className={`wrap ${styles.story}`} aria-labelledby="story">
        <h2 id="story" className="eyebrow">
          The story
        </h2>
        <p className={styles.storyText}>{product.story}</p>
      </section>

      {product.kind === 'fragrance' ? (
        <>
          <section className={`wrap ${styles.section}`} aria-labelledby="notes">
            <h2 id="notes" className={`display ${styles.h2}`}>
              The <em>notes</em>
            </h2>
            <NotePyramid notes={product.notes} />
          </section>
          <section className={`wrap ${styles.section}`} aria-labelledby="drydown">
            <h2 id="drydown" className={`display ${styles.h2}`}>
              How it <em>wears</em>
            </h2>
            <DryDown fragrance={product} />
          </section>
          <section className={`wrap ${styles.section}`} aria-label="Details">
            <dl className={styles.specs}>
              <div>
                <dt>Strength</dt>
                <dd>
                  <span className={styles.meter} aria-hidden>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} data-on={i <= product.intensity} />
                    ))}
                  </span>
                  {INTENSITY[product.intensity]}
                </dd>
              </div>
              <div>
                <dt>Lasts</dt>
                <dd>About {product.longevityHours} hours</dd>
              </div>
              <div>
                <dt>When</dt>
                <dd>
                  {TIME[product.time]}, {SEASON[product.season].toLowerCase()}
                </dd>
              </div>
              <div>
                <dt>Perfumer</dt>
                <dd>{product.perfumer}</dd>
              </div>
            </dl>
          </section>
        </>
      ) : (
        <section className={`wrap ${styles.section}`} aria-label="Details">
          <dl className={styles.specs}>
            <div>
              <dt>Smells of</dt>
              <dd>{product.notes.map((n) => noteById(n).name).join(', ')}</dd>
            </div>
            <div>
              <dt>Burns for</dt>
              <dd>About {product.burnHours} hours</dd>
            </div>
            <div>
              <dt>Wax</dt>
              <dd>{product.wax}</dd>
            </div>
            <div>
              <dt>First burn</dt>
              <dd>Let the top melt to the edge, about two hours, so it doesn’t tunnel.</dd>
            </div>
          </dl>
        </section>
      )}

      {product.reviews.length > 0 && (
        <section id="reviews" className={`wrap ${styles.section}`} aria-labelledby="reviews-h">
          <h2 id="reviews-h" className={`display ${styles.h2}`}>
            What people say <span className={`num ${styles.avg}`}>{rating.toFixed(1)}</span>
          </h2>
          <ul role="list" className={styles.reviews}>
            {product.reviews.map((r) => (
              <li key={r.id}>
                <Stars value={r.rating} />
                <p className={styles.reviewBody}>“{r.body}”</p>
                <p className="muted">
                  {r.author}, {r.city} ·{' '}
                  <time dateTime={r.date}>{new Date(r.date).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}</time>
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {similar.length > 0 && (
        <section className={`wrap ${styles.section}`} aria-labelledby="similar">
          <h2 id="similar" className={`display ${styles.h2}`}>
            If you like {product.name}
          </h2>
          <ul role="list" className={styles.similar}>
            {similar.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} sizes="(min-width: 960px) 25vw, 50vw" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
