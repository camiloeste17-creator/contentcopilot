'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LabAnalysis } from '@/types/lab'
import { LabBadge, IntentBadge } from './LabBadge'
import { Copy, ChevronDown, ChevronUp, Bookmark, Zap } from 'lucide-react'

interface AnalysisCardProps {
  analysis: LabAnalysis
  onSavePattern?: (type: string, content: string) => void
  onGenerateIdeas?: () => void
  generatingIdeas?: boolean
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
      {children}
    </div>
  )
}

function CopyableText({ text, onSave, saveLabel }: { text: string; onSave?: () => void; saveLabel?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="group flex items-start justify-between gap-2 bg-secondary/60 rounded-lg px-3 py-2.5">
      <p className="text-sm text-foreground leading-relaxed flex-1">{text}</p>
      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {onSave && (
          <button onClick={onSave} className="text-muted-foreground hover:text-primary transition-colors" title={saveLabel}>
            <Bookmark className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

const INTENT_COLOR = { bajo: 'bg-secondary', medio: 'bg-amber-500/20', alto: 'bg-green-500/20' }

export function AnalysisCard({ analysis, onSavePattern, onGenerateIdeas, generatingIdeas }: AnalysisCardProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="space-y-4">
      {/* Badges + intent */}
      <div className="flex flex-wrap items-center gap-2">
        {analysis.badges.map(b => <LabBadge key={b} label={b} />)}
        <IntentBadge intent={analysis.commercialIntent} />
        <span className="ml-auto text-xs text-muted-foreground capitalize">{analysis.contentType.replace('_', ' ')}</span>
      </div>

      {/* Core insights — always visible */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Section title="🎣 Hook principal">
          <CopyableText
            text={analysis.hook}
            onSave={() => onSavePattern?.('hook', analysis.hook)}
            saveLabel="Guardar hook"
          />
        </Section>
        <Section title="🎯 Promesa">
          <CopyableText text={analysis.promise} />
        </Section>
        <Section title="💊 Dolor / Deseo que activa">
          <CopyableText text={analysis.painOrDesire} />
        </Section>
        <Section title="👥 Audiencia objetivo">
          <CopyableText text={analysis.targetAudience} />
        </Section>
      </div>

      {/* CTA + Sales angle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Section title="📣 CTA usado">
          <CopyableText
            text={analysis.cta}
            onSave={() => onSavePattern?.('cta', analysis.cta)}
            saveLabel="Guardar CTA"
          />
        </Section>
        <Section title="💡 Ángulo de venta">
          <CopyableText
            text={analysis.salesAngle}
            onSave={() => onSavePattern?.('angle', analysis.salesAngle)}
            saveLabel="Guardar ángulo"
          />
        </Section>
      </div>

      {/* Structure */}
      <Section title="🗂 Estructura del contenido">
        <div className="flex flex-wrap gap-1.5">
          {analysis.structure.map((step, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <span className="text-xs text-muted-foreground">{step}</span>
              {i < analysis.structure.length - 1 && <span className="text-muted-foreground/40">→</span>}
            </div>
          ))}
        </div>
      </Section>

      {/* Expandable details */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {expanded ? 'Ocultar análisis completo' : 'Ver análisis completo'}
      </button>

      {expanded && (
        <div className="space-y-4 pt-2 border-t border-border">
          {/* Emotions + keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Section title="❤️ Emociones que genera">
              <div className="flex flex-wrap gap-1.5">
                {analysis.emotions.map(e => (
                  <span key={e} className="px-2 py-1 rounded-lg bg-secondary text-xs text-muted-foreground">{e}</span>
                ))}
              </div>
            </Section>
            <Section title="🔑 Palabras clave SEO">
              <div className="flex flex-wrap gap-1.5">
                {analysis.keywords.map(k => (
                  <span key={k} className="px-2 py-1 rounded-lg bg-primary/8 text-primary text-xs border border-primary/20">{k}</span>
                ))}
              </div>
            </Section>
          </div>

          {/* Retention elements */}
          {analysis.retentionElements.length > 0 && (
            <Section title="🧲 Elementos de retención">
              <div className="space-y-1">
                {analysis.retentionElements.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">·</span> {r}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* What worked / improve */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Section title="✅ Qué hace bien">
              <div className="space-y-1">
                {analysis.whatWorked.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-green-400 mt-0.5">✓</span> {w}
                  </div>
                ))}
              </div>
            </Section>
            <Section title="⚠️ Qué podría mejorar">
              <div className="space-y-1">
                {analysis.whatToImprove.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-amber-400 mt-0.5">→</span> {w}
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Why it worked */}
          <Section title="💎 Por qué funciona">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{analysis.whyItWorked}</p>
            </div>
          </Section>

          {/* Key moment */}
          {analysis.keyMoment && (
            <Section title="⚡ Momento clave">
              <div className="bg-amber-500/8 border border-amber-500/20 rounded-lg px-3 py-2.5">
                <p className="text-sm text-muted-foreground">{analysis.keyMoment}</p>
              </div>
            </Section>
          )}
        </div>
      )}

      {/* Generate button */}
      {onGenerateIdeas && (
        <Button
          onClick={onGenerateIdeas}
          disabled={generatingIdeas}
          className="w-full gap-2 mt-2"
          size="lg"
        >
          <Zap className="w-4 h-4" />
          {generatingIdeas ? 'Generando ideas para tu marca...' : 'Generar ideas para mi marca'}
        </Button>
      )}
    </div>
  )
}
