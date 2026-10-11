import { fragrances } from '@/data/catalogue'
import { familyInfo } from '@/data/notes'
import { FAMILIES, type Family, type Fragrance } from '@/data/types'
import { similarity, vectorOf, zero, type Vector } from './profile'

export type Swipe = 'love' | 'no' | 'skip'

export interface Moment {
  id: string
  title: string
  line: string
  photo: string
  /** Which families this moment speaks for. */
  leans: Partial<Record<Family, number>>
}

export const MOMENTS: Moment[] = [
  { id: 'sea', title: 'Sea spray at dawn', line: 'Salt wind, wet sand, nobody else on the beach.', photo: 'n-sea', leans: { aquatic: 1, citrus: 0.3 } },
  { id: 'peel', title: 'Peeling an orange', line: 'The sharp spray from the skin on your fingers.', photo: 'n-citrus', leans: { citrus: 1, green: 0.2 } },
  { id: 'roses', title: 'A bowl of rose petals', line: 'Deep red, soft, a little jammy.', photo: 'n-rose', leans: { floral: 1 } },
  { id: 'fig', title: 'A ripe fig, split open', line: 'Milky fruit and the green sap of the leaf.', photo: 'n-fig', leans: { green: 1, gourmand: 0.3 } },
  { id: 'wood', title: 'Freshly cut wood', line: 'Sawdust, dry and clean, in a quiet workshop.', photo: 'n-sandalwood', leans: { woody: 1 } },
  { id: 'resin', title: 'Warm amber resin', line: 'Golden, sticky, glowing in the sun.', photo: 'n-amber', leans: { amber: 1, gourmand: 0.2 } },
  { id: 'coffee', title: 'Coffee being roasted', line: 'Toasty, bitter and a little sweet.', photo: 'n-coffee', leans: { gourmand: 1, smoky: 0.2 } },
  { id: 'smoke', title: 'Smoke from a fire', line: 'The end of the evening, embers still going.', photo: 'n-smoke', leans: { smoky: 1, woody: 0.3 } },
]

export interface QuizAnswers {
  swipes: Record<string, Swipe>
  /** 0 = fresh and cool, 100 = warm and cosy. */
  warmth: number
  /** 0 = close to skin, 100 = fills the room. */
  boldness: number
  /** 0 = daytime, 100 = night out. */
  night: number
}

const WEIGHT: Record<Swipe, number> = { love: 1, skip: 0, no: -0.6 }
const FRESH: Family[] = ['citrus', 'aquatic', 'green']
const WARM: Family[] = ['amber', 'gourmand', 'smoky', 'woody']

/** Turns swipes and sliders into a preference for each family. Never negative. */
export function buildProfile(a: QuizAnswers): Vector {
  const v = zero()
  for (const m of MOMENTS) {
    const w = WEIGHT[a.swipes[m.id] ?? 'skip']
    for (const [f, x] of Object.entries(m.leans) as [Family, number][]) v[f] += w * x
  }
  // the warmth slider tilts the whole profile, by up to half a "love"
  const tilt = (a.warmth - 50) / 100
  for (const f of FRESH) v[f] -= tilt
  for (const f of WARM) v[f] += tilt
  for (const f of FAMILIES) v[f] = Math.max(0, Number(v[f].toFixed(3)))
  return v
}

export interface Match {
  fragrance: Fragrance
  /** 0 to 100. */
  score: number
  reasons: string[]
}

/**
 * Score = how well the family shape fits (70%), how close the strength is
 * to what you asked for (20%), and whether it suits the time of day (10%).
 */
export function matchFragrances(a: QuizAnswers, pool: Fragrance[] = fragrances): Match[] {
  const me = buildProfile(a)
  const wantIntensity = 1 + (a.boldness / 100) * 4
  const wantsNight = a.night >= 60
  const wantsDay = a.night <= 40
  const top = (FAMILIES.filter((f) => me[f] > 0).sort((x, y) => me[y] - me[x]) as Family[]).slice(0, 2)

  return pool
    .map((fr) => {
      const shape = similarity(me, vectorOf(fr))
      const strength = 1 - Math.abs(fr.intensity - wantIntensity) / 4
      const time = fr.time === 'any' ? 0.8 : (fr.time === 'night' && wantsNight) || (fr.time === 'day' && wantsDay) ? 1 : wantsNight || wantsDay ? 0.3 : 0.7
      const score = Math.round((shape * 0.7 + strength * 0.2 + time * 0.1) * 100)

      const reasons: string[] = []
      const shared = top.filter((f) => (fr.profile[f] ?? 0) >= 0.4)
      if (shared.length) reasons.push(`Strong on ${shared.map((f) => familyInfo[f].label.toLowerCase()).join(' and ')}, which you went for`)
      if (strength >= 0.75) reasons.push(fr.intensity <= 2 ? 'Stays close to skin, as you asked' : fr.intensity >= 4 ? 'Bold and long-lasting, as you asked' : 'Medium strength, noticeable without shouting')
      if (fr.time === 'night' && wantsNight) reasons.push('Made for evenings')
      if (fr.time === 'day' && wantsDay) reasons.push('Easy to wear in the day')
      return { fragrance: fr, score, reasons }
    })
    .sort((x, y) => y.score - x.score)
}

/* ---------- URL encoding, so results can be shared ---------- */

const CODE: Record<Swipe, string> = { love: 'l', no: 'n', skip: 's' }
const DECODE: Record<string, Swipe> = { l: 'love', n: 'no', s: 'skip' }
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

export function encodeAnswers(a: QuizAnswers): string {
  const s = MOMENTS.map((m) => CODE[a.swipes[m.id] ?? 'skip']).join('')
  return new URLSearchParams({ s, w: String(clamp(a.warmth)), b: String(clamp(a.boldness)), n: String(clamp(a.night)) }).toString()
}

export function decodeAnswers(params: URLSearchParams): QuizAnswers | null {
  const s = params.get('s')
  if (!s || s.length !== MOMENTS.length || ![...s].every((c) => c in DECODE)) return null
  const nums = ['w', 'b', 'n'].map((k) => Number(params.get(k)))
  if (nums.some((n) => !Number.isFinite(n) || params.get('w') === null)) return null
  const swipes = Object.fromEntries(MOMENTS.map((m, i) => [m.id, DECODE[s[i]!]!]))
  return { swipes, warmth: clamp(nums[0]!), boldness: clamp(nums[1]!), night: clamp(nums[2]!) }
}
