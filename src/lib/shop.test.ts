import { describe, expect, it } from 'vitest'
import { products } from '@/data/catalogue'
import { filterProducts, parseShopQuery, toSearchParams } from './shop'

const q = (s: string) => parseShopQuery(new URLSearchParams(s))

describe('shop query', () => {
  it('ignores junk in the URL', () => {
    expect(q('kind=shoes&family=citrus,nope&time=noon&sort=random')).toEqual({ kind: 'all', families: ['citrus'], time: 'any', q: '', sort: 'featured' })
  })

  it('round-trips through search params, leaving defaults out', () => {
    const query = q('kind=fragrance&family=woody,smoky&sort=strongest')
    expect(toSearchParams(query).toString()).toBe('kind=fragrance&family=woody%2Csmoky&sort=strongest')
    expect(toSearchParams(q('')).toString()).toBe('')
  })
})

describe('filterProducts', () => {
  it('filters by kind', () => {
    expect(filterProducts(products, q('kind=candle')).every((p) => p.kind === 'candle')).toBe(true)
  })

  it('family filter keeps things where that family is a real part of it', () => {
    const r = filterProducts(products, q('family=aquatic&kind=fragrance'))
    expect(r.map((p) => p.slug)).toContain('lekki-salt')
    expect(r.map((p) => p.slug)).not.toContain('oud-oba')
  })

  it('searches note names as well as product names', () => {
    expect(filterProducts(products, q('q=frankincense')).map((p) => p.slug)).toContain('harmattan')
  })

  it('night filter keeps night and anytime fragrances only', () => {
    const r = filterProducts(products, q('time=night'))
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((p) => p.kind === 'fragrance' && p.time !== 'day')).toBe(true)
  })

  it('sorts by price and strength', () => {
    const asc = filterProducts(products, q('sort=price-asc')).map((p) => Math.min(...p.sizes.map((s) => s.price)))
    expect(asc).toEqual([...asc].sort((a, b) => a - b))
    const strong = filterProducts(products, q('kind=fragrance&sort=strongest'))
    expect(strong[0]!.kind === 'fragrance' && strong[0]!.intensity).toBe(5)
  })
})
