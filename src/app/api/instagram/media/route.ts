export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { getMediaList, getMediaInsights } from '@/lib/instagram'

export async function GET() {
  try {
    const media = await getMediaList(20)
    // Fetch insights for each media item in parallel
    const withInsights = await Promise.all(
      media.map(async (item) => {
        const insights = await getMediaInsights(item.id)
        return { ...item, insights }
      })
    )
    return NextResponse.json({ data: withInsights })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
