export const runtime = 'edge'

import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { comments, context } = await req.json() as { comments: string; context?: string }
    if (!comments?.trim()) return new Response(JSON.stringify({ error: 'Sin comentarios' }), { status: 400 })

    const prompt = `Analiza estos comentarios de una pieza de contenido y extrae insights estratégicos para un creador de contenido.
${context ? `Contexto del contenido: ${context}` : ''}

COMENTARIOS:
${comments}

Responde en JSON estricto:
{
  "frequentQuestions": ["pregunta 1 con sus variaciones", "pregunta 2", "..."],
  "objections": ["objeción 1 textual o parafraseada", "objeción 2", "..."],
  "hiddenDesires": ["deseo oculto detectado 1", "deseo 2", "..."],
  "painPoints": ["dolor repetido 1 con frase textual si existe", "dolor 2", "..."],
  "audiencePhrases": ["frase exacta que usa la audiencia 1", "frase 2", "frase 3", "..."],
  "contentIdeas": ["idea de contenido derivada de los comentarios 1", "idea 2", "idea 3", "idea 4", "idea 5"],
  "productOpportunities": ["oportunidad de producto/servicio/bono detectada 1", "oportunidad 2", "oportunidad 3"]
}`

    const resp = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = resp.content[0].type === 'text' ? resp.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Error al analizar comentarios' }), { status: 500 })
  }
}
