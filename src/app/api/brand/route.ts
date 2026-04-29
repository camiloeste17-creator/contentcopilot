export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { generateCopy } from '@/lib/claude'
import { BrandProfile, Platform } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { brand, copyType, platform, topic } = body as {
      brand: BrandProfile
      copyType: string
      platform: Platform
      topic: string
    }

    if (!brand || !copyType || !platform || !topic) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const result = await generateCopy({ brand, copyType, platform, topic })
    return NextResponse.json({ result })
  } catch (error) {
    console.error('Error generating copy:', error)
    return NextResponse.json({ error: 'Error al generar copy' }, { status: 500 })
  }
}
