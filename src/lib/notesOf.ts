import type { Product } from '@/data/types'

export function notesOf(p: Product): string[] {
  return p.kind === 'fragrance' ? [...p.notes.top, ...p.notes.heart, ...p.notes.base] : p.notes
}

export function jaccard(a: string[], b: string[]) {
  const A = new Set(a)
  const B = new Set(b)
  const inter = [...A].filter((x) => B.has(x)).length
  const union = new Set([...A, ...B]).size
  return union === 0 ? 0 : inter / union
}
