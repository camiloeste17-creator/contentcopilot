'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Bookmark, BookmarkCheck, ChevronDown, ChevronUp } from 'lucide-react'

export interface ParsedIdea {
  title: string
  hookType: string
  technique: string
  hook: string
  script: string
  caption: string
  whyItWorks: string
  raw: string
}

// Finds the text after a label until the next label or end
function extractField(text: string, labelPatterns: string[]): string {
  for (const label of labelPatterns) {
    // Build a regex that finds the label and captures everything until next **...: or end
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(escaped + '[:\\s]*\\n([\\s\\S]+?)(?=\\n\\*\\*|\\n##\\s|\\n---\\s*\\n|$)', 'i')
    const m = text.match(re)
    if (m && m[1].trim()) return m[1].trim()
  }
  return ''
}

function extractInlineField(text: string, labelPatterns: string[]): string {
  for (const label of labelPatterns) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(escaped + '[:\\s*]*(.+)', 'i')
    const m = text.match(re)
    if (m && m[1].trim()) return m[1].replace(/\*+$/, '').trim()
  }
  return ''
}

export function parseIdeaBlock(block: string): ParsedIdea {
  const b = block.trim()

  // Title from ## IDEA N: title
  const titleMatch = b.match(/##\s+IDEA\s+\d+[:\s\-–]+(.+)/i)
  const title = titleMatch ? titleMatch[1].trim() : 'Idea de contenido'

  // Hook type (inline field)
  const hookType = extractInlineField(b, [
    '**Tipo de hook**', '**Tipo de Hook**', '**Tipo**',
  ])

  // Technique (inline)
  const technique = extractInlineField(b, [
    '**Técnica narrativa**', '**Técnica Narrativa**', '**Técnica**',
  ])

  // Hook (multiline — everything after the Hook: header)
  const hook = extractField(b, [
    '**🎣 Hook:**', '**Hook:**', '**🎣Hook:**', '**🎣 Hook**', '**Hook**',
  ])

  // Script
  const script = extractField(b, [
    '**📝 Guion:**', '**Guion:**', '**📝Guion:**', '**📝 Guion**', '**Guion**',
    '**📝 Guión:**', '**Guión:**',
  ])

  // Caption
  const caption = extractField(b, [
    '**📱 Caption:**', '**Caption:**', '**📱Caption:**', '**📱 Caption**', '**Caption**',
  ])

  // Why it works
  const whyItWorks = extractField(b, [
    '**💡 Por qué funciona:**', '**Por qué funciona:**', '**💡Por qué funciona:**',
    '**💡 Por qué va a funcionar:**', '**Por qué va a funcionar:**',
    '**💡 Por qué funciona**', '**Por qué funciona**',
  ])

  return { title, hookType, technique, hook, script, caption, whyItWorks, raw: b }
}

interface IdeaCardProps {
  idea: ParsedIdea
  index: number
  isSaved: boolean
  onSave: () => void
}

export function IdeaCard({ idea, index, isSaved, onSave }: IdeaCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  function copyText(text: string, field: string) {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const hasDetails = !!(idea.script || idea.caption || idea.whyItWorks)

  return (
    <Card className="overflow-hidden border-border hover:border-primary/30 transition-colors">
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="w-6 h-6 rounded-md bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {index + 1}
            </span>
            <div className="min-w-0 space-y-1.5">
              <h3 className="font-semibold text-sm leading-snug">{idea.title}</h3>
              <div className="flex flex-wrap gap-1.5">
                {idea.hookType && (
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                    {idea.hookType}
                  </Badge>
                )}
                {idea.technique && (
                  <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-400">
                    {idea.technique}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <button
            className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-accent transition-colors ${
              isSaved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={onSave}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-4 space-y-4">
        {/* Hook — always visible */}
        {idea.hook ? (
          <div className="rounded-lg bg-primary/8 border border-primary/20 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Hook</span>
              <button
                onClick={() => copyText(idea.hook, 'hook')}
                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                {copiedField === 'hook' ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <p className="text-sm font-medium leading-snug">"{idea.hook}"</p>
          </div>
        ) : (
          <div className="rounded-lg bg-secondary border border-border p-3">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Contenido generado</p>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-6">{idea.raw.slice(0, 500)}</p>
          </div>
        )}

        {/* Expandable details */}
        {expanded && (
          <div className="space-y-4">
            {idea.script && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Guion</p>
                  <button
                    onClick={() => copyText(idea.script, 'script')}
                    className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedField === 'script' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <div className="bg-secondary rounded-lg p-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {idea.script}
                </div>
              </div>
            )}

            {idea.caption && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Caption</p>
                  <button
                    onClick={() => copyText(idea.caption, 'caption')}
                    className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedField === 'caption' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <div className="bg-secondary rounded-lg p-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {idea.caption}
                </div>
              </div>
            )}

            {idea.whyItWorks && (
              <div className="rounded-lg bg-green-500/8 border border-green-500/20 p-3">
                <p className="text-[10px] font-semibold text-green-400 uppercase tracking-wider mb-1">Por qué funciona</p>
                <p className="text-sm text-muted-foreground">{idea.whyItWorks}</p>
              </div>
            )}

            {/* Fallback: show raw if nothing parsed */}
            {!idea.script && !idea.caption && !idea.whyItWorks && (
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Texto completo</p>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{idea.raw}</p>
              </div>
            )}
          </div>
        )}

        {/* Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
        >
          {expanded
            ? <><ChevronUp className="w-3.5 h-3.5" /> Ocultar</>
            : <><ChevronDown className="w-3.5 h-3.5" /> Ver guion, caption y más</>}
        </button>
      </CardContent>
    </Card>
  )
}
