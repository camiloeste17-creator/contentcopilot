export const runtime = 'edge'

import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { BrandProfile, ContentObjective, ContentType, Platform } from '@/types'
import { getRandomHooks, getRandomTechniques, STORYTELLING_TECHNIQUES } from '@/lib/storytelling-data'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const OBJECTIVE_LABELS: Record<ContentObjective, string> = {
  attract: 'Atraer nueva audiencia',
  educate: 'Educar a la audiencia',
  sell: 'Vender / Convertir',
  authority: 'Posicionar autoridad',
  community: 'Construir comunidad',
  remarketing: 'Remarketing / Retención',
}

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram Reels',
  tiktok: 'TikTok',
  youtube: 'YouTube Shorts',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { brand, objective, platform, contentTypes, extraContext, technique } = body as {
      brand: BrandProfile
      objective: ContentObjective
      platform: Platform
      contentTypes: ContentType[]
      extraContext?: string
      technique?: keyof typeof STORYTELLING_TECHNIQUES
    }

    if (!brand?.niche || !objective || !platform || !contentTypes?.length) {
      return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), { status: 400 })
    }

    // Pick 4 different real hooks and techniques from the PDF
    const assignedHooks = getRandomHooks(4)
    const assignedTechniques = technique
      ? Array(4).fill(STORYTELLING_TECHNIQUES[technique].prompt)
      : getRandomTechniques(4)

    const scriptInstruction = brand.script_structure
      ? `ESTRUCTURA DE GUION DEL CREADOR (respétala en cada guion, es obligatoria):
---
${brand.script_structure}
---`
      : `Sin estructura fija definida. Sigue el flujo natural de la técnica de storytelling asignada.`

    const systemPrompt = `Eres el escritor de contenido de ${brand.name || 'esta marca'}. Conoces su voz íntimamente.

REGLAS ABSOLUTAS — NUNCA las rompas:
1. NUNCA uses estas frases: "hoy te voy a enseñar", "en este video aprenderás", "sin más preámbulos", "espero que te sirva", "te comparto", "en este reel".
2. NUNCA hagas listas de tips sin profundidad real. Si mencionas 3 cosas, desarrolla al menos una con detalle real.
3. NUNCA empieces el hook con "Hola" o presentándote.
4. SIEMPRE escribe el guion como si el creador lo fuera a grabar mañana — lenguaje hablado, no escrito.
5. SIEMPRE incluye detalles específicos del nicho, nunca generalices.
6. Cada idea DEBE usar el hook y la técnica asignada. No los ignores.
7. El hook se escribe TAL CUAL va a decir en cámara, no como descripción.
8. Responde en español.`

    const userPrompt = `MARCA:
- Nombre: ${brand.name || 'Sin definir'}
- Nicho: ${brand.niche}
- Negocio: ${brand.business_type || 'Sin definir'}
- Audiencia: ${brand.target_audience || 'Sin definir'}
- Propuesta de valor: ${brand.value_proposition || 'Sin definir'}
- Dolor #1 del cliente: ${brand.main_pain || 'Sin definir'}
- Deseo principal: ${brand.main_desire || 'Sin definir'}
- Objeciones: ${brand.objections || 'Sin definir'}
- Diferenciales: ${brand.differentials || 'Sin definir'}
- Tono: ${brand.tone || 'Sin definir'}
- Personaje en cámara: ${brand.character || 'Sin definir'}
- Posicionamiento: ${brand.positioning || 'Sin definir'}

${scriptInstruction}

RED SOCIAL: ${PLATFORM_LABELS[platform]}
OBJETIVO: ${OBJECTIVE_LABELS[objective]}
${extraContext ? `CONTEXTO ADICIONAL: ${extraContext}` : ''}

ASIGNACIÓN POR IDEA (obligatorio respetar hook y técnica de cada una):

Idea 1:
- Hook base (adáptalo al nicho sin perder la esencia): "${assignedHooks[0].hook}" [Categoría: ${assignedHooks[0].category}]
- Técnica de storytelling: ${assignedTechniques[0]}

Idea 2:
- Hook base: "${assignedHooks[1].hook}" [Categoría: ${assignedHooks[1].category}]
- Técnica de storytelling: ${assignedTechniques[1]}

Idea 3:
- Hook base: "${assignedHooks[2].hook}" [Categoría: ${assignedHooks[2].category}]
- Técnica de storytelling: ${assignedTechniques[2]}

Idea 4:
- Hook base: "${assignedHooks[3].hook}" [Categoría: ${assignedHooks[3].category}]
- Técnica de storytelling: ${assignedTechniques[3]}

IMPORTANTE sobre el hook: No lo copies literal. Adáptalo al nicho y contexto específico de esta marca, manteniendo el mismo tipo de gancho emocional. El resultado debe sonar como ${brand.character || 'el creador'}, no como una plantilla.

Genera las 4 ideas con EXACTAMENTE este formato:

---
## IDEA [número]: [título interno descriptivo]

**Tipo de hook:** [nombre de la categoría]
**Técnica narrativa:** [nombre de la técnica]

**🎣 Hook:**
[El hook adaptado al nicho. Exactamente como lo diría en cámara. Sin puntos suspensivos innecesarios. Máx 15 palabras.]

**📝 Guion:**
${brand.script_structure
  ? '[Sigue la estructura del creador sección por sección. Mínimo 180 palabras. Lenguaje hablado, específico, con ejemplos concretos del nicho.]'
  : '[Aplica la técnica de storytelling asignada. Mínimo 180 palabras. Lenguaje hablado como si lo grabara ahora. Específico, con ejemplos concretos del nicho. Sin vaguedades.]'}

**📱 Caption:**
[Caption real listo para publicar. Empieza fuerte. Saltos de línea naturales. Emojis en contexto. Hashtags al final agrupados.]

**💡 Por qué funciona:**
[Por qué este hook + esta técnica conecta específicamente con ${brand.target_audience || 'esta audiencia'} dado su dolor "${brand.main_pain || 'principal'}".]
---

Recuerda: el guion debe sonar a ${brand.name || 'esta persona'} hablando en cámara, no a un texto de marketing.`

    const stream = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
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
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error generating ideas:', error)
    return new Response(JSON.stringify({ error: 'Error al generar ideas' }), { status: 500 })
  }
}
