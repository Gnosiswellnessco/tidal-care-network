'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      style={{
        fontSize: 13,
        fontWeight: 500,
        color: '#3e6a70',
        background: 'white',
        border: '1px solid #3e6a70',
        padding: '7px 14px',
        borderRadius: 8,
        cursor: signingOut ? 'default' : 'pointer',
        opacity: signingOut ? 0.6 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      {signingOut ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
