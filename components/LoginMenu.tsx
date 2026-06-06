'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BRAND } from '@/lib/brand'

const teal = BRAND.teal
const dark = BRAND.dark

type Role = 'loading' | 'guest' | 'member' | 'provider'

// Header auth control. Detects the viewer and renders accordingly:
//  - guest    → "Sign in ▾" dropdown with member vs provider options
//  - member   → "Saved" + sign out
//  - provider → "My dashboard" + sign out
export default function LoginMenu() {
  const [role, setRole] = useState<Role>('loading')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setRole('guest'); return }
      const { data: provider } = await supabase.from('providers').select('id').eq('user_id', user.id).maybeSingle()
      setRole(provider ? 'provider' : 'member')
    })
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey) }
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // Until we know who's viewing, render nothing to avoid a flash of the wrong control.
  if (role === 'loading') return null

  const signOutBtn = (
    <button onClick={signOut} style={{ fontSize: 14, color: '#4a5557', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign out</button>
  )

  if (role === 'provider') {
    return (
      <>
        <Link href="/dashboard" style={ctaStyle}>My dashboard</Link>
        {signOutBtn}
      </>
    )
  }

  if (role === 'member') {
    return (
      <>
        <Link href="/saved" style={{ fontSize: 14, color: '#4a5557', textDecoration: 'none' }}>Saved</Link>
        {signOutBtn}
      </>
    )
  }

  // guest
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button onClick={() => setOpen((o) => !o)} style={{ ...ctaStyle, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
        Sign in <span style={{ fontSize: 11 }}>▾</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 210, background: 'white', borderRadius: 12, border: '0.5px solid ' + BRAND.hairline, boxShadow: '0 8px 30px rgba(28,44,46,0.16)', padding: 6, zIndex: 100 }}>
          <Link href="/member-login" onClick={() => setOpen(false)} style={menuItem}>
            <span style={{ fontSize: 14, fontWeight: 600, color: dark }}>{"I'm a member"}</span>
            <span style={menuSub}>Save providers &amp; build a shortlist</span>
          </Link>
          <Link href="/login" onClick={() => setOpen(false)} style={menuItem}>
            <span style={{ fontSize: 14, fontWeight: 600, color: dark }}>{"I'm a provider"}</span>
            <span style={menuSub}>Manage your listing</span>
          </Link>
        </div>
      )}
    </div>
  )
}

const ctaStyle: React.CSSProperties = { fontSize: 14, fontWeight: 500, color: 'white', background: teal, padding: '9px 18px', borderRadius: 8, textDecoration: 'none', border: 'none' }
const menuItem: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 2, padding: '9px 12px', borderRadius: 8, textDecoration: 'none' }
const menuSub: React.CSSProperties = { fontSize: 12, color: '#8a9092' }
