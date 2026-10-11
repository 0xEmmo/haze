import { useMemo } from 'react'
import { computeTotals, priceLines, type DeliveryId } from '@/lib/cart'
import { useCart } from '@/stores/cart'
import { availableCredit, useOrders } from '@/stores/orders'

/** Priced bag lines and totals, with any sample-box credit applied. */
export function useBag(delivery: DeliveryId | null = null) {
  const raw = useCart((s) => s.lines)
  const giftWrap = useCart((s) => s.giftWrap)
  const orders = useOrders((s) => s.orders)
  return useMemo(() => {
    const lines = priceLines(raw)
    const credit = availableCredit(orders)
    return { lines, credit, giftWrap, totals: computeTotals(lines, { delivery, giftWrap, credit }) }
  }, [raw, giftWrap, orders, delivery])
}
