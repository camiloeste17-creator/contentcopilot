import { create } from 'zustand'
import { GeneratedIdea, IdeaGeneratorInput } from '@/types'

interface IdeasStore {
  ideas: GeneratedIdea[]
  rawOutput: string
  isGenerating: boolean
  lastInput: IdeaGeneratorInput | null
  setIdeas: (ideas: GeneratedIdea[]) => void
  setRawOutput: (output: string) => void
  setIsGenerating: (v: boolean) => void
  setLastInput: (input: IdeaGeneratorInput) => void
  savedIdeas: GeneratedIdea[]
  saveIdea: (idea: GeneratedIdea) => void
  removeSavedIdea: (index: number) => void
}

export const useIdeasStore = create<IdeasStore>((set) => ({
  ideas: [],
  rawOutput: '',
  isGenerating: false,
  lastInput: null,
  savedIdeas: [],
  setIdeas: (ideas) => set({ ideas }),
  setRawOutput: (rawOutput) => set({ rawOutput }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setLastInput: (lastInput) => set({ lastInput }),
  saveIdea: (idea) => set((s) => ({ savedIdeas: [...s.savedIdeas, idea] })),
  removeSavedIdea: (index) =>
    set((s) => ({ savedIdeas: s.savedIdeas.filter((_, i) => i !== index) })),
}))
