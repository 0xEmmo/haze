import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Order } from '@/api/types'

interface OrdersState {
  orders: Order[]
  add: (o: Order) => void
}

export const useOrders = create<OrdersState>()(
  persist((set) => ({ orders: [], add: (o) => set((s) => ({ orders: [o, ...s.orders.filter((x) => x.id !== o.id)] })) }), { name: 'haze.orders', version: 1 }),
)

/**
 * Credit from sample boxes on earlier orders, minus what has been spent.
 * Boxes on an order earn credit; bottles on a later order spend it.
 */
export function availableCredit(orders: Order[], now = new Date()): number {
  const earned = orders.reduce((s, o) => {
    const fresh = now.getTime() - new Date(o.placedAt).getTime() < 30 * 864e5
    return s + (fresh ? o.boxCredit : 0)
  }, 0)
  const spent = orders.reduce((s, o) => s + o.totals.credit, 0)
  return Math.max(0, earned - spent)
}
