'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BRAND, SERIF } from '@/lib/brand'

export default function NewsDigestSignup() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  function validEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
  }

  async function submit() {
    if (!validEmail(email)) { setState('error'); setMsg('Please enter a valid email address.'); return }
    setState('submitting'); setMsg('')
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('news_digest_subscribers')
        .insert({ email: email.trim().toLowerCase() })
      if (error) {
        // Unique-violation = already subscribed; treat as success.
        if ((error as { code?: string }).code === '23505') {
          setState('done'); setMsg('You\u2019re already on the list — thanks!')
          return
        }
        setState('error'); setMsg('Something went wrong. Please try again.')
        return
      }
      setState('done'); setMsg('Thanks! You\u2019ll get the next digest.')
    } catch {
      setState('error'); setMsg('Something went wrong. Please try again.')
    }
  }

  return (
    <div style={{ background: BRAND.cardBg, border: '0.5px solid ' + BRAND.hairline, borderRadius: 14, padding: '22px 24px' }}>
      <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: BRAND.dark, margin: '0 0 4px' }}>Get the news digest</h3>
      <p style={{ fontSize: 14, color: '#5f6b6d', lineHeight: 1.6, margin: '0 0 14px' }}>
        Occasional updates from across the network — new providers, events, and resources. No spam, unsubscribe anytime.
      </p>

      {state === 'done' ? (
        <p style={{ fontSize: 14, fontWeight: 500, color: BRAND.teal, margin: 0 }}>{msg}</p>
      ) : (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle') }}
            onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
            placeholder="you@example.com"
            style={{ flex: '1 1 220px', fontSize: 15, padding: '11px 13px', borderRadius: 8, border: '1px solid ' + BRAND.hairline, background: 'white', boxSizing: 'border-box' }}
          />
          <button
            type="button"
            onClick={submit}
            disabled={state === 'submitting'}
            style={{ fontSize: 15, fontWeight: 500, color: 'white', background: BRAND.teal, border: 'none', padding: '11px 22px', borderRadius: 8, cursor: state === 'submitting' ? 'default' : 'pointer', opacity: state === 'submitting' ? 0.6 : 1, whiteSpace: 'nowrap' }}
          >
            {state === 'submitting' ? 'Joining…' : 'Subscribe'}
          </button>
        </div>
      )}
      {state === 'error' && <p style={{ fontSize: 13, color: '#b3504f', margin: '8px 0 0' }}>{msg}</p>}
    </div>
  )
}
