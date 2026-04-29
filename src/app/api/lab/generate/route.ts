export const runtime = 'edge'

import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { BrandProfile } from '@/types'
import { LabAnalysis, ContentCategory, ContentPlatform } from '@/types/lab'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { analysis, brand, platform, category } = await req.json() as {
      analysis: LabAnalysis
      brand: BrandProfile | null
      platform: ContentPlatform
      category: ContentCategory
    }

    const brandCtx = brand ? `
MARCA DEL USUARIO:
- Nombre: ${brand.name || 'Sin definir'}
- Nicho: ${brand.niche}
- Tipo de negocio: ${brand.business_type || 'Sin definir'}
- Audiencia: ${brand.target_audience || 'Sin definir'}
- Propuesta de valor: ${brand.value_proposition || 'Sin definir'}
- Dolor principal del cliente: ${brand.main_pain || 'Sin definir'}
- Tono de comunicación: ${brand.tone || 'Sin definir'}
- Personaje en cámara: ${brand.character || 'Sin definir'}
- Posicionamiento: ${brand.positioning || 'Sin definir'}
- Diferencial: ${brand.differentials || 'Sin definir'}
- Promesa: ${brand.promise || 'Sin definir'}` : 'Sin información de marca configurada.'

    const prompt = `Actúa como el estratega de contenido de esta marca. Tienes el análisis de un contenido de referencia y debes generar ideas originales adaptadas 100% a la marca, sin copiar.

${brandCtx}

ANÁLISIS DEL CONTENIDO DE REFERENCIA:
- Hook analizado: "${analysis.hook}"
- Promesa: "${analysis.promise}"
- Dolor/Deseo que activa: "${analysis.painOrDesire}"
- Tipo de contenido: ${analysis.contentType}
- Ángulo de venta: "${analysis.salesAngle}"
- Estructura: ${analysis.structure.join(' → ')}
- Qué funcionó: ${analysis.whatWorked.join(', ')}
- CTA usado: "${analysis.cta}"
- Emociones generadas: ${analysis.emotions.join(', ')}

Genera en JSON estricto (sin markdown):
{
  "ideas": [
    "idea completa 1 adaptada al nicho de la marca",
    "idea completa 2",
    "idea completa 3",
    "idea completa 4",
    "idea completa 5",
    "idea completa 6",
    "idea completa 7",
    "idea completa 8",
    "idea completa 9",
    "idea completa 10"
  ],
  "hooks": [
    "hook 1 listo para decir en cámara, adaptado al nicho",
    "hook 2",
    "hook 3",
    "hook 4",
    "hook 5"
  ],
  "scripts": [
    "guion corto completo 1 (150-180 palabras, listo para grabar, con el tono de la marca)",
    "guion corto completo 2",
    "guion corto completo 3"
  ],
  "salesAngles": [
    "ángulo de venta 1 adaptado al producto/servicio de la marca",
    "ángulo de venta 2",
    "ángulo de venta 3"
  ],
  "ctas": [
    "CTA 1 que suene natural para esta marca",
    "CTA 2",
    "CTA 3"
  ],
  "seoTitles": [
    "título SEO 1 para video/post",
    "título SEO 2",
    "título SEO 3",
    "título SEO 4",
    "título SEO 5"
  ],
  "instagramCaptions": [
    "caption completo 1 listo para publicar con emojis y hashtags",
    "caption completo 2",
    "caption completo 3",
    "caption completo 4",
    "caption completo 5"
  ],
  "metaAdsIdeas": [
    "idea de anuncio Meta Ads 1 con copy de apertura",
    "idea de anuncio Meta Ads 2",
    "idea de anuncio Meta Ads 3"
  ],
  "organicIdeas": [
    "idea contenido orgánico 1",
    "idea contenido orgánico 2",
    "idea contenido orgánico 3"
  ],
  "storytellingIdeas": [
    "idea storytelling personal 1 con gancho emocional",
    "idea storytelling personal 2",
    "idea storytelling personal 3"
  ]
}`

    const stream = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 5000,
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
    return new Response(JSON.stringify({ error: 'Error al generar ideas' }), { status: 500 })
  }
}
