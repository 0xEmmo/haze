import { FAMILIES, type Family, type Product } from '@/data/types'
import { notesOf } from './notesOf'
import { noteById } from '@/data/notes'

export type Sort = 'featured' | 'price-asc' | 'price-desc' | 'strongest' | 'lightest'
export const SORTS: { id: Sort; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price, low to high' },
  { id: 'price-desc', label: 'Price, high to low' },
  { id: 'strongest', label: 'Strongest first' },
  { id: 'lightest', label: 'Lightest first' },
]

export interface ShopQuery {
  kind: 'all' | 'fragrance' | 'candle'
  families: Family[]
  time: 'any' | 'day' | 'night'
  q: string
  sort: Sort
}

export function parseShopQuery(p: URLSearchParams): ShopQuery {
  const kind = p.get('kind')
  const time = p.get('time')
  const sort = p.get('sort') as Sort | null
  return {
    kind: kind === 'fragrance' || kind === 'candle' ? kind : 'all',
    families: (p.get('family') ?? '').split(',').filter((f): f is Family => (FAMILIES as string[]).includes(f)),
    time: time === 'day' || time === 'night' ? time : 'any',
    q: (p.get('q') ?? '').trim(),
    sort: SORTS.some((s) => s.id === sort) ? sort! : 'featured',
  }
}

export function toSearchParams(q: ShopQuery): URLSearchParams {
  const p = new URLSearchParams()
  if (q.kind !== 'all') p.set('kind', q.kind)
  if (q.families.length) p.set('family', q.families.join(','))
  if (q.time !== 'any') p.set('time', q.time)
  if (q.q) p.set('q', q.q)
  if (q.sort !== 'featured') p.set('sort', q.sort)
  return p
}

const strength = (p: Product) => (p.kind === 'fragrance' ? p.intensity : 3)
const from = (p: Product) => Math.min(...p.sizes.map((s) => s.price))
const BADGE_RANK = { bestseller: 0, new: 1, limited: 2 } as const

/** A family filter matches when that family is at least 40% as strong as the product's main family. */
function hasFamily(p: Product, f: Family) {
  const max = Math.max(...Object.values(p.profile))
  return (p.profile[f] ?? 0) >= max * 0.4
}

export function filterProducts(all: Product[], q: ShopQuery): Product[] {
  const needle = q.q.toLowerCase()
  const out = all.filter((p) => {
    if (q.kind !== 'all' && p.kind !== q.kind) return false
    if (q.families.length && !q.families.some((f) => hasFamily(p, f))) return false
    if (q.time !== 'any' && (p.kind !== 'fragrance' || (p.time !== q.time && p.time !== 'any'))) return false
    if (needle) {
      const hay = [p.name, p.tagline, ...notesOf(p).map((n) => noteById(n).name)].join(' ').toLowerCase()
      if (!hay.includes(needle)) return false
    }
    return true
  })
  const index = new Map(all.map((p, i) => [p.slug, i]))
  const featured = (a: Product, b: Product) => (a.badge ? BADGE_RANK[a.badge] : 9) - (b.badge ? BADGE_RANK[b.badge] : 9) || index.get(a.slug)! - index.get(b.slug)!
  const cmp: Record<Sort, (a: Product, b: Product) => number> = {
    featured,
    'price-asc': (a, b) => from(a) - from(b) || featured(a, b),
    'price-desc': (a, b) => from(b) - from(a) || featured(a, b),
    strongest: (a, b) => strength(b) - strength(a) || featured(a, b),
    lightest: (a, b) => strength(a) - strength(b) || featured(a, b),
  }
  return out.sort(cmp[q.sort])
}
