import { Link, useLocation } from 'react-router'
import { fragranceBySlug } from '@/data/catalogue'
import { useCompare } from '@/stores/compare'
import { Icon } from './Icon'
import { Photo } from './Photo'
import styles from './CompareTray.module.css'

/** Floating tray that appears once something is picked to compare. */
export function CompareTray() {
  const slugs = useCompare((s) => s.slugs)
  const clear = useCompare((s) => s.clear)
  const { pathname } = useLocation()
  if (!slugs.length || pathname === '/compare') return null
  const list = slugs.map((s) => fragranceBySlug(s)).filter((f) => !!f)
  return (
    <aside className={styles.tray} aria-label="Compare">
      <ul role="list" className={styles.thumbs}>
        {list.map((f) => (
          <li key={f.slug}>
            <Photo name={f.photos[0]!} alt={f.name} sizes="40px" ratio={1} />
          </li>
        ))}
        {Array.from({ length: 3 - list.length }, (_, i) => (
          <li key={i} className={styles.empty} aria-hidden />
        ))}
      </ul>
      <Link to={`/compare?ids=${slugs.join(',')}`} className="btn btn-sm btn-light">
        Compare {list.length}
      </Link>
      <button type="button" className={styles.clear} onClick={clear} aria-label="Clear compare">
        <Icon name="close" size={16} />
      </button>
    </aside>
  )
}
