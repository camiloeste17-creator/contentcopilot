'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy } from 'lucide-react'
import { useState } from 'react'

interface InsightSectionProps {
  emoji: string
  title: string
  content: string
  highlight?: boolean
}

export function InsightSection({ emoji, title, content, highlight }: InsightSectionProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className={highlight ? 'border-primary/40 bg-primary/5' : ''}>
      <CardHeader className="pb-2 pt-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <span>{emoji}</span>
          {title}
        </CardTitle>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <Copy className="w-3 h-3" />
          {copied ? 'Copiado' : 'Copiar'}
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
