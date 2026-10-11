import { fragranceBySlug } from '@/data/catalogue'
import { BOX_PRICE } from '@/lib/box'
import { computeTotals, MAX_QTY, priceLines } from '@/lib/cart'
import { hasErrors, validateAddress, validateContact } from '@/lib/checkout'
import { simulateCharge, validateCard } from '@/lib/payment'
import type { CheckoutError, CheckoutRequest, Order } from './types'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const orderId = (rand = Math.random) => 'HZ-' + Array.from({ length: 6 }, () => ALPHABET[Math.floor(rand() * ALPHABET.length)]).join('')

/**
 * What a server would do: price everything again from the catalogue, check
 * stock, validate, cap the credit, then charge. Pure, so it is unit-tested.
 */
export function processCheckout(req: CheckoutRequest, maxCredit: number, now = new Date(), rand = Math.random): { ok: true; order: Order } | ({ ok: false } & CheckoutError) {
  if (req.lines.some((l) => l.type === 'item' && (!Number.isInteger(l.qty) || l.qty < 1 || l.qty > MAX_QTY))) {
    return { ok: false, kind: 'invalid', message: 'One of the quantities in your bag isn’t valid.' }
  }
  const lines = priceLines(req.lines)
  if (!lines.length) return { ok: false, kind: 'empty', message: 'Your bag is empty.' }

  const short = lines.find((l) => l.type === 'item' && l.qty > l.available)
  if (short && short.type === 'item') {
    return {
      ok: false,
      kind: 'stock',
      message: short.available === 0 ? `${short.product.name} (${short.size.label}) has just sold out.` : `Only ${short.available} of ${short.product.name} (${short.size.label}) left.`,
    }
  }

  const pickup = req.delivery === 'pickup'
  const contact = validateContact(req.contact)
  const address = validateAddress(req.address, pickup)
  const card = req.payment.method === 'card' ? validateCard(req.payment.card ?? { number: '', expiry: '', cvv: '', name: '' }, now) : {}
  if (hasErrors(contact) || hasErrors(address) || hasErrors(card)) {
    return { ok: false, kind: 'invalid', message: 'Some details need fixing.', fields: { contact, address, card } }
  }
  if (!pickup && req.delivery === 'lagos' && req.address.state !== 'Lagos') {
    return { ok: false, kind: 'invalid', message: 'Lagos delivery is only for Lagos addresses.' }
  }

  const totals = computeTotals(lines, { delivery: req.delivery, giftWrap: req.giftWrap, credit: Math.min(req.credit, maxCredit) })
  const id = orderId(rand)
  let last4: string | undefined
  if (req.payment.method === 'card') {
    const charge = simulateCharge(req.payment.card!.number, id)
    if (!charge.ok) return { ok: false, kind: 'payment', message: charge.message }
    last4 = req.payment.card!.number.replace(/\D/g, '').slice(-4)
  }

  return {
    ok: true,
    order: {
      id,
      placedAt: now.toISOString(),
      lines: lines.map((l) =>
        l.type === 'box'
          ? { key: l.key, title: 'Discovery box', detail: l.slugs.map((s) => fragranceBySlug(s)!.name).join(', '), photo: 'b-vials', qty: 1, total: l.total }
          : { key: l.key, title: l.product.name, detail: [l.size.label, l.engraving && `engraved “${l.engraving}”`].filter(Boolean).join(' · '), photo: l.product.photos[0]!, qty: l.qty, total: l.total },
      ),
      totals,
      contact: req.contact,
      address: req.address,
      delivery: req.delivery,
      payment: { method: req.payment.method, last4 },
      giftNote: req.giftNote?.trim().slice(0, 200) || undefined,
      boxCredit: lines.filter((l) => l.type === 'box').length * BOX_PRICE,
    },
  }
}
