export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { getProfile } from '@/lib/instagram'

export async function GET() {
  try {
    const profile = await getProfile()
    return NextResponse.json(profile)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
