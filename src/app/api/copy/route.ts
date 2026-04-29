export const runtime = 'edge'

import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { BrandProfile, Platform } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { brand, copyType, platform, topic } = body as {
      brand: BrandProfile
      copyType: string
      platform: Platform
      topic: string
    }

    if (!brand || !copyType || !platform || !topic) {
      return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), { status: 400 })
    }

    const systemPrompt = `Eres el experto en copywriting y SEO de ${brand.name || 'esta marca'}.
Generas copies que convierten, auténticos y alineados con la marca.
Responde siempre en español.`

    const userPrompt = `CONTEXTO DE MARCA:
- Nicho: ${brand.niche}
- Público objetivo: ${brand.target_audience || 'Sin definir'}
- Tono: ${brand.tone || 'Sin definir'}
- Personaje: ${brand.character || 'Sin definir'}
- Dolor principal del cliente: ${brand.main_pain || 'Sin definir'}
- Diferenciales: ${brand.differentials || 'Sin definir'}

Genera un ${copyType} para ${PLATFORM_LABELS[platform]} sobre:
"${topic}"

El copy debe:
- Sonar exactamente como ${brand.character || 'el creador'}
- Tener tono ${brand.tone || 'auténtico y cercano'}
- Hablarle directamente a ${brand.target_audience || 'la audiencia'}
- Incluir un CTA claro al final
- Estar optimizado para ${PLATFORM_LABELS[platform]}

Entrega 3 variaciones con este formato:

---
**Variación 1 — [estilo: suave/directo/agresivo]:**
[el copy completo]

---
**Variación 2 — [estilo]:**
[el copy completo]

---
**Variación 3 — [estilo]:**
[el copy completo]
---`

    const stream = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
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
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error generating copy:', error)
    return new Response(JSON.stringify({ error: 'Error al generar copy' }), { status: 500 })
  }
}
