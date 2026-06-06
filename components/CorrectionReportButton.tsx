'use client'

import { useState } from 'react'

const teal = '#3e6a70'
const dark = '#2c4d52'

const REASONS = [
  'Incorrect credentials or license info',
  'Outdated or inaccurate information',
  'Wrong contact details (phone, email, website)',
  'No longer practicing / accepting clients',
  'Not affiliated as listed',
  'Misrepresented specialties or approaches',
  'Other',
]

export default function CorrectionReportButton({
  providerId,
  providerName,
}: {
  providerId: string
  providerName: string
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [reporterEmail, setReporterEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')

  async function submit() {
    if (!reason) { setErr('Please choose a reason.'); return }
    setBusy(true); setErr('')
    try {
      const res = await fetch('/api/report-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, reason, details, reporterEmail }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || 'Something went wrong.'); setBusy(false); return }
      setDone(true)
    } catch {
      setErr('Network error — please try again.')
    }
    setBusy(false)
  }

  function close() {
    setOpen(false)
    // reset after the modal closes
    setTimeout(() => { setReason(''); setDetails(''); setReporterEmail(''); setDone(false); setErr('') }, 200)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, color: '#7a8688' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
        <span>Something not right? <span style={{ color: teal, textDecoration: 'underline' }}>Suggest a correction</span></span>
      </button>

      {open && (
        <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(44,77,82,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: 14, maxWidth: 460, width: '100%', padding: 26, boxShadow: '0 8px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            {done ? (
              <>
                <div style={{ fontSize: 19, fontWeight: 700, color: dark, marginBottom: 10 }}>Thank you</div>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#54625f', margin: '0 0 20px' }}>
                  We've recorded your report and notified the provider. They have 14 days to review and confirm the correction, or their listing will be temporarily hidden.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={close} style={btnPrimary}>Close</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 19, fontWeight: 700, color: dark, marginBottom: 4 }}>Suggest a correction</div>
                <p style={{ fontSize: 13.5, lineHeight: 1.55, color: '#7a8688', margin: '0 0 18px' }}>
                  Report an inaccuracy on <strong>{providerName}</strong>'s listing. The provider will be notified and asked to fix it.
                </p>

                <label style={lbl}>What's wrong?</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)} style={inp}>
                  <option value="">Select a reason…</option>
                  {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>

                <label style={lbl}>Details (optional)</label>
                <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} placeholder="Describe what should be corrected…" style={{ ...inp, resize: 'vertical' }} />

                <label style={lbl}>Your email (optional)</label>
                <input value={reporterEmail} onChange={(e) => setReporterEmail(e.target.value)} type="email" placeholder="So we can follow up if needed" style={inp} />

                {err && <p style={{ color: '#b3504f', fontSize: 13, margin: '4px 0 0' }}>{err}</p>}

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                  <button type="button" onClick={close} style={btnGhost}>Cancel</button>
                  <button type="button" onClick={submit} disabled={busy} style={{ ...btnPrimary, opacity: busy ? 0.6 : 1 }}>{busy ? 'Sending…' : 'Submit report'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: '#444', margin: '14px 0 5px' }
const inp: React.CSSProperties = { width: '100%', boxSizing: 'border-box', fontSize: 14, padding: '9px 11px', border: '1px solid #d4d2ca', borderRadius: 8, background: '#faf9f5', color: '#1a1a1a', fontFamily: 'inherit' }
const btnPrimary: React.CSSProperties = { fontSize: 14, fontWeight: 500, color: 'white', background: teal, border: 'none', padding: '9px 18px', borderRadius: 8, cursor: 'pointer' }
const btnGhost: React.CSSProperties = { fontSize: 14, fontWeight: 500, color: '#666', background: 'white', border: '1px solid #d4d2ca', padding: '9px 18px', borderRadius: 8, cursor: 'pointer' }
