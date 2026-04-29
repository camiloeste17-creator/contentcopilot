'use client'

import { useState, useRef } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useBrandStore } from '@/store/brand'
import { Users, Sparkles, RefreshCw, ClipboardPaste } from 'lucide-react'

interface ParsedInsights {
  pains: string
  questions: string
  objections: string
  language: string
  contentType: string
  contentOpportunities: string
  salesOpportunities: string
  mainInsight: string
}

const SECTION_CONFIG = [
  { key: 'mainInsight', emoji: '⚡', title: 'Insight principal', highlight: true },
  { key: 'pains', emoji: '🔥', title: 'Dolores detectados', highlight: false },
  { key: 'questions', emoji: '❓', title: 'Preguntas frecuentes', highlight: false },
  { key: 'objections', emoji: '🚫', title: 'Objeciones identificadas', highlight: false },
  { key: 'language', emoji: '💬', title: 'Lenguaje de la audiencia', highlight: false },
  { key: 'contentOpportunities', emoji: '💡', title: 'Oportunidades de contenido', highlight: false },
  { key: 'salesOpportunities', emoji: '💰', title: 'Oportunidades de venta', highlight: false },
  { key: 'contentType', emoji: '📊', title: 'Tipo de contenido con más interacción', highlight: false },
]

const EXAMPLE_COMMENTS = `No entiendo por qué no me compran si publico todos los días
¿Esto funciona para alguien que recién empieza?
Llevo meses viendo tus videos y por fin me animé a comentar, cambió mi forma de ver el contenido
¿Cuánto tiempo tardaste tú en ver resultados?
Yo intenté algo similar y no me funcionó, creo que mi nicho es muy saturado
¿Tienes algún curso o mentoría disponible?
Ojalá hubiera encontrado esto antes de gastar en publicidad
El problema es que no tengo tiempo para crear contenido todos los días
¿Esto aplica para Instagram o solo para TikTok?
Me identifico mucho, yo también siento que el algoritmo me tiene castigada
¿Cuál es el precio de tu programa?
Llevo 2 años tratando de vivir de las redes y sigo sin lograrlo
Tu contenido es el único que me explica esto de forma simple
¿Necesito muchos seguidores para empezar a vender?
El miedo a vender es lo que más me frena, me da pena parecer desesperada`

function parseInsights(text: string): ParsedInsights {
  function extractSection(header: string): string {
    const regex = new RegExp(`##\\s*${header}[^\\n]*\\n([\\s\\S]*?)(?=\\n##|$)`, 'i')
    const match = text.match(regex)
    return match ? match[1].trim() : ''
  }

  return {
    mainInsight: extractSection('⚡ INSIGHT PRINCIPAL') || extractSection('INSIGHT PRINCIPAL'),
    pains: extractSection('🔥 DOLORES DETECTADOS') || extractSection('DOLORES DETECTADOS'),
    questions: extractSection('❓ PREGUNTAS FRECUENTES') || extractSection('PREGUNTAS FRECUENTES'),
    objections: extractSection('🚫 OBJECIONES IDENTIFICADAS') || extractSection('OBJECIONES IDENTIFICADAS'),
    language: extractSection('💬 LENGUAJE DE LA AUDIENCIA') || extractSection('LENGUAJE DE LA AUDIENCIA'),
    contentType: extractSection('📊 TIPO DE CONTENIDO') || extractSection('TIPO DE CONTENIDO'),
    contentOpportunities: extractSection('💡 OPORTUNIDADES DE CONTENIDO') || extractSection('OPORTUNIDADES DE CONTENIDO'),
    salesOpportunities: extractSection('💰 OPORTUNIDADES DE VENTA') || extractSection('OPORTUNIDADES DE VENTA'),
  }
}

function countComments(text: string): number {
  return text.split('\n').filter(l => l.trim().length > 10).length
}

