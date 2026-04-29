import { cn } from '@/lib/utils'

const BADGE_STYLES: Record<string, string> = {
  'Hook fuerte':     'bg-violet-500/15 text-violet-400 border-violet-500/25',
  'Venta directa':   'bg-green-500/15 text-green-400 border-green-500/25',
  'Storytelling':    'bg-amber-500/15 text-amber-400 border-amber-500/25',
  'Trend':           'bg-pink-500/15 text-pink-400 border-pink-500/25',
  'Alta retención':  'bg-blue-500/15 text-blue-400 border-blue-500/25',
  'Buen CTA':        'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  'Educativo':       'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
  'Autoridad':       'bg-orange-500/15 text-orange-400 border-orange-500/25',
  'Viral potential': 'bg-red-500/15 text-red-400 border-red-500/25',
}

export function LabBadge({ label, className }: { label: string; className?: string }) {
  const style = BADGE_STYLES[label] ?? 'bg-secondary text-muted-foreground border-border'
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border', style, className)}>
      {label}
    </span>
  )
}

const INTENT_STYLES = {
  bajo:  'bg-secondary text-muted-foreground border-border',
  medio: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  alto:  'bg-green-500/15 text-green-400 border-green-500/25',
}

export function IntentBadge({ intent }: { intent: 'bajo' | 'medio' | 'alto' }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border', INTENT_STYLES[intent])}>
      Intención {intent}
    </span>
  )
}

const CATEGORY_STYLES: Record<string, string> = {
  referente:    'bg-primary/15 text-primary border-primary/25',
  competidor:   'bg-red-500/15 text-red-400 border-red-500/25',
  propio:       'bg-green-500/15 text-green-400 border-green-500/25',
  anuncio:      'bg-orange-500/15 text-orange-400 border-orange-500/25',
  trend:        'bg-pink-500/15 text-pink-400 border-pink-500/25',
  storytelling: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  educativo:    'bg-blue-500/15 text-blue-400 border-blue-500/25',
  venta:        'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  autoridad:    'bg-violet-500/15 text-violet-400 border-violet-500/25',
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border capitalize', CATEGORY_STYLES[category] ?? 'bg-secondary text-muted-foreground border-border')}>
      {category}
    </span>
  )
}
