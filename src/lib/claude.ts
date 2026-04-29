import Anthropic from '@anthropic-ai/sdk'
import { BrandProfile, ContentObjective, ContentType, Platform } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

function buildBrandContext(brand: BrandProfile): string {
  return `
CONTEXTO DE MARCA:
- Nombre/Marca: ${brand.name}
- Nicho: ${brand.niche}
- Tipo de negocio: ${brand.business_type}
- Público objetivo: ${brand.target_audience}
- Propuesta de valor: ${brand.value_proposition}
- Dolor principal del cliente: ${brand.main_pain}
- Deseo principal: ${brand.main_desire}
- Objeciones frecuentes: ${brand.objections}
- Diferenciales: ${brand.differentials}
- Promesa de marca: ${brand.promise}
- Tono de comunicación: ${brand.tone}
- Personaje: ${brand.character}
- Posicionamiento: ${brand.positioning}
`.trim()
}

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

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  hook: 'Hooks poderosos',
  storytelling: 'Storytelling personal o de clientes',
  educational: 'Contenido educativo / tutorial',
  authority: 'Contenido de autoridad / opinión',
  sale: 'Contenido de venta',
  trend: 'Tendencias adaptadas a la marca',
  competitor: 'Inspirado en referentes (sin copiar)',
}

export async function generateIdeas(params: {
  brand: BrandProfile
  objective: ContentObjective
  platform: Platform
  contentTypes: ContentType[]
  extraContext?: string
}): Promise<string> {
  const { brand, objective, platform, contentTypes, extraContext } = params

  const systemPrompt = `Eres el copiloto estratégico de contenido de ${brand.name}.
Eres experto en marketing de contenidos, copywriting y estrategia de marca personal.
Tu trabajo es generar ideas de contenido AUTÉNTICAS, estratégicas y alineadas exactamente con la marca del usuario.
NUNCA generes contenido genérico. Siempre usa el contexto de marca como base.
Responde SIEMPRE en español.`

  const userPrompt = `${buildBrandContext(brand)}

INSTRUCCIÓN:
Genera 4 ideas de videos para ${PLATFORM_LABELS[platform]} con objetivo de "${OBJECTIVE_LABELS[objective]}".

Tipos de contenido a incluir: ${contentTypes.map(t => CONTENT_TYPE_LABELS[t]).join(', ')}
${extraContext ? `Contexto adicional: ${extraContext}` : ''}

Para CADA idea entrega este formato exacto:

---
## IDEA [número]: [título atractivo de la idea]

**Tipo:** [tipo de contenido]
**Objetivo:** [objetivo]

**🎣 HOOK** (máx 10 palabras, debe generar curiosidad o tensión inmediata):
[el hook]

**📐 ÁNGULO:** [cómo está contado: error/revelación/historia/dato/opinión/pregunta]

**🗂 ESTRUCTURA:**
- 0-3s: [qué pasa en la apertura]
- 3-20s: [desarrollo principal]
- 20-40s: [punto clave / clímax]
- 40-50s: [cierre + CTA]

**📝 GUION CORTO** (máx 180 palabras, tono conversacional y auténtico):
[guion completo]

**📱 CAPTION** (optimizado para ${PLATFORM_LABELS[platform]}, incluye emojis y hashtags relevantes):
[caption completo]

**💡 POR QUÉ FUNCIONA PARA ESTA MARCA:**
[1-2 oraciones explicando la alineación estratégica]
---

IMPORTANTE: Cada idea debe sonar EXACTAMENTE como ${brand.character}, con tono ${brand.tone}, hablándole directamente a ${brand.target_audience}.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}

export async function generateCopy(params: {
  brand: BrandProfile
  copyType: string
  platform: Platform
  topic: string
}): Promise<string> {
  const { brand, copyType, platform, topic } = params

  const systemPrompt = `Eres el experto en copywriting y SEO de ${brand.name}.
Generas copies que convierten, auténticos y alineados con la marca.
Responde siempre en español.`

  const userPrompt = `${buildBrandContext(brand)}

Genera un ${copyType} para ${PLATFORM_LABELS[platform]} sobre el siguiente tema:
"${topic}"

El copy debe:
- Sonar como ${brand.character}
- Tener tono ${brand.tone}
- Hablarle directamente a ${brand.target_audience}
- Incluir un CTA claro al final
- Estar optimizado para ${PLATFORM_LABELS[platform]}

Entrega 3 variaciones distintas, de menor a mayor agresividad en la venta.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}

export async function analyzeBrandFromAnswers(answers: Record<string, string>): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: 'Eres un estratega de marca experto. Analiza las respuestas del usuario y genera un resumen estratégico de su marca. Responde en español.',
    messages: [{
      role: 'user',
      content: `Basándote en estas respuestas del creador de contenido, genera un análisis de marca conciso con: propuesta de valor clara, diferencial principal, promesa de marca y tono recomendado.

Respuestas:
${Object.entries(answers).map(([k, v]) => `${k}: ${v}`).join('\n')}

Formato: párrafos cortos, directo, estratégico.`,
    }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