export default function AudiencePage() {
  const brand = useBrandStore((s) => s.brand)
  const [comments, setComments] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [insights, setInsights] = useState<ParsedInsights | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const commentCount = countComments(comments)

  async function handleAnalyze() {
    if (!comments.trim() || streaming) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStreaming(true)
    setStreamText('')
    setInsights(null)

    try {
      const res = await fetch('/api/audience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments, brand }),
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
        setStreamText(accumulated)
        const parsed = parseInsights(accumulated)
        if (parsed.pains || parsed.mainInsight) setInsights(parsed)
      }

      setInsights(parseInsights(accumulated))
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') console.error(err)
    } finally {
      setStreaming(false)
    }
  }

  function useExample() {
    setComments(EXAMPLE_COMMENTS)
    setInsights(null)
    setStreamText('')
  }

  return (
    <div>
      <Topbar title="Análisis de Audiencia" subtitle="Pega comentarios reales — la IA detecta dolores, oportunidades y lenguaje" />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
        {/* LEFT: Input */}
        <div className="space-y-4 lg:sticky lg:top-20">
          <Card>
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <ClipboardPaste className="w-4 h-4 text-primary" />
                Pega tus comentarios
              </CardTitle>
              <CardDescription className="text-xs">
                Copia comentarios de Instagram, TikTok o YouTube y pégalos aquí. Un comentario por línea.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4 space-y-3">
              <Textarea
                rows={14}
                placeholder="Pega aquí tus comentarios...&#10;&#10;Ej:&#10;¿Esto funciona para principiantes?&#10;Llevo meses intentándolo sin resultados&#10;¿Tienes algún curso disponible?&#10;..."
                value={comments}
                onChange={e => setComments(e.target.value)}
                className="text-sm font-mono resize-none"
              />

              <div className="flex items-center justify-between">
                {commentCount > 0 ? (
                  <Badge variant="outline" className="text-[10px]">
                    {commentCount} comentarios
                  </Badge>
                ) : (
                  <span />
                )}
                <button
                  onClick={useExample}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
                >
                  Usar ejemplo
                </button>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleAnalyze}
            disabled={!comments.trim() || streaming}
            className="w-full gap-2"
            size="lg"
          >
            {streaming ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Analizando...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Analizar audiencia</>
            )}
          </Button>

          {/* Tips */}
          <div className="rounded-lg border border-border p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cómo sacarle más partido</p>
            <ul className="space-y-1.5">
              {[
                'Mínimo 10-15 comentarios para mejores resultados',
                'Incluye comentarios de distintos videos',
                'Agrega preguntas de DMs si tienes acceso',
                'Más comentarios = insights más precisos',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="text-primary mt-0.5">·</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT: Results */}
        <div>
          {(insights || streaming) ? (
            <div className="space-y-4">
              {streaming && !insights && (
                <Card>
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs text-muted-foreground">Analizando comentarios...</span>
                    </div>
                    <pre className="text-xs text-muted-foreground/60 whitespace-pre-wrap font-mono leading-relaxed max-h-40 overflow-hidden">
                      {streamText.slice(-500)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {insights && SECTION_CONFIG.map(({ key, emoji, title, highlight }) => {
                const content = insights[key as keyof ParsedInsights]
                if (!content) return null
                return (
                  <InsightCard
                    key={key}
                    emoji={emoji}
                    title={title}
                    content={content}
                    highlight={highlight}
                  />
                )
              })}

              {streaming && insights && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Generando más insights...
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[560px] border border-dashed border-border rounded-xl text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-base mb-2">Analiza lo que dice tu audiencia</h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-4">
                Pega comentarios reales de tus redes y la IA extrae los dolores, preguntas, objeciones y oportunidades que tienes frente a ti.
              </p>
              <p className="text-xs text-muted-foreground/60">
                Sin comentarios aún, prueba el ejemplo →
              </p>
              <button
                onClick={useExample}
                className="mt-2 text-xs text-primary underline underline-offset-2 hover:opacity-80"
              >
                Cargar comentarios de ejemplo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InsightCard({ emoji, title, content, highlight }: {
  emoji: string
  title: string
  content: string
  highlight?: boolean
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className={`transition-colors ${highlight ? 'border-primary/40 bg-primary/5' : 'hover:border-border/80'}`}>
      <CardHeader className="pb-2 pt-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <span>{emoji}</span>
          {title}
          {highlight && (
            <Badge className="text-[9px] px-1.5 py-0 ml-1">Clave</Badge>
          )}
        </CardTitle>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          <span className="sr-only">Copiar</span>
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </CardContent>
    </Card>
  )
}
