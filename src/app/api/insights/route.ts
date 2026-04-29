export const runtime = 'edge'

import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { BrandProfile } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { brand, igData } = await req.json() as {
      brand: BrandProfile | null
      igData?: {
        followers: number
        mediaCount: number
        recentMedia: {
          caption?: string
          likes: number
          comments: number
          views: number
          saves: number
          type: string
          date: string
        }[]
      }
    }

    const brandCtx = brand?.niche
      ? `MARCA: ${brand.name || 'Sin nombre'} | Nicho: ${brand.niche} | Audiencia: ${brand.target_audience || 'Sin definir'} | Tono: ${brand.tone || 'Sin definir'} | Objetivo: ${brand.value_proposition || 'Sin definir'}`
      : 'Sin Brand Canvas configurado'

    const igCtx = igData
      ? `DATOS DE INSTAGRAM (últimos ${igData.recentMedia.length} posts):
- Seguidores: ${igData.followers.toLocaleString('es')}
- Total publicaciones: ${igData.mediaCount}
- Posts analizados: ${igData.recentMedia.length}

RENDIMIENTO POR POST:
${igData.recentMedia.slice(0, 10).map((m, i) =>
  `Post ${i + 1} (${m.date}) — ${m.type}:
  Caption: "${m.caption?.slice(0, 80) ?? 'Sin caption'}..."
  Vistas: ${m.views} | Likes: ${m.likes} | Comentarios: ${m.comments} | Guardados: ${m.saves}`
).join('\n\n')}`
      : 'Sin datos de Instagram conectados.'

    const prompt = `${brandCtx}

${igCtx}

Basándote en estos datos, genera 6 recomendaciones estratégicas inteligentes y accionables.

REGLAS:
- Cada recomendación debe estar basada en los datos reales, no ser genérica
- Menciona números o patrones específicos que observas
- Que sea accionable: di QUÉ hacer exactamente, no solo qué está pasando
- Usa los datos de Instagram para detectar patrones reales
- Si no hay datos de Instagram, basa las recomendaciones en el Brand Canvas

Usa EXACTAMENTE esta estructura para cada una:

---
**[URGENTE/IMPORTANTE/OPORTUNIDAD]** [Título corto de la recomendación]

📊 **Dato:** [el número o patrón que justifica esto]
💡 **Acción:** [qué hacer exactamente, en 1-2 oraciones concretas]
---

Tipos de recomendaciones a incluir (varía):
- Sobre el contenido que más funciona
- Sobre constancia o frecuencia de publicación
- Sobre el tipo de contenido que falta
- Sobre la audiencia y lo que piden
- Sobre oportunidades de monetización o conversión
- Sobre el formato o hook que deberían probar`

    const stream = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(chunk.delta.text))
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    })
  } catch (error) {
    console.error('Insights error:', error)
    return new Response(JSON.stringify({ error: 'Error al generar insights' }), { status: 500 })
  }
}
