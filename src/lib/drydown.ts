/**
 * How strongly each tier of a perfume reads at a given hour after spraying.
 * Top notes are gone within the first hour or so, the heart carries the
 * middle of the day, and the base takes over and fades at the end.
 * Rough, but it is how perfumers describe it to customers.
 */
export type Tier = 'top' | 'heart' | 'base'

const clamp = (n: number) => Math.max(0, Math.min(1, n))

export function tierStrength(tier: Tier, hour: number, longevity: number): number {
  const h = Math.max(0, hour)
  const L = Math.max(2, longevity)
  if (h > L) return 0
  switch (tier) {
    case 'top':
      return Number(clamp(1 - h / 1.25).toFixed(2))
    case 'heart': {
      const peak = Math.min(2, L * 0.25)
      const end = L * 0.7
      const v = h <= peak ? 0.35 + (0.65 * h) / peak : 1 - (h - peak) / (end - peak)
      return Number(clamp(v).toFixed(2))
    }
    case 'base': {
      const v = h < L * 0.6 ? 0.2 + (0.8 * h) / (L * 0.6) : 1 - (h - L * 0.6) / (L * 0.4)
      return Number(clamp(v).toFixed(2))
    }
  }
}

export function describeHour(hour: number, longevity: number): string {
  if (hour === 0) return 'The first spray'
  if (hour > longevity) return 'Gone, or nearly'
  if (hour <= 1) return 'The opening'
  if (hour <= longevity * 0.6) return 'The heart'
  return 'The dry-down, close to skin'
}
