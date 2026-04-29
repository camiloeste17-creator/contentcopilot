'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBrandStore } from '@/store/brand'
import { useInstagramToken } from '@/hooks/useInstagramToken'
import { Zap, Sparkles, RefreshCw, AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react'

interface RecommendationBlock {
  priority: 'URGENTE' | 'IMPORTANTE' | 'OPORTUNIDAD'
  title: string
  dato: string
  accion: string
}

const PRIORITY_STYLES = {
  URGENTE: 'border-red-500/30 bg-red-500/5 text-red-400',
  IMPORTANTE: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
  OPORTUNIDAD: 'border-green-500/30 bg-green-500/5 text-green-400',
}

const PRIORITY_ICONS = {
  URGENTE: AlertTriangle,
  IMPORTANTE: TrendingUp,
  OPORTUNIDAD: Lightbulb,
}

function parseRecommendations(text: string): RecommendationBlock[] {
  const blocks = text.split(/\n---\n/).filter(b => b.includes('**['))
  return blocks.map(block => {
    const titleMatch = block.match(/\*\*\[(URGENTE|IMPORTANTE|OPORTUNIDAD)\]\*\*\s+(.+)/i)
    const datoMatch = block.match(/\*\*Dato:\*\*\s*(.+)/i)
    const accionMatch = block.match(/\*\*Acción:\*\*\s*([\s\S]+?)(?=\n---|$)/i)

    return {
      priority: (titleMatch?.[1]?.toUpperCase() ?? 'IMPORTANTE') as RecommendationBlock['priority'],
      title: titleMatch?.[2]?.trim() ?? 'Recomendación',
      dato: datoMatch?.[1]?.trim() ?? '',
      accion: accionMatch?.[1]?.trim() ?? '',
    }
  }).filter(r => r.title !== 'Recomendación' || r.dato || r.accion)
}

export default function InsightsPage() {
  const brand = useBrandStore((s) => s.brand)
  const { token: igToken, loading: tokenLoading } = useInstagramToken()
  const [streaming, setStreaming] = useState(false)
  const [output, setOutput] = useState('')
  const [recs, setRecs] = useState<RecommendationBlock[]>([])
  const [igData, setIgData] = useState<null | object>(null)
  const [loadingIG, setLoadingIG] = useState(true)
  const abortRef = useRef<AbortController | null>(null)

  const loadIG = useCallback(async (token: string) => {
    try {
      const headers = { 'X-Instagram-Token': token }
        const [profileRes, mediaRes] = await Promise.all([
          fetch('/api/instagram/profile', { headers }),
          fetch('/api/instagram/media', { headers }),
        ])
        const profile = await profileRes.json()
        const media = await mediaRes.json()
        if (!profile.error && !media.error) {
          setIgData({
            followers: profile.followers_count,
            mediaCount: profile.media_count,
            recentMedia: (media.data ?? []).map((m: {
              caption?: string
              like_count?: number
              comments_count?: number
              insights?: { plays?: number; views?: number; saved?: number; shares?: number }
              media_type?: string
              timestamp?: string
            }) => ({
              caption: m.caption,
              likes: m.like_count ?? 0,
              comments: m.comments_count ?? 0,
              views: m.insights?.plays ?? m.insights?.views ?? 0,
              saves: m.insights?.saved ?? 0,
              type: m.media_type ?? 'POST',
              date: m.timestamp ? new Date(m.timestamp).toLocaleDateString('es', { day: 'numeric', month: 'short' }) : '',
            })),
          })
        }
    } catch { /* no IG */ }
    finally { setLoadingIG(false) }
  }, [])

  useEffect(() => {
    if (tokenLoading) return
    if (igToken) loadIG(igToken)
    else setLoadingIG(false)
  }, [igToken, tokenLoading, loadIG])

  async function handleGenerate() {
    if (streaming) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStreaming(true)
    setOutput('')
    setRecs([])

    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, igData }),
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
        const parsed = parseRecommendations(accumulated)
        if (parsed.length > 0) setRecs(parsed)
      }

      setRecs(parseRecommendations(accumulated))
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') console.error(err)
    } finally {
      setStreaming(false)
    }
  }

  const hasData = !!igData || !!brand?.niche

  return (
    <div>
      <Topbar
        title="Insights Inteligentes"
        subtitle="Recomendaciones estratégicas basadas en tus datos reales"
      />

      <div className="p-6 max-w-3xl space-y-6">
        {/* Context status */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={brand?.niche
              ? 'border-green-500/30 text-green-400'
              : 'border-border text-muted-foreground'}
          >
            {brand?.niche ? '✓ Brand Canvas' : '○ Sin Brand Canvas'}
          </Badge>
          <Badge
            variant="outline"
            className={igData
              ? 'border-green-500/30 text-green-400'
              : 'border-border text-muted-foreground'}
          >
            {loadingIG ? 'Cargando Instagram...' : igData ? '✓ Instagram conectado' : '○ Sin datos de Instagram'}
          </Badge>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={streaming || loadingIG || !hasData}
          className="gap-2"
          size="lg"
        >
          {streaming ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Generando recomendaciones...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generar recomendaciones</>
          )}
        </Button>

        {/* Results */}
        {(recs.length > 0 || (streaming && output)) ? (
          <div className="space-y-4">
            {recs.length > 0 ? (
              recs.map((rec, i) => {
                const Icon = PRIORITY_ICONS[rec.priority] ?? Zap
                const style = PRIORITY_STYLES[rec.priority] ?? PRIORITY_STYLES.IMPORTANTE
                return (
                  <Card key={i} className={`border ${style.split(' ')[0]}`}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${style.split(' ').slice(1).join(' ')}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline" className={`text-[10px] ${style.split(' ')[0]} ${style.split(' ')[2]}`}>
                              {rec.priority}
                            </Badge>
                            <p className="text-sm font-semibold">{rec.title}</p>
                          </div>
                          {rec.dato && (
                            <p className="text-xs text-muted-foreground mb-2">
                              <span className="font-medium text-foreground">Dato: </span>{rec.dato}
                            </p>
                          )}
                          {rec.accion && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              <span className="font-medium text-foreground">Acción: </span>{rec.accion}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs text-muted-foreground">Generando recomendaciones...</span>
                  </div>
                  <pre className="text-xs text-muted-foreground/60 whitespace-pre-wrap font-mono leading-relaxed max-h-40 overflow-hidden">
                    {output.slice(-400)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {streaming && recs.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Generando más recomendaciones...
              </div>
            )}
          </div>
        ) : !streaming ? (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-xl text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-base mb-2">Recomendaciones estratégicas</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {!hasData
                ? 'Configura tu Brand Canvas o conecta Instagram para recibir recomendaciones personalizadas.'
                : 'Haz clic en "Generar recomendaciones" para recibir insights basados en tus datos reales.'}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
