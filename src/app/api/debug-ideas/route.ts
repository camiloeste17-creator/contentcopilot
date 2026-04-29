export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { parseIdeaBlock } from '@/components/ideas/IdeaCard'

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  const blocks = text.split(/\n\s*---+\s*\n/).filter((b: string) => /##\s+IDEA\s+\d+/i.test(b))
  const parsed = blocks.map(parseIdeaBlock)
  return NextResponse.json({ blockCount: blocks.length, parsed })
}
