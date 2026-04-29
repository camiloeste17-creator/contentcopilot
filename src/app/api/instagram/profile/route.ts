export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getProfile } from '@/lib/instagram'

export async function GET(request: NextRequest) {
  const token = request.headers.get('X-Instagram-Token') ?? process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) return NextResponse.json({ error: 'no_token' }, { status: 401 })
  try {
    const profile = await getProfile(token)
    return NextResponse.json(profile)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
