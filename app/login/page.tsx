'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BRAND, SERIF, LOGO } from '@/lib/brand'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const next = new URLSearchParams(window.location.search).get('next') || '/dashboard'
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', background: BRAND.pageBg, padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '36px 32px', background: 'white', borderRadius: 18, border: '0.5px solid ' + BRAND.hairline, boxShadow: '0 1px 3px rgba(44,77,82,0.05)', textAlign: 'center' }}>
        <Link href="/" style={{ display: 'inline-block' }}>
          <img src={LOGO.mark} alt="Tidal Care Network" style={{ height: 56, width: 'auto', margin: '0 auto 16px', display: 'block' }} />
        </Link>
        <h1 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: BRAND.dark, marginBottom: 6, letterSpacing: '-0.01em' }}>Tidal Care Network</h1>
        <p style={{ fontSize: 14, color: '#5f6b6d', marginBottom: 26, lineHeight: 1.5 }}>Sign in to join or manage your provider profile</p>

        {sent ? (
          <div style={{ padding: 16, background: BRAND.panelBg, borderRadius: 10, fontSize: 14, color: BRAND.dark, lineHeight: 1.6, textAlign: 'left' }}>
            Check your email — we sent you a sign-in link. Click it to continue.
          </div>
        ) : (
          <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 6 }}>Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '11px 12px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, marginBottom: 16, color: '#1a1a1a', background: 'white' }}
            />
            {error && <p style={{ fontSize: 13, color: '#b91c1c', marginBottom: 12 }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '11px', fontSize: 14, fontWeight: 500, color: 'white', background: BRAND.teal, border: 'none', borderRadius: 8, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Sending…' : 'Send me a sign-in link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
