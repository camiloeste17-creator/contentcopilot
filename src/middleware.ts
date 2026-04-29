import { NextRequest, NextResponse } from 'next/server'

// Auth is handled client-side via useUser hook in the layout
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
