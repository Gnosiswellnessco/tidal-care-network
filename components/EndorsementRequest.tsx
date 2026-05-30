'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const teal = '#3e6a70'
const dark = '#2c4d52'
const mint = '#e8eff0'

export default function EndorsementRequest({ providerId }: { providerId: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [title, setTitle] = useState('')
  const [relationship, setRelationship] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function send() {
    setError('')
    if (!name.trim() || !email.trim()) { setError('Please enter your colleague’s name and email.'); return }
    setSending(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const token = crypto.randomUUID().replace(/-/g, '')

    const { data, error: insErr } = await supabase
      .from('endorsements')
      .insert({
        provider_id: providerId,
        endorser_name: name,
        endorser_email: email,
        endorser_title: title || null,
        relationship: relationship || null,
        confirm_token: token,
        status: 'pending',
      })
      .select()
      .single()

    if (insErr || !data) { setError('Could not save: ' + (insErr?.message || 'unknown')); setSending(false); return }

    try {
      await fetch('/api/request-endorsement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endorsementId: data.id }),
      })
    } catch {
      // saved even if email hiccups
    }

    setSending(false)
    setDone(true)
    setName(''); setEmail(''); setTitle(''); setRelationship('')
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ marginTop: 12, fontSize: 14, fontWeight: 500, color: teal, background: 'white', border: `1px solid ${teal}`, padding: '9px 18px', borderRadius: 8, cursor: 'pointer' }}>
        Request a peer endorsement
      </button>
    )
  }

  return (
    <div style={{ marginTop: 16, padding: 20, background: mint, borderRadius: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: dark, marginBottom: 4 }}>Request a peer endorsement</div>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 14, lineHeight: 1.5 }}>
        Enter a colleague, supervisor, or peer who can vouch for you professionally. They'll get an email to confirm.
      </p>

      {done ? (
        <div>
          <p style={{ fontSize: 14, color: '#27500a', background: '#eaf3de', padding: '10px 12px', borderRadius: 8, marginBottom: 12 }}>Endorsement request sent. You can request another, or close this.</p>
          <button onClick={() => setDone(false)} style={{ fontSize: 13, color: teal, background: 'none', border: 'none', cursor: 'pointer', marginRight: 12 }}>Request another</button>
          <button onClick={() => { setOpen(false); setDone(false) }} style={{ fontSize: 13, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>Close</button>
        </div>
      ) : (
        <>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Colleague's full name" style={inp} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Colleague's email" style={inp} />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Their title / credentials (optional)" style={inp} />
          <input value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="How you know each other (optional)" style={inp} />
          {error && <p style={{ fontSize: 13, color: '#b91c1c', marginBottom: 10 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={send} disabled={sending} style={{ fontSize: 14, fontWeight: 500, padding: '9px 18px', borderRadius: 8, border: 'none', background: teal, color: 'white', cursor: sending ? 'default' : 'pointer', opacity: sending ? 0.6 : 1 }}>
              {sending ? 'Sending…' : 'Send request'}
            </button>
            <button onClick={() => setOpen(false)} style={{ fontSize: 14, padding: '9px 18px', borderRadius: 8, border: '1px solid #d4d2ca', background: 'white', color: '#777', cursor: 'pointer' }}>Cancel</button>
          </div>
        </>
      )}
    </div>
  )
}

const inp: React.CSSProperties = { width: '100%', padding: '9px 11px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, color: '#1a1a1a', background: 'white', marginBottom: 10 }