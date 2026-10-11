import { describe, expect, it } from 'vitest'
import { addToBox, BOX_SIZE, fillBox, moveInBox, removeFromBox } from './box'

describe('discovery box', () => {
  it('adds until full and refuses duplicates', () => {
    let slugs: string[] = []
    for (const s of ['a', 'b', 'c', 'd', 'e']) {
      const r = addToBox(slugs, s)
      expect(r.ok).toBe(true)
      slugs = r.slugs
    }
    expect(slugs).toHaveLength(BOX_SIZE)
    expect(addToBox(slugs, 'f')).toMatchObject({ ok: false, reason: 'full' })
    expect(addToBox(['a'], 'a')).toMatchObject({ ok: false, reason: 'duplicate' })
  })

  it('removes and refills from a ranking without repeats', () => {
    expect(removeFromBox(['a', 'b'], 'a')).toEqual(['b'])
    expect(fillBox(['b'], ['a', 'b', 'c', 'd', 'e', 'f'])).toEqual(['b', 'a', 'c', 'd', 'e'])
  })

  it('reorders and ignores out-of-range moves', () => {
    expect(moveInBox(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a'])
    expect(moveInBox(['a', 'b'], 0, 5)).toEqual(['a', 'b'])
  })
})
