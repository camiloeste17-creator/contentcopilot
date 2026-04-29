'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GeneratedIdeas } from '@/types/lab'
import { Copy, Check } from 'lucide-react'

interface IdeaListProps {
  title: string
  emoji: string
  items: string[]
  accent?: string
}

function IdeaList({ title, emoji, items, accent = 'text-primary' }: IdeaListProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  function copy(text: string, i: number) {
    navigator.clipboard.writeText(text)
    setCopiedIdx(i)
    setTimeout(() => setCopiedIdx(null), 1500)
  }

  return (
    <div className="space-y-2">
      <p className={`text-xs font-semibold uppercase tracking-wider ${accent}`}>{emoji} {title}</p>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="group flex items-start gap-2.5 bg-secondary/50 hover:bg-secondary rounded-xl px-3 py-2.5 transition-colors">
            <span className="w-5 h-5 rounded-md bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item}</p>
            <button
              onClick={() => copy(item, i)}
              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5 text-muted-foreground hover:text-foreground"
            >
              {copiedIdx === i ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function IdeasPanel({ ideas }: { ideas: GeneratedIdeas }) {
  const [activeTab, setActiveTab] = useState<'ideas' | 'hooks' | 'scripts' | 'captions' | 'ads'>('ideas')

  const tabs = [
    { key: 'ideas', label: 'Ideas (10)', count: ideas.ideas.length },
    { key: 'hooks', label: 'Hooks (5)', count: ideas.hooks.length },
    { key: 'scripts', label: 'Guiones', count: ideas.scripts.length },
    { key: 'captions', label: 'Captions', count: ideas.instagramCaptions.length },
    { key: 'ads', label: 'Meta Ads', count: ideas.metaAdsIdeas.length },
  ] as const

  return (
    <div className="space-y-5">
      {/* Tab selector */}
      <div className="flex gap-1 bg-secondary/50 rounded-xl p-1 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              activeTab === t.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'ideas' && (
        <div className="space-y-4">
          <IdeaList title="Ideas de contenido" emoji="💡" items={ideas.ideas} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <IdeaList title="Ángulos de venta" emoji="💰" items={ideas.salesAngles} accent="text-green-400" />
            <IdeaList title="CTAs" emoji="📣" items={ideas.ctas} accent="text-cyan-400" />
          </div>
          <IdeaList title="Títulos SEO" emoji="🔑" items={ideas.seoTitles} accent="text-amber-400" />
        </div>
      )}

      {activeTab === 'hooks' && (
        <IdeaList title="Hooks listos para cámara" emoji="🎣" items={ideas.hooks} accent="text-violet-400" />
      )}

      {activeTab === 'scripts' && (
        <div className="space-y-4">
          {ideas.scripts.map((script, i) => (
            <Card key={i} className="border-border/60">
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-xs text-muted-foreground">Guion {i + 1}</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{script}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(script)}
                  className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="w-3 h-3" /> Copiar guion
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'captions' && (
        <div className="space-y-4">
          <IdeaList title="Captions para Instagram" emoji="📱" items={ideas.instagramCaptions} accent="text-pink-400" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <IdeaList title="Contenido orgánico" emoji="🌱" items={ideas.organicIdeas} accent="text-green-400" />
            <IdeaList title="Storytelling personal" emoji="📖" items={ideas.storytellingIdeas} accent="text-amber-400" />
          </div>
        </div>
      )}

      {activeTab === 'ads' && (
        <IdeaList title="Ideas para Meta Ads" emoji="🎯" items={ideas.metaAdsIdeas} accent="text-blue-400" />
      )}
    </div>
  )
}
