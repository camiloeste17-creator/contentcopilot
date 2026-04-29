export const runtime = 'edge'

import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { BrandProfile } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { comments, brand } = await req.json() as {
      comments: string
      brand: BrandProfile | null
    }

    if (!comments?.trim()) {
      return new Response(JSON.stringify({ error: 'Sin comentarios para analizar' }), { status: 400 })
    }

    const brandContext = brand?.niche
      ? `CONTEXTO DE MARCA:\n- Nicho: ${brand.niche}\n- Público objetivo: ${brand.target_audience || 'Sin definir'}\n- Producto/servicio: ${brand.business_type || 'Sin definir'}\n`
      : ''

    const prompt = `${brandContext}
Analiza estos comentarios de redes sociales y extrae insights estratégicos profundos.
Los comentarios están separados por líneas o numerados:

---
${comments.trim()}
---

Entrega el análisis con EXACTAMENTE esta estructura:

## 🔥 DOLORES DETECTADOS
[Lista los 5 dolores principales que aparecen en los comentarios. Usa frases textuales cuando puedas. Indica cuántas veces aparece cada uno.]

## ❓ PREGUNTAS FRECUENTES
[Las preguntas reales que hace la audiencia. Agrupadas por tema. Incluye ejemplos textuales.]

## 🚫 OBJECIONES IDENTIFICADAS
[Razones por las que no compran o no actúan. Frases textuales de los comentarios cuando sea posible.]

## 💬 LENGUAJE DE LA AUDIENCIA
[Palabras, expresiones y frases exactas que usa esta audiencia. Estas son oro para tu copy.]

## 📊 TIPO DE CONTENIDO CON MÁS INTERACCIÓN
[Qué tipo de posts o videos generaron más comentarios y por qué.]

## 💡 OPORTUNIDADES DE CONTENIDO
[5 ideas de contenido concretas basadas en los dolores y preguntas detectados. Cada una con el ángulo específico.]

## 💰 OPORTUNIDADES DE VENTA
[Momentos o señales en los comentarios que indican intención de compra. Cómo aprovecharlos.]

## ⚡ INSIGHT PRINCIPAL
[El hallazgo más importante de este análisis en 2-3 oraciones. Lo que más deberías saber.]

Sé específico, usa datos del análisis real. No generalices.`

    const stream = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
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
    console.error('Audience analysis error:', error)
    return new Response(JSON.stringify({ error: 'Error al analizar comentarios' }), { status: 500 })
  }
}
