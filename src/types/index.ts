export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'facebook'
export type ContentObjective = 'attract' | 'educate' | 'sell' | 'authority' | 'community' | 'remarketing'
export type ContentFormat = 'reel' | 'carousel' | 'story' | 'live' | 'post' | 'short' | 'ad'
export type ContentStatus = 'idea' | 'script' | 'recorded' | 'edited' | 'published' | 'analyzed'
export type ContentType = 'hook' | 'storytelling' | 'educational' | 'authority' | 'sale' | 'trend' | 'competitor'

export interface BrandProfile {
  id?: string
  user_id?: string
  name: string
  niche: string
  business_type: string
  target_audience: string
  value_proposition: string
  main_pain: string
  main_desire: string
  objections: string
  differentials: string
  promise: string
  tone: string
  character: string
  product: string
  personality: string
  positioning: string
  platforms: Platform[]
  script_structure?: string
  updated_at?: string
}

export interface GeneratedIdea {
  id?: string
  hook: string
  angle: string
  structure: string[]
  script: string
  caption: string
  keywords: string[]
  objective: ContentObjective
  platform: Platform
  content_type: ContentType
  why_it_works: string
}

export interface ContentPiece {
  id: string
  title: string
  format: ContentFormat
  platform: Platform
  objective: ContentObjective
  status: ContentStatus
  scheduled_date?: string
  idea_text?: string
  script_text?: string
  notes?: string
  created_at: string
}

export interface IdeaGeneratorInput {
  niche: string
  business_type: string
  target_audience: string
  objective: ContentObjective
  platform: Platform
  content_types: ContentType[]
  extra_context?: string
}
