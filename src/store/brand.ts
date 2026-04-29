import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BrandProfile } from '@/types'

interface BrandStore {
  brand: BrandProfile | null
  setBrand: (brand: BrandProfile) => void
  updateBrand: (partial: Partial<BrandProfile>) => void
  clearBrand: () => void
}

export const useBrandStore = create<BrandStore>()(
  persist(
    (set) => ({
      brand: null,
      setBrand: (brand) => set({ brand }),
      updateBrand: (partial) =>
        set((state) => ({
          brand: state.brand ? { ...state.brand, ...partial } : null,
        })),
      clearBrand: () => set({ brand: null }),
    }),
    { name: 'contentcopilot-brand' }
  )
)
