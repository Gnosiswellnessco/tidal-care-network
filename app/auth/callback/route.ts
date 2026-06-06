import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Record member consent (Terms/Privacy/disclaimer version) when present.
      // Runs before the redirect branching so it's captured even for members,
      // whose next is '/saved'.
      const consent = searchParams.get('consent')
      if (consent) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('member_profiles').upsert(
            { user_id: user.id, terms_version: consent, terms_agreed_at: new Date().toISOString() },
            { onConflict: 'user_id' },
          )
        }
      }

      if (next !== '/dashboard') {
        return NextResponse.redirect(`${origin}${next}`)
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: provider } = await supabase
          .from('providers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()
        if (!provider) {
          await supabase.from('member_profiles').upsert({ user_id: user.id }, { onConflict: 'user_id' })
          return NextResponse.redirect(`${origin}/saved`)
        }
      }
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}