import type { Product } from '@/data/types'
import { jaccard, notesOf } from './notesOf'
import { similarity, vectorOf } from './profile'

/**
 * "If you like this, try…": mostly the shape of the scent (family profile),
 * nudged by shared notes so two ambers with the same resin rank above two
 * that merely share a family.
 */
export function similarTo(target: Product, pool: Product[], limit = 3): Product[] {
  const tv = vectorOf(target)
  const tn = notesOf(target)
  return pool
    .filter((p) => p.slug !== target.slug && p.kind === target.kind)
    .map((p) => ({ p, s: similarity(tv, vectorOf(p)) * 0.7 + jaccard(tn, notesOf(p)) * 0.3 }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ p }) => p)
}
