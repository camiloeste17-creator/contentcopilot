'use client'

import { useState, useRef } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBrandStore } from '@/store/brand'
import { Sparkles, RefreshCw, Plus, Trash2, TrendingDown, Info } from 'lucide-react'

interface RetentionPoint {
  second: number
  pct: number
}

function NumInput({ label, value, onChange, placeholder, unit }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  unit?: string
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
      <div className="relative flex items-center">
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? '0'}
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-secondary focus:outline-none focus:border-primary transition-colors pr-10"
        />
        {unit && <span className="absolute right-3 text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  )
}

function renderMarkdown(text: string) {
  return text
    .replace(/^## (.+)$/gm, '<h2 class="font-semibold text-sm text-primary mt-5 mb-2">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>')
    .replace(/^---$/gm, '<hr class="my-3 border-border">')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-muted-foreground my-0.5 text-sm">$1</li>')
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/^(?!<[h2pli]|<hr)(.+)$/gm, '<p class="text-sm text-muted-foreground">$1</p>')
}

export default function RetentionPage() {
  const brand = useBrandStore(s => s.brand)

  const [caption, setCaption] = useState('')
  const [plays, setPlays] = useState('')
  const [reach, setReach] = useState('')
  const [likes, setLikes] = useState('')
  const [comments, setComments] = useState('')
  const [saves, setSaves] = useState('')
  const [shares, setShares] = useState('')
  const [duration, setDuration] = useState('')
  const [avgWatch, setAvgWatch] = useState('')
  const [retentionPoints, setRetentionPoints] = useState<RetentionPoint[]>([
    { second: 1, pct: 100 },
    { second: 3, pct: 0 },
    { second: 5, pct: 0 },
    { second: 10, pct: 0 },
    { second: 15, pct: 0 },
    { second: 30, pct: 0 },
  ])

  const [streaming, setStreaming] = useState(false)
  const [output, setOutput] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  function updatePoint(i: number, field: 'second' | 'pct', val: string) {
    setRetentionPoints(prev => prev.map((p, idx) =>
      idx === i ? { ...p, [field]: Number(val) } : p
    ))
  }

  function addPoint() {
    setRetentionPoints(prev => [...prev, { second: 0, pct: 0 }])
  }

  function removePoint(i: number) {
    setRetentionPoints(prev => prev.filter((_, idx) => idx !== i))
  }

  const hasRetentionData = retentionPoints.some(p => p.second > 0 && p.pct > 0)
  const dropPoint = retentionPoints.reduce<RetentionPoint | null>((maxDrop, p, i, arr) => {
    if (i === 0) return null
    const prev = arr[i - 1]
    const drop = prev.pct - p.pct
    return drop > (maxDrop ? prev.pct - arr[retentionPoints.indexOf(maxDrop)].pct : 0)
      ? p : maxDrop
  }, null)

  async function handleAnalyze() {
    if (streaming) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStreaming(true)
    setOutput('')

    const videoData = {
      caption,
      plays: Number(plays) || undefined,
      reach: Number(reach) || undefined,
      likes: Number(likes) || undefined,
      comments: Number(comments) || undefined,
      saves: Number(saves) || undefined,
      shares: Number(shares) || undefined,
      duration: Number(duration) || undefined,
      avgWatchTime: Number(avgWatch) || undefined,
      retentionPoints: hasRetentionData ? retentionPoints.filter(p => p.second > 0) : undefined,
      dropSecond: dropPoint?.second,
    }

    try {
      const res = await fetch('/api/videos/retention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoData, brand }),
        signal: controller.signal,
      })
      if (!res.ok || !res.body) { setStreaming(false); return }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setOutput(acc)
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') console.error(err)
    } finally {
      setStreaming(false)
    }
  }

  const retentionAvg = hasRetentionData && retentionPoints.length > 1
    ? Math.round(retentionPoints.slice(1).reduce((s, p) => s + p.pct, 0) / (retentionPoints.length - 1))
    : null

  return (
    <div>
      <Topbar
        title="Análisis de Retención"
        subtitle="Ingresa los datos de tu video desde Instagram Insights"
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* LEFT: inputs */}
        <div className="space-y-4 lg:sticky lg:top-20">

          {/* Info banner */}
          <div className="flex items-start gap-2.5 bg-blue-500/8 border border-blue-500/20 rounded-xl p-3.5">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Instagram no expone reproducciones ni retención via API para cuentas Creator.
              Ingresa los datos manualmente desde la app: <strong className="text-foreground">Instagram → tu video → Ver estadísticas</strong>.
            </p>
          </div>

          {/* Métricas principales */}
          <Card>
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-sm">Métricas del video</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Caption (opcional)</label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Pega el caption de tu video..."
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-secondary focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumInput label="Reproducciones" value={plays} onChange={setPlays} placeholder="ej: 1200" />
                <NumInput label="Alcance" value={reach} onChange={setReach} placeholder="ej: 800" />
                <NumInput label="Likes" value={likes} onChange={setLikes} placeholder="ej: 45" />
                <NumInput label="Comentarios" value={comments} onChange={setComments} placeholder="ej: 12" />
                <NumInput label="Guardados" value={saves} onChange={setSaves} placeholder="ej: 20" />
                <NumInput label="Compartidos" value={shares} onChange={setShares} placeholder="ej: 5" />
                <NumInput label="Duración" value={duration} onChange={setDuration} placeholder="ej: 45" unit="s" />
                <NumInput label="Tiempo promedio" value={avgWatch} onChange={setAvgWatch} placeholder="ej: 18" unit="s" />
              </div>
            </CardContent>
          </Card>

          {/* Curva de retención */}
          <Card>
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-primary" />
                Curva de retención
              </CardTitle>
              <CardDescription className="text-xs">
                En la app ve al video → Ver estadísticas → Retención de la audiencia.
                Ingresa el % en cada segundo clave.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4 space-y-2">
              {/* Header */}
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Segundo</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">% viendo</span>
                <span className="w-6" />
              </div>

              {retentionPoints.map((p, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <input
                    type="number"
                    value={p.second || ''}
                    onChange={e => updatePoint(i, 'second', e.target.value)}
                    placeholder="seg"
                    className="px-2.5 py-2 text-sm rounded-lg border border-border bg-secondary focus:outline-none focus:border-primary transition-colors"
                  />
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      value={p.pct || ''}
                      onChange={e => updatePoint(i, 'pct', e.target.value)}
                      min={0} max={100}
                      placeholder="%"
                      className="w-full px-2.5 py-2 text-sm rounded-lg border border-border bg-secondary focus:outline-none focus:border-primary transition-colors pr-6"
                    />
                    <span className="absolute right-2 text-xs text-muted-foreground">%</span>
                  </div>
                  <button onClick={() => removePoint(i)} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <button
                onClick={addPoint}
                className="flex items-center gap-1.5 text-xs text-primary hover:opacity-80 transition-opacity mt-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar punto
              </button>

              {/* Mini preview */}
              {hasRetentionData && retentionAvg !== null && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Retención promedio</span>
                    <span className={`font-semibold ${retentionAvg >= 50 ? 'text-green-400' : retentionAvg >= 30 ? 'text-amber-400' : 'text-red-400'}`}>
                      {retentionAvg}%
                    </span>
                  </div>
                  {/* Visual bar */}
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${retentionAvg >= 50 ? 'bg-green-500' : retentionAvg >= 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${retentionAvg}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={handleAnalyze}
            className="w-full gap-2"
            size="lg"
            disabled={streaming || (!plays && !reach && !likes)}
          >
            {streaming
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analizando...</>
              : <><Sparkles className="w-4 h-4" /> Analizar video</>}
          </Button>
        </div>

        {/* RIGHT: output */}
        <div>
          {output ? (
            <Card>
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-base">Análisis del video</CardTitle>
                {streaming && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs text-muted-foreground">Generando análisis...</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div
                  className="leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] border border-dashed border-border rounded-xl text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <TrendingDown className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-base mb-2">Análisis profundo de retención</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                Ingresa las métricas de tu video desde Instagram Insights y la IA te dice qué funcionó, dónde perdiste audiencia y cómo mejorar el próximo.
              </p>
              <div className="text-left bg-secondary rounded-xl p-4 text-xs text-muted-foreground space-y-1.5 max-w-sm w-full">
                <p className="font-medium text-foreground mb-2">Dónde encontrar los datos en Instagram:</p>
                <p>1. Ve al video en tu perfil</p>
                <p>2. Toca los 3 puntos → <strong className="text-foreground">Ver estadísticas</strong></p>
                <p>3. Busca: Reproducciones, Alcance, Likes, Guardados</p>
                <p>4. Desplázate hasta <strong className="text-foreground">Retención de la audiencia</strong></p>
                <p>5. Ingresa el % en cada punto clave del video</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
