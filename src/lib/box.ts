/** The discovery box: pick five 2 ml samples, get the price back off a full bottle. */
export const BOX_SIZE = 5
export const BOX_PRICE = 18000
export const BOX_CREDIT_DAYS = 30

export type BoxResult = { ok: true; slugs: string[] } | { ok: false; reason: 'full' | 'duplicate'; slugs: string[] }

export function addToBox(slugs: string[], slug: string): BoxResult {
  if (slugs.includes(slug)) return { ok: false, reason: 'duplicate', slugs }
  if (slugs.length >= BOX_SIZE) return { ok: false, reason: 'full', slugs }
  return { ok: true, slugs: [...slugs, slug] }
}

export const removeFromBox = (slugs: string[], slug: string) => slugs.filter((s) => s !== slug)

/** Fill the empty slots from a ranked list (quiz matches), skipping what is already in. */
export function fillBox(slugs: string[], ranked: string[]): string[] {
  const out = [...slugs]
  for (const s of ranked) {
    if (out.length >= BOX_SIZE) break
    if (!out.includes(s)) out.push(s)
  }
  return out
}

export function moveInBox(slugs: string[], from: number, to: number): string[] {
  if (from === to || from < 0 || to < 0 || from >= slugs.length || to >= slugs.length) return slugs
  const out = [...slugs]
  const [x] = out.splice(from, 1)
  out.splice(to, 0, x!)
  return out
}
