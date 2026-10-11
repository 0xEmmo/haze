/** Geometry for the scent wheel. Angles are degrees, 0 at twelve o'clock, clockwise. */

export interface Point {
  x: number
  y: number
}

export function polar(cx: number, cy: number, r: number, deg: number): Point {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: Number((cx + r * Math.cos(rad)).toFixed(3)), y: Number((cy + r * Math.sin(rad)).toFixed(3)) }
}

/** SVG path for a ring segment between two angles. */
export function arcPath(cx: number, cy: number, inner: number, outer: number, start: number, end: number): string {
  const large = end - start > 180 ? 1 : 0
  const a = polar(cx, cy, outer, start)
  const b = polar(cx, cy, outer, end)
  const c = polar(cx, cy, inner, end)
  const d = polar(cx, cy, inner, start)
  return [`M${a.x} ${a.y}`, `A${outer} ${outer} 0 ${large} 1 ${b.x} ${b.y}`, `L${c.x} ${c.y}`, `A${inner} ${inner} 0 ${large} 0 ${d.x} ${d.y}`, 'Z'].join(' ')
}

export interface Segment {
  index: number
  start: number
  end: number
  mid: number
}

/** n equal segments with a small gap between them. */
export function segments(n: number, gap = 1.5): Segment[] {
  const size = 360 / n
  return Array.from({ length: n }, (_, i) => ({ index: i, start: i * size + gap / 2, end: (i + 1) * size - gap / 2, mid: i * size + size / 2 }))
}

/** Split a parent segment into k child segments (the notes in a family). */
export function subdivide(parent: Segment, k: number, gap = 0.8): Segment[] {
  const size = (parent.end - parent.start) / k
  return Array.from({ length: k }, (_, i) => {
    const start = parent.start + i * size
    return { index: i, start: start + gap / 2, end: start + size - gap / 2, mid: start + size / 2 }
  })
}

/**
 * Rotation that brings `mid` to the top, taking the shortest way round from
 * the current rotation so the wheel never spins the long way.
 */
export function rotationFor(mid: number, current: number): number {
  const target = -mid
  let delta = (target - current) % 360
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  return current + delta
}

/** Labels on the left half read upside down unless flipped. */
export const flipLabel = (deg: number) => {
  const a = ((deg % 360) + 360) % 360
  return a > 90 && a < 270
}
