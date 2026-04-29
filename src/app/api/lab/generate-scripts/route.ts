export const runtime = 'edge'

import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { referentes, vozPrompt, outputType } = await req.json() as {
      referentes: {
        title: string
        transcript: string
        hook?: string
        structure?: string[]
        platform: string
        url?: string
      }[]
      vozPrompt: string
      outputType: 'scripts' | 'hooks' | 'captions' | 'all'
    }

    if (!referentes?.length || !vozPrompt?.trim()) {
      return new Response(JSON.stringify({ error: 'Faltan datos' }), { status: 400 })
    }

    const referentesContext = referentes.map((r, i) => `
REFERENTE ${i + 1} — ${r.platform.toUpperCase()}${r.url ? ` (${r.url})` : ''}:
Título/Caption: ${r.title || 'Sin título'}
${r.hook ? `Hook detectado: "${r.hook}"` : ''}
${r.structure?.length ? `Estructura: ${r.structure.join(' → ')}` : ''}
Contenido/Transcripción:
${(r.transcript || '').slice(0, 800)}
`).join('\n---\n')

    const prompt = `Eres un ghostwriter experto. Tu trabajo es tomar los PATRONES de contenido de referentes exitosos y adaptarlos COMPLETAMENTE a la voz, esencia y estilo de comunicación del creador.

MI VOZ Y ESENCIA (cómo me comunico, quién soy, cómo hablo):
${vozPrompt}

REFERENTES A ANALIZAR (extraer patrones, NO copiar):
${referentesContext}

INSTRUCCIONES:
1. Analiza los patrones de los referentes: hooks, estructura, ritmo, palabras clave, ángulos
2. Usa esos PATRONES como base, pero escribe con la voz y esencia que el creador describió
3. El resultado debe sonar 100% como el creador, NO como el referente
4. Sé específico, concreto y auténtico — nada genérico

${outputType === 'all' || outputType === 'scripts' ? `
GENERA 3 GUIONES COMPLETOS:
Para cada guion usa este formato:

### GUION [N]: [título descriptivo interno]
**Patrón tomado de:** [qué aprendiste del referente y adaptaste]
**Hook (primeras 3-5 palabras en cámara):**
[el hook exacto como lo diría el creador]

**Guion completo:**
[El guion completo, mínimo 150 palabras, escrito como habla el creador, con pausas naturales, frases cortas, momentos de tensión y conexión emocional. Listo para grabar.]

**CTA natural:**
[cómo terminaría el creador este video]
` : ''}

${outputType === 'all' || outputType === 'hooks' ? `
GENERA 5 HOOKS:
Basados en los patrones de los referentes pero con la voz del creador.
Formato: una línea por hook, numerados.
` : ''}

${outputType === 'all' || outputType === 'captions' ? `
GENERA 3 CAPTIONS PARA INSTAGRAM:
Con el estilo de escritura del creador. Incluye emojis si encajan con su voz, y hashtags al final.
` : ''}`

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
    console.error(e)
    return new Response(JSON.stringify({ error: 'Error al generar' }), { status: 500 })
  }
}
