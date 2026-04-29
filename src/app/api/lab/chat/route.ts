export const runtime = 'edge'

import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { message, context, history } = await req.json() as {
      message: string
      context: string
      history: { role: 'user' | 'assistant'; content: string }[]
    }

    const systemPrompt = `Eres un estratega de contenido digital experto. Tu trabajo es analizar piezas de contenido de redes sociales y ayudar al usuario a entender qué funciona y cómo adaptarlo a su marca.

${context}

Responde siempre en español. Sé directo, estratégico y accionable. Cuando des hooks o copys, ponlos en negrita o entre comillas para destacarlos. Usa emojis con moderación para organizar la información.`

    const messages = [
      ...history.filter(m => m.content.trim()).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const stream = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: systemPrompt,
      messages,
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
    return new Response(JSON.stringify({ error: 'Error en el chat' }), { status: 500 })
  }
}
