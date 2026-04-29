'use client'

import { useState, useRef, useEffect } from 'react'
import { useBrandStore } from '@/store/brand'
import {
  Plus, X, Link2, RefreshCw, Sparkles, Brain, Copy, Check,
  Play, Mic, FileText, ChevronDown, ChevronUp, Zap, ArrowRight,
  Trash2, Globe, ToggleLeft, ToggleRight, BookOpen,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Referente {
  id: string
  url: string
  platform: string
  title: string
  transcript: string
  thumbnailUrl?: string
  hook?: string
  structure?: string[]
  loading: boolean
  error?: string
}

interface OutputSection {
  type: 'script' | 'hook' | 'caption'
  title: string
  pattern?: string
  hook?: string
  body: string
  cta?: string
}

function detectPlatform(url: string): string {
  if (/youtube|youtu\.be/.test(url)) return 'youtube'
  if (/instagram/.test(url)) return 'instagram'
  if (/tiktok/.test(url)) return 'tiktok'
  if (/linkedin/.test(url)) return 'linkedin'
  if (/facebook|fb\.com/.test(url)) return 'facebook'
  return 'otro'
}

const PLATFORM_META: Record<string, { emoji: string; color: string; bg: string }> = {
  youtube:   { emoji: '▶', color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30' },
  instagram: { emoji: '📸', color: 'text-pink-400',  bg: 'bg-pink-500/10 border-pink-500/30' },
  tiktok:    { emoji: '🎵', color: 'text-foreground', bg: 'bg-secondary border-border' },
  linkedin:  { emoji: 'in', color: 'text-blue-400',  bg: 'bg-blue-500/10 border-blue-500/30' },
  facebook:  { emoji: '📘', color: 'text-blue-500',  bg: 'bg-blue-500/10 border-blue-500/30' },
  otro:      { emoji: '🌐', color: 'text-muted-foreground', bg: 'bg-secondary border-border' },
}

const VOZ_EXAMPLES = [
  'Hablo de forma directa, sin rodeos. Uso frases cortas. Me gusta empezar con una pregunta incómoda. Soy empática pero no suavizo la verdad.',
  'Mi tono es conversacional, como si hablara con un amigo. Uso mucho humor sutil y referencias a la vida cotidiana. Nunca soy rígida.',
  'Soy polarizante. Digo lo que otros no se atreven a decir. Uso datos para respaldarlo todo. Mi audiencia son emprendedores que ya lo intentaron.',
  'Cuento todo desde mi experiencia personal. Soy vulnerable, real, sin filtros. Cada video tiene un momento de quiebre emocional.',
]

function renderMarkdown(text: string) {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="font-bold text-sm mt-5 mb-2 text-foreground">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-bold text-xs uppercase tracking-wider text-primary mt-6 mb-2">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/^---$/gm, '<hr class="border-border my-4">')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-muted-foreground text-sm my-0.5">$1</li>')
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/^(?!<[h23pli]|<hr)(.+)$/gm, '<p class="text-sm text-muted-foreground leading-relaxed">$1</p>')
}

// ─── Referente Card ───────────────────────────────────────────────────────────

function ReferenteCard({ ref: r, onRemove, isConnected }: {
  ref: Referente; onRemove: () => void; isConnected: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const meta = PLATFORM_META[r.platform] ?? PLATFORM_META.otro

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all ${
      isConnected ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'
    }`}>
      {/* Platform header */}
      <div className={`flex items-center gap-2 px-3 py-2 border-b border-border ${
        r.platform === 'youtube' ? 'bg-red-600' :
        r.platform === 'facebook' ? 'bg-[#1877f2]' : 'bg-secondary'
      }`}>
        <span className={`text-sm font-bold ${r.platform === 'youtube' || r.platform === 'facebook' ? 'text-white' : meta.color}`}>
          {meta.emoji}
        </span>
        <span className={`text-xs font-semibold capitalize ${r.platform === 'youtube' || r.platform === 'facebook' ? 'text-white' : ''}`}>
          {r.platform === 'facebook' ? 'Meta Ads' : r.platform}
        </span>
        {isConnected && (
          <span className="ml-auto text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">
            Conectado
          </span>
        )}
        <button onClick={onRemove} className="ml-auto text-muted-foreground hover:text-destructive transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Thumbnail */}
      <div className="relative h-28 bg-secondary overflow-hidden">
        {r.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.thumbnailUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-20">{meta.emoji}</span>
          </div>
        )}
        {!r.loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
        )}
        {r.loading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-primary animate-spin" />
          </div>
        )}
        {r.transcript && !r.loading && (
          <div className="absolute bottom-1.5 left-1.5 bg-primary/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg">
            🎤 Transcripción obtenida
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        {r.error && <p className="text-xs text-red-400">{r.error}</p>}

        <p className="text-xs font-medium line-clamp-2 leading-snug">
          {r.title || r.url.slice(0, 50) + '...'}
        </p>

        {r.hook && (
          <div className="bg-primary/8 border border-primary/20 rounded-lg px-2.5 py-2">
            <p className="text-[10px] font-semibold text-primary mb-0.5">Hook detectado</p>
            <p className="text-[11px] text-muted-foreground italic">"{r.hook}"</p>
          </div>
        )}

        {r.transcript && (
          <button onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Ocultar' : `Ver transcripción (${r.transcript.split(' ').length} palabras)`}
          </button>
        )}

        {expanded && r.transcript && (
          <div className="bg-secondary rounded-xl p-2.5 max-h-32 overflow-y-auto">
            <p className="text-[10px] text-muted-foreground leading-relaxed font-mono">{r.transcript.slice(0, 500)}...</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Mi Voz Node ─────────────────────────────────────────────────────────────

function MiVozNode({ value, onChange, isConnected }: {
  value: string; onChange: (v: string) => void; isConnected: boolean
}) {
  const [showExamples, setShowExamples] = useState(false)

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all ${
      isConnected ? 'border-violet-500/60 shadow-lg shadow-violet-500/10' : 'border-border'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-violet-500/10 border-b border-violet-500/20">
        <Mic className="w-4 h-4 text-violet-400" />
        <span className="text-xs font-semibold text-violet-400">Mi Voz y Esencia</span>
        {isConnected && (
          <span className="ml-auto text-[9px] bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full font-semibold">
            Conectado
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Describe cómo te comunicas: tu tono, tus frases típicas, lo que nunca dirías, cómo cuentas historias, qué hace única tu voz.
        </p>

        <textarea
          rows={7}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={`Ej: Hablo de forma directa y sin rodeos. Uso frases muy cortas. Me gusta empezar con una pregunta incómoda. Soy empática pero no suavizo la verdad. Mi audiencia son mujeres emprendedoras que ya lo intentaron y fallaron. Nunca digo "tips" ni "hacks". Cuento todo desde mi experiencia personal. Soy vulnerable pero no victimista...`}
          className="w-full text-xs leading-relaxed bg-secondary border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500/50 transition-colors resize-none placeholder:text-muted-foreground/50"
        />

        <div>
          <button onClick={() => setShowExamples(e => !e)}
            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            <BookOpen className="w-3 h-3" />
            {showExamples ? 'Ocultar ejemplos' : 'Ver ejemplos de prompts'}
          </button>

          {showExamples && (
            <div className="mt-2 space-y-1.5">
              {VOZ_EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => onChange(ex)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-secondary hover:bg-accent text-[10px] text-muted-foreground hover:text-foreground transition-colors leading-relaxed border border-transparent hover:border-border"
                >
                  {ex.slice(0, 90)}...
                </button>
              ))}
            </div>
          )}
        </div>

        {value && (
          <div className="flex items-center gap-1.5 text-[10px] text-violet-400">
            <Check className="w-3 h-3" />
            {value.split(' ').length} palabras — tu esencia está definida
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Connection Line (SVG) ────────────────────────────────────────────────────

function ConnectionLine({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1 py-2 select-none">
      {/* Line */}
      <div className={`w-0.5 h-8 rounded-full transition-all duration-500 ${
        active ? 'bg-gradient-to-b from-primary to-violet-500' : 'bg-border'
      }`} />
      {/* Node dot */}
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
        active
          ? 'border-primary bg-primary/20 shadow-md shadow-primary/30'
          : 'border-border bg-secondary'
      }`}>
        {active && <Zap className="w-2.5 h-2.5 text-primary" />}
      </div>
      {/* Line */}
      <div className={`w-0.5 h-8 rounded-full transition-all duration-500 ${
        active ? 'bg-gradient-to-b from-violet-500 to-primary' : 'bg-border'
      }`} />
    </div>
  )
}

