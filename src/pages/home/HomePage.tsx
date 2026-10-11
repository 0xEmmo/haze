import { Link } from 'react-router'
import { Photo } from '@/components/Photo'
import { ProductCard } from '@/components/ProductCard'
import { candles, fragrances } from '@/data/catalogue'
import { familyInfo, notes } from '@/data/notes'
import { BOX_PRICE } from '@/lib/box'
import { formatNaira } from '@/lib/money'
import styles from './HomePage.module.css'

const LOVED = ['harmattan', 'lekki-salt', 'night-market', 'oud-oba']
const NOTE_STRIP = ['bitter-orange', 'rose', 'fig', 'sea-salt', 'sandalwood', 'oud', 'frankincense', 'vanilla', 'coffee', 'incense', 'leather', 'jasmine']

export function HomePage() {
  const loved = LOVED.map((s) => fragrances.find((f) => f.slug === s)!).filter(Boolean)
  const strip = NOTE_STRIP.map((id) => notes.find((n) => n.id === id)!)

  return (
    <>
      <section className={styles.hero}>
        <div className={`wrap ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <p className="eyebrow">Fragrance &amp; candles · Ikoyi, Lagos</p>
            <h1 className="display">
              Fragrance, <em>found</em> slowly.
            </h1>
            <p className={styles.lede}>
              Twelve perfumes and six candles, blended in small batches. Start with a sample box, or let the quiz work out what you’ll
              love from the smells you already know.
            </p>
            <div className={styles.ctas}>
              <Link to="/quiz" className="btn btn-ember">
                Find your scent
              </Link>
              <Link to="/box" className="btn btn-ghost">
                Try five for {formatNaira(BOX_PRICE)}
              </Link>
            </div>
          </div>
          <figure className={styles.heroMedia}>
            <Photo name="p-woman-golden" alt="A woman in a dark coat at sunset, the light hazy and gold behind her" sizes="(min-width: 960px) 44vw, 100vw" ratio={4 / 5} priority />
            <figcaption className={styles.heroCard}>
              <span className="eyebrow">Wearing</span>
              <Link to="/shop/harmattan" className={styles.heroCardName}>
                Harmattan
              </Link>
              <span className={styles.heroNotes}>bitter orange · iris · amber</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="wrap" aria-labelledby="ways">
        <div className={styles.head}>
          <h2 id="ways" className="display">
            Three ways <em>in</em>
          </h2>
          <p className="muted">Buying perfume online is guesswork. These make it less so.</p>
        </div>
        <ol role="list" className={styles.ways}>
          <li>
            <Link to="/quiz" className={styles.way}>
              <Photo name="n-citrus" alt="" sizes="(min-width: 960px) 30vw, 100vw" ratio={3 / 2} />
              <span className={styles.wayNo}>01</span>
              <h3>Swipe through smells</h3>
              <p>Eight moments, from sea spray to a dying fire. Keep or pass, set three sliders, and get your matches with the reasons.</p>
            </Link>
          </li>
          <li>
            <Link to="/wheel" className={styles.way}>
              <Photo name="n-amber" alt="" sizes="(min-width: 960px) 30vw, 100vw" ratio={3 / 2} />
              <span className={styles.wayNo}>02</span>
              <h3>Turn the scent wheel</h3>
              <p>Eight families and thirty-odd notes. Tap a note to see what it smells like and which of ours carry it.</p>
            </Link>
          </li>
          <li>
            <Link to="/box" className={styles.way}>
              <Photo name="b-pipettes" alt="" sizes="(min-width: 960px) 30vw, 100vw" ratio={3 / 2} />
              <span className={styles.wayNo}>03</span>
              <h3>Wear five for a week</h3>
              <p>Pick five 2 ml vials. The {formatNaira(BOX_PRICE)} comes back as credit on a full bottle for thirty days.</p>
            </Link>
          </li>
        </ol>
      </section>

      <section className="wrap" aria-labelledby="loved">
        <div className={styles.head}>
          <h2 id="loved" className="display">
            Most worn
          </h2>
          <Link to="/shop?kind=fragrance" className={styles.more}>
            All twelve perfumes →
          </Link>
        </div>
        <ul role="list" className={styles.grid}>
          {loved.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="notes" className={styles.notes}>
        <div className="wrap">
          <div className={styles.head}>
            <h2 id="notes" className="display">
              What it’s <em>made of</em>
            </h2>
            <Link to="/wheel" className={styles.more}>
              Open the wheel →
            </Link>
          </div>
        </div>
        <ul role="list" className={styles.noteStrip}>
          {strip.map((n) => (
            <li key={n.id}>
              <Link to={`/wheel?note=${n.id}`} className={styles.note}>
                <Photo name={n.photo!} alt="" sizes="220px" ratio={3 / 4} />
                <span className={styles.noteFam}>
                  <span className="dot" style={{ background: familyInfo[n.family].colour }} />
                  {familyInfo[n.family].label}
                </span>
                <strong>{n.name}</strong>
                <span className={styles.noteSmells}>{n.smells}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.studio} aria-labelledby="studio">
        <div className={`wrap ${styles.studioGrid}`}>
          <Photo name="p-perfumer-lab" alt="A perfumer holding three paper smelling strips up to his nose" sizes="(min-width: 960px) 40vw, 100vw" ratio={4 / 5} className={styles.studioA} />
          <Photo name="p-perfumer-flowers" alt="Someone breathing in a handful of dried flowers" sizes="(min-width: 960px) 24vw, 60vw" ratio={1} className={styles.studioB} />
          <div className={styles.studioText}>
            <p className="eyebrow">The studio</p>
            <h2 id="studio" className="display">
              Two hundred bottles at a time, <em>never more</em>.
            </h2>
            <blockquote>
              <p>
                “I want each one to smell like somewhere you’ve actually been. Harmattan is the drive north in December. Lekki Salt is the
                car seat after the beach. If it doesn’t remind anyone of anything, we don’t make it.”
              </p>
              <footer>Adaeze Okafor, founder and nose</footer>
            </blockquote>
            <p className={styles.facts}>
              <span>
                <strong className="num">18–22%</strong> perfume oil
              </span>
              <span>
                <strong className="num">6 weeks</strong> maceration
              </span>
              <span>
                <strong className="num">0</strong> animal testing
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className="wrap" aria-labelledby="worn">
        <div className={styles.head}>
          <h2 id="worn" className="display">
            On skin, <em>not paper</em>
          </h2>
          <p className="muted">Scent changes on everyone. That’s the whole point of trying it on.</p>
        </div>
        <ul role="list" className={styles.worn}>
          <li><Photo name="p-man-yellow" alt="A man in profile against a bright orange wall" sizes="(min-width: 960px) 25vw, 50vw" ratio={3 / 4} /></li>
          <li><Photo name="p-woman-flowers" alt="A woman with red roses tucked in her hair, smelling a white flower" sizes="(min-width: 960px) 25vw, 50vw" ratio={3 / 4} /></li>
          <li><Photo name="p-man-smile" alt="A man in a black t-shirt laughing" sizes="(min-width: 960px) 25vw, 50vw" ratio={3 / 4} /></li>
          <li><Photo name="p-woman-portrait" alt="A woman in pearls and a fur coat" sizes="(min-width: 960px) 25vw, 50vw" ratio={3 / 4} /></li>
        </ul>
      </section>

      <section className="wrap" aria-labelledby="candles">
        <div className={styles.head}>
          <h2 id="candles" className="display">
            For the <em>room</em>
          </h2>
          <Link to="/shop?kind=candle" className={styles.more}>
            All candles →
          </Link>
        </div>
        <ul role="list" className={styles.grid3}>
          {candles.slice(0, 3).map((c) => (
            <li key={c.slug}>
              <ProductCard product={c} sizes="(min-width: 960px) 33vw, 50vw" />
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
