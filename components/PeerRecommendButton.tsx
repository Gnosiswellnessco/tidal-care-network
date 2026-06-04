'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const teal = '#3e6a70'
const dark = '#2c4d52'
const mint = '#e8eff0'

function ThumbIcon({ color = teal, size = 16 }: { color?: string; size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={size} height={size} style={{ display: 'block', flexShrink: 0 }}>
      <path d="M7 10v11" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  )
}

// Lets a logged-in, approved provider recommend ANOTHER provider (one thumbs-up per pair).
// Renders nothing for: not-logged-in, non-providers, unapproved providers, or your own profile.
export default function PeerRecommendButton({ profileProviderId }: { profileProviderId: string }) {
  const [ready, setReady] = useState(false)
  const [eligible, setEligible] = useState(false)
  const [myProviderId, setMyProviderId] = useState<string | null>(null)
  const [recommended, setRecommended] = useState(false)
  const [working, setWorking] = useState(false)

  const init = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setReady(true); return }

    const { data: me } = await supabase
      .from('providers')
      .select('id, vetting_status, is_active')
      .eq('user_id', user.id)
      .maybeSingle()

    // Must be an approved, active provider, and not viewing their own profile.
    if (!me || me.vetting_status !== 'approved' || me.is_active === false || me.id === profileProviderId) {
      setReady(true)
      return
    }

    setMyProviderId(me.id)
    setEligible(true)

    const { data: existing } = await supabase
      .from('peer_recommendations')
      .select('id')
      .eq('recommender_provider_id', me.id)
      .eq('recommended_provider_id', profileProviderId)
      .maybeSingle()

    setRecommended(!!existing)
    setReady(true)
  }, [profileProviderId])

  useEffect(() => { init() }, [init])

  async function toggle() {
    if (!myProviderId || working) return
    setWorking(true)
    const supabase = createClient()

    if (recommended) {
      const { error } = await supabase
        .from('peer_recommendations')
        .delete()
        .eq('recommender_provider_id', myProviderId)
        .eq('recommended_provider_id', profileProviderId)
      if (!error) setRecommended(false)
    } else {
      const { error } = await supabase
        .from('peer_recommendations')
        .insert({ recommender_provider_id: myProviderId, recommended_provider_id: profileProviderId })
      if (!error) setRecommended(true)
    }
    setWorking(false)
  }

  if (!ready || !eligible) return null

  return (
    <button
      onClick={toggle}
      disabled={working}
      title={recommended ? 'Remove your recommendation' : 'Recommend this provider to colleagues'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        fontSize: 13, fontWeight: 600,
        color: recommended ? 'white' : teal,
        background: recommended ? teal : 'white',
        border: `1px solid ${teal}`,
        padding: '7px 14px', borderRadius: 999,
        cursor: working ? 'default' : 'pointer',
        opacity: working ? 0.6 : 1,
      }}
    >
      <ThumbIcon color={recommended ? 'white' : teal} size={15} />
      {recommended ? 'Recommended' : 'Recommend'}
    </button>
  )
}
