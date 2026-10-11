import { products } from '@/data/catalogue'
import type { Product } from '@/data/types'
import { processCheckout } from './checkout'
import type { CheckoutError, CheckoutRequest, Order } from './types'

/**
 * The app's only door to "the server". Everything here is async with a
 * little latency, so the UI is built for real network behaviour (pending
 * states, failures) and could be pointed at HTTP without changing.
 */

const latency = () => {
  const forced = typeof localStorage !== 'undefined' ? localStorage.getItem('haze.latency') : null
  return forced !== null ? Number(forced) : 350 + Math.random() * 400
}
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export class ApiError extends Error {
  constructor(public readonly detail: CheckoutError) {
    super(detail.message)
  }
}

export async function searchProducts(q: string, limit = 6): Promise<Product[]> {
  await wait(Math.min(latency(), 180))
  const needle = q.trim().toLowerCase()
  if (!needle) return []
  return products
    .map((p) => {
      const hay = [p.name, p.tagline, ...(p.kind === 'fragrance' ? [...p.notes.top, ...p.notes.heart, ...p.notes.base] : p.notes)].join(' ').toLowerCase()
      const score = p.name.toLowerCase().startsWith(needle) ? 3 : p.name.toLowerCase().includes(needle) ? 2 : hay.includes(needle) ? 1 : 0
      return { p, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p)
}

export async function placeOrder(req: CheckoutRequest, maxCredit: number): Promise<Order> {
  await wait(latency() + 300)
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new ApiError({ kind: 'network', message: 'You’re offline. Nothing has been charged; try again when you’re connected.' })
  }
  const r = processCheckout(req, maxCredit)
  if (!r.ok) throw new ApiError(r)
  return r.order
}
