'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const teal = '#3e6a70'
const dark = '#2c4d52'
const mint = '#e8eff0'

type Provider = { id: string; full_name: string; credentials: string | null; practice_name: string | null; primary_area: string | null; is_org: boolean; photo_url: string | null }

export default function ReferPage() {
  const [me, setMe] = useState<Provider | null>(null)
  const [loadingMe, setLoadingMe] = useState(true)
  const [allProviders, setAllProviders] = useState<Provider[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Provider[]>([])
  const [type, setType] = useState<'provider' | 'client'>('client')
  const [roi, setRoi] = useState(false)
  const [note, setNote] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ token: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('providers').select('id, full_name, credentials, practice_name, primary_area, is_org, photo_url').eq('user_id', user.id).maybeSingle()
        setMe(data)
      }
      setLoadingMe(false)
      const { data: provs } = await supabase
        .from('providers')
        .select('id, full_name, credentials, practice_name, primary_area, is_org, photo_url')
        .eq('vetting_status', 'approved')
        .eq('is_active', true)
        .order('full_name')
      if (provs) setAllProviders(provs)
    })()
  }, [])

  const results = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return allProviders
      .filter((p) => !selected.some((s) => s.id === p.id))
      .filter((p) => me ? p.id !== me.id : true)
      .filter((p) => `${p.full_name} ${p.practice_name || ''}`.toLowerCase().includes(q))
      .slice(0, 6)
  }, [search, allProviders, selected, me])

  function addProvider(p: Provider) { setSelected([...selected, p]); setSearch('') }
  function removeProvider(id: string) { setSelected(selected.filter((s) => s.id !== id)) }

  async function handleSend() {
    setError('')
    if (selected.length === 0) { setError('Add at least one provider to refer.'); return }
    if (type === 'client' && !clientName.trim()) { setError('Enter the client name (or a label) for this referral.'); return }
    setSending(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !me) { setError('You must be a registered provider to send referrals.'); setSending(false); return }

    const token = type === 'client' ? crypto.randomUUID().replace(/-/g, '') : null

    const { data: referral, error: refErr } = await supabase
      .from('referrals')
      .insert({
        from_provider_id: me.id,
        to_provider_id: type === 'provider' ? selected[0].id : null,
        referral_type: type,
        roi_requested: roi,
        note: note || null,
        client_name: type === 'client' ? clientName : null,
        client_email: type === 'client' ? (clientEmail || null) : null,
        share_token: token,
        status: 'sent',
      })
      .select()
      .single()

    if (refErr || !referral) { setError('Could not create referral: ' + (refErr?.message || 'unknown')); setSending(false); return }

    await supabase.from('referral_providers').insert(
      selected.map((p) => ({ referral_id: referral.id, provider_id: p.id }))
    )

    setSending(false)
    if (type === 'client' && token) {
      setResult({ token })
    } else {
      setResult({ token: '' })
    }
  }

  if (loadingMe) return <Shell><p style={{ color: '#888' }}>Loading…</p></Shell>
  if (!me) return <Shell><p style={{ fontSize: 15, color: '#444' }}>You need an approved provider profile to create referrals. <Link href="/dashboard" style={{ color: teal }}>Go to your dashboard</Link>.</p></Shell>

  if (result) {
    const shareUrl = result.token ? `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${result.token}` : ''
    return (
      <Shell>
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e3dc', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: dark, marginBottom: 8 }}>Referral created</h1>
          {type === 'client' ? (
            <>
              <p style={{ fontSize: 15, color: '#555', lineHeight: 1.6, marginBottom: 20 }}>Share this link with {clientName} so they can view the recommended provider{selected.length > 1 ? 's' : ''} and reach out.</p>
              <div style={{ display: 'flex', gap: 8, maxWidth: 480, margin: '0 auto 20px' }}>
                <input readOnly value={shareUrl} style={{ flex: 1, padding: '10px 12px', fontSize: 13, border: '1px solid #d4d2ca', borderRadius: 8, color: '#1a1a1a', background: '#faf9f5' }} />
                <button onClick={() => navigator.clipboard.writeText(shareUrl)} style={{ fontSize: 13, fontWeight: 500, padding: '10px 16px', borderRadius: 8, border: 'none', background: teal, color: 'white', cursor: 'pointer' }}>Copy</button>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.6, marginBottom: 20 }}>Your warm handoff to {selected[0].full_name} has been recorded. They'll be notified.</p>
          )}
          <Link href="/dashboard" style={{ fontSize: 14, fontWeight: 500, color: 'white', background: teal, padding: '10px 22px', borderRadius: 8, textDecoration: 'none' }}>Back to dashboard</Link>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: dark, marginBottom: 6 }}>Create a referral</h1>
      <p style={{ fontSize: 15, color: '#666', marginBottom: 24 }}>Refer a client to a provider in the network, or send them a set of options to choose from.</p>

      <Card>
        <Label>Referral type</Label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <TypeBtn active={type === 'client'} onClick={() => setType('client')} title="Send to a client" desc="Share provider info with your client to choose" />
          <TypeBtn active={type === 'provider'} onClick={() => setType('provider')} title="Warm handoff" desc="Refer directly to one provider" />
        </div>

        <Label>{type === 'client' ? 'Recommend providers (add 1 or more)' : 'Refer to provider'}</Label>
        {selected.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
            {selected.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: mint, borderRadius: 8 }}>
                <span style={{ fontSize: 14, color: dark, fontWeight: 500 }}>{p.is_org ? (p.practice_name || p.full_name) : `${p.full_name}${p.credentials ? `, ${p.credentials}` : ''}`}</span>
                <button onClick={() => removeProvider(p.id)} style={{ fontSize: 12, color: '#991b1b', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
              </div>
            ))}
          </div>
        )}
        {(type === 'client' || selected.length === 0) && (
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search providers by name…" style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, color: '#1a1a1a', background: 'white' }} />
            {results.length > 0 && (
              <div style={{ border: '1px solid #e5e3dc', borderRadius: 8, marginTop: 4, overflow: 'hidden' }}>
                {results.map((p) => (
                  <button key={p.id} onClick={() => addProvider(p)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: 14, color: '#333', background: 'white', border: 'none', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
                    {p.is_org ? (p.practice_name || p.full_name) : `${p.full_name}${p.credentials ? `, ${p.credentials}` : ''}`}{p.primary_area ? ` · ${p.primary_area}` : ''}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {type === 'client' && (
          <>
            <Label>Client name (or a private label)</Label>
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. Jordan M." style={inp} />
            <Label>Client email (optional — to email them the link)</Label>
            <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} type="email" placeholder="client@example.com" style={inp} />
          </>
        )}

        <Label>Note (optional)</Label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={type === 'client' ? 'A short note for your client about these recommendations.' : 'Context for the receiving provider. Do not include detailed health information here.'} style={{ ...inp, minHeight: 70, resize: 'vertical' }} />

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: dark, cursor: 'pointer', marginBottom: 20 }}>
          <input type="checkbox" checked={roi} onChange={(e) => setRoi(e.target.checked)} />
          Request a Release of Information (ROI) so providers can communicate about this client
        </label>

        {error && <p style={{ fontSize: 14, color: '#b91c1c', marginBottom: 12 }}>{error}</p>}

        <button onClick={handleSend} disabled={sending} style={{ fontSize: 14, fontWeight: 500, padding: '11px 24px', borderRadius: 8, border: 'none', background: teal, color: 'white', cursor: sending ? 'default' : 'pointer', opacity: sending ? 0.6 : 1 }}>
          {sending ? 'Creating…' : type === 'client' ? 'Create referral & get link' : 'Send warm handoff'}
        </button>
      </Card>
    </Shell>
  )
}

const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, color: '#1a1a1a', background: 'white', marginBottom: 16 }

function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>{children}</label>
}

function TypeBtn({ active, onClick, title, desc }: { active: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button onClick={onClick} style={{ flex: 1, textAlign: 'left', padding: '12px 14px', borderRadius: 10, cursor: 'pointer', border: active ? `2px solid ${teal}` : '1px solid #d4d2ca', background: active ? mint : 'white' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: active ? dark : '#333' }}>{title}</div>
      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{desc}</div>
    </button>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', padding: '24px 28px', maxWidth: 640 }}>{children}</div>
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1a1a', background: '#f7f6f2', minHeight: '100vh' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', maxWidth: 900, margin: '0 auto' }}>
        <Link href="/"><img src="/logo.svg" alt="Tidal Care Network" style={{ height: 48, width: 'auto' }} /></Link>
        <Link href="/dashboard" style={{ fontSize: 14, color: teal, textDecoration: 'none' }}>← Dashboard</Link>
      </header>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 40px 64px' }}>{children}</div>
    </main>
  )
}
