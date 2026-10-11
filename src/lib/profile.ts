import { FAMILIES, type Family, type Product } from '@/data/types'

export type Vector = Record<Family, number>

export const zero = (): Vector => Object.fromEntries(FAMILIES.map((f) => [f, 0])) as Vector

export function vectorOf(p: Pick<Product, 'profile'>): Vector {
  const v = zero()
  for (const f of FAMILIES) v[f] = p.profile[f] ?? 0
  return v
}

const dot = (a: Vector, b: Vector) => FAMILIES.reduce((s, f) => s + a[f] * b[f], 0)
const norm = (a: Vector) => Math.sqrt(dot(a, a))

/** Cosine similarity between two family profiles, 0 when either is empty. */
export function similarity(a: Vector, b: Vector) {
  const n = norm(a) * norm(b)
  return n === 0 ? 0 : dot(a, b) / n
}

/** The family a product leans on most. */
export function mainFamily(p: Pick<Product, 'profile'>): Family {
  const v = vectorOf(p)
  return FAMILIES.reduce((best, f) => (v[f] > v[best] ? f : best), FAMILIES[0]!)
}

/** Families sorted by weight, strongest first, ignoring the faint ones. */
export function familiesOf(p: Pick<Product, 'profile'>, min = 0.2): Family[] {
  const v = vectorOf(p)
  return FAMILIES.filter((f) => v[f] >= min).sort((a, b) => v[b] - v[a])
}
