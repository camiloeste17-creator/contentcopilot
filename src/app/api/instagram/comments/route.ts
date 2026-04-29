export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getMediaList, getComments } from '@/lib/instagram'

export async function GET(req: NextRequest) {
  try {
    const limit = Number(req.nextUrl.searchParams.get('limit') ?? '5')
    const media = await getMediaList(limit)
    const allComments: string[] = []

    await Promise.all(
      media.slice(0, limit).map(async (item) => {
        const comments = await getComments(item.id, 30)
        allComments.push(...comments.map(c => c.text))
      })
    )

    return NextResponse.json({ comments: allComments, total: allComments.length })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
