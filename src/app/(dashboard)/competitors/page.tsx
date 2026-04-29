'use client'

import { useState, useRef } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBrandStore } from '@/store/brand'
import { Eye, Sparkles, RefreshCw, Plus, X, AtSign, Search } from 'lucide-react'

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'LinkedIn']

interface SavedCompetitor {
  username: string
  platform: string
  result: string
  date: string
}

function renderMarkdown(text: string) {
  return text
    .replace(/^## (.+)$/gm, '<h2 class="font-semibold text-sm text-primary mt-5 mb-2 uppercase tracking-wide">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>')
    .replace(/^---$/gm, '<hr class="my-3 border-border">')
    .replace(/^- (.+)$/gm, '<li class="ml-4 my-0.5 list-disc text-muted-foreground">$1</li>')
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/^(?!<[h2pli]|<hr)(.+)$/gm, '<p class="text-muted-foreground">$1</p>')
}

export default function CompetitorsPage() {
  const brand = useBrandStore((s) => s.brand)
  const [username, setUsername] = useState('')
  const [platform, setPlatform] = useState('Instagram')
  const [niche, setNiche] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [output, setOutput] = useState('')
  const [saved, setSaved] = useState<SavedCompetitor[]>([])
  const [activeTab, setActiveTab] = useState<'analyze' | 'saved'>('analyze')
  const [fetchedProfile, setFetchedProfile] = useState<{ username: string; followers: number; bio: string; posts: number } | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  async function handleAnalyze() {
    if (!username.trim() || streaming) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStreaming(true)
    setOutput('')
    setFetchedProfile(null)

    try {
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.replace('@', ''), platform, brand }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) { setStreaming(false); return }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setOutput(accumulated)
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') console.error(err)
    } finally {
      setStreaming(false)
    }
  }

  function handleSave() {
    if (!output || !username) return
    setSaved(prev => [{
      username: username.replace('@', ''),
      platform,
      result: output,
      date: new Date().toLocaleDateString('es', { day: 'numeric', month: 'short' }),
    }, ...prev])
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAnalyze()
  }

  return (
    <div>
      <Topbar title="Referentes" subtitle="Escribe el username — Claude analiza su estrategia de contenido" />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* LEFT */}
        <div className="space-y-4 lg:sticky lg:top-20">
          <Card>
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-sm">Buscar referente</CardTitle>
              <CardDescription className="text-xs">
                Solo escribe el username. Claude analiza su estrategia usando su conocimiento de creadores de contenido.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4 space-y-4">
              {/* Username */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Username <span className="text-destructive">*</span></label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="nombredeusuario"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-8 pr-3 py-2.5 text-sm rounded-lg border border-border bg-secondary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Platform */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Plataforma</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PLATFORMS.map(p => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        platform === p
                          ? 'bg-primary/15 border-primary text-primary'
                          : 'bg-secondary border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Niche (optional) */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  Nicho / industria <span className="font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: fitness, negocios, repostería, moda..."
                  value={niche}
                  onChange={e => setNiche(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-secondary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleAnalyze}
            disabled={!username.trim() || streaming}
            className="w-full gap-2"
            size="lg"
          >
            {streaming ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Analizando...</>
            ) : (
              <><Search className="w-4 h-4" /> Analizar @{username.replace('@', '') || 'username'}</>
            )}
          </Button>

          <div className="rounded-lg border border-border p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cómo funciona</p>
            <ul className="space-y-1.5">
              {[
                'Obtiene el perfil real de Instagram públicamente',
                'Analiza sus últimos posts, likes y comentarios reales',
                'Detecta patrones, hooks y qué contenido funciona',
                'Genera ideas adaptadas a tu marca, no copias',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="text-primary mt-0.5">·</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('analyze')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'analyze' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Análisis
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'saved' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Guardados
              {saved.length > 0 && (
                <Badge className="text-[10px] px-1.5 py-0">{saved.length}</Badge>
              )}
            </button>
          </div>

          {activeTab === 'analyze' ? (
            output ? (
              <Card>
                <CardHeader className="pb-3 pt-4 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" />
                      {streaming ? 'Analizando...' : `@${username.replace('@', '')} · ${platform}`}
                    </CardTitle>
                    {streaming && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs text-muted-foreground">Claude está analizando</span>
                      </div>
                    )}
                  </div>
                  {!streaming && (
                    <Button variant="outline" size="sm" onClick={handleSave} className="gap-1.5 text-xs flex-shrink-0">
                      <Plus className="w-3.5 h-3.5" /> Guardar
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center h-[480px] border border-dashed border-border rounded-xl text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Eye className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-base mb-2">Analiza cualquier referente</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Escribe el username de un creador que admiras y Claude analiza su estrategia de contenido para encontrar qué puedes adaptar a tu marca.
                </p>
              </div>
            )
          ) : (
            <div className="space-y-3">
              {saved.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border rounded-xl text-center p-6">
                  <Eye className="w-8 h-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Los referentes guardados aparecerán aquí</p>
                </div>
              ) : (
                saved.map((item, i) => (
                  <Card key={i} className="hover:border-border/80 transition-colors">
                    <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium">@{item.username}</p>
                          <Badge variant="outline" className="text-[10px]">{item.platform}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{item.date}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setUsername(item.username)
                            setPlatform(item.platform)
                            setOutput(item.result)
                            setActiveTab('analyze')
                          }}
                          className="text-xs text-primary underline underline-offset-2 hover:opacity-80"
                        >
                          Ver análisis
                        </button>
                        <button onClick={() => setSaved(prev => prev.filter((_, j) => j !== i))}>
                          <X className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
