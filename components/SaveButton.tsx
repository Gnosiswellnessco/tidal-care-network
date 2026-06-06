'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BRAND } from '@/lib/brand'

// Standalone member "Save to my list" toggle for a single provider, for use
// on the provider profile page. Requires sign-in; tapping while logged out
// routes through login and auto-saves on return (handled by the directory).
export default function SaveButton({ providerId }: { providerId: string }) {
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data } = await supabase
          .from('member_provider_list')
          .select('provider_id')
          .eq('user_id', user.id)
          .eq('provider_id', providerId)
          .maybeSingle()
        setSaved(!!data)
        // Finish a save that was started before login.
        const params = new URLSearchParams(window.location.search)
        if (params.get('save') === providerId && !data) {
          await supabase.from('member_provider_list').upsert({ user_id: user.id, provider_id: providerId }, { onConflict: 'user_id,provider_id' })
          setSaved(true)
          params.delete('save')
          window.history.replaceState({}, '', `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`)
        }
      }
      setReady(true)
    })
  }, [providerId])

  async function toggle() {
    if (busy) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = `/member-login?next=${encodeURIComponent(`/provider/${providerId}?save=${providerId}`)}`
      return
    }
    setBusy(true)
    if (saved) {
      await supabase.from('member_provider_list').delete().eq('user_id', user.id).eq('provider_id', providerId)
      setSaved(false)
    } else {
      await supabase.from('member_provider_list').upsert({ user_id: user.id, provider_id: providerId }, { onConflict: 'user_id,provider_id' })
      setSaved(true)
    }
    setBusy(false)
  }

  if (!ready) return null

  return (
    <button
      onClick={toggle}
      disabled={busy}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 500,
        color: saved ? 'white' : BRAND.teal, background: saved ? BRAND.teal : 'white',
        border: '1px solid ' + BRAND.teal, padding: '9px 18px', borderRadius: 8,
        cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'white' : 'none'} stroke={saved ? 'white' : BRAND.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
