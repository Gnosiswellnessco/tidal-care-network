'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BRAND, SERIF, LOGO } from '@/lib/brand'
import { TERMS_VERSION, MEMBER_DISCLAIMER } from '@/lib/consent'

// Shared magic-link sign-in form used by both the provider login (/login)
// and the member login (/member-login). The only differences between the two
// are the copy and the default destination after sign-in, passed as props.
export default function LoginForm({
  heading,
  subtitle,
  defaultNext,
  footer,
  requireConsent = false,
}: {
  heading: string
  subtitle: string
  defaultNext: string
  footer?: React.ReactNode
  requireConsent?: boolean
}) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreed, setAgreed] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (requireConsent && !agreed) {
      setError('Please agree to the Terms, Privacy Policy, and disclaimer to continue.')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    // An explicit ?next= (e.g. from a Save click) always wins; otherwise use
    // this page's default destination.
    const next = new URLSearchParams(window.location.search).get('next') || defaultNext
    const redirect = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}${requireConsent ? `&consent=${encodeURIComponent(TERMS_VERSION)}` : ''}`
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirect,
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
        <h1 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: BRAND.dark, marginBottom: 6, letterSpacing: '-0.01em' }}>{heading}</h1>
        <p style={{ fontSize: 14, color: '#5f6b6d', marginBottom: 26, lineHeight: 1.5 }}>{subtitle}</p>

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
            {requireConsent && (
              <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, color: '#5f6b6d', lineHeight: 1.5, marginBottom: 14 }}>
                <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); if (error) setError('') }} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>
                  I agree to the <Link href="/terms" style={{ color: BRAND.teal }}>Terms</Link> and <Link href="/privacy" style={{ color: BRAND.teal }}>Privacy Policy</Link>. {MEMBER_DISCLAIMER}
                </span>
              </label>
            )}
            <button
              type="submit"
              disabled={loading || (requireConsent && !agreed)}
              style={{ width: '100%', padding: '11px', fontSize: 14, fontWeight: 500, color: 'white', background: BRAND.teal, border: 'none', borderRadius: 8, cursor: loading || (requireConsent && !agreed) ? 'default' : 'pointer', opacity: loading || (requireConsent && !agreed) ? 0.6 : 1 }}
            >
              {loading ? 'Sending…' : 'Send me a sign-in link'}
            </button>
            <p style={{ fontSize: 12, color: '#9aa0a1', marginTop: 12, lineHeight: 1.5 }}>
              No password needed — we&apos;ll email you a secure link. If you&apos;re new, this creates your account.
            </p>
          </form>
        )}

        {footer && <div style={{ marginTop: 20, paddingTop: 16, borderTop: '0.5px solid ' + BRAND.hairline, fontSize: 13, color: '#5f6b6d' }}>{footer}</div>}
      </div>
    </div>
  )
}
