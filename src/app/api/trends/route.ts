export const runtime = 'edge'

import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { BrandProfile } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { trend, brand } = await req.json() as { trend: string; brand: BrandProfile | null }

    if (!trend?.trim()) {
      return new Response(JSON.stringify({ error: 'Sin tendencia para analizar' }), { status: 400 })
    }

    const brandContext = brand?.niche
      ? `MARCA: ${brand.name || 'Sin nombre'} | Nicho: ${brand.niche} | Tono: ${brand.tone || 'Sin definir'} | Posicionamiento: ${brand.positioning || 'Sin definir'}`
      : 'Sin contexto de marca configurado'

    const prompt = `${brandContext}

El creador quiere adaptar esta tendencia a su marca:
"${trend}"

Analiza si encaja con la marca y genera adaptaciones estratégicas.

## ✅ ENCAJE CON LA MARCA
[Evalúa del 1-10 qué tan bien encaja esta tendencia con el posicionamiento de la marca y explica por qué]

## 🎯 3 ADAPTACIONES CONCRETAS
[Para cada una: título de la idea, hook específico, por qué funcionaría para esta marca]

### Adaptación 1: [título]
**Hook:** [el hook exacto, máx 10 palabras]
**Desarrollo:** [cómo ejecutarla en 2-3 oraciones]
**Por qué funciona:** [alineación con la marca]

### Adaptación 2: [título]
**Hook:** [el hook exacto]
**Desarrollo:** [cómo ejecutarla]
**Por qué funciona:** [alineación con la marca]

### Adaptación 3: [título]
**Hook:** [el hook exacto]
**Desarrollo:** [cómo ejecutarla]
**Por qué funciona:** [alineación con la marca]

## ⚠️ ADVERTENCIAS
[¿Hay algo de esta tendencia que podría dañar el posicionamiento o credibilidad de la marca? Sé honesto. Si no hay advertencias reales, escribe "Ninguna — esta tendencia encaja bien con tu marca."]

## 💡 CONSEJO ESTRATÉGICO
[Una recomendación final sobre si hacerla, cómo hacerla y cuándo publicarla]`

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
    console.error('Trends error:', error)
    return new Response(JSON.stringify({ error: 'Error al analizar tendencia' }), { status: 500 })
  }
}
