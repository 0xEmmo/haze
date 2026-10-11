import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toggleCompare } from '@/lib/compare'

interface CompareState {
  slugs: string[]
  toggle: (slug: string) => { added: boolean; full: boolean }
  set: (slugs: string[]) => void
  clear: () => void
}

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) => {
        const before = get().slugs
        const r = toggleCompare(before, slug)
        set({ slugs: r.slugs })
        return { added: r.slugs.length > before.length, full: r.full }
      },
      set: (slugs) => set({ slugs }),
      clear: () => set({ slugs: [] }),
    }),
    { name: 'haze.compare', version: 1 },
  ),
)
