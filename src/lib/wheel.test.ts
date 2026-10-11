import { describe, expect, it } from 'vitest'
import { arcPath, flipLabel, polar, rotationFor, segments, subdivide } from './wheel'

describe('wheel geometry', () => {
  it('measures angles from twelve o’clock, clockwise', () => {
    expect(polar(0, 0, 10, 0)).toEqual({ x: 0, y: -10 })
    expect(polar(0, 0, 10, 90)).toEqual({ x: 10, y: 0 })
    expect(polar(0, 0, 10, 180).y).toBeCloseTo(10)
  })

  it('splits the circle into equal segments with gaps', () => {
    const s = segments(8, 2)
    expect(s).toHaveLength(8)
    expect(s[0]).toMatchObject({ start: 1, end: 44, mid: 22.5 })
    expect(s[7]!.end).toBe(359)
  })

  it('subdivides a family into its notes', () => {
    const [first] = segments(4, 0)
    const kids = subdivide(first!, 3, 0)
    expect(kids.map((k) => k.mid)).toEqual([15, 45, 75])
  })

  it('draws a closed ring segment and uses the large-arc flag past 180°', () => {
    expect(arcPath(50, 50, 20, 40, 0, 90)).toMatch(/^M50 10 A40 40 0 0 1 90 50 L70 50 A20 20 0 0 0 50 30 Z$/)
    expect(arcPath(50, 50, 20, 40, 0, 200)).toContain('A40 40 0 1 1')
  })

  it('rotates the shortest way round', () => {
    expect(rotationFor(90, 0)).toBe(-90)
    expect(rotationFor(350, 0)).toBe(10)
    expect(rotationFor(10, -350)).toBe(-370)
  })

  it('flips labels on the bottom half so they read the right way up', () => {
    expect(flipLabel(45)).toBe(false)
    expect(flipLabel(180)).toBe(true)
    expect(flipLabel(-90)).toBe(false)
  })
})
