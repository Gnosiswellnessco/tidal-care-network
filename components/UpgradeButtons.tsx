'use client'

import { useState } from 'react'

const PREMIUM = '#b5aa8e'

export default function UpgradeButtons({ mode }: { mode: 'upgrade' | 'manage' }) {
  const [loading, setLoading] = useState('')
  const [err, setErr] = useState('')

  async function checkout(plan: 'monthly' | 'yearly') {
    setLoading(plan); setErr('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      setErr(data.error || 'Could not start checkout.')
    } catch {
      setErr('Something went wrong. Please try again.')
    }
    setLoading('')
  }

  async function portal() {
    setLoading('manage'); setErr('')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      setErr(data.error || 'Could not open the billing portal.')
    } catch {
      setErr('Something went wrong. Please try again.')
    }
    setLoading('')
  }

  if (mode === 'manage') {
    return (
      <div>
        <button type="button" onClick={portal} disabled={loading === 'manage'} style={{ fontSize: 12, padding: '7px 14px', border: '1px solid #d4d2ca', background: 'white', borderRadius: 8, color: '#5f6b6d', cursor: loading ? 'default' : 'pointer' }}>
          {loading === 'manage' ? 'Opening…' : 'Manage subscription'}
        </button>
        {err && <p style={{ fontSize: 12, color: '#b91c1c', marginTop: 8 }}>{err}</p>}
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" onClick={() => checkout('yearly')} disabled={!!loading} style={{ fontSize: 14, fontWeight: 500, padding: '11px 22px', border: 'none', borderRadius: 8, background: PREMIUM, color: 'white', letterSpacing: '0.02em', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading === 'yearly' ? 'Starting…' : 'Go Premium — $50/year'}
        </button>
        <button type="button" onClick={() => checkout('monthly')} disabled={!!loading} style={{ fontSize: 14, fontWeight: 500, padding: '11px 22px', border: '1px solid ' + PREMIUM, background: 'white', borderRadius: 8, color: '#7d7256', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading === 'monthly' ? 'Starting…' : 'or $5/month'}
        </button>
      </div>
      {err && <p style={{ fontSize: 13, color: '#b91c1c', marginTop: 10 }}>{err}</p>}
    </div>
  )
}
