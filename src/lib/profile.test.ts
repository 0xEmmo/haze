import { describe, expect, it } from 'vitest'
import { fragranceBySlug, fragrances } from '@/data/catalogue'
import { jaccard } from './notesOf'
import { familiesOf, mainFamily, similarity, vectorOf, zero } from './profile'
import { similarTo } from './similar'

describe('profiles', () => {
  it('fills missing families with zero', () => {
    const v = vectorOf({ profile: { amber: 0.5 } })
    expect(v.amber).toBe(0.5)
    expect(v.citrus).toBe(0)
  })

  it('cosine similarity is 1 for the same shape and 0 for nothing in common', () => {
    expect(similarity(vectorOf({ profile: { amber: 1, woody: 0.5 } }), vectorOf({ profile: { amber: 2, woody: 1 } }))).toBeCloseTo(1)
    expect(similarity(vectorOf({ profile: { citrus: 1 } }), vectorOf({ profile: { smoky: 1 } }))).toBe(0)
    expect(similarity(zero(), vectorOf({ profile: { smoky: 1 } }))).toBe(0)
  })

  it('finds the main family and drops faint ones', () => {
    const h = fragranceBySlug('harmattan')!
    expect(mainFamily(h)).toBe('amber')
    expect(familiesOf(h)).toEqual(['amber', 'woody', 'citrus', 'floral'])
    expect(familiesOf(h, 0.5)).toEqual(['amber', 'woody'])
  })

  it('jaccard overlap of notes', () => {
    expect(jaccard(['a', 'b'], ['b', 'c'])).toBeCloseTo(1 / 3)
    expect(jaccard([], [])).toBe(0)
  })

  it('suggests smoky things for a smoky scent and never itself', () => {
    const ember = fragranceBySlug('ember')!
    const picks = similarTo(ember, fragrances)
    expect(picks.map((p) => p.slug)).not.toContain('ember')
    expect(picks[0]!.slug).toBe('oud-oba')
  })
})
