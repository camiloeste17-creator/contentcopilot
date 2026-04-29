export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getMediaList, getMediaInsights } from '@/lib/instagram'

export async function GET(request: NextRequest) {
  const token = request.headers.get('X-Instagram-Token') ?? process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) return NextResponse.json({ error: 'no_token' }, { status: 401 })
  try {
    const media = await getMediaList(token, 24)

    const withInsights = await Promise.all(
      media.map(async (item) => {
        const insights = await getMediaInsights(token, item.id)
        return { ...item, insights }
      })
    )

    const videos = withInsights.filter(
      m => m.media_type === 'VIDEO' || m.media_type === 'REELS'
    )

    return NextResponse.json({ data: videos, total: videos.length })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
