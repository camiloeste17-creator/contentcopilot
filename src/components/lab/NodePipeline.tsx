'use client'

import { cn } from '@/lib/utils'
import { Check, RefreshCw, AlertCircle, Clock, ChevronDown, ChevronUp, Copy } from 'lucide-react'
import { useState } from 'react'

export type NodeStatus = 'idle' | 'running' | 'done' | 'error' | 'skipped'

export interface PipelineNode {
  id: string
  label: string
  emoji: string
  status: NodeStatus
  description?: string
  output?: string | object
  errorMsg?: string
  action?: () => void
  actionLabel?: string
}

const STATUS_STYLES: Record<NodeStatus, string> = {
  idle:    'border-border bg-card text-muted-foreground',
  running: 'border-primary/60 bg-primary/5 text-primary',
  done:    'border-green-500/40 bg-green-500/5 text-foreground',
  error:   'border-red-500/40 bg-red-500/5 text-red-400',
  skipped: 'border-border/40 bg-secondary/40 text-muted-foreground/50',
}

const STATUS_ICON: Record<NodeStatus, React.ReactNode> = {
  idle:    <Clock className="w-3.5 h-3.5" />,
  running: <RefreshCw className="w-3.5 h-3.5 animate-spin" />,
  done:    <Check className="w-3.5 h-3.5 text-green-400" />,
  error:   <AlertCircle className="w-3.5 h-3.5 text-red-400" />,
  skipped: <span className="text-[10px]">—</span>,
}

const CONNECTOR_STYLES: Record<NodeStatus, string> = {
  idle:    'bg-border',
  running: 'bg-primary/40 animate-pulse',
  done:    'bg-green-500/50',
  error:   'bg-red-500/40',
  skipped: 'bg-border/40',
}

function OutputPreview({ output }: { output: string | object }) {
  const [copied, setCopied] = useState(false)
  const text = typeof output === 'string' ? output : JSON.stringify(output, null, 2)
  const preview = text.slice(0, 300) + (text.length > 300 ? '...' : '')

  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="mt-3 bg-secondary/80 rounded-lg p-3 relative group">
      <pre className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono overflow-hidden max-h-32">
        {preview}
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
      >
        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  )
}

function NodeCard({ node, isLast }: { node: PipelineNode; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const hasOutput = !!node.output

  return (
    <div className="flex items-start">
      {/* Node */}
      <div className={cn(
        'w-64 rounded-2xl border-2 p-4 transition-all duration-300 flex-shrink-0',
        STATUS_STYLES[node.status],
        node.status === 'running' && 'shadow-lg shadow-primary/10',
        node.status === 'done' && 'shadow-sm shadow-green-500/10',
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{node.emoji}</span>
            <span className="text-xs font-semibold uppercase tracking-wide">{node.label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {STATUS_ICON[node.status]}
          </div>
        </div>

        {/* Description */}
        {node.description && (
          <p className="text-[11px] text-muted-foreground leading-relaxed">{node.description}</p>
        )}

        {/* Error */}
        {node.status === 'error' && node.errorMsg && (
          <div className="mt-2 text-[11px] text-red-400 bg-red-500/10 rounded-lg p-2">
            {node.errorMsg}
          </div>
        )}

        {/* Running pulse */}
        {node.status === 'running' && (
          <div className="mt-3 flex gap-1">
            {[0,1,2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        )}

        {/* Output preview */}
        {node.status === 'done' && hasOutput && (
          <div>
            <button
              onClick={() => setExpanded(e => !e)}
              className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Ocultar' : 'Ver resultado'}
            </button>
            {expanded && <OutputPreview output={node.output!} />}
          </div>
        )}

        {/* Action button */}
        {node.action && node.status === 'idle' && (
          <button
            onClick={node.action}
            className="mt-3 w-full px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-medium hover:bg-primary/25 transition-colors"
          >
            {node.actionLabel ?? 'Ejecutar'}
          </button>
        )}
      </div>

      {/* Connector */}
      {!isLast && (
        <div className="flex items-center flex-shrink-0 pt-6">
          <div className={cn('h-0.5 w-8 transition-all duration-500', CONNECTOR_STYLES[node.status])} />
          <div className={cn(
            'w-2 h-2 rounded-full border-2 transition-all duration-500',
            node.status === 'done' ? 'border-green-500/60 bg-green-500/20' :
            node.status === 'running' ? 'border-primary/60 bg-primary/20 animate-pulse' :
            'border-border bg-secondary'
          )} />
          <div className={cn('h-0.5 w-8 transition-all duration-500', CONNECTOR_STYLES[node.status])} />
        </div>
      )}
    </div>
  )
}

interface NodePipelineProps {
  nodes: PipelineNode[]
  className?: string
}

export function NodePipeline({ nodes, className }: NodePipelineProps) {
  return (
    <div className={cn('flex items-start overflow-x-auto pb-4', className)}>
      {nodes.map((node, i) => (
        <NodeCard key={node.id} node={node} isLast={i === nodes.length - 1} />
      ))}
    </div>
  )
}
