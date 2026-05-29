'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', background: '#f7f6f2' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 32, background: 'white', borderRadius: 16, border: '1px solid #e5e3dc' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#2c4d52', marginBottom: 4 }}>Tidal Care Network</h1>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>Sign in to join or manage your provider profile</p>

        {sent ? (
          <div style={{ padding: 16, background: '#e8eff0', borderRadius: 8, fontSize: 14, color: '#2c4d52', lineHeight: 1.6 }}>
            Check your email — we sent you a sign-in link. Click it to continue.
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <label style={{ display: 'block', fontSize: 13, color: '#444', marginBottom: 6 }}>Email address</label>
           <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, marginBottom: 16, color: '#1a1a1a', background: 'white' }}
            />
            {error && <p style={{ fontSize: 13, color: '#b91c1c', marginBottom: 12 }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '10px', fontSize: 14, fontWeight: 500, color: 'white', background: '#3e6a70', border: 'none', borderRadius: 8, cursor: 'pointer' }}
            >
              {loading ? 'Sending…' : 'Send me a sign-in link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}