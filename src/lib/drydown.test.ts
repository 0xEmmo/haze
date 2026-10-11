import { describe, expect, it } from 'vitest'
import { describeHour, tierStrength } from './drydown'

describe('dry-down', () => {
  it('top notes lead at first and are gone after a couple of hours', () => {
    expect(tierStrength('top', 0, 8)).toBe(1)
    expect(tierStrength('top', 0, 8)).toBeGreaterThan(tierStrength('base', 0, 8))
    expect(tierStrength('top', 2, 8)).toBe(0)
  })

  it('the heart peaks in the middle', () => {
    expect(tierStrength('heart', 2, 8)).toBe(1)
    expect(tierStrength('heart', 2, 8)).toBeGreaterThan(tierStrength('heart', 0, 8))
    expect(tierStrength('heart', 7, 8)).toBe(0)
  })

  it('the base is what is left at the end, then nothing', () => {
    expect(tierStrength('base', 6, 9)).toBeGreaterThan(tierStrength('heart', 6, 9))
    expect(tierStrength('base', 10, 9)).toBe(0)
  })

  it('stays between 0 and 1 for any input', () => {
    for (const t of ['top', 'heart', 'base'] as const)
      for (let h = -1; h < 14; h += 0.5) {
        const v = tierStrength(t, h, 6)
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(1)
      }
  })

  it('names the phase', () => {
    expect(describeHour(0, 8)).toBe('The first spray')
    expect(describeHour(3, 8)).toBe('The heart')
    expect(describeHour(7, 8)).toMatch(/dry-down/)
  })
})
