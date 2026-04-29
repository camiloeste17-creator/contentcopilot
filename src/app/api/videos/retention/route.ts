export const runtime = 'edge'

import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { BrandProfile } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { videoData, brand } = await req.json() as {
      videoData: {
        caption?: string
        duration?: number
        plays?: number
        reach?: number
        likes?: number
        comments?: number
        saves?: number
        shares?: number
        avgWatchTime?: number
        retentionPoints?: { second: number; pct: number }[]
        peakRetentionSecond?: number
        dropSecond?: number
      }
      brand: BrandProfile | null
    }

    const brandCtx = brand?.niche
      ? `MARCA: ${brand.name || ''} | Nicho: ${brand.niche} | Audiencia: ${brand.target_audience || 'Sin definir'}`
      : ''

    const plays = videoData.plays ?? 0
    const reach = videoData.reach ?? 0
    const avgWatch = videoData.avgWatchTime ?? 0
    const duration = videoData.duration ?? 0
    const retentionPct = duration > 0 && avgWatch > 0 ? ((avgWatch / duration) * 100).toFixed(0) : null
    const likes = videoData.likes ?? 0
    const saves = videoData.saves ?? 0
    const comments = videoData.comments ?? 0
    const shares = videoData.shares ?? 0
    const base = plays > 0 ? plays : reach
    const engRate = base > 0 ? (((likes + comments + saves + shares) / base) * 100).toFixed(1) : '0'
    const saveRate = base > 0 ? ((saves / base) * 100).toFixed(1) : '0'

    const retentionCurve = videoData.retentionPoints?.length
      ? `CURVA DE RETENCIÓN (segundo → % de audiencia que sigue viendo):
${videoData.retentionPoints.map(p => `  ${p.second}s → ${p.pct}%`).join('\n')}
${videoData.peakRetentionSecond ? `Segundo con mayor retención: ${videoData.peakRetentionSecond}s` : ''}
${videoData.dropSecond ? `Caída más fuerte: alrededor del segundo ${videoData.dropSecond}` : ''}`
      : 'Curva de retención: no ingresada'

    const prompt = `${brandCtx}

Analiza en profundidad el rendimiento de este video de Instagram:

MÉTRICAS DEL VIDEO:
- Reproducciones totales: ${plays > 0 ? plays.toLocaleString('es') : 'No disponible'}
- Alcance: ${reach > 0 ? reach.toLocaleString('es') : 'No disponible'}
- Likes: ${likes}
- Comentarios: ${comments}
- Guardados: ${saves}
- Compartidos: ${shares}
- Interacciones totales: ${likes + comments + saves + shares}
- Engagement rate: ${engRate}%
- Tasa de guardado: ${saveRate}%
${duration > 0 ? `- Duración del video: ${duration} segundos` : ''}
${avgWatch > 0 ? `- Tiempo promedio de visualización: ${avgWatch} segundos${retentionPct ? ` (${retentionPct}% del video)` : ''}` : ''}

${retentionCurve}

CAPTION:
"${videoData.caption?.slice(0, 200) ?? 'Sin caption'}"

Entrega un análisis estratégico completo:

## 🎣 DIAGNÓSTICO DEL HOOK
[Analiza los primeros 3-5 segundos basándote en la retención inicial. ¿La gente se quedó? ¿Cuánto cayó desde el inicio?]

## 📉 ANÁLISIS DE RETENCIÓN
${videoData.retentionPoints?.length
  ? '[Describe la curva: dónde cayó más fuerte, por qué pudo haber sido, cuál fue el momento más fuerte, qué parte recuperó atención. Sé específico con los segundos.]'
  : '[No hay curva ingresada. Analiza el engagement general y el tiempo promedio de visualización para inferir patrones.]'}

## 💪 PARTE MÁS FUERTE DEL VIDEO
[El segmento con más retención o el que generó más guardados/compartidos. Por qué funcionó.]

## ⚠️ PARTE MÁS DÉBIL
[Dónde cayó la retención o qué métrica está por debajo del promedio. Hipótesis del por qué.]

## 👥 QUÉ CONECTÓ CON LA AUDIENCIA
[Basado en guardados, compartidos y comentarios: qué parte del contenido resonó más y por qué.]

## 📊 PUNTUACIÓN
Hook: [X/10] | Retención: [X/10] | Engagement: [X/10] | CTA: [X/10]

## 🚀 ¿VALE LA PENA PAUTARLO?
[Análisis concreto: si el engagement rate y save rate justifican invertir en pauta. Qué umbral mínimo necesitaría para ser rentable.]

## 📋 RECOMENDACIONES PARA EL PRÓXIMO VIDEO
[3-5 acciones concretas y específicas basadas en lo que mostraron las métricas reales de este video]`

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
        } catch (err) { controller.error(err) }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    })
  } catch (error) {
    console.error('Retention analyze error:', error)
    return new Response(JSON.stringify({ error: 'Error al analizar' }), { status: 500 })
  }
}
