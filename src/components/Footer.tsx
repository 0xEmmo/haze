import { Link } from 'react-router'
import { familyInfo } from '@/data/notes'
import { FAMILIES } from '@/data/types'
import { Wordmark } from './Wordmark'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.about}>
          <Wordmark className={styles.mark} />
          <p>A small fragrance and candle house. We blend in Ikoyi, in batches of two hundred, and we’d rather you try before you buy.</p>
          <p className={styles.small}>
            A portfolio project by <a href="https://github.com/0xEmmo">Emmanuel Balogun</a>. Haze, its perfumers and prices are made up and nothing is charged. Photos are real and{' '}
            <Link to="/credits">credited here</Link>.
          </p>
        </div>
        <nav aria-label="Families">
          <p className="eyebrow">By family</p>
          <ul role="list">
            {FAMILIES.map((f) => (
              <li key={f}>
                <Link to={`/shop?family=${f}`}>{familyInfo[f].label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Explore">
          <p className="eyebrow">Explore</p>
          <ul role="list">
            <li><Link to="/shop?kind=fragrance">Fragrance</Link></li>
            <li><Link to="/shop?kind=candle">Candles</Link></li>
            <li><Link to="/wheel">Scent wheel</Link></li>
            <li><Link to="/quiz">Scent quiz</Link></li>
            <li><Link to="/box">Sample box</Link></li>
            <li><Link to="/compare">Compare</Link></li>
          </ul>
        </nav>
        <div>
          <p className="eyebrow">The studio</p>
          <address className={styles.address}>
            14 Bourdillon Road, Ikoyi, Lagos
            <br />
            Tuesday to Saturday, 11 to 7
          </address>
        </div>
      </div>
    </footer>
  )
}
