import { beforeEach, describe, expect, it } from 'vitest'
import { useCart } from './cart'

describe('cart store', () => {
  beforeEach(() => useCart.getState().clear())

  it('merges the same size and engraving, keeps different engravings apart', () => {
    const { addItem } = useCart.getState()
    addItem({ type: 'item', slug: 'ember', sizeId: '50ml', qty: 1 })
    addItem({ type: 'item', slug: 'ember', sizeId: '50ml', qty: 2 })
    addItem({ type: 'item', slug: 'ember', sizeId: '50ml', qty: 1, engraving: 'Ada' })
    const lines = useCart.getState().lines
    expect(lines).toHaveLength(2)
    expect(lines[0]).toMatchObject({ qty: 3 })
  })

  it('caps quantity at five', () => {
    useCart.getState().addItem({ type: 'item', slug: 'ember', sizeId: '50ml', qty: 4 })
    useCart.getState().addItem({ type: 'item', slug: 'ember', sizeId: '50ml', qty: 4 })
    expect(useCart.getState().lines[0]).toMatchObject({ qty: 5 })
  })

  it('remembers the removed line and puts it back where it was', () => {
    const s = useCart.getState()
    s.addItem({ type: 'item', slug: 'ember', sizeId: '50ml', qty: 1 })
    s.addItem({ type: 'item', slug: 'harmattan', sizeId: '50ml', qty: 1 })
    s.addBox(['harmattan', 'ember', 'oud-oba', 'lekki-salt', 'after-rain'])
    useCart.getState().remove('harmattan:50ml:')
    const removed = useCart.getState().removed!
    expect(removed.index).toBe(1)
    useCart.getState().restore(removed.line, removed.index)
    expect(useCart.getState().lines.map((l) => (l.type === 'box' ? 'box' : l.slug))).toEqual(['ember', 'harmattan', 'box'])
    expect(useCart.getState().removed).toBeNull()
  })
})
