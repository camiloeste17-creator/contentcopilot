'use client'

import { useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ContentStatus, ContentObjective, ContentFormat } from '@/types'
import { Plus, CalendarDays, Video, FileText, Image } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { es } from 'date-fns/locale'

interface ContentItem {
  id: string
  title: string
  date: Date
  format: ContentFormat
  objective: ContentObjective
  status: ContentStatus
}

const STATUS_COLORS: Record<ContentStatus, string> = {
  idea: 'bg-muted-foreground/30',
  script: 'bg-blue-500/60',
  recorded: 'bg-violet-500/60',
  edited: 'bg-amber-500/60',
  published: 'bg-green-500/60',
  analyzed: 'bg-primary/60',
}

const STATUS_LABELS: Record<ContentStatus, string> = {
  idea: 'Idea',
  script: 'Guion',
  recorded: 'Grabado',
  edited: 'Editado',
  published: 'Publicado',
  analyzed: 'Analizado',
}

const OBJECTIVE_COLORS: Record<ContentObjective, string> = {
  attract: 'border-blue-500/50 text-blue-400',
  educate: 'border-violet-500/50 text-violet-400',
  sell: 'border-green-500/50 text-green-400',
  authority: 'border-amber-500/50 text-amber-400',
  community: 'border-pink-500/50 text-pink-400',
  remarketing: 'border-orange-500/50 text-orange-400',
}

const SAMPLE_CONTENT: ContentItem[] = [
  {
    id: '1',
    title: '3 errores al crear contenido',
    date: new Date(2026, 3, 29),
    format: 'reel',
    objective: 'attract',
    status: 'script',
  },
  {
    id: '2',
    title: 'Cómo crear un hook que enganche',
    date: new Date(2026, 4, 2),
    format: 'reel',
    objective: 'educate',
    status: 'idea',
  },
  {
    id: '3',
    title: 'Mi historia: de empleada a creadora',
    date: new Date(2026, 4, 5),
    format: 'reel',
    objective: 'authority',
    status: 'idea',
  },
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 28))
  const [content] = useState<ContentItem[]>(SAMPLE_CONTENT)

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })

  const startDow = startOfMonth(currentDate).getDay()
  const blanks = Array(startDow).fill(null)

  function getContentForDay(day: Date) {
    return content.filter(c => isSameDay(c.date, day))
  }

  return (
    <div>
      <Topbar title="Calendario de Contenido" subtitle="Planea tu constancia de publicación" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1))}>
              ‹
            </Button>
            <h2 className="font-semibold capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1))}>
              ›
            </Button>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Agregar contenido
          </Button>
        </div>

        {/* Status legend */}
        <div className="flex flex-wrap gap-3 text-xs">
          {(Object.entries(STATUS_LABELS) as [ContentStatus, string][]).map(([status, label]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status]}`} />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="border border-border rounded-xl overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
              <div key={d} className="py-2.5 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7">
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[100px] border-b border-r border-border bg-muted/20" />
            ))}
            {days.map((day) => {
              const dayContent = getContentForDay(day)
              const today = isToday(day)
              return (
                <div
                  key={day.toISOString()}
                  className="min-h-[100px] border-b border-r border-border p-2 hover:bg-accent/30 transition-colors"
                >
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1 ${
                    today ? 'bg-primary text-white' : 'text-muted-foreground'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayContent.map(item => (
                      <div
                        key={item.id}
                        className={`text-[10px] font-medium px-1.5 py-1 rounded border ${OBJECTIVE_COLORS[item.objective]} bg-current/5 truncate flex items-center gap-1`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_COLORS[item.status]}`} />
                        {item.title}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Content list */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Próximos contenidos</h3>
          <div className="space-y-2">
            {content
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map(item => (
                <Card key={item.id} className="hover:border-border/80 transition-colors cursor-pointer">
                  <CardContent className="py-3 px-4 flex items-center gap-4">
                    <div className="flex-shrink-0 text-center w-12">
                      <p className="text-xs text-muted-foreground capitalize">{format(item.date, 'EEE', { locale: es })}</p>
                      <p className="text-lg font-bold leading-tight">{format(item.date, 'd')}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-[10px] ${OBJECTIVE_COLORS[item.objective]}`}>
                          {item.objective}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{item.format}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[item.status]}`} />
                      <span className="text-xs text-muted-foreground">{STATUS_LABELS[item.status]}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
