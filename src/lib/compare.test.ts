import { describe, expect, it } from 'vitest'
import { MAX_COMPARE, parseCompare, pricePerMl, sharedNotes, toggleCompare } from './compare'

describe('compare', () => {
  it('parses known fragrances only, without repeats, up to three', () => {
    const list = parseCompare('harmattan,nope,harmattan,ember,oud-oba,lekki-salt,harmattan-candle')
    expect(list.map((f) => f.slug)).toEqual(['harmattan', 'ember', 'oud-oba'])
    expect(parseCompare(null)).toEqual([])
  })

  it('finds notes shared by at least two', () => {
    const shared = sharedNotes(parseCompare('ember,oud-oba'))
    expect([...shared].sort()).toEqual(['black-pepper', 'labdanum', 'leather', 'oud'])
  })

  it('price per ml', () => {
    expect(pricePerMl(68000, 50)).toBe(1360)
  })

  it('toggles and stops at the limit', () => {
    let s: string[] = []
    for (const x of ['a', 'b', 'c']) s = toggleCompare(s, x).slugs
    expect(s).toHaveLength(MAX_COMPARE)
    expect(toggleCompare(s, 'd')).toEqual({ slugs: s, full: true })
    expect(toggleCompare(s, 'b').slugs).toEqual(['a', 'c'])
  })
})
