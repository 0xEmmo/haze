import { fragranceBySlug, productBySlug } from '@/data/catalogue'
import type { Product, Size } from '@/data/types'
import { BOX_PRICE, BOX_SIZE } from './box'

export const MAX_QTY = 5
export const ENGRAVING_PRICE = 5000
export const ENGRAVING_MAX = 12
export const GIFT_WRAP_PRICE = 3000

export type CartLine =
  | { type: 'item'; slug: string; sizeId: string; qty: number; engraving?: string }
  | { type: 'box'; id: string; slugs: string[] }

export type PricedLine =
  | { type: 'item'; key: string; product: Product; size: Size; qty: number; engraving?: string; unit: number; total: number; available: number }
  | { type: 'box'; key: string; id: string; slugs: string[]; total: number }

export const lineKey = (l: CartLine) => (l.type === 'box' ? `box:${l.id}` : `${l.slug}:${l.sizeId}:${l.engraving ?? ''}`)

const ENGRAVING_RE = /^[A-Za-z0-9 &.'-]*$/

export function validEngraving(text: string) {
  const t = text.trim()
  if (!t) return 'Type what you’d like engraved'
  if (t.length > ENGRAVING_MAX) return `Up to ${ENGRAVING_MAX} characters`
  if (!ENGRAVING_RE.test(t)) return "Plain letters without accents, numbers, spaces and & . - ' only"
  return null
}

/** Re-prices from the catalogue; anything unknown or malformed is dropped. */
export function priceLines(lines: CartLine[]): PricedLine[] {
  const out: PricedLine[] = []
  for (const l of lines) {
    if (l.type === 'box') {
      const ok = l.slugs.length === BOX_SIZE && new Set(l.slugs).size === BOX_SIZE && l.slugs.every((s) => fragranceBySlug(s))
      if (ok) out.push({ type: 'box', key: lineKey(l), id: l.id, slugs: l.slugs, total: BOX_PRICE })
      continue
    }
    const product = productBySlug(l.slug)
    const size = product?.sizes.find((s) => s.id === l.sizeId)
    if (!product || !size) continue
    const engraving = product.kind === 'fragrance' && l.engraving && !validEngraving(l.engraving) ? l.engraving.trim() : undefined
    const qty = Math.max(1, Math.min(MAX_QTY, Math.floor(l.qty)))
    const unit = size.price + (engraving ? ENGRAVING_PRICE : 0)
    out.push({ type: 'item', key: lineKey(l), product, size, qty, engraving, unit, total: unit * qty, available: size.stock })
  }
  return out
}

export type DeliveryId = 'lagos' | 'nationwide' | 'pickup'

export const DELIVERY: Record<DeliveryId, { label: string; eta: string; fee: number; freeOver: number }> = {
  lagos: { label: 'Lagos delivery', eta: '1 to 2 working days', fee: 2500, freeOver: 100000 },
  nationwide: { label: 'Nationwide', eta: '3 to 5 working days', fee: 6000, freeOver: 150000 },
  pickup: { label: 'Collect from the studio, Ikoyi', eta: 'Ready in 2 hours', fee: 0, freeOver: 0 },
}

export interface Totals {
  items: number
  merchandise: number
  credit: number
  giftWrap: number
  delivery: number
  total: number
}

export interface TotalsOptions {
  delivery?: DeliveryId | null
  giftWrap?: boolean
  /** Discovery-box credit, used only against full-size fragrance bottles. */
  credit?: number
}

export function computeTotals(lines: PricedLine[], o: TotalsOptions = {}): Totals {
  const merchandise = lines.reduce((s, l) => s + l.total, 0)
  const bottles = lines.reduce((s, l) => s + (l.type === 'item' && l.product.kind === 'fragrance' ? l.size.price * l.qty : 0), 0)
  const credit = Math.min(o.credit ?? 0, bottles)
  const giftWrap = o.giftWrap && lines.length ? GIFT_WRAP_PRICE : 0
  const d = o.delivery ? DELIVERY[o.delivery] : null
  const afterCredit = merchandise - credit
  const delivery = !d || !lines.length ? 0 : d.freeOver && afterCredit >= d.freeOver ? 0 : d.fee
  const items = lines.reduce((s, l) => s + (l.type === 'box' ? 1 : l.qty), 0)
  return { items, merchandise, credit, giftWrap, delivery, total: afterCredit + giftWrap + delivery }
}
