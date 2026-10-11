import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addToBox, fillBox, moveInBox, removeFromBox, type BoxResult } from '@/lib/box'

interface BoxState {
  slugs: string[]
  add: (slug: string) => BoxResult
  remove: (slug: string) => void
  fill: (ranked: string[]) => void
  move: (from: number, to: number) => void
  reset: () => void
}

/** The sample box being built. It only becomes a cart line once all five slots are full. */
export const useBox = create<BoxState>()(
  persist(
    (set, get) => ({
      slugs: [],
      add: (slug) => {
        const r = addToBox(get().slugs, slug)
        if (r.ok) set({ slugs: r.slugs })
        return r
      },
      remove: (slug) => set((s) => ({ slugs: removeFromBox(s.slugs, slug) })),
      fill: (ranked) => set((s) => ({ slugs: fillBox(s.slugs, ranked) })),
      move: (from, to) => set((s) => ({ slugs: moveInBox(s.slugs, from, to) })),
      reset: () => set({ slugs: [] }),
    }),
    { name: 'haze.box', version: 1 },
  ),
)
