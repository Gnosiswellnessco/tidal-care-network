'use client'

import { useState } from 'react'

const dark = '#2c4d52'

export type CorrectionItem = {
  id: string
  reason: string
  details: string | null
  deadline_at: string
  created_at: string
}

export default function CorrectionBanner({
  reports,
  hidden,
}: {
  reports: CorrectionItem[]
  hidden: boolean
}) {
  const [items, setItems] = useState(reports)
  const [busy, setBusy] = useState<string | null>(null)
  const [err, setErr] = useState('')

  if (items.length === 0) return null

  async function certify(id: string) {
    setBusy(id); setErr('')
    try {
      const res = await fetch('/api/certify-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: id }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || 'Could not certify.'); setBusy(null); return }
      setItems((cur) => cur.filter((r) => r.id !== id))
    } catch {
      setErr('Network error — please try again.')
    }
    setBusy(null)
  }

  function daysLeft(deadline: string) {
    const ms = new Date(deadline).getTime() - Date.now()
    return Math.ceil(ms / (1000 * 60 * 60 * 24))
  }

  return (
    <div style={{ background: hidden ? '#fbeaea' : '#fef6e8', border: `1px solid ${hidden ? '#e3b9b9' : '#e6d4a8'}`, borderRadius: 12, padding: '18px 20px', marginBottom: 22 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: hidden ? '#9a3b3b' : '#8a6512', marginBottom: 4 }}>
        {hidden
          ? 'Your listing is hidden until you confirm a correction'
          : 'Action needed: a correction was reported on your listing'}
      </div>
      <p style={{ fontSize: 13.5, lineHeight: 1.55, color: '#5a5750', margin: '0 0 14px' }}>
        Please review your profile, make any needed updates, then confirm below. Confirming tells us you've reviewed your listing.
        {hidden ? ' Your listing will return to the directory as soon as you confirm.' : ''}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((r) => {
          const d = daysLeft(r.deadline_at)
          return (
            <div key={r.id} style={{ background: 'white', border: '1px solid #ece9e0', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0, flex: '1 1 240px' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: dark }}>{r.reason}</div>
                  {r.details && <div style={{ fontSize: 13, color: '#6a7472', marginTop: 3, lineHeight: 1.5 }}>{r.details}</div>}
                  <div style={{ fontSize: 12, color: d <= 3 ? '#b3504f' : '#9aa0a1', marginTop: 5 }}>
                    {d > 0 ? `${d} day${d === 1 ? '' : 's'} left to confirm` : 'Past due'}
                  </div>
                </div>
                <button type="button" onClick={() => certify(r.id)} disabled={busy === r.id}
                  style={{ flex: 'none', fontSize: 13, fontWeight: 600, color: 'white', background: dark, border: 'none', padding: '8px 15px', borderRadius: 8, cursor: busy === r.id ? 'default' : 'pointer', opacity: busy === r.id ? 0.6 : 1 }}>
                  {busy === r.id ? 'Saving…' : "I've corrected this"}
                </button>
              </div>
            </div>
          )
        })}
      </div>
      {err && <p style={{ color: '#b3504f', fontSize: 13, margin: '10px 0 0' }}>{err}</p>}
    </div>
  )
}
