export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { getMediaList, getMediaInsights } from '@/lib/instagram'

export async function GET() {
  try {
    const media = await getMediaList(24)

    const withInsights = await Promise.all(
      media.map(async (item) => {
        const insights = await getMediaInsights(item.id)
        return { ...item, insights }
      })
    )

    // Only videos/reels
    const videos = withInsights.filter(
      m => m.media_type === 'VIDEO' || m.media_type === 'REELS'
    )

    return NextResponse.json({ data: videos, total: videos.length })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
