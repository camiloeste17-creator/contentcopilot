import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/auth', '/_next', '/favicon', '/api']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow all public paths and API routes
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check for any Supabase auth cookie (various possible names)
  const cookies = request.cookies.getAll()
  const hasAuthCookie = cookies.some(c =>
    c.name.includes('supabase') ||
    c.name.includes('sb-') ||
    c.name.startsWith('sb-ynpqmfyafesxqvzqmszp')
  )

  if (!hasAuthCookie && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
