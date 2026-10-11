import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { lineKey, MAX_QTY, type CartLine } from '@/lib/cart'

interface CartState {
  lines: CartLine[]
  /** The last line taken out, so the bag can offer an inline undo. */
  removed: { line: CartLine; index: number } | null
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
      removed: null,
      giftWrap: false,
      addItem: (incoming) =>
        set((s) => {
          const key = lineKey(incoming)
          const existing = s.lines.find((l) => lineKey(l) === key)
          if (existing && existing.type === 'item') {
            return { removed: null, lines: s.lines.map((l) => (l === existing ? { ...existing, qty: Math.min(MAX_QTY, existing.qty + incoming.qty) } : l)) }
          }
          return { removed: null, lines: [...s.lines, incoming] }
        }),
      addBox: (slugs) => set((s) => ({ lines: [...s.lines, { type: 'box', id: Math.random().toString(36).slice(2, 8), slugs }] })),
      setQty: (key, qty) =>
        set((s) => ({ lines: s.lines.map((l) => (l.type === 'item' && lineKey(l) === key ? { ...l, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : l)) })),
      remove: (key) => {
        const index = get().lines.findIndex((l) => lineKey(l) === key)
        if (index < 0) return null
        const line = get().lines[index]!
        set((s) => ({ lines: s.lines.filter((_, i) => i !== index), removed: { line, index } }))
        return { line, index }
      },
      restore: (line, index) =>
        set((s) => {
          if (s.lines.some((l) => lineKey(l) === lineKey(line))) return { removed: null }
          const lines = [...s.lines]
          lines.splice(index, 0, line)
          return { lines, removed: null }
        }),
      setGiftWrap: (giftWrap) => set({ giftWrap }),
      clear: () => set({ lines: [], giftWrap: false, removed: null }),
    }),
    { name: 'haze.cart', version: 1, partialize: (s) => ({ lines: s.lines, giftWrap: s.giftWrap }) },
  ),
)