// ─── Output Node ──────────────────────────────────────────────────────────────

function OutputNode({ streaming, output, onGenerate, canGenerate, outputType, setOutputType }: {
  streaming: boolean
  output: string
  onGenerate: () => void
  canGenerate: boolean
  outputType: string
  setOutputType: (v: string) => void
}) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  function copySection(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopiedSection(key)
    setTimeout(() => setCopiedSection(null), 1500)
  }

  const OUTPUT_TYPES = [
    { value: 'all',      label: 'Todo',         emoji: '✨' },
    { value: 'scripts',  label: 'Guiones',      emoji: '📝' },
    { value: 'hooks',    label: 'Hooks',        emoji: '🎣' },
    { value: 'captions', label: 'Captions',     emoji: '📱' },
  ]

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all ${
      output ? 'border-green-500/40 shadow-lg shadow-green-500/5' :
      canGenerate ? 'border-primary/40' : 'border-border'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-green-500/8 border-b border-green-500/20">
        <Sparkles className="w-4 h-4 text-green-400" />
        <span className="text-xs font-semibold text-green-400">Output — Resultado generado</span>
        {output && !streaming && (
          <span className="ml-auto text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold">
            ✓ Listo
          </span>
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* Output type selector */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">¿Qué quieres generar?</p>
          <div className="grid grid-cols-2 gap-1.5">
            {OUTPUT_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setOutputType(t.value)}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                  outputType === t.value
                    ? 'bg-primary/15 border-primary text-primary'
                    : 'bg-secondary border-transparent text-muted-foreground hover:border-border'
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={onGenerate}
          disabled={!canGenerate || streaming}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
            canGenerate && !streaming
              ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
              : 'bg-secondary text-muted-foreground cursor-not-allowed'
          }`}
        >
          {streaming ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Generando...</>
          ) : (
            <><Zap className="w-4 h-4" /> Generar con mis referentes y mi voz</>
          )}
        </button>

        {!canGenerate && (
          <p className="text-[10px] text-muted-foreground text-center">
            Agrega al menos 1 referente y define tu voz para generar
          </p>
        )}

        {/* Streaming preview */}
        {streaming && !output && (
          <div className="bg-secondary rounded-xl p-3 space-y-1.5">
            {['Analizando patrones de referentes...', 'Aplicando tu voz y esencia...', 'Escribiendo guiones...'].map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: `${i * 300}ms` }} />
                {step}
              </div>
            ))}
          </div>
        )}

        {/* Output */}
        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Resultado</p>
              <button
                onClick={() => copySection(output, 'all')}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {copiedSection === 'all' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                Copiar todo
              </button>
            </div>
            <div
              className="bg-secondary rounded-xl p-3 max-h-96 overflow-y-auto text-sm"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Add Referente Modal ──────────────────────────────────────────────────────

function AddReferenteModal({ onAdd, onClose }: {
  onAdd: (url: string) => void
  onClose: () => void
}) {
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [mode, setMode] = useState<'url' | 'text'>('url')

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
          <div>
            <h3 className="font-semibold">Agregar referente</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Pega el link o el texto del contenido</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-1 bg-secondary rounded-xl p-1">
            <button onClick={() => setMode('url')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                mode === 'url' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
              }`}>
              <Link2 className="w-3.5 h-3.5" /> URL del contenido
            </button>
            <button onClick={() => setMode('text')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                mode === 'text' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
              }`}>
              <FileText className="w-3.5 h-3.5" /> Pegar texto
            </button>
          </div>

          {mode === 'url' ? (
            <div className="space-y-2">
              <input
                autoFocus
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && url.trim() && (onAdd(url), onClose())}
                placeholder="https://youtube.com/watch?v=... · instagram.com/reel/... · tiktok.com/@..."
                className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-secondary focus:outline-none focus:border-primary transition-colors"
              />
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '▶ YouTube → transcripción automática', platform: 'youtube' },
                  { label: '📸 Instagram → caption', platform: 'instagram' },
                  { label: '🎵 TikTok → metadata', platform: 'tiktok' },
                ].map(p => (
                  <span key={p.platform} className="text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded-lg">
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                autoFocus
                rows={6}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Pega el caption, la transcripción del video, el copy del anuncio o cualquier texto del contenido de referencia..."
                className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-secondary focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => {
              const val = mode === 'url' ? url : `TEXTO:${text}`
              if (val.trim()) { onAdd(val); onClose() }
            }}
            disabled={mode === 'url' ? !url.trim() : !text.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Agregar al board
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LabPage() {
  const brand = useBrandStore(s => s.brand)

  const [referentes, setReferentes] = useState<Referente[]>([])
  const [voz, setVoz] = useState(brand?.tone ? `Mi tono es ${brand.tone}. ${brand.character ? `En cámara soy ${brand.character}.` : ''} ${brand.personality ? `Mi personalidad es ${brand.personality}.` : ''}`.trim() : '')
  const [outputType, setOutputType] = useState('all')
  const [output, setOutput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const canGenerate = referentes.some(r => r.transcript || r.title) && voz.trim().length > 20

  // ── Add referente ──────────────────────────────────────────────────────────

  async function handleAddReferente(input: string) {
    const id = crypto.randomUUID()
    const isText = input.startsWith('TEXTO:')
    const rawText = isText ? input.slice(6) : ''
    const url = isText ? '' : input

    const newRef: Referente = {
      id, url, platform: isText ? 'otro' : detectPlatform(url),
      title: '', transcript: '', loading: !isText,
    }
    setReferentes(prev => [...prev, newRef])

    if (isText) {
      setReferentes(prev => prev.map(r => r.id === id
        ? { ...r, title: rawText.slice(0, 60), transcript: rawText, loading: false }
        : r))
      return
    }

    // Fetch from URL
    try {
      const res = await fetch('/api/lab/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setReferentes(prev => prev.map(r => r.id === id ? {
        ...r,
        title: data.title || url.slice(0, 60),
        transcript: data.transcript || data.description || '',
        thumbnailUrl: data.thumbnailUrl,
        platform: data.source || r.platform,
        loading: false,
      } : r))

      // Auto-extract hook with quick analysis
      if (data.transcript || data.description) {
        const analyzeRes = await fetch('/api/lab/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url, title: data.title, transcript: data.transcript || data.description,
            platform: data.source, category: 'referente', brand: null,
          }),
        })
        if (analyzeRes.ok && analyzeRes.body) {
          const reader = analyzeRes.body.getReader()
          const decoder = new TextDecoder()
          let acc = ''
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            acc += decoder.decode(value, { stream: true })
            const p = (() => { try { const m = acc.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null } catch { return null } })()
            if (p?.hook) {
              setReferentes(prev => prev.map(r => r.id === id ? {
                ...r, hook: p.hook, structure: p.structure,
              } : r))
            }
          }
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al extraer'
      setReferentes(prev => prev.map(r => r.id === id ? { ...r, loading: false, error: msg } : r))
    }
  }

  // ── Generate ───────────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!canGenerate || streaming) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStreaming(true)
    setOutput('')

    const referentesPayload = referentes
      .filter(r => r.transcript || r.title)
      .map(r => ({
        title: r.title,
        transcript: r.transcript,
        hook: r.hook,
        structure: r.structure,
        platform: r.platform,
        url: r.url,
      }))

    try {
      const res = await fetch('/api/lab/generate-scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referentes: referentesPayload, vozPrompt: voz, outputType }),
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

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {showModal && (
        <AddReferenteModal
          onAdd={handleAddReferente}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Full layout */}
      <div className="flex flex-col h-screen" style={{ paddingTop: 64, paddingLeft: 220 }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-background flex-shrink-0">
          <span className="text-lg">🧪</span>
          <div>
            <h1 className="font-semibold text-sm">AI Content Lab</h1>
            <p className="text-[11px] text-muted-foreground">Conecta tus referentes con tu voz → genera guiones auténticos</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {canGenerate && !streaming && (
              <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
                <Zap className="w-3 h-3" /> Listo para generar
              </div>
            )}
          </div>
        </div>

        {/* Three-column node board */}
        <div className="flex-1 overflow-auto p-6"
          style={{
            background: 'radial-gradient(circle at 1px 1px, hsl(var(--border)/50%) 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}>
          <div className="max-w-6xl mx-auto">

            {/* Node labels row */}
            <div className="grid grid-cols-[1fr_80px_1fr_80px_1fr] gap-0 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Nodo 1 — Referentes</span>
              </div>
              <div />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-500" />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Nodo 2 — Mi Voz</span>
              </div>
              <div />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Nodo 3 — Output</span>
              </div>
            </div>

            {/* Nodes row */}
            <div className="grid grid-cols-[1fr_80px_1fr_80px_1fr] gap-0 items-start">

              {/* ── Nodo 1: Referentes ── */}
              <div className="space-y-3">
                {referentes.map(r => (
                  <ReferenteCard
                    key={r.id}
                    ref={r}
                    onRemove={() => setReferentes(prev => prev.filter(x => x.id !== r.id))}
                    isConnected={canGenerate}
                  />
                ))}

                {/* Add button */}
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full border-2 border-dashed border-border rounded-2xl p-5 flex flex-col items-center gap-2.5 hover:border-primary/40 hover:bg-primary/3 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Agregar referente</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">URL de YouTube, Instagram, TikTok o texto</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {['▶ YouTube', '📸 Instagram', '🎵 TikTok', '📘 Meta Ads'].map(p => (
                      <span key={p} className="text-[10px] bg-secondary px-2 py-1 rounded-lg text-muted-foreground">{p}</span>
                    ))}
                  </div>
                </button>

                {referentes.length === 0 && (
                  <div className="bg-secondary/40 rounded-2xl border border-dashed border-border p-4 text-center">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Agrega videos o posts de creadores que admiras. La IA extrae sus patrones de hook, estructura y estilo narrativo.
                    </p>
                  </div>
                )}
              </div>

              {/* ── Connector 1→2 ── */}
              <div className="flex flex-col items-center justify-center pt-16">
                <ConnectionLine active={referentes.some(r => r.transcript || r.title)} />
                <span className="text-[9px] text-muted-foreground mt-1 text-center leading-tight">Patrones<br/>detectados</span>
              </div>

              {/* ── Nodo 2: Mi Voz ── */}
              <div>
                <MiVozNode
                  value={voz}
                  onChange={setVoz}
                  isConnected={canGenerate}
                />
              </div>

              {/* ── Connector 2→3 ── */}
              <div className="flex flex-col items-center justify-center pt-16">
                <ConnectionLine active={canGenerate} />
                <span className="text-[9px] text-muted-foreground mt-1 text-center leading-tight">Fusión<br/>IA</span>
              </div>

              {/* ── Nodo 3: Output ── */}
              <div>
                <OutputNode
                  streaming={streaming}
                  output={output}
                  onGenerate={handleGenerate}
                  canGenerate={canGenerate}
                  outputType={outputType}
                  setOutputType={setOutputType}
                />
              </div>
            </div>

            {/* How it works */}
            {referentes.length === 0 && !voz && (
              <div className="mt-10 grid grid-cols-3 gap-4">
                {[
                  { emoji: '📌', title: 'Paso 1 — Referentes', desc: 'Agrega URLs de creadores que admiras. YouTube extrae transcripción automática. Instagram y TikTok jalan el caption y la estructura.' },
                  { emoji: '🎙️', title: 'Paso 2 — Tu Voz', desc: 'Escribe cómo te comunicas: tu tono, tus frases, lo que te hace único. Cuanto más específico, más auténtico el resultado.' },
                  { emoji: '⚡', title: 'Paso 3 — Generar', desc: 'La IA toma los patrones de los referentes y los escribe con tu voz. El resultado suena como tú, no como ellos.' },
                ].map((step, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-4 text-center">
                    <span className="text-3xl mb-3 block">{step.emoji}</span>
                    <p className="text-sm font-semibold mb-2">{step.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
