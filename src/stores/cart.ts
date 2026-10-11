import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { lineKey, MAX_QTY, type CartLine } from '@/lib/cart'

interface CartState {
  lines: CartLine[]
  giftWrap: boolean
  addItem: (l: Extract<CartLine, { type: 'item' }>) => void
  addBox: (slugs: string[]) => void
  setQty: (key: string, qty: number) => void
  remove: (key: string) => { line: CartLine; index: number } | null
  restore: (line: CartLine, index: number) => void
  setGiftWrap: (on: boolean) => void
  clear: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      giftWrap: false,
      addItem: (incoming) =>
        set((s) => {
          const key = lineKey(incoming)
          const existing = s.lines.find((l) => lineKey(l) === key)
          if (existing && existing.type === 'item') {
            return { lines: s.lines.map((l) => (l === existing ? { ...existing, qty: Math.min(MAX_QTY, existing.qty + incoming.qty) } : l)) }
          }
          return { lines: [...s.lines, incoming] }
        }),
      addBox: (slugs) => set((s) => ({ lines: [...s.lines, { type: 'box', id: Math.random().toString(36).slice(2, 8), slugs }] })),
      setQty: (key, qty) =>
        set((s) => ({ lines: s.lines.map((l) => (l.type === 'item' && lineKey(l) === key ? { ...l, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : l)) })),
      remove: (key) => {
        const index = get().lines.findIndex((l) => lineKey(l) === key)
        if (index < 0) return null
        const line = get().lines[index]!
        set((s) => ({ lines: s.lines.filter((_, i) => i !== index) }))
        return { line, index }
      },
      restore: (line, index) =>
        set((s) => {
          if (s.lines.some((l) => lineKey(l) === lineKey(line))) return s
          const lines = [...s.lines]
          lines.splice(index, 0, line)
          return { lines }
        }),
      setGiftWrap: (giftWrap) => set({ giftWrap }),
      clear: () => set({ lines: [], giftWrap: false }),
    }),
    { name: 'haze.cart', version: 1 },
  ),
)
