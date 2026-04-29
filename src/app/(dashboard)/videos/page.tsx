'use client'

import { useEffect, useState, useRef } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBrandStore } from '@/store/brand'
import {
  Video, Eye, Heart, MessageSquare, Bookmark, Share2,
  Sparkles, RefreshCw, ExternalLink, TrendingUp, ChevronDown, ChevronUp, TrendingDown,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface VideoInsights {
  reach?: number
  impressions?: number
  plays?: number
  views?: number
  saved?: number
  shares?: number
  total_interactions?: number
  ig_reels_avg_watch_time?: number
  ig_reels_video_view_total_time?: number
  estimated_plays?: number
}

interface VideoItem {
  id: string
  caption?: string
  media_type: string
  thumbnail_url?: string
  media_url?: string
  timestamp: string
  permalink: string
  like_count?: number
  comments_count?: number
  insights?: VideoInsights
}

function fmt(n?: number) {
  if (!n) return '0'
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

function rate(num?: number, den?: number, digits = 1) {
  if (!num || !den) return '0%'
  return `${((num / den) * 100).toFixed(digits)}%`
}

function MetricBadge({ icon: Icon, value, label, highlight, zero }: {
  icon: React.ElementType; value: string; label: string; highlight?: boolean; zero?: boolean
}) {
  if (zero) return null
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${highlight ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="text-xs font-semibold">{value}</span>
      <span className="text-[10px]">{label}</span>
    </div>
  )
}

function renderMarkdown(text: string) {
  return text
    .replace(/^## (.+)$/gm, '<h2 class="font-semibold text-sm text-primary mt-4 mb-1.5 flex items-center gap-1.5">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/^---$/gm, '<hr class="my-3 border-border">')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-muted-foreground my-0.5">$1</li>')
    .replace(/\n\n/g, '</p><p class="mt-2 text-sm text-muted-foreground">')
    .replace(/^(?!<[h2pli]|<hr)(.+)$/gm, '<p class="text-sm text-muted-foreground">$1</p>')
}

function VideoCard({ video, brand }: { video: VideoItem; brand: import('@/types').BrandProfile | null }) {
  const [expanded, setExpanded] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const plays = video.insights?.views ?? video.insights?.plays ?? video.insights?.estimated_plays ?? 0
  const reach = video.insights?.reach ?? 0
  const saves = video.insights?.saved ?? 0
  const shares = video.insights?.shares ?? 0
  const totalInteractions = video.insights?.total_interactions ?? 0
  const likes = video.like_count ?? 0
  const comments = video.comments_count ?? 0
  const avgWatchMs = video.insights?.ig_reels_avg_watch_time ?? 0
  const avgWatchSec = avgWatchMs > 0 ? (avgWatchMs / 1000).toFixed(1) : null
  const isEstimated = !video.insights?.views && !video.insights?.plays && !!video.insights?.estimated_plays
  // Best denominator for rates
  const base = plays > 0 ? plays : reach
  const engRate = base > 0 ? ((likes + comments + saves + shares) / base * 100).toFixed(1) : '0'
  const saveRate = base > 0 ? ((saves / base) * 100).toFixed(1) : '0'
  const isHighSave = parseFloat(saveRate) >= 1
  const isHighEng = parseFloat(engRate) >= 3
  const date = format(new Date(video.timestamp), "d MMM yyyy", { locale: es })

  async function handleAnalyze() {
    if (analyzing) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setAnalyzing(true)
    setAnalysis('')
    setExpanded(true)

    try {
      const res = await fetch('/api/videos/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video, brand }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) { setAnalyzing(false); return }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setAnalysis(acc)
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') console.error(err)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Video header */}
        <div className="flex gap-4 p-4">
          {/* Thumbnail */}
          <div className="w-20 h-20 rounded-lg bg-secondary flex-shrink-0 overflow-hidden relative">
            {(video.thumbnail_url || video.media_url) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={video.thumbnail_url ?? video.media_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="w-6 h-6 text-muted-foreground/40" />
              </div>
            )}
            <div className="absolute bottom-1 right-1 bg-black/70 rounded px-1 py-0.5">
              <Video className="w-2.5 h-2.5 text-white" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-xs text-muted-foreground">{date}</p>
              <a href={video.permalink} target="_blank" rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-snug mb-3">
              {video.caption?.slice(0, 100) ?? 'Sin caption'}
            </p>

            {/* Metrics */}
            <div className="flex flex-wrap gap-1.5">
              {/* Plays / Reproducciones — siempre primero */}
              {plays > 0 && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary`}>
                  <Eye className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs font-semibold">{fmt(plays)}</span>
                  <span className="text-[10px]">{isEstimated ? 'reproduc. ~' : 'reproduc.'}</span>
                </div>
              )}
              <MetricBadge icon={Eye} value={fmt(reach)} label="alcance" zero={reach === 0} />
              <MetricBadge icon={Heart} value={fmt(likes)} label="likes" zero={likes === 0} />
              <MetricBadge icon={MessageSquare} value={String(comments)} label="coment." zero={comments === 0} />
              <MetricBadge icon={Bookmark} value={String(saves)} label="guardados" highlight={isHighSave} zero={saves === 0} />
              <MetricBadge icon={Share2} value={String(shares)} label="compart." zero={shares === 0} />
              {avgWatchSec && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary text-muted-foreground">
                  <TrendingDown className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs font-semibold">{avgWatchSec}s</span>
                  <span className="text-[10px]">prom. visto</span>
                </div>
              )}
              <MetricBadge icon={TrendingUp} value={`${engRate}%`} label="eng." highlight={isHighEng} zero={base === 0} />
            </div>
          </div>
        </div>

        {/* Analyze button */}
        <div className="px-4 pb-4 flex items-center gap-2">
          <Button
            size="sm"
            variant={analysis ? 'outline' : 'default'}
            className="gap-1.5 text-xs"
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing
              ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analizando...</>
              : analysis
                ? <><RefreshCw className="w-3.5 h-3.5" /> Re-analizar</>
                : <><Sparkles className="w-3.5 h-3.5" /> Analizar con IA</>}
          </Button>

          {analysis && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Ocultar</> : <><ChevronDown className="w-3.5 h-3.5" /> Ver análisis</>}
            </button>
          )}
        </div>

        {/* Analysis output */}
        {expanded && analysis && (
          <div className="border-t border-border px-4 py-4">
            {analyzing && (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-muted-foreground">Analizando métricas...</span>
              </div>
            )}
            <div
              className="text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(analysis) }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function VideosPage() {
  const brand = useBrandStore((s) => s.brand)
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadVideos() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/videos')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setVideos(data.data ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar videos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadVideos() }, [])

  const getPlays = (v: VideoItem) =>
    v.insights?.views ?? v.insights?.plays ?? v.insights?.estimated_plays ?? 0
  const totalPlays = videos.reduce((s, v) => s + getPlays(v), 0)
  const avgPlays = videos.length ? Math.round(totalPlays / videos.length) : 0
  const totalReach = videos.reduce((s, v) => s + (v.insights?.reach ?? 0), 0)
  const hasEstimated = videos.some(v => v.insights?.estimated_plays && !v.insights?.views && !v.insights?.plays)
  const topVideo = videos.reduce<VideoItem | null>((top, v) => {
    return getPlays(v) > getPlays(top ?? { insights: {} } as VideoItem) ? v : top
  }, null)

  return (
    <div>
      <Topbar title="Análisis de Videos" subtitle="Entiende qué funciona en cada reel y cómo mejorarlo" />

      <div className="p-6 space-y-6">
        {/* Summary stats */}
        {!loading && videos.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground mb-1">Videos/Reels</p>
                <p className="text-2xl font-bold">{videos.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Reproduc. promedio {hasEstimated && <span className="text-[10px]">(~)</span>}
                </p>
                <p className="text-2xl font-bold">{fmt(avgPlays)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground mb-1">Total reproducciones</p>
                <p className="text-2xl font-bold">{fmt(totalPlays)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground mb-1">Video más visto</p>
                <p className="text-sm font-semibold">
                  {topVideo ? fmt(getPlays(topVideo)) + ' reproduc.' : '—'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive/30">
            <CardContent className="pt-4 pb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button size="sm" variant="outline" onClick={loadVideos} className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Videos list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {loading ? 'Cargando...' : `${videos.length} videos encontrados`}
            </h2>
            <div className="flex items-center gap-2">
              <Link href="/videos/retention">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <TrendingDown className="w-3.5 h-3.5" /> Análisis de retención
                </Button>
              </Link>
              {!loading && (
                <Button variant="ghost" size="sm" onClick={loadVideos} className="gap-1.5 text-xs">
                  <RefreshCw className="w-3.5 h-3.5" /> Actualizar
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-secondary rounded-lg animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3 bg-secondary rounded animate-pulse w-1/4" />
                        <div className="h-3 bg-secondary rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-secondary rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : videos.length === 0 && !error ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Video className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No se encontraron videos publicados</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {videos.map(v => (
                <VideoCard key={v.id} video={v} brand={brand} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
