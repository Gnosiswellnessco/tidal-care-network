import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Handles the provider's own visibility + freshness actions from the
// dashboard status banner. All actions operate ONLY on the signed-in
// user's own provider row. The DB status guard prevents tampering with
// admin-controlled fields (listing_status / reason / note), and none of
// the fields touched here are guarded, so the user's session is enough.
export async function POST(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  let action: string
  try {
    ;({ action } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!provider) {
    return NextResponse.json({ error: 'No provider profile' }, { status: 404 })
  }

  let patch: Record<string, unknown>
  switch (action) {
    case 'pause':
      patch = { is_self_paused: true }
      break
    case 'unpause':
      patch = { is_self_paused: false }
      break
    case 'certify':
      patch = { last_certified_at: new Date().toISOString() }
      break
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  const { error } = await supabase
    .from('providers')
    .update(patch)
    .eq('id', provider.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
