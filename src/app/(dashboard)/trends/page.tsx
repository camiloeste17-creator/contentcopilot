'use client'

import { useState, useRef } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useBrandStore } from '@/store/brand'
import { TrendingUp, Sparkles, RefreshCw, Plus, X, Clock } from 'lucide-react'

const EXAMPLE_TRENDS = [
  'POV: eres [profesión] y tu cliente te dice...',
  'Cosas que nadie te dice sobre [tema]',
  'Un día en mi vida como [profesión]',
  'Lo que aprendí después de [X tiempo/experiencia]',
  'Antes vs Después: mi estrategia de contenido',
  'Red flag vs Green flag en [tu industria]',
  'Me preguntaron si [mito]... la respuesta te va a sorprender',
  'El error que me costó [consecuencia] y cómo lo evité',
]

interface SavedTrend {
  trend: string
  result: string
  date: string
}

function renderMarkdown(text: string) {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="font-semibold text-sm mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-semibold text-sm text-primary mt-5 mb-2 uppercase tracking-wide">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>')
    .replace(/^---$/gm, '<hr class="my-3 border-border">')
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/^(?!<[h23p]|<hr)(.+)$/gm, '<p>$1</p>')
}

export default function TrendsPage() {
  const brand = useBrandStore((s) => s.brand)
  const [trend, setTrend] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [output, setOutput] = useState('')
  const [saved, setSaved] = useState<SavedTrend[]>([])
  const [activeTab, setActiveTab] = useState<'analyze' | 'saved'>('analyze')
  const abortRef = useRef<AbortController | null>(null)

  async function handleAnalyze() {
    if (!trend.trim() || streaming) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStreaming(true)
    setOutput('')

    try {
      const res = await fetch('/api/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trend, brand }),
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
    if (!output || !trend) return
    setSaved(prev => [{
      trend,
      result: output,
      date: new Date().toLocaleDateString('es', { day: 'numeric', month: 'short' }),
    }, ...prev])
  }

  return (
    <div>
      <Topbar title="Tendencias" subtitle="Analiza si una tendencia encaja con tu marca antes de hacerla" />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
        {/* LEFT */}
        <div className="space-y-4 lg:sticky lg:top-20">
          <Card>
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-sm">Describe la tendencia</CardTitle>
              <CardDescription className="text-xs">
                Escribe o pega el formato viral que viste, el audio, el meme o el tipo de video que está creciendo.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4 space-y-3">
              <Textarea
                rows={4}
                placeholder='Ej: "POV: eres coach y tu cliente te dice que no tiene presupuesto..." o "el trend de mostrar un día en la vida de..."'
                value={trend}
                onChange={e => setTrend(e.target.value)}
                className="text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Tendencias populares</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 space-y-1.5">
              {EXAMPLE_TRENDS.map((t, i) => (
                <button
                  key={i}
                  onClick={() => { setTrend(t); setOutput('') }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors flex items-start gap-2"
                >
                  <TrendingUp className="w-3 h-3 flex-shrink-0 mt-0.5 text-primary/60" />
                  {t}
                </button>
              ))}
            </CardContent>
          </Card>

          <Button
            onClick={handleAnalyze}
            disabled={!trend.trim() || streaming}
            className="w-full gap-2"
            size="lg"
          >
            {streaming ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Analizando...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Analizar tendencia</>
            )}
          </Button>
        </div>

        {/* RIGHT */}
        <div>
          {/* Tabs */}
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
              Guardadas {saved.length > 0 && <Badge className="text-[10px] px-1.5 py-0">{saved.length}</Badge>}
            </button>
          </div>

          {activeTab === 'analyze' ? (
            output ? (
              <Card>
                <CardHeader className="pb-3 pt-4 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      {streaming ? 'Analizando tendencia...' : 'Análisis completo'}
                    </CardTitle>
                    {!streaming && (
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-xs">"{trend}"</p>
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
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-base mb-2">¿Esa tendencia sirve para tu marca?</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Antes de subirte a cualquier trend, la IA evalúa si encaja con tu posicionamiento y genera 3 formas de adaptarla.
                </p>
              </div>
            )
          ) : (
            <div className="space-y-3">
              {saved.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border rounded-xl text-center p-6">
                  <Clock className="w-8 h-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Las tendencias analizadas aparecerán aquí cuando las guardes
                  </p>
                </div>
              ) : (
                saved.map((item, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2 pt-3 flex flex-row items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">"{item.trend}"</p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                      <button
                        onClick={() => setSaved(prev => prev.filter((_, j) => j !== i))}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div
                        className="text-xs text-muted-foreground leading-relaxed line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(item.result.slice(0, 300)) }}
                      />
                      <button
                        onClick={() => { setTrend(item.trend); setOutput(item.result); setActiveTab('analyze') }}
                        className="text-xs text-primary underline underline-offset-2 mt-2 hover:opacity-80"
                      >
                        Ver análisis completo →
                      </button>
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
