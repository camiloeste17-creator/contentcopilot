export const runtime = 'edge'

import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { BrandProfile } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface IGPost {
  caption: string
  likes: number
  comments: number
  type: string
  isReel: boolean
}

interface IGPublicProfile {
  username: string
  fullName: string
  followers: number
  following: number
  bio: string
  postCount: number
  posts: IGPost[]
  isVerified: boolean
}

async function fetchInstagramProfile(username: string): Promise<IGPublicProfile | null> {
  try {
    const res = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'x-ig-app-id': '936619743392459',
          'Accept': '*/*',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          'Referer': 'https://www.instagram.com/',
          'Origin': 'https://www.instagram.com',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Dest': 'empty',
          'X-Requested-With': 'XMLHttpRequest',
        },
        next: { revalidate: 0 },
      }
    )

    if (!res.ok) return null
    const data = await res.json()
    const user = data?.data?.user
    if (!user) return null

    const edges: { node: {
      edge_media_to_caption?: { edges: { node: { text: string } }[] }
      edge_liked_by?: { count: number }
      edge_media_to_comment?: { count: number }
      is_video?: boolean
      __typename?: string
    } }[] = user.edge_owner_to_timeline_media?.edges ?? []

    const posts: IGPost[] = edges.slice(0, 12).map(e => ({
      caption: e.node.edge_media_to_caption?.edges?.[0]?.node?.text?.slice(0, 200) ?? '',
      likes: e.node.edge_liked_by?.count ?? 0,
      comments: e.node.edge_media_to_comment?.count ?? 0,
      type: e.node.__typename ?? 'GraphImage',
      isReel: e.node.is_video === true || e.node.__typename === 'GraphVideo',
    }))

    return {
      username: user.username,
      fullName: user.full_name,
      followers: user.edge_followed_by?.count ?? 0,
      following: user.edge_follow?.count ?? 0,
      bio: user.biography ?? '',
      postCount: user.edge_owner_to_timeline_media?.count ?? 0,
      posts,
      isVerified: user.is_verified ?? false,
    }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { username, platform, brand } = await req.json() as {
      username: string
      platform: string
      brand: BrandProfile | null
    }

    if (!username?.trim()) {
      return new Response(JSON.stringify({ error: 'Ingresa un username' }), { status: 400 })
    }

    const clean = username.replace('@', '').trim()

    // Fetch real profile data if Instagram
    let profileData: IGPublicProfile | null = null
    if (!platform || platform === 'Instagram') {
      profileData = await fetchInstagramProfile(clean)
    }

    const brandContext = brand?.niche
      ? `MI MARCA:
- Nicho: ${brand.niche}
- Negocio: ${brand.business_type || 'Sin definir'}
- Tono: ${brand.tone || 'Sin definir'}
- Posicionamiento: ${brand.positioning || 'Sin definir'}
- Diferencial: ${brand.differentials || 'Sin definir'}
- Audiencia: ${brand.target_audience || 'Sin definir'}`
      : 'Sin contexto de marca configurado.'

    let referentContext: string
    if (profileData) {
      const topPosts = [...profileData.posts]
        .sort((a, b) => (b.likes + b.comments * 3) - (a.likes + a.comments * 3))
        .slice(0, 6)

      const reelCount = profileData.posts.filter(p => p.isReel).length
      const avgLikes = profileData.posts.length
        ? Math.round(profileData.posts.reduce((s, p) => s + p.likes, 0) / profileData.posts.length)
        : 0
      const avgComments = profileData.posts.length
        ? Math.round(profileData.posts.reduce((s, p) => s + p.comments, 0) / profileData.posts.length)
        : 0

      referentContext = `DATOS REALES DEL REFERENTE @${profileData.username} (extraídos de Instagram):
- Nombre: ${profileData.fullName}
- Seguidores: ${profileData.followers.toLocaleString('es')}
- Siguiendo: ${profileData.following.toLocaleString('es')}
- Total de publicaciones: ${profileData.postCount}
- Verificado: ${profileData.isVerified ? 'Sí' : 'No'}
- Biografía: "${profileData.bio}"
- De los últimos ${profileData.posts.length} posts: ${reelCount} son videos/reels
- Promedio de likes por post: ${avgLikes.toLocaleString('es')}
- Promedio de comentarios por post: ${avgComments}

SUS ${topPosts.length} POSTS CON MÁS ENGAGEMENT (los más virales):
${topPosts.map((p, i) => `
Post ${i + 1} — ${p.isReel ? '🎬 Video/Reel' : '🖼 Imagen'} | ${p.likes.toLocaleString('es')} likes | ${p.comments} comentarios
Caption: "${p.caption || 'Sin caption'}"
`).join('')}

TODOS SUS POSTS RECIENTES (para analizar patrones):
${profileData.posts.map((p, i) => `${i + 1}. [${p.isReel ? 'Video' : 'Imagen'}] ${p.likes.toLocaleString('es')} likes | "${p.caption?.slice(0, 100) || 'Sin caption'}"`).join('\n')}`
    } else {
      referentContext = `No se pudo obtener el perfil de @${clean} en ${platform || 'Instagram'} (perfil privado o no encontrado).
Haz el análisis basado en tu conocimiento sobre este tipo de cuenta y el nicho.`
    }

    const prompt = `${brandContext}

${referentContext}

Analiza estratégicamente este referente y genera un informe para que el usuario pueda aprender de él sin copiarlo.

## 📊 PERFIL DEL REFERENTE
[Resumen de quién es, qué hace, qué tan grande es, qué los hace populares. Máximo 3-4 oraciones con datos concretos.]

## 🎯 PATRÓN DE CONTENIDO
[Analiza los posts reales: ¿Qué tipo de contenido publica más? ¿Videos o imágenes? ¿Qué temas repiten? ¿Qué formatos? ¿Con qué frecuencia parecen publicar?]

## 🎣 HOOKS Y ESTILO DE APERTURA
[Basándote en las captions reales, ¿cómo abren sus textos? ¿Qué tipo de hooks usan? ¿Qué palabras repiten? Da ejemplos de sus captions más exitosas.]

## 💪 QUÉ LES FUNCIONA MÁS
[Compara likes y comentarios de los posts. ¿Qué tipo de contenido genera más engagement? ¿Los videos o las fotos? ¿Qué temas? ¿Por qué crees que conecta?]

## 🔍 GAPS Y OPORTUNIDADES
[¿Qué temas NO cubre? ¿Qué ángulos no explora? ¿Qué necesidades de la audiencia están desatendidas? ¿Dónde está el espacio libre?]

## ✨ CÓMO DIFERENCIARTE SIN COPIAR
[3 formas concretas de tomar inspiración pero ejecutarlas desde el posicionamiento único de la marca del usuario. Sé específico con el nicho y tono de la marca.]

## 💡 3 IDEAS ADAPTADAS A TU MARCA
[Basadas en los posts más exitosos del referente, genera 3 ideas de contenido para la marca del usuario. Cada una con: hook específico listo para usar + ángulo + por qué funcionaría.]

## ⚠️ QUÉ NO DEBERÍAS COPIAR
[Algo del estilo, formato o posicionamiento de este referente que podría dañar la autenticidad o diferenciación de la marca del usuario.]`

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
    console.error('Competitors error:', error)
    return new Response(JSON.stringify({ error: 'Error al analizar referente' }), { status: 500 })
  }
}
