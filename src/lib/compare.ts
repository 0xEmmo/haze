import { fragranceBySlug } from '@/data/catalogue'
import type { Fragrance } from '@/data/types'
import { notesOf } from './notesOf'

export const MAX_COMPARE = 3

export function parseCompare(param: string | null): Fragrance[] {
  if (!param) return []
  const seen = new Set<string>()
  const out: Fragrance[] = []
  for (const slug of param.split(',')) {
    const f = fragranceBySlug(slug.trim())
    if (f && !seen.has(f.slug) && out.length < MAX_COMPARE) {
      seen.add(f.slug)
      out.push(f)
    }
  }
  return out
}

/** Notes that appear in at least two of the fragrances being compared. */
export function sharedNotes(list: Fragrance[]): Set<string> {
  const count = new Map<string, number>()
  for (const f of list) for (const n of new Set(notesOf(f))) count.set(n, (count.get(n) ?? 0) + 1)
  return new Set([...count].filter(([, c]) => c >= 2).map(([n]) => n))
}

export const pricePerMl = (price: number, ml: number) => Math.round(price / ml)

export function toggleCompare(slugs: string[], slug: string): { slugs: string[]; full: boolean } {
  if (slugs.includes(slug)) return { slugs: slugs.filter((s) => s !== slug), full: false }
  if (slugs.length >= MAX_COMPARE) return { slugs, full: true }
  return { slugs: [...slugs, slug], full: false }
}
