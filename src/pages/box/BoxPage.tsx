import { Link } from 'react-router'
import { Icon } from '@/components/Icon'
import { Photo } from '@/components/Photo'
import { ScentStrip } from '@/components/ScentStrip'
import { useToast } from '@/components/toast'
import { fragranceBySlug, fragrances } from '@/data/catalogue'
import { familyInfo } from '@/data/notes'
import { usePageTitle } from '@/hooks/usePageTitle'
import { BOX_CREDIT_DAYS, BOX_PRICE, BOX_SIZE } from '@/lib/box'
import { formatNaira } from '@/lib/money'
import { mainFamily } from '@/lib/profile'
import { useBox } from '@/stores/box'
import { useCart } from '@/stores/cart'
import { useUi } from '@/stores/ui'
import styles from './BoxPage.module.css'

/** A spread of families, for "fill the rest for me". */
const SPREAD = ['harmattan', 'lekki-salt', 'hibiscus-hour', 'oud-oba', 'shea-and-fig', 'night-market', 'after-rain', 'ember', 'blue-hour', 'glass-garden', 'gold-leaf', 'cedar-room']

export default function BoxPage() {
  usePageTitle('Sample box')
  const slugs = useBox((s) => s.slugs)
  const { add, remove, fill, move, reset } = useBox()
  const addBox = useCart((s) => s.addBox)
  const openBag = useUi((s) => s.openBag)
  const toast = useToast()
  const full = slugs.length === BOX_SIZE

  const toBag = () => {
    addBox(slugs)
    reset()
    toast('Discovery box added to your bag', { tone: 'ok', action: { label: 'View bag', onClick: openBag } })
  }

  return (
    <div className={`wrap ${styles.page}`}>
      <header className={styles.head}>
        <div>
          <p className="eyebrow">Discovery box</p>
          <h1 className="display">
            Five vials, <em>one week</em>, no guessing.
          </h1>
          <p className={styles.lede}>
            Pick any five perfumes as 2 ml sprays, about thirty wears each. It’s {formatNaira(BOX_PRICE)}, and the whole amount comes off a
            full bottle for {BOX_CREDIT_DAYS} days after it ships.
          </p>
        </div>
        <Photo name="b-vials" alt="Two small glass sample bottles lying on white linen" sizes="(min-width: 960px) 30vw, 100vw" ratio={4 / 3} className={styles.headPhoto} />
      </header>

      <section className={styles.tray} aria-labelledby="your-box">
        <div className={styles.trayHead}>
          <h2 id="your-box" className="display">
            Your box <span className="num muted">{slugs.length}/{BOX_SIZE}</span>
          </h2>
          <div className={styles.trayActions}>
            {!full && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => fill(SPREAD)}>
                <Icon name="spark" size={16} /> Fill the rest for me
              </button>
            )}
            {slugs.length > 0 && (
              <button type="button" className="link-btn" onClick={reset}>
                Empty
              </button>
            )}
          </div>
        </div>
        <ol role="list" className={styles.slots}>
          {Array.from({ length: BOX_SIZE }, (_, i) => {
            const f = slugs[i] ? fragranceBySlug(slugs[i]) : undefined
            if (!f)
              return (
                <li key={`empty-${i}`} className={styles.slot} data-empty>
                  <span className={styles.vial} aria-hidden />
                  <span className="muted">Empty</span>
                </li>
              )
            const colour = familyInfo[mainFamily(f)].colour
            return (
              <li key={f.slug} className={styles.slot}>
                <span className={styles.vial} style={{ ['--liquid' as string]: colour }} aria-hidden>
                  <span />
                </span>
                <strong>{f.name}</strong>
                <span className={styles.slotTools}>
                  <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move ${f.name} earlier`}>
                    <Icon name="back" size={14} />
                  </button>
                  <button type="button" onClick={() => remove(f.slug)} aria-label={`Remove ${f.name}`}>
                    <Icon name="close" size={14} />
                  </button>
                  <button type="button" onClick={() => move(i, i + 1)} disabled={i === slugs.length - 1} aria-label={`Move ${f.name} later`}>
                    <Icon name="arrow" size={14} />
                  </button>
                </span>
              </li>
            )
          })}
        </ol>
        <div className={styles.trayFoot}>
          <p className="muted">{full ? 'Ready. You can still swap any of them.' : `Pick ${BOX_SIZE - slugs.length} more.`}</p>
          <button type="button" className="btn btn-ember" disabled={!full} onClick={toBag}>
            Add box to bag · <span className="num">{formatNaira(BOX_PRICE)}</span>
          </button>
        </div>
      </section>

      <section aria-labelledby="choose">
        <h2 id="choose" className={`display ${styles.chooseTitle}`}>
          Choose from all twelve
        </h2>
        <p className="muted">
          Not sure? <Link to="/quiz">Take the quiz</Link> and it fills the box with your matches.
        </p>
        <ul role="list" className={styles.grid}>
          {fragrances.map((f) => {
            const chosen = slugs.includes(f.slug)
            return (
              <li key={f.slug}>
                <button
                  type="button"
                  className={styles.pick}
                  aria-pressed={chosen}
                  disabled={!chosen && full}
                  onClick={() => (chosen ? remove(f.slug) : add(f.slug))}
                >
                  <Photo name={f.photos[0]!} alt="" sizes="(min-width: 960px) 16vw, 45vw" ratio={1} />
                  <span className={styles.pickText}>
                    <strong>{f.name}</strong>
                    <ScentStrip product={f} height={4} />
                  </span>
                  <span className={styles.tick} aria-hidden>
                    <Icon name={chosen ? 'check' : 'plus'} size={16} />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
