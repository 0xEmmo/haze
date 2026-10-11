import { describe, expect, it } from 'vitest'
import { buildProfile, decodeAnswers, encodeAnswers, matchFragrances, MOMENTS, type QuizAnswers } from './quiz'

const neutral: QuizAnswers = { swipes: {}, warmth: 50, boldness: 50, night: 50 }

describe('scent quiz', () => {
  it('a neutral quiz says nothing about any family', () => {
    const v = buildProfile(neutral)
    expect(Object.values(v).every((x) => x === 0)).toBe(true)
  })

  it('loving the sea and peel, and turning the dial to fresh, points at Lekki Salt', () => {
    const a: QuizAnswers = { swipes: { sea: 'love', peel: 'love', smoke: 'no', coffee: 'no' }, warmth: 15, boldness: 25, night: 20 }
    const [first] = matchFragrances(a)
    expect(first!.fragrance.slug).toBe('lekki-salt')
    expect(first!.score).toBeGreaterThan(80)
    expect(first!.reasons.length).toBeGreaterThan(0)
  })

  it('smoke and coffee at night lands on the dark ones', () => {
    const a: QuizAnswers = { swipes: { smoke: 'love', coffee: 'love', resin: 'love', sea: 'no', roses: 'no' }, warmth: 85, boldness: 90, night: 90 }
    const top3 = matchFragrances(a).slice(0, 3).map((m) => m.fragrance.slug)
    expect(top3).toEqual(expect.arrayContaining(['night-market', 'ember']))
  })

  it('a "no" can push a family below zero but the profile is clamped', () => {
    const v = buildProfile({ ...neutral, swipes: { roses: 'no' } })
    expect(v.floral).toBe(0)
  })

  it('scores stay between 0 and 100 and are sorted', () => {
    const m = matchFragrances({ ...neutral, swipes: { wood: 'love' } })
    expect(m.every((x) => x.score >= 0 && x.score <= 100)).toBe(true)
    expect(m.map((x) => x.score)).toEqual([...m.map((x) => x.score)].sort((a, b) => b - a))
  })

  it('round-trips through the URL and rejects junk', () => {
    const a: QuizAnswers = { swipes: Object.fromEntries(MOMENTS.map((m, i) => [m.id, i % 2 ? 'love' : 'no'])), warmth: 30, boldness: 70, night: 10 }
    expect(decodeAnswers(new URLSearchParams(encodeAnswers(a)))).toEqual(a)
    expect(decodeAnswers(new URLSearchParams('s=lll&w=1&b=1&n=1'))).toBeNull()
    expect(decodeAnswers(new URLSearchParams('s=llllllxl&w=1&b=1&n=1'))).toBeNull()
    expect(decodeAnswers(new URLSearchParams('s=llllllll'))).toBeNull()
  })
})
