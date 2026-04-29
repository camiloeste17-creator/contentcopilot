'use client'

import { useEffect, useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useBrandStore } from '@/store/brand'
import {
  TrendingUp, Video, Users, Eye, Zap, AlertTriangle,
  CheckCircle2, ArrowRight, Lightbulb, Heart, MessageSquare,
  RefreshCw, ExternalLink, Link2,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useInstagramToken } from '@/hooks/useInstagramToken'

interface IGProfile {
  username: string
  followers_count: number
  media_count: number
  biography: string
  profile_picture_url?: string
}

interface IGMediaItem {
  id: string
  caption?: string
  media_type: string
  thumbnail_url?: string
  media_url?: string
  timestamp: string
  permalink: string
  like_count?: number
  comments_count?: number
  insights?: {
    reach?: number
    impressions?: number
    plays?: number
    views?: number
    saved?: number
    shares?: number
    total_interactions?: number
  }
}

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
  sub?: string
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString('es') : value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function MediaCard({ item }: { item: IGMediaItem }) {
  const views = item.insights?.plays ?? item.insights?.views ?? 0
  const reach = item.insights?.reach ?? 0
  const saves = item.insights?.saved ?? 0
  const date = format(new Date(item.timestamp), "d MMM", { locale: es })

  return (
    <Card className="hover:border-border/80 transition-colors">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="w-14 h-14 rounded-lg bg-secondary flex-shrink-0 overflow-hidden">
            {(item.thumbnail_url || item.media_url) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.thumbnail_url ?? item.media_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="w-5 h-5 text-muted-foreground/40" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">{date}</p>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
              {item.caption?.slice(0, 80) ?? 'Sin caption'}
            </p>
            <div className="flex items-center gap-3 mt-2">
              {views > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-3 h-3" /> {views.toLocaleString('es')}
                </span>
              )}
              {item.like_count !== undefined && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Heart className="w-3 h-3" /> {item.like_count.toLocaleString('es')}
                </span>
              )}
              {item.comments_count !== undefined && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="w-3 h-3" /> {item.comments_count}
                </span>
              )}
              {saves > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Zap className="w-3 h-3" /> {saves} guardados
                </span>
              )}
              <a
                href={item.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const brand = useBrandStore((s) => s.brand)
  const { token: igToken, loading: tokenLoading } = useInstagramToken()
  const [profile, setProfile] = useState<IGProfile | null>(null)
  const [media, setMedia] = useState<IGMediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchData(token: string) {
    setLoading(true)
    setError(null)
    try {
      const headers = { 'X-Instagram-Token': token }
      const [profileRes, mediaRes] = await Promise.all([
        fetch('/api/instagram/profile', { headers }),
        fetch('/api/instagram/media', { headers }),
      ])
      const profileData = await profileRes.json()
      const mediaData = await mediaRes.json()

      if (profileData.error) throw new Error(profileData.error)
      if (mediaData.error) throw new Error(mediaData.error)

      setProfile(profileData)
      setMedia(mediaData.data ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tokenLoading) return
    if (igToken) fetchData(igToken)
    else setLoading(false)
  }, [igToken, tokenLoading])

  const hasBrand = !!brand?.niche
  const reels = media.filter(m => m.media_type === 'VIDEO' || m.media_type === 'REELS')
  const avgViews = reels.length
    ? Math.round(reels.reduce((s, r) => s + (r.insights?.plays ?? r.insights?.views ?? 0), 0) / reels.length)
    : 0
  const totalLikes = media.reduce((s, m) => s + (m.like_count ?? 0), 0)
  const totalComments = media.reduce((s, m) => s + (m.comments_count ?? 0), 0)

  return (
    <div>
      <Topbar
        title="Dashboard"
        subtitle={profile ? `@${profile.username}` : 'Tu resumen estratégico'}
      />

      <div className="p-6 space-y-6">
        {/* Instagram connection banner */}
        {!tokenLoading && !igToken && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm mb-1">Conecta tu Instagram</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Vincula tu cuenta para ver tus métricas, reels y análisis de audiencia.
                  </p>
                  <Link href="/onboarding">
                    <Button size="sm" className="gap-2">
                      <Link2 className="w-3.5 h-3.5" /> Conectar Instagram
                    </Button>
                  </Link>
                </div>
                <Link2 className="w-8 h-8 text-amber-400/40 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Brand setup banner */}
        {!hasBrand && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm mb-1">Configura tu Brand Canvas</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    La IA necesita conocer tu marca para generar ideas alineadas a tu estilo y audiencia.
                  </p>
                  <Link href="/brand">
                    <Button size="sm" className="gap-2">
                      Configurar mi marca <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
                <Zap className="w-8 h-8 text-primary/40 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instagram error */}
        {error && (
          <Alert className="border-destructive/30 bg-destructive/5">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <AlertDescription className="text-sm flex items-center justify-between">
              <span>Error al conectar con Instagram: {error.slice(0, 120)}</span>
              <Button variant="ghost" size="sm" onClick={() => igToken && fetchData(igToken)} className="gap-1.5 ml-4 flex-shrink-0">
                <RefreshCw className="w-3.5 h-3.5" /> Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* KPIs */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-5 pb-4">
                  <div className="h-4 bg-secondary rounded animate-pulse mb-3 w-2/3" />
                  <div className="h-8 bg-secondary rounded animate-pulse w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Seguidores"
              value={profile?.followers_count ?? '—'}
              icon={Users}
              color="bg-blue-500/10 text-blue-400"
              sub="Instagram"
            />
            <StatCard
              label="Vistas promedio"
              value={avgViews || '—'}
              icon={Eye}
              color="bg-violet-500/10 text-violet-400"
              sub={`${reels.length} reels analizados`}
            />
            <StatCard
              label="Likes totales"
              value={totalLikes || '—'}
              icon={Heart}
              color="bg-pink-500/10 text-pink-400"
              sub="Últimos 20 posts"
            />
            <StatCard
              label="Comentarios"
              value={totalComments || '—'}
              icon={MessageSquare}
              color="bg-amber-500/10 text-amber-400"
              sub="Últimos 20 posts"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent media */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Contenido reciente
              </h2>
              {!loading && (
                <Button variant="ghost" size="sm" onClick={() => igToken && fetchData(igToken)} className="gap-1.5 text-xs">
                  <RefreshCw className="w-3.5 h-3.5" /> Actualizar
                </Button>
              )}
            </div>

            {loading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-14 h-14 bg-secondary rounded-lg animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-secondary rounded animate-pulse w-1/4" />
                        <div className="h-3 bg-secondary rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-secondary rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : media.length > 0 ? (
              media.slice(0, 8).map(item => <MediaCard key={item.id} item={item} />)
            ) : !error ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <Video className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No se encontró contenido publicado</p>
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Profile card */}
            {profile && (
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {profile.username?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">@{profile.username}</p>
                      <p className="text-xs text-muted-foreground">{profile.media_count} publicaciones</p>
                    </div>
                  </div>
                  {profile.biography && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{profile.biography}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick actions */}
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Acciones rápidas</CardTitle>
              </CardHeader>
              <CardContent className="pb-4 space-y-1">
                {[
                  { href: '/ideas', icon: Lightbulb, label: 'Generar ideas' },
                  { href: '/audience', icon: MessageSquare, label: 'Analizar audiencia' },
                  { href: '/brand', icon: Zap, label: hasBrand ? 'Editar Brand Canvas' : 'Configurar marca' },
                  { href: '/copy', icon: TrendingUp, label: 'Crear un caption' },
                ].map(({ href, icon: Icon, label }) => (
                  <Link key={href} href={href} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent transition-colors group">
                    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium">{label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Status */}
            {hasBrand && (
              <Alert className="border-green-500/30 bg-green-500/5">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <AlertDescription className="text-xs text-muted-foreground">
                  Brand Canvas configurado. <Link href="/ideas" className="text-primary underline underline-offset-2">Generar ideas →</Link>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
