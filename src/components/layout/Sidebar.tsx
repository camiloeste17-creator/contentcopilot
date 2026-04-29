'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Lightbulb,
  CalendarDays,
  Video,
  Users,
  PenTool,
  Target,
  TrendingUp,
  Eye,
  FlaskConical,
  Zap,
  Settings,
  Sparkles,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/lab', icon: FlaskConical, label: 'Content Lab', highlight: true },
  { href: '/ideas', icon: Lightbulb, label: 'Ideas' },
  { href: '/calendar', icon: CalendarDays, label: 'Calendario' },
  { href: '/videos', icon: Video, label: 'Videos' },
  { href: '/audience', icon: Users, label: 'Audiencia' },
  { href: '/copy', icon: PenTool, label: 'Copy & SEO' },
  { href: '/brand', icon: Target, label: 'Mi Marca' },
  { href: '/trends', icon: TrendingUp, label: 'Tendencias' },
  { href: '/competitors', icon: Eye, label: 'Referentes' },
  { href: '/insights', icon: Zap, label: 'Insights' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-[220px] flex flex-col border-r border-border bg-sidebar z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">ContentCopilot</p>
          <p className="text-[10px] text-muted-foreground">Tu copiloto estratégico</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-0.5">
          {navItems.map(({ href, icon: Icon, label, highlight }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  highlight && !active && 'bg-primary/8 border border-primary/20',
                  active
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0', active && 'text-primary', highlight && !active && 'text-primary')} />
                <span className="flex-1">{label}</span>
                {(highlight as boolean | undefined) && !active && (
                  <span className="text-[9px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-md leading-none">NEW</span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-border px-3 py-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Settings className="w-4 h-4" />
          Configuración
        </Link>
      </div>
    </aside>
  )
}
