import { describe, expect, it } from 'vitest'
import { TEST_CARDS } from '@/lib/payment'
import { availableCredit } from '@/stores/orders'
import { processCheckout } from './checkout'
import type { CheckoutRequest } from './types'

const now = new Date('2026-10-12T10:00:00+01:00')
const base: CheckoutRequest = {
  lines: [{ type: 'item', slug: 'harmattan', sizeId: '50ml', qty: 1 }],
  giftWrap: false,
  contact: { name: 'Ada Obi', email: 'ada@example.com', phone: '08031234567' },
  address: { state: 'Lagos', area: 'Yaba', street: '12 Herbert Macaulay Way', landmark: '' },
  delivery: 'lagos',
  payment: { method: 'card', card: { number: TEST_CARDS.success, expiry: '12/29', cvv: '123', name: 'Ada Obi' } },
  credit: 0,
}

describe('checkout', () => {
  it('prices on the "server" and keeps only the last four digits', () => {
    const r = processCheckout(base, 0, now, () => 0)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.order.id).toBe('HZ-AAAAAA')
    expect(r.order.totals.total).toBe(68000 + 2500)
    expect(r.order.payment.last4).toBe('4081')
    expect(JSON.stringify(r.order)).not.toContain(TEST_CARDS.success.replace(/ /g, ''))
  })

  it('never spends more credit than the account has', () => {
    const r = processCheckout({ ...base, credit: 999999 }, 18000, now)
    expect(r.ok && r.order.totals.credit).toBe(18000)
  })

  it('a box earns credit that a later bottle spends', () => {
    const box = processCheckout({ ...base, lines: [{ type: 'box', id: 'x', slugs: ['harmattan', 'ember', 'oud-oba', 'lekki-salt', 'after-rain'] }] }, 0, now)
    expect(box.ok).toBe(true)
    if (!box.ok) return
    expect(box.order.boxCredit).toBe(18000)
    expect(availableCredit([box.order], now)).toBe(18000)
    const bottle = processCheckout({ ...base, credit: 18000 }, availableCredit([box.order], now), now)
    if (!bottle.ok) throw new Error('expected ok')
    expect(availableCredit([bottle.order, box.order], now)).toBe(0)
    // and it expires after 30 days
    expect(availableCredit([box.order], new Date('2026-12-01'))).toBe(0)
  })

  it('refuses sold-out sizes, bad quantities and a declined card', () => {
    expect(processCheckout({ ...base, lines: [{ type: 'item', slug: 'ember', sizeId: '100ml', qty: 1 }] }, 0, now)).toMatchObject({ ok: false, kind: 'stock' })
    expect(processCheckout({ ...base, lines: [{ type: 'item', slug: 'harmattan', sizeId: '50ml', qty: 50 }] }, 0, now)).toMatchObject({ ok: false, kind: 'invalid' })
    expect(processCheckout({ ...base, payment: { method: 'card', card: { ...base.payment.card!, number: TEST_CARDS.declined } } }, 0, now)).toMatchObject({ ok: false, kind: 'payment' })
  })

  it('returns all field errors together', () => {
    const r = processCheckout({ ...base, contact: { name: '', email: 'x', phone: '1' } }, 0, now)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(Object.keys(r.fields!.contact!)).toEqual(['name', 'email', 'phone'])
  })

  it('Lagos delivery needs a Lagos address', () => {
    const r = processCheckout({ ...base, address: { ...base.address, state: 'Oyo', area: 'Ibadan' } }, 0, now)
    expect(r).toMatchObject({ ok: false, kind: 'invalid' })
  })
})
