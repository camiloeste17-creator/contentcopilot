export const runtime = 'edge'

import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { BrandProfile } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { video, brand } = await req.json() as {
      video: {
        caption?: string
        like_count?: number
        comments_count?: number
        timestamp: string
        insights?: {
          reach?: number
          impressions?: number
          plays?: number
          views?: number
          saved?: number
          shares?: number
          total_interactions?: number
          ig_reels_avg_watch_time?: number
          ig_reels_video_view_total_time?: number
          estimated_plays?: number
        }
      }
      brand: BrandProfile | null
    }

    const plays = video.insights?.views ?? video.insights?.plays ?? video.insights?.estimated_plays ?? 0
    const isEstimated = !video.insights?.views && !video.insights?.plays && !!video.insights?.estimated_plays
    const reach = video.insights?.reach ?? 0
    const saves = video.insights?.saved ?? 0
    const shares = video.insights?.shares ?? 0
    const totalInteractions = video.insights?.total_interactions ?? 0
    const likes = video.like_count ?? 0
    const comments = video.comments_count ?? 0
    const avgWatchMs = video.insights?.ig_reels_avg_watch_time ?? 0
    const avgWatchSec = avgWatchMs > 0 ? (avgWatchMs / 1000).toFixed(1) : null
    const base = plays > 0 ? plays : reach
    const engagementRate = base > 0 ? (((likes + comments + saves + shares) / base) * 100).toFixed(1) : '0'
    const saveRate = base > 0 ? ((saves / base) * 100).toFixed(2) : '0'
    const commentRate = base > 0 ? ((comments / base) * 100).toFixed(2) : '0'
    const shareRate = base > 0 ? ((shares / base) * 100).toFixed(2) : '0'

    const brandCtx = brand?.niche
      ? `MARCA: ${brand.name || 'Sin nombre'} | Nicho: ${brand.niche} | Audiencia: ${brand.target_audience || 'Sin definir'} | Tono: ${brand.tone || 'Sin definir'}`
      : ''

    const prompt = `${brandCtx}

Analiza el rendimiento de este video publicado en Instagram:

MÉTRICAS REALES:
- Reproducciones: ${plays > 0 ? `${plays.toLocaleString('es')}${isEstimated ? ' (estimado: tiempo total ÷ tiempo promedio)' : ''}` : 'No disponible'}
- Alcance (personas únicas): ${reach > 0 ? reach.toLocaleString('es') : 'No disponible'}
- Tiempo promedio de visualización: ${avgWatchSec ? `${avgWatchSec} segundos` : 'No disponible'}
- Likes: ${likes}
- Comentarios: ${comments}
- Guardados: ${saves}
- Compartidos: ${shares}
- Interacciones totales: ${totalInteractions}
- Tasa de engagement: ${engagementRate}%
- Tasa de guardado: ${saveRate}%
- Tasa de comentarios: ${commentRate}%
- Tasa de compartidos: ${shareRate}%

CAPTION DEL VIDEO:
"${video.caption?.slice(0, 300) ?? 'Sin caption'}"

Entrega el análisis con esta estructura exacta:

## 💪 PUNTO MÁS FUERTE
[Cuál es la métrica o característica más positiva de este video y qué indica]

## ⚠️ PUNTO MÁS DÉBIL
[Cuál es la métrica más preocupante y qué puede estar fallando]

## 🎣 DIAGNÓSTICO DEL HOOK
[Basado en las reproducciones vs alcance, ¿el hook funcionó? ¿La gente paró a ver el video?]

## 📊 QUÉ CONECTÓ CON LA AUDIENCIA
[Basado en comentarios, guardados y compartidos, qué parte del contenido resonó más]

## 🔍 QUÉ NO CONECTÓ
[Hipótesis basada en las métricas débiles sobre qué no funcionó]

## ⭐ PUNTUACIÓN
Hook: [X/10] | Contenido: [X/10] | CTA: [X/10]

## 🚀 ¿VALE LA PENA PAUTARLO?
[Sí/No y por qué, basado en las métricas reales]

## 📋 3 RECOMENDACIONES PARA EL PRÓXIMO VIDEO
[Acciones concretas y específicas basadas en lo que mostraron las métricas]`

    const stream = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
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
    console.error('Video analyze error:', error)
    return new Response(JSON.stringify({ error: 'Error al analizar video' }), { status: 500 })
  }
}
