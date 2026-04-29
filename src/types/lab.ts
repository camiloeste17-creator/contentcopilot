export type ContentCategory =
  | 'referente' | 'competidor' | 'propio' | 'anuncio'
  | 'trend' | 'storytelling' | 'educativo' | 'venta' | 'autoridad'

export type ContentPlatform =
  | 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'facebook' | 'otro'

export type ContentType =
  | 'educativo' | 'storytelling' | 'autoridad' | 'venta'
  | 'tendencia' | 'prueba_social' | 'polemica' | 'tutorial' | 'comparacion'

export type CommercialIntent = 'bajo' | 'medio' | 'alto'

export interface LabItem {
  id: string
  url?: string
  title?: string
  description?: string
  platform: ContentPlatform
  category: ContentCategory
  transcript?: string
  comments?: string
  createdAt: string
  analysis?: LabAnalysis
  commentsAnalysis?: CommentsAnalysis
}

export interface LabAnalysis {
  hook: string
  promise: string
  painOrDesire: string
  targetAudience: string
  contentType: ContentType
  structure: string[]
  keyMoment?: string
  retentionElements: string[]
  cta: string
  emotions: string[]
  keywords: string[]
  salesAngle: string
  commercialIntent: CommercialIntent
  whatWorked: string[]
  whatToImprove: string[]
  whyItWorked: string
  badges: string[]
}

export interface CommentsAnalysis {
  frequentQuestions: string[]
  objections: string[]
  hiddenDesires: string[]
  painPoints: string[]
  audiencePhrases: string[]
  contentIdeas: string[]
  productOpportunities: string[]
}

export interface LabPattern {
  id: string
  type: 'hook' | 'cta' | 'promise' | 'angle' | 'structure' | 'topic'
  content: string
  sourceItemId: string
  platform: ContentPlatform
  category: ContentCategory
  savedAt: string
}

export interface GeneratedIdeas {
  ideas: string[]
  hooks: string[]
  scripts: string[]
  salesAngles: string[]
  ctas: string[]
  seoTitles: string[]
  instagramCaptions: string[]
  metaAdsIdeas: string[]
  organicIdeas: string[]
  storytellingIdeas: string[]
}
