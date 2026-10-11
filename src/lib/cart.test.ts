import { describe, expect, it } from 'vitest'
import { computeTotals, ENGRAVING_PRICE, GIFT_WRAP_PRICE, priceLines, validEngraving, type CartLine } from './cart'

const bottle: CartLine = { type: 'item', slug: 'harmattan', sizeId: '50ml', qty: 1 }
const box: CartLine = { type: 'box', id: 'b1', slugs: ['harmattan', 'ember', 'oud-oba', 'lekki-salt', 'after-rain'] }

describe('cart pricing', () => {
  it('prices from the catalogue and drops unknown lines', () => {
    const lines = priceLines([bottle, { type: 'item', slug: 'nope', sizeId: '50ml', qty: 1 }, { type: 'item', slug: 'harmattan', sizeId: '5l', qty: 1 }])
    expect(lines).toHaveLength(1)
    expect(lines[0]!.total).toBe(68000)
  })

  it('charges for engraving only when the text is valid', () => {
    const [ok] = priceLines([{ ...bottle, engraving: 'For Ada' }])
    expect(ok!.total).toBe(68000 + ENGRAVING_PRICE)
    const [bad] = priceLines([{ ...bottle, engraving: '<script>' }])
    expect(bad!.total).toBe(68000)
  })

  it('accepts a box only with five different fragrances', () => {
    expect(priceLines([box])).toHaveLength(1)
    expect(priceLines([{ ...box, slugs: box.slugs.slice(0, 4) }])).toHaveLength(0)
    expect(priceLines([{ ...box, slugs: ['harmattan', 'harmattan', 'ember', 'oud-oba', 'lekki-salt'] }])).toHaveLength(0)
    expect(priceLines([{ ...box, slugs: ['harmattan-candle', 'ember', 'oud-oba', 'lekki-salt', 'after-rain'] }])).toHaveLength(0)
  })

  it('applies box credit only to full bottles, then delivery thresholds', () => {
    const lines = priceLines([bottle, { type: 'item', slug: 'library-candle', sizeId: '220g', qty: 1 }])
    const t = computeTotals(lines, { credit: 18000, delivery: 'lagos', giftWrap: true })
    expect(t.merchandise).toBe(100000)
    expect(t.credit).toBe(18000)
    // 82,000 after credit is under the free-delivery line
    expect(t.delivery).toBe(2500)
    expect(t.total).toBe(82000 + GIFT_WRAP_PRICE + 2500)
    const candleOnly = computeTotals(priceLines([{ type: 'item', slug: 'library-candle', sizeId: '220g', qty: 1 }]), { credit: 18000 })
    expect(candleOnly.credit).toBe(0)
  })

  it('free Lagos delivery from ₦100,000', () => {
    const t = computeTotals(priceLines([{ ...bottle, sizeId: '100ml', qty: 2 }]), { delivery: 'lagos' })
    expect(t.delivery).toBe(0)
  })

  it('validates engraving text', () => {
    expect(validEngraving('')).toMatch(/type/i)
    expect(validEngraving('A very long engraving')).toMatch(/12/)
    expect(validEngraving('Ọba')).toMatch(/letters/i)
    expect(validEngraving("Ada & Tolu '26".slice(0, 12))).toBeNull()
  })
})
