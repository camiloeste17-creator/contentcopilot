import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    if (data.session) {
      // Use the user's JWT to query user_tokens with RLS
      const authedClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
      })
      const { data: tokenRow } = await authedClient
        .from('user_tokens')
        .select('instagram_access_token')
        .eq('user_id', data.session.user.id)
        .maybeSingle()

      if (!tokenRow?.instagram_access_token) {
        return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}
