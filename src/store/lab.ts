import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LabItem, LabPattern, GeneratedIdeas } from '@/types/lab'

interface LabStore {
  items: LabItem[]
  patterns: LabPattern[]
  lastGenerated: GeneratedIdeas | null
  addItem: (item: LabItem) => void
  updateItem: (id: string, updates: Partial<LabItem>) => void
  removeItem: (id: string) => void
  addPattern: (pattern: LabPattern) => void
  removePattern: (id: string) => void
  setLastGenerated: (ideas: GeneratedIdeas) => void
}

export const useLabStore = create<LabStore>()(
  persist(
    (set) => ({
      items: [],
      patterns: [],
      lastGenerated: null,
      addItem: (item) => set((s) => ({ items: [item, ...s.items] })),
      updateItem: (id, updates) =>
        set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...updates } : i)) })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      addPattern: (pattern) => set((s) => ({ patterns: [pattern, ...s.patterns] })),
      removePattern: (id) => set((s) => ({ patterns: s.patterns.filter((p) => p.id !== id) })),
      setLastGenerated: (lastGenerated) => set({ lastGenerated }),
    }),
    { name: 'contentcopilot-lab' }
  )
)
