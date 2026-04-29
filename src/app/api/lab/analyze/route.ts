export const runtime = 'edge'

import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { BrandProfile } from '@/types'
import { ContentCategory, ContentPlatform } from '@/types/lab'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PLATFORM_LABELS: Record<ContentPlatform, string> = {
  instagram: 'Instagram Reel/Post', tiktok: 'TikTok', youtube: 'YouTube Short',
  linkedin: 'LinkedIn Post', facebook: 'Facebook/Meta Ad', otro: 'Contenido digital',
}

const CATEGORY_LABELS: Record<ContentCategory, string> = {
  referente: 'Referente del nicho', competidor: 'Competidor directo',
  propio: 'Pieza propia', anuncio: 'Anuncio pagado',
  trend: 'Tendencia viral', storytelling: 'Storytelling',
  educativo: 'Contenido educativo', venta: 'Contenido de venta', autoridad: 'Contenido de autoridad',
}

export async function POST(req: NextRequest) {
  try {
    const { url, title, description, transcript, platform, category, brand } = await req.json() as {
      url?: string
      title?: string
      description?: string
      transcript?: string
      platform: ContentPlatform
      category: ContentCategory
      brand: BrandProfile | null
    }

    const context = [
      url ? `URL: ${url}` : '',
      title ? `Título/Caption: ${title}` : '',
      description ? `Descripción adicional: ${description}` : '',
      transcript ? `Transcripción/Texto del contenido:\n${transcript}` : '',
    ].filter(Boolean).join('\n')

    if (!context.trim()) {
      return new Response(JSON.stringify({ error: 'Agrega al menos un título, descripción o transcripción' }), { status: 400 })
    }

    const brandCtx = brand?.niche
      ? `\nMI MARCA (para cruzar el análisis):
Nicho: ${brand.niche} | Audiencia: ${brand.target_audience || 'N/A'} | Tono: ${brand.tone || 'N/A'} | Posicionamiento: ${brand.positioning || 'N/A'}`
      : ''

    const prompt = `Actúa como un estratega de contenido experto analizando una pieza de contenido digital.
${brandCtx}

CONTENIDO A ANALIZAR:
Plataforma: ${PLATFORM_LABELS[platform]}
Tipo de pieza: ${CATEGORY_LABELS[category]}
${context}

Analiza esta pieza en profundidad y responde en JSON estricto con esta estructura exacta:

{
  "hook": "el hook principal exacto o reconstruido si solo tienes el caption",
  "promise": "qué promete el contenido al espectador/lector",
  "painOrDesire": "qué dolor o deseo específico activa",
  "targetAudience": "a quién está dirigido con precisión",
  "contentType": "uno de: educativo|storytelling|autoridad|venta|tendencia|prueba_social|polemica|tutorial|comparacion",
  "structure": ["paso 1 del contenido", "paso 2", "paso 3", "..."],
  "keyMoment": "en qué momento/segundo/parte ocurre el giro o punto más fuerte",
  "retentionElements": ["elemento 1 que retiene", "elemento 2", "..."],
  "cta": "el call to action usado (implícito o explícito)",
  "emotions": ["emoción 1", "emoción 2", "..."],
  "keywords": ["keyword 1", "keyword 2", "keyword 3", "..."],
  "salesAngle": "el ángulo de venta o persuasión principal",
  "commercialIntent": "bajo|medio|alto",
  "whatWorked": ["qué hace bien 1", "qué hace bien 2", "qué hace bien 3"],
  "whatToImprove": ["qué podría mejorar 1", "qué podría mejorar 2"],
  "whyItWorked": "explicación estratégica de por qué este contenido funciona o podría funcionar",
  "badges": ["badge relevante de: Hook fuerte|Venta directa|Storytelling|Trend|Alta retención|Buen CTA|Educativo|Autoridad|Viral potential"]
}

Responde SOLO con el JSON, sin markdown, sin explicaciones adicionales.`

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
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Error al analizar' }), { status: 500 })
  }
}
