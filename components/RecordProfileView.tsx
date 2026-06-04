'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

// Logs a single profile view on mount. Privacy-light: records only the
// provider_id + timestamp (the DB default), never the viewer's identity.
// Skips logging when the profile owner is viewing their own page.
export default function RecordProfileView({ providerId }: { providerId: string }) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    const supabase = createClient()
    ;(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Don't count the provider viewing their own profile.
          const { data: me } = await supabase
            .from('providers')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle()
          if (me && me.id === providerId) return
        }
        await supabase.from('profile_views').insert({ provider_id: providerId })
      } catch {
        // View logging is best-effort; never disrupt the page.
      }
    })()
  }, [providerId])

  return null
}
