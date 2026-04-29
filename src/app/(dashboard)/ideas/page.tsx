'use client'

import { useState, useRef } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBrandStore } from '@/store/brand'
import { ContentObjective, ContentType, Platform } from '@/types'
import { IdeaCard, parseIdeaBlock, ParsedIdea } from '@/components/ideas/IdeaCard'
import { STORYTELLING_TECHNIQUES, StorytellingTechnique } from '@/lib/storytelling-data'
import {
  Sparkles, Lightbulb, AlertTriangle, RefreshCw, Target, Bookmark, Shuffle,
} from 'lucide-react'
import Link from 'next/link'

const OBJECTIVES: { value: ContentObjective; label: string; color: string }[] = [
  { value: 'attract', label: 'Atraer', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  { value: 'educate', label: 'Educar', color: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
  { value: 'sell', label: 'Vender', color: 'bg-green-500/15 text-green-400 border-green-500/30' },
  { value: 'authority', label: 'Autoridad', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  { value: 'community', label: 'Comunidad', color: 'bg-pink-500/15 text-pink-400 border-pink-500/30' },
  { value: 'remarketing', label: 'Remarketing', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
]

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube Shorts' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
]

const CONTENT_TYPES: { value: ContentType; label: string; desc: string }[] = [
  { value: 'hook', label: 'Hooks', desc: 'Aperturas que enganchen' },
  { value: 'storytelling', label: 'Storytelling', desc: 'Historias personales o de clientes' },
  { value: 'educational', label: 'Educativo', desc: 'Tutoriales, tips, listas' },
  { value: 'authority', label: 'Autoridad', desc: 'Opiniones y posiciones claras' },
  { value: 'sale', label: 'Ventas', desc: 'Videos que convierten' },
  { value: 'trend', label: 'Tendencias', desc: 'Formatos virales adaptados' },
]

function parseIdeasFromStream(text: string): ParsedIdea[] {
  // Split on any --- separator line (with or without surrounding newlines/spaces)
  const blocks = text.split(/\n\s*---+\s*\n/)
  const ideaBlocks = blocks.filter(b => /##\s+IDEA\s+\d+/i.test(b))
  return ideaBlocks.map(parseIdeaBlock)
}

export default function IdeasPage() {
  const brand = useBrandStore((s) => s.brand)

  const [objective, setObjective] = useState<ContentObjective>('attract')
  const [platform, setPlatform] = useState<Platform>('instagram')
  const [contentTypes, setContentTypes] = useState<ContentType[]>(['hook', 'storytelling'])
  const [extraContext, setExtraContext] = useState('')
  const [technique, setTechnique] = useState<StorytellingTechnique | 'random'>('random')

  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [ideas, setIdeas] = useState<ParsedIdea[]>([])
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set())
  const abortRef = useRef<AbortController | null>(null)

  function toggleContentType(t: ContentType) {
    setContentTypes(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    )
  }

  function toggleSaved(index: number) {
    setSavedIds(prev => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  async function handleGenerate() {
    if (!brand || streaming) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStreaming(true)
    setStreamText('')
    setIdeas([])
    setSavedIds(new Set())

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand, objective, platform, contentTypes, extraContext,
          technique: technique === 'random' ? undefined : technique,
        }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}))
        console.error('API error:', err)
        setStreaming(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setStreamText(accumulated)
        // Parse ideas progressively
        const parsed = parseIdeasFromStream(accumulated)
        if (parsed.length > 0) setIdeas(parsed)
      }

      // Final parse
      setIdeas(parseIdeasFromStream(accumulated))
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') console.error(err)
    } finally {
      setStreaming(false)
    }
  }

  const savedIdeas = ideas.filter((_, i) => savedIds.has(i))
  const hasBrand = !!brand?.niche

  return (
    <div>
      <Topbar title="Generador de Ideas" subtitle="Ideas estratégicas alineadas a tu marca y audiencia" />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* LEFT: Controls */}
        <div className="space-y-4 lg:sticky lg:top-20">
          {!hasBrand && (
            <Alert className="border-amber-500/30 bg-amber-500/5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <AlertDescription className="text-sm">
                <Link href="/brand" className="text-primary underline underline-offset-2">
                  Configura tu Brand Canvas
                </Link>{' '}para ideas alineadas a tu marca
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Objetivo</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-2 gap-1.5">
                {OBJECTIVES.map(obj => (
                  <button
                    key={obj.value}
                    onClick={() => setObjective(obj.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      objective === obj.value ? obj.color : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {obj.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Red social</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 space-y-1">
              {PLATFORMS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPlatform(p.value)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    platform === p.value
                      ? 'bg-primary/15 border-primary text-primary'
                      : 'bg-secondary border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Tipos de contenido</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 space-y-1.5">
              {CONTENT_TYPES.map(ct => (
                <button
                  key={ct.value}
                  onClick={() => toggleContentType(ct.value)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all text-left ${
                    contentTypes.includes(ct.value)
                      ? 'bg-primary/10 border-primary/40'
                      : 'bg-secondary border-transparent hover:border-border'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    contentTypes.includes(ct.value) ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                  }`}>
                    {contentTypes.includes(ct.value) && (
                      <div className="w-1.5 h-1.5 bg-white rounded-sm" />
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${contentTypes.includes(ct.value) ? 'text-primary' : ''}`}>{ct.label}</p>
                    <p className="text-[10px] text-muted-foreground">{ct.desc}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Técnica de storytelling</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 space-y-1.5">
              <button
                onClick={() => setTechnique('random')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all text-left ${
                  technique === 'random'
                    ? 'bg-primary/10 border-primary/40'
                    : 'bg-secondary border-transparent hover:border-border'
                }`}
              >
                <Shuffle className={`w-3.5 h-3.5 flex-shrink-0 ${technique === 'random' ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className={`text-xs font-medium ${technique === 'random' ? 'text-primary' : ''}`}>Variedad aleatoria</p>
                  <p className="text-[10px] text-muted-foreground">Mezcla de técnicas distintas</p>
                </div>
              </button>
              {(Object.entries(STORYTELLING_TECHNIQUES) as [StorytellingTechnique, typeof STORYTELLING_TECHNIQUES[StorytellingTechnique]][]).map(([key, tech]) => (
                <button
                  key={key}
                  onClick={() => setTechnique(key)}
                  className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg border transition-all text-left ${
                    technique === key
                      ? 'bg-primary/10 border-primary/40'
                      : 'bg-secondary border-transparent hover:border-border'
                  }`}
                >
                  <div>
                    <p className={`text-xs font-medium ${technique === key ? 'text-primary' : ''}`}>{tech.label}</p>
                    <p className="text-[10px] text-muted-foreground">{tech.description}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">
                Contexto extra <span className="font-normal normal-case">(opcional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <Textarea
                rows={2}
                placeholder="Ej: Quiero hablar sobre el miedo a vender..."
                value={extraContext}
                onChange={e => setExtraContext(e.target.value)}
                className="text-xs resize-none"
              />
            </CardContent>
          </Card>

          <Button
            onClick={handleGenerate}
            disabled={!hasBrand || streaming || contentTypes.length === 0}
            className="w-full gap-2"
            size="lg"
          >
            {streaming ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Generando ideas...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generar ideas</>
            )}
          </Button>
        </div>

        {/* RIGHT: Output */}
        <div>
          {(ideas.length > 0 || streaming) ? (
            <Tabs defaultValue="ideas">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="ideas" className="gap-2">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Ideas {ideas.length > 0 && `(${ideas.length})`}
                  </TabsTrigger>
                  <TabsTrigger value="saved" className="gap-2">
                    <Bookmark className="w-3.5 h-3.5" />
                    Guardadas {savedIds.size > 0 && `(${savedIds.size})`}
                  </TabsTrigger>
                </TabsList>
                {streaming && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Generando...
                  </div>
                )}
              </div>

              <TabsContent value="ideas" className="space-y-4 mt-0">
                {/* Streaming preview while parsing */}
                {streaming && ideas.length === 0 && (
                  <Card>
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs text-muted-foreground">La IA está pensando...</span>
                      </div>
                      <pre className="text-xs text-muted-foreground/70 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-hidden">
                        {streamText.slice(-600)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {ideas.map((idea, i) => (
                  <IdeaCard
                    key={i}
                    idea={idea}
                    index={i}
                    isSaved={savedIds.has(i)}
                    onSave={() => toggleSaved(i)}
                  />
                ))}
              </TabsContent>

              <TabsContent value="saved" className="space-y-4 mt-0">
                {savedIdeas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border rounded-xl text-center p-6">
                    <Bookmark className="w-8 h-8 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Haz clic en el ícono de bookmark en cualquier idea para guardarla aquí
                    </p>
                  </div>
                ) : (
                  savedIdeas.map((idea, i) => (
                    <IdeaCard
                      key={i}
                      idea={idea}
                      index={i}
                      isSaved={true}
                      onSave={() => {
                        const originalIndex = ideas.indexOf(idea)
                        toggleSaved(originalIndex)
                      }}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex flex-col items-center justify-center h-[520px] border border-dashed border-border rounded-xl text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-base mb-2">Listo para generar ideas</h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-6">
                {hasBrand
                  ? 'Configura el objetivo, la plataforma y los tipos de contenido, luego haz clic en Generar.'
                  : 'Primero configura tu Brand Canvas para que las ideas estén alineadas a tu marca.'}
              </p>
              {!hasBrand && (
                <Link href="/brand">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Target className="w-3.5 h-3.5" /> Configurar Brand Canvas
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
