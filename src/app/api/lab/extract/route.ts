export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

interface ExtractedContent {
  platform: string
  title: string
  description: string
  transcript: string
  thumbnailUrl?: string
  author?: string
  duration?: string
  source: 'youtube' | 'instagram' | 'tiktok' | 'meta' | 'unknown'
}

function detectPlatform(url: string): ExtractedContent['source'] {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube'
  if (/instagram\.com/.test(url)) return 'instagram'
  if (/tiktok\.com/.test(url)) return 'tiktok'
  if (/facebook\.com|fb\.com/.test(url)) return 'meta'
  return 'unknown'
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

async function fetchOpenGraph(url: string): Promise<{ title: string; description: string; image?: string; author?: string }> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(8000),
    })
    const html = await res.text()

    const og = (prop: string) => {
      const m = html.match(new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["']`, 'i'))
        || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${prop}["']`, 'i'))
      return m ? m[1] : ''
    }

    const title = og('title') || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || ''
    const description = og('description')
      || html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]
      || ''

    return { title: title.trim(), description: description.trim(), image: og('image'), author: og('author') }
  } catch {
    return { title: '', description: '' }
  }
}

async function fetchYouTubeTranscript(videoId: string): Promise<string> {
  try {
    // Fetch the YouTube page to get the timedtext URL
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8' },
      signal: AbortSignal.timeout(8000),
    })
    const html = await pageRes.text()

    // Extract captions URL from page
    const captionMatch = html.match(/"captionTracks":\[.*?"baseUrl":"([^"]+)"/)
    if (!captionMatch) return ''

    const captionUrl = captionMatch[1].replace(/\\u0026/g, '&')
    const captionRes = await fetch(captionUrl, { signal: AbortSignal.timeout(5000) })
    const xml = await captionRes.text()

    // Parse XML captions
    const lines = [...xml.matchAll(/<text[^>]*>([^<]+)<\/text>/g)]
    return lines
      .map(m => m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"'))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
  } catch {
    return ''
  }
}

async function extractYouTube(url: string): Promise<ExtractedContent> {
  const videoId = extractYouTubeId(url)
  if (!videoId) throw new Error('No se pudo extraer el ID del video de YouTube')

  const [ogData, transcriptResult] = await Promise.allSettled([
    fetchOpenGraph(url),
    fetchYouTubeTranscript(videoId),
  ])

  const og = ogData.status === 'fulfilled' ? ogData.value : { title: '', description: '' }
  const transcript = transcriptResult.status === 'fulfilled' ? transcriptResult.value : ''

  return {
    platform: 'YouTube',
    title: og.title,
    description: og.description,
    transcript,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    source: 'youtube',
  }
}

async function extractInstagram(url: string): Promise<ExtractedContent> {
  // Try to get caption from public page metadata
  const og = await fetchOpenGraph(url)

  // Instagram OG description often contains the caption
  return {
    platform: 'Instagram',
    title: og.title || 'Reel de Instagram',
    description: og.description || '',
    transcript: og.description || '',
    thumbnailUrl: og.image,
    source: 'instagram',
  }
}

async function extractTikTok(url: string): Promise<ExtractedContent> {
  const og = await fetchOpenGraph(url)
  return {
    platform: 'TikTok',
    title: og.title || 'Video de TikTok',
    description: og.description || '',
    transcript: og.description || '',
    thumbnailUrl: og.image,
    source: 'tiktok',
  }
}

async function extractGeneric(url: string): Promise<ExtractedContent> {
  const og = await fetchOpenGraph(url)
  return {
    platform: 'Web',
    title: og.title || url,
    description: og.description || '',
    transcript: og.description || '',
    thumbnailUrl: og.image,
    source: 'unknown',
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json() as { url: string }
    if (!url?.trim()) return NextResponse.json({ error: 'URL requerida' }, { status: 400 })

    const source = detectPlatform(url)
    let content: ExtractedContent

    switch (source) {
      case 'youtube': content = await extractYouTube(url); break
      case 'instagram': content = await extractInstagram(url); break
      case 'tiktok': content = await extractTikTok(url); break
      default: content = await extractGeneric(url); break
    }

    return NextResponse.json({
      ...content,
      hasTranscript: content.transcript.length > 50,
      transcriptWordCount: content.transcript.split(' ').length,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error al extraer contenido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
