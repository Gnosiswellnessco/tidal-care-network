import { createClient } from '@/lib/supabase/server'
import DirectoryClient from './DirectoryClient'
import SignOutButton from '@/components/SignOutButton'
import BrandLogo from '@/components/BrandLogo'

export const dynamic = 'force-dynamic'

export default async function DirectoryPage() {
  const supabase = await createClient()

  const { data: rawProviders } = await supabase
    .from('providers')
    .select('*')
    .eq('vetting_status', 'approved')
    .eq('is_active', true)
    .order('full_name')

  const ids = (rawProviders || []).map((p) => p.id)
  const safeIds = ids.length ? ids : ['00000000-0000-0000-0000-000000000000']

  const { data: cats } = await supabase
    .from('provider_categories')
    .select('provider_id, category, is_primary')
    .in('provider_id', safeIds)

  const { data: tags } = await supabase
    .from('provider_tags')
    .select('provider_id, tag_type, tag_value')
    .in('provider_id', safeIds)

    const { data: endorsed } = await supabase
    .from('endorsements')
    .select('provider_id')
    .eq('status', 'confirmed')
    .in('provider_id', safeIds)

  const { data: ratings } = await supabase
    .from('ratings')
    .select('provider_id, stars')
    .in('provider_id', safeIds)
    const { data: addresses } = await supabase
    .from('provider_addresses')
    .select('provider_id, label, latitude, longitude, visibility, is_primary')
    .in('provider_id', safeIds)

  // Compute average rating per provider
  function avgFor(pid: string) {
    const rs = (ratings || []).filter((r) => r.provider_id === pid)
    if (rs.length === 0) return { avg: null as number | null, count: 0 }
    const sum = rs.reduce((a, r) => a + r.stars, 0)
    return { avg: sum / rs.length, count: rs.length }
  }

  const providers = (rawProviders || []).map((p) => {
    const { avg, count } = avgFor(p.id)
    const pAddrs = (addresses || []).filter((a) => a.provider_id === p.id)
    const primary = pAddrs.find((a) => a.is_primary) || pAddrs[0] || null
    return {
      ...p,
      provider_categories: (cats || []).filter((c) => c.provider_id === p.id),
      provider_tags: (tags || []).filter((t) => t.provider_id === p.id),
      is_endorsed: (endorsed || []).some((e) => e.provider_id === p.id),
      rating_avg: avg,
      rating_count: count,
      map_lat: primary?.latitude ?? null,
      map_lng: primary?.longitude ?? null,
      map_label: primary?.label ?? null,
      map_visibility: primary?.visibility ?? 'full',
    }
  })

  // Rank: endorsed first, then by rating (no-rating = neutral 3.5), then accepting, then name
  const NEUTRAL = 3.5
  providers.sort((a, b) => {
    if (a.is_endorsed !== b.is_endorsed) return a.is_endorsed ? -1 : 1
    const ra = a.rating_avg ?? NEUTRAL
    const rb = b.rating_avg ?? NEUTRAL
    if (rb !== ra) return rb - ra
    const aAcc = a.availability_status === 'accepting' ? 0 : 1
    const bAcc = b.availability_status === 'accepting' ? 0 : 1
    if (aAcc !== bAcc) return aAcc - bAcc
    return (a.full_name || '').localeCompare(b.full_name || '')
  })
  return <DirectoryClient providers={providers} />
}
