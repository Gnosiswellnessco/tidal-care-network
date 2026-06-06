import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SavedListClient from './SavedListClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Your saved providers — Tidal Care Network' }

export default async function SavedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/saved')

  const { data: rows } = await supabase
    .from('member_provider_list')
    .select('provider_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const ids = (rows || []).map((r) => r.provider_id)

  let providers: Provider[] = []
  if (ids.length > 0) {
    const { data: provs } = await supabase
      .from('providers')
      .select('id, full_name, credentials, practice_name, primary_area, photo_url, is_org, availability_status, offers_telehealth, vetting_status, is_active, listing_status, is_self_paused')
      .in('id', ids)

    const { data: cats } = await supabase
      .from('provider_categories')
      .select('provider_id, category, is_primary')
      .in('provider_id', ids)

    const visible = (provs || []).filter(
      (p) => p.vetting_status === 'approved' && p.is_active && p.listing_status !== 'hidden' && !p.is_self_paused
    )

    // Preserve saved order (most-recent first).
    const order = new Map(ids.map((id, i) => [id, i]))
    visible.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))

    providers = visible.map((p) => ({
      ...p,
      primary_category: (cats || []).find((c) => c.provider_id === p.id && c.is_primary)?.category
        || (cats || []).find((c) => c.provider_id === p.id)?.category
        || null,
    }))
  }

  const unavailableCount = ids.length - providers.length

  return <SavedListClient providers={providers} unavailableCount={unavailableCount} />
}

type Provider = {
  id: string
  full_name: string
  credentials: string | null
  practice_name: string | null
  primary_area: string | null
  photo_url: string | null
  is_org: boolean
  availability_status: string
  offers_telehealth: boolean
  vetting_status: string
  is_active: boolean
  listing_status: string | null
  is_self_paused: boolean
  primary_category?: string | null
}
