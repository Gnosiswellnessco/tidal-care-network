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