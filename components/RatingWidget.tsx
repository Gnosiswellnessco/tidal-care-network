'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const teal = '#3e6a70'
const dark = '#2c4d52'

function Stars({ value, size = 18, onPick, interactive }: { value: number; size?: number; onPick?: (n: number) => void; interactive?: boolean }) {
  const [hover, setHover] = useState(0)
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = (hover || value) >= n
        return (
          <span
            key={n}
            onClick={interactive && onPick ? () => onPick(n) : undefined}
            onMouseEnter={interactive ? () => setHover(n) : undefined}
            onMouseLeave={interactive ? () => setHover(0) : undefined}
            style={{ cursor: interactive ? 'pointer' : 'default', lineHeight: 1 }}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#bd8254' : 'none'} stroke={filled ? '#bd8254' : '#c9c6bd'} strokeWidth="2" strokeLinejoin="round">
              <path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 6.9L12 17.8 5.4 21l1.4-6.9L1.6 9.3l7-.8z" />
            </svg>
          </span>
        )
      })}
    </span>
  )
}

// Compact average display for cards and profile headers
export function RatingDisplay({ avg, count, size = 16 }: { avg: number | null; count: number; size?: number }) {
  if (!count || avg == null) {
    return <span style={{ fontSize: 12, color: '#aaa' }}>No ratings yet</span>
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Stars value={Math.round(avg)} size={size} />
      <span style={{ fontSize: 12, color: '#666' }}>{avg.toFixed(1)} ({count})</span>
    </span>
  )
}

// Interactive submit widget for the profile page
export function RatingSubmit({ providerId }: { providerId: string }) {
  const [picked, setPicked] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [already, setAlready] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const rated = JSON.parse(localStorage.getItem('tcn_rated') || '[]')
      if (Array.isArray(rated) && rated.includes(providerId)) setAlready(true)
    } catch {}
  }, [providerId])

  async function submit(n: number) {
    setPicked(n)
    setError('')
    setSubmitting(true)
    const supabase = createClient()
    const { error: insErr } = await supabase.from('ratings').insert({
      provider_id: providerId,
      stars: n,
      rating_type: 'client',
      is_published: true,
    })
    setSubmitting(false)
    if (insErr) { setError('Could not submit your rating. Please try again.'); return }
    try {
      const rated = JSON.parse(localStorage.getItem('tcn_rated') || '[]')
      localStorage.setItem('tcn_rated', JSON.stringify([...rated, providerId]))
    } catch {}
    setDone(true)
  }

  if (already || done) {
    return (
      <div style={{ fontSize: 13, color: '#27500a', background: '#eaf3de', padding: '10px 14px', borderRadius: 8 }}>
        {done ? 'Thank you! Your rating has been recorded.' : 'You’ve already rated this provider. Thank you!'}
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: dark, marginBottom: 8 }}>Rate your experience</div>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 10, lineHeight: 1.5 }}>If you’ve seen this provider, tap a star. Ratings are anonymous and help others find good care.</p>
      <Stars value={picked} size={30} interactive onPick={submit} />
      {submitting && <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>Submitting…</p>}
      {error && <p style={{ fontSize: 12, color: '#b91c1c', marginTop: 8 }}>{error}</p>}
    </div>
  )
}
