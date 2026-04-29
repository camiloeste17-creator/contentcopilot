'use client'

import { useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ChevronDown, ChevronUp, ExternalLink, Info, CheckCircle2, Key,
} from 'lucide-react'

interface Integration {
  name: string
  platform: string
  status: 'available' | 'coming_soon'
  desc: string
  steps: string[]
  devUrl: string
  devLabel: string
  notes?: string
}

const INTEGRATIONS: Integration[] = [
  {
    name: 'Instagram & Facebook',
    platform: 'meta',
    status: 'available',
    desc: 'Métricas de reels, alcance, engagement y comentarios',
    devUrl: 'https://developers.facebook.com',
    devLabel: 'Meta for Developers',
    steps: [
      'Crea una app en developers.facebook.com',
      'Agrega el producto "Instagram Graph API"',
      'Solicita los permisos: instagram_basic, instagram_manage_insights, pages_read_engagement',
      'Conecta tu cuenta Business o Creator en la app',
      'Copia el Access Token y agrégalo en .env.local',
    ],
    notes: 'Requiere cuenta Business o Creator en Instagram. Puede tardar 1-3 días en ser aprobada.',
  },
  {
    name: 'TikTok',
    platform: 'tiktok',
    status: 'available',
    desc: 'Retención por segundo, vistas, shares y comentarios',
    devUrl: 'https://developers.tiktok.com',
    devLabel: 'TikTok for Developers',
    steps: [
      'Crea una cuenta en developers.tiktok.com',
      'Crea una nueva app y selecciona "Content API" y "Research API"',
      'Solicita acceso a las métricas de video (puede tomar días)',
      'Una vez aprobada, copia el Client Key y Client Secret',
      'Agrégalos en .env.local como TIKTOK_CLIENT_KEY y TIKTOK_CLIENT_SECRET',
    ],
    notes: 'TikTok requiere revisión manual de la app. Puede tomar hasta 7 días hábiles.',
  },
  {
    name: 'YouTube',
    platform: 'youtube',
    status: 'available',
    desc: 'Retención por segundo (la más detallada), vistas, CTR y suscriptores',
    devUrl: 'https://console.cloud.google.com',
    devLabel: 'Google Cloud Console',
    steps: [
      'Ve a console.cloud.google.com y crea un nuevo proyecto',
      'Activa "YouTube Analytics API" y "YouTube Data API v3"',
      'Crea credenciales OAuth 2.0 (tipo: Web application)',
      'Agrega http://localhost:3000 como Redirect URI',
      'Copia el Client ID y Client Secret a .env.local',
    ],
    notes: 'YouTube tiene la API más completa. La retención por segundo solo está disponible a través de YouTube Analytics API.',
  },
  {
    name: 'LinkedIn',
    platform: 'linkedin',
    status: 'coming_soon',
    desc: 'Impresiones, clics y engagement de posts',
    devUrl: 'https://developer.linkedin.com',
    devLabel: 'LinkedIn Developers',
    steps: [],
    notes: 'LinkedIn tiene restricciones severas en su API para personas individuales. Disponible próximamente.',
  },
]

function IntegrationCard({ integration }: { integration: Integration }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/30 transition-colors"
        onClick={() => integration.status === 'available' && setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold text-muted-foreground">
            {integration.name.slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-medium">{integration.name}</p>
            <p className="text-xs text-muted-foreground">{integration.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {integration.status === 'coming_soon' ? (
            <Badge variant="outline" className="text-[10px] text-muted-foreground">Próximamente</Badge>
          ) : (
            <>
              <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">Requiere configuración</Badge>
              {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </>
          )}
        </div>
      </div>

      {open && integration.status === 'available' && (
        <div className="border-t border-border p-4 space-y-4 bg-secondary/30">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pasos para conectar</p>
            <ol className="space-y-2">
              {integration.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {integration.notes && (
            <Alert className="border-amber-500/20 bg-amber-500/5">
              <Info className="w-4 h-4 text-amber-400" />
              <AlertDescription className="text-xs text-muted-foreground">
                {integration.notes}
              </AlertDescription>
            </Alert>
          )}

          <a href={integration.devUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2">
              Ir a {integration.devLabel}
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const [showKeyInfo, setShowKeyInfo] = useState(false)

  return (
    <div>
      <Topbar title="Configuración" subtitle="Integraciones y API keys" />
      <div className="p-6 max-w-2xl space-y-6">

        <Alert className="border-blue-500/20 bg-blue-500/5">
          <Info className="w-4 h-4 text-blue-400" />
          <AlertDescription className="text-sm text-muted-foreground">
            Las integraciones con redes sociales requieren crear apps en cada plataforma de desarrolladores.
            Haz clic en cada red para ver las instrucciones exactas.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Redes sociales</CardTitle>
            <CardDescription>Conecta para activar métricas, análisis de videos y audiencia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {INTEGRATIONS.map(i => (
              <IntegrationCard key={i.name} integration={i} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            className="pb-3 cursor-pointer"
            onClick={() => setShowKeyInfo(o => !o)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Anthropic API Key</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="text-[10px] bg-green-500/15 text-green-400 border-green-500/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Configurada
                </Badge>
                {showKeyInfo ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </div>
          </CardHeader>
          {showKeyInfo && (
            <CardContent className="pt-0 space-y-3">
              <p className="text-sm text-muted-foreground">
                La API key está configurada en{' '}
                <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">.env.local</code>.
                Si necesitas cambiarla, edita ese archivo y reinicia el servidor.
              </p>
              <div className="bg-secondary rounded-lg p-3 font-mono text-xs text-muted-foreground">
                ANTHROPIC_API_KEY=sk-ant-...
              </div>
              <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  Anthropic Console
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </a>
            </CardContent>
          )}
        </Card>

      </div>
    </div>
  )
}
