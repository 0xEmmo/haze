import { familyInfo } from '@/data/notes'
import type { Family, Product } from '@/data/types'
import { familiesOf } from '@/lib/profile'
import styles from './ScentStrip.module.css'

/**
 * A blotter-strip of colour showing how much of each family is in a scent.
 * Width of each band is its share of the profile.
 */
export function ScentStrip({ product, showLabels = false, height = 6 }: { product: Pick<Product, 'profile'>; showLabels?: boolean; height?: number }) {
  const entries = (Object.entries(product.profile) as [Family, number][]).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
  const sum = entries.reduce((s, [, v]) => s + v, 0)
  const label = familiesOf(product, 0.2)
    .map((f) => familyInfo[f].label)
    .join(', ')
  return (
    <div className={styles.wrap}>
      <span className={styles.strip} style={{ height }} role="img" aria-label={`Scent families: ${label}`}>
        {entries.map(([f, v]) => (
          <span key={f} style={{ flexGrow: v / sum, background: familyInfo[f].colour }} />
        ))}
      </span>
      {showLabels && (
        <ul role="list" className={styles.labels} aria-hidden>
          {entries
            .filter(([, v]) => v >= 0.2)
            .map(([f, v]) => (
              <li key={f}>
                <span className="dot" style={{ background: familyInfo[f].colour }} />
                {familyInfo[f].label}
                <span className={styles.pct}>{Math.round((v / sum) * 100)}%</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
