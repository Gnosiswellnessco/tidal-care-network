import { createClient } from '@/lib/supabase/server'
import DirectoryClient from './DirectoryClient'

export const dynamic = 'force-dynamic'

export default async function DirectoryPage() {
  const supabase = await createClient()

  const { data: rawProviders } = await supabase
    .from('providers')
    .select('*')
    .eq('vetting_status', 'approved')
    .eq('is_active', true)
    .neq('listing_status', 'hidden')
    .eq('is_self_paused', false)
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

  const { data: insurance } = await supabase
    .from('provider_insurance')
    .select('provider_id, insurance')
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

  const { data: peerRecs } = await supabase
    .from('peer_recommendations')
    .select('recommended_provider_id')
    .in('recommended_provider_id', safeIds)

  const { data: addresses } = await supabase
    .from('provider_addresses')
    .select('provider_id, label, latitude, longitude, visibility, is_primary')
    .in('provider_id', safeIds)

  function avgFor(pid: string) {
    const rs = (ratings || []).filter((r) => r.provider_id === pid)
    if (rs.length === 0) return { avg: null as number | null, count: 0, sum: 0 }
    const sum = rs.reduce((a, r) => a + r.stars, 0)
    return { avg: sum / rs.length, count: rs.length, sum }
  }

  // Global mean star rating across ALL ratings — the center that low-volume
  // providers are pulled toward in the Bayesian weighted score below.
  const allStars = (ratings || []).map((r) => r.stars)
  const GLOBAL_MEAN = allStars.length ? allStars.reduce((a, s) => a + s, 0) / allStars.length : 3.5

  // Confidence constant: how many reviews before a provider's own average
  // starts to outweigh the global mean. Higher = more conservative.
  const C = 5

  const providers = (rawProviders || []).map((p) => {
    const { avg, count, sum } = avgFor(p.id)
    const pAddrs = (addresses || []).filter((a) => a.provider_id === p.id)
    const primary = pAddrs.find((a) => a.is_primary) || pAddrs[0] || null
    // Bayesian weighted rating: (C * m + sum) / (C + n)
    const weightedRating = (C * GLOBAL_MEAN + sum) / (C + count)
    return {
      ...p,
      provider_categories: (cats || []).filter((c) => c.provider_id === p.id),
      provider_tags: (tags || []).filter((t) => t.provider_id === p.id),
      provider_insurance: (insurance || []).filter((i) => i.provider_id === p.id).map((i) => i.insurance),
      is_endorsed: (endorsed || []).some((e) => e.provider_id === p.id),
      rating_avg: avg,
      rating_count: count,
      weighted_rating: weightedRating,
      peer_rec_count: (peerRecs || []).filter((r) => r.recommended_provider_id === p.id).length,
      map_lat: primary?.latitude ?? null,
      map_lng: primary?.longitude ?? null,
      map_label: primary?.label ?? null,
      map_visibility: primary?.visibility ?? 'full',
    }
  })

  providers.sort((a, b) => {
    if (a.is_endorsed !== b.is_endorsed) return a.is_endorsed ? -1 : 1
    // Rank by the Bayesian weighted score, not the raw average, so a single
    // glowing (or harsh) review can't outweigh a longer track record.
    if (b.weighted_rating !== a.weighted_rating) return b.weighted_rating - a.weighted_rating
    const aAcc = a.availability_status === 'accepting' ? 0 : 1
    const bAcc = b.availability_status === 'accepting' ? 0 : 1
    if (aAcc !== bAcc) return aAcc - bAcc
    return (a.full_name || '').localeCompare(b.full_name || '')
  })
  return <DirectoryClient providers={providers} />
}
