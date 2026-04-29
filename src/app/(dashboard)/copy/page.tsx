'use client'

import { useState, useRef } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useBrandStore } from '@/store/brand'
import { Platform } from '@/types'
import { PenTool, Sparkles, RefreshCw, Copy, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

const COPY_TYPES = [
  { value: 'caption', label: 'Caption', desc: 'Post completo con hashtags' },
  { value: 'hook para reel', label: 'Hook de Reel', desc: 'Apertura irresistible' },
  { value: 'título de video', label: 'Título de video', desc: 'SEO + curiosidad' },
  { value: 'copy de venta', label: 'Copy de venta', desc: 'Framework AIDA / PAS' },
  { value: 'descripción de Meta Ad', label: 'Meta Ad', desc: 'Descripción de anuncio' },
  { value: 'copy de remarketing', label: 'Remarketing', desc: 'Para audiencia que ya te conoce' },
]

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
]

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^---$/gm, '<hr class="my-4 border-border">')
    .replace(/\n\n/g, '</p><p class="mt-3">')
    .replace(/^(?!<)(.+)$/gm, '<p>$1</p>')
}

export default function CopyPage() {
  const brand = useBrandStore((s) => s.brand)
  const [copyType, setCopyType] = useState('caption')
  const [platform, setPlatform] = useState<Platform>('instagram')
  const [topic, setTopic] = useState('')
  const [output, setOutput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [copied, setCopied] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const hasBrand = !!brand?.niche

  async function handleGenerate() {
    if (!brand || !topic || streaming) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStreaming(true)
    setOutput('')

    try {
      const res = await fetch('/api/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, copyType, platform, topic }),
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

  function handleCopy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <Topbar title="Copy & SEO" subtitle="Genera copies optimizados para cada red social" />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        <div className="space-y-4 lg:sticky lg:top-20">
          {!hasBrand && (
            <Alert className="border-amber-500/30 bg-amber-500/5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <AlertDescription className="text-sm">
                <Link href="/brand" className="text-primary underline underline-offset-2">
                  Configura tu Brand Canvas
                </Link>{' '}para copies alineados a tu marca
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Tipo de copy</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 space-y-1.5">
              {COPY_TYPES.map(ct => (
                <button
                  key={ct.value}
                  onClick={() => setCopyType(ct.value)}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                    copyType === ct.value
                      ? 'bg-primary/15 border-primary/40'
                      : 'bg-secondary border-transparent hover:border-border'
                  }`}
                >
                  <div>
                    <p className={`text-sm font-medium ${copyType === ct.value ? 'text-primary' : ''}`}>{ct.label}</p>
                    <p className="text-xs text-muted-foreground">{ct.desc}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Red social</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-2 gap-1.5">
                {PLATFORMS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setPlatform(p.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      platform === p.value
                        ? 'bg-primary/15 border-primary text-primary'
                        : 'bg-secondary border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Tema del copy</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <Textarea
                rows={4}
                placeholder="Ej: Los 3 errores que cometen los coaches al crear contenido y cómo evitarlos..."
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="text-sm"
              />
            </CardContent>
          </Card>

          <Button
            onClick={handleGenerate}
            disabled={!hasBrand || !topic.trim() || streaming}
            className="w-full gap-2"
            size="lg"
          >
            {streaming ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Generando...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generar copy</>
            )}
          </Button>
        </div>

        <div>
          {output ? (
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-primary" />
                  {streaming ? (
                    <span className="flex items-center gap-2">
                      Generando copy...
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    </span>
                  ) : 'Copy generado'}
                </CardTitle>
                {!streaming && (
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Copiado' : 'Copiar todo'}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div
                  className="prose-ai text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] border border-dashed border-border rounded-xl text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <PenTool className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-base mb-2">Tu copy aparecerá aquí</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Selecciona el tipo, la plataforma, escribe el tema y genera tu copy optimizado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
