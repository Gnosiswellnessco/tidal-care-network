'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const teal = '#3e6a70'
const dark = '#2c4d52'
const mint = '#e8eff0'

type Provider = {
  id: string
  full_name: string
  credentials: string | null
  practice_name: string | null
  is_org: boolean
  email: string | null
  phone: string | null
  photo_url: string | null
  primary_zip: string | null
  offers_telehealth: boolean
}

function displayName(p: Provider) {
  return p.is_org ? (p.practice_name || p.full_name) : `${p.full_name}${p.credentials ? `, ${p.credentials}` : ''}`
}

const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, color: '#1a1a1a', background: 'white', marginBottom: 16 }

function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>{children}</label>
}

export default function ReferralSources({ providerId }: { providerId: string }) {
  const [favorites, setFavorites] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Provider[]>([])
  const [searching, setSearching] = useState(false)

  // Referral builder state
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [type, setType] = useState<'provider' | 'client'>('client')
  const [roi, setRoi] = useState(false)
  const [note, setNote] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ token: string; names: string[] } | null>(null)

  const loadFavorites = useCallback(async () => {
    const supabase = createClient()
    const { data: favRows } = await supabase
      .from('provider_favorites')
      .select('favorite_provider_id')
      .eq('owner_provider_id', providerId)

    const ids = (favRows || []).map((r) => r.favorite_provider_id)
    if (ids.length === 0) { setFavorites([]); setLoading(false); return }

    const { data: provs } = await supabase
      .from('providers')
      .select('id, full_name, credentials, practice_name, is_org, email, phone, photo_url, primary_zip, offers_telehealth')
      .in('id', ids)
    setFavorites((provs as Provider[]) || [])
    setLoading(false)
  }, [providerId])

  useEffect(() => { loadFavorites() }, [loadFavorites])

  async function runSearch(q: string) {
    setSearch(q)
    if (!q.trim()) { setResults([]); return }
    setSearching(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('providers')
      .select('id, full_name, credentials, practice_name, is_org, email, phone, photo_url, primary_zip, offers_telehealth')
      .eq('vetting_status', 'approved')
      .eq('is_active', true)
      .or(`full_name.ilike.%${q}%,practice_name.ilike.%${q}%`)
      .limit(8)
    const favIds = new Set(favorites.map((f) => f.id))
    setResults(((data as Provider[]) || []).filter((p) => p.id !== providerId && !favIds.has(p.id)))
    setSearching(false)
  }

  async function addFavorite(p: Provider) {
    const supabase = createClient()
    const { error } = await supabase.from('provider_favorites').insert({
      owner_provider_id: providerId,
      favorite_provider_id: p.id,
    })
    if (!error) {
      setFavorites((cur) => [...cur, p])
      setResults((cur) => cur.filter((r) => r.id !== p.id))
    }
  }

  async function removeFavorite(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('provider_favorites')
      .delete()
      .eq('owner_provider_id', providerId)
      .eq('favorite_provider_id', id)
    if (!error) {
      setFavorites((cur) => cur.filter((f) => f.id !== id))
      setChecked((cur) => { const n = new Set(cur); n.delete(id); return n })
    }
  }

  function toggleCheck(id: string) {
    setChecked((cur) => {
      const n = new Set(cur)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  const selectedProviders = favorites.filter((f) => checked.has(f.id))

  async function handleSend() {
    setError('')
    if (selectedProviders.length === 0) { setError('Check at least one provider to refer.'); return }
    if (type === 'provider' && selectedProviders.length > 1) { setError('A warm handoff goes to a single provider. Select just one, or switch to a client referral.'); return }
    if (type === 'client' && !clientName.trim()) { setError('Enter the client name (or a private label) for this referral.'); return }
    setSending(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('You must be signed in to send referrals.'); setSending(false); return }

    const token = type === 'client' ? crypto.randomUUID().replace(/-/g, '') : null

    const { data: referral, error: refErr } = await supabase
      .from('referrals')
      .insert({
        from_provider_id: providerId,
        to_provider_id: type === 'provider' ? selectedProviders[0].id : null,
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
      selectedProviders.map((p) => ({ referral_id: referral.id, provider_id: p.id }))
    )

    setSending(false)
    setResult({ token: token || '', names: selectedProviders.map(displayName) })
  }

  function resetBuilder() {
    setResult(null); setChecked(new Set()); setNote(''); setClientName(''); setClientEmail(''); setRoi(false); setType('client')
  }

  // --- Result screen ---
  if (result) {
    const shareUrl = result.token ? `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${result.token}` : ''
    return (
      <div>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e5e3dc', padding: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>✓</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: dark, marginBottom: 8 }}>Referral created</h2>
          {result.token ? (
            <>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 18 }}>Share this link{clientName ? ` with ${clientName}` : ''} so they can view the recommended provider{result.names.length > 1 ? 's' : ''} and reach out.</p>
              <div style={{ display: 'flex', gap: 8, maxWidth: 460, margin: '0 auto 18px' }}>
                <input readOnly value={shareUrl} style={{ flex: 1, padding: '10px 12px', fontSize: 13, border: '1px solid #d4d2ca', borderRadius: 8, color: '#1a1a1a', background: '#faf9f5' }} />
                <button onClick={() => navigator.clipboard.writeText(shareUrl)} style={{ fontSize: 13, fontWeight: 500, padding: '10px 16px', borderRadius: 8, border: 'none', background: teal, color: 'white', cursor: 'pointer' }}>Copy</button>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 18 }}>Your warm handoff to {result.names[0]} has been recorded. They&apos;ll be notified.</p>
          )}
          <button onClick={resetBuilder} style={{ fontSize: 14, fontWeight: 500, color: 'white', background: teal, padding: '10px 22px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Create another referral</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: dark }}>My preferred referral sources</h2>
        {!adding && <button onClick={() => setAdding(true)} style={{ fontSize: 13, fontWeight: 500, color: teal, background: 'white', border: `1px solid ${teal}`, padding: '7px 14px', borderRadius: 8, cursor: 'pointer' }}>+ Add</button>}
      </div>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 14, lineHeight: 1.5 }}>Your go-to providers. Check the ones you want to refer to, then build the referral below.</p>

      {adding && (
        <div style={{ padding: 16, background: mint, borderRadius: 12, marginBottom: 16 }}>
          <input value={search} onChange={(e) => runSearch(e.target.value)} placeholder="Search the network by name or practice…" style={{ width: '100%', padding: '9px 11px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, color: '#1a1a1a', background: 'white', marginBottom: 10 }} />
          {searching && <p style={{ fontSize: 12, color: '#888' }}>Searching…</p>}
          {results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {results.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'white', borderRadius: 8, border: '1px solid #e5e3dc' }}>
                  <span style={{ fontSize: 13, color: dark }}>{displayName(p)}</span>
                  <button onClick={() => addFavorite(p)} style={{ fontSize: 12, fontWeight: 500, color: 'white', background: teal, border: 'none', padding: '5px 12px', borderRadius: 6, cursor: 'pointer' }}>Add</button>
                </div>
              ))}
            </div>
          )}
          {search.trim() && !searching && results.length === 0 && <p style={{ fontSize: 12, color: '#888' }}>No matching providers found.</p>}
          <button onClick={() => { setAdding(false); setSearch(''); setResults([]) }} style={{ fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer', marginTop: 10 }}>Done adding</button>
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: 13, color: '#888' }}>Loading…</p>
      ) : favorites.length === 0 ? (
        <p style={{ fontSize: 13, color: '#aaa', padding: '16px 0' }}>No referral sources yet. Tap &ldquo;+ Add&rdquo; to build your list.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {favorites.map((p) => {
            const isChecked = checked.has(p.id)
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: isChecked ? mint : 'white', borderRadius: 10, border: isChecked ? `1px solid ${teal}` : '1px solid #e5e3dc' }}>
                <input type="checkbox" checked={isChecked} onChange={() => toggleCheck(p.id)} style={{ width: 18, height: 18, flexShrink: 0, cursor: 'pointer', accentColor: teal }} />
                <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: mint, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e3dc' }}>
                  {p.photo_url ? <img src={p.photo_url} alt={displayName(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 16, fontWeight: 600, color: teal }}>{(p.full_name || '?').charAt(0).toUpperCase()}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: dark }}>{displayName(p)}</div>
                  <div style={{ fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.primary_zip ? p.primary_zip : ''}{p.offers_telehealth ? ' · Telehealth' : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                  {p.phone && <a href={`tel:${p.phone}`} title="Call" style={{ fontSize: 12, color: teal, textDecoration: 'none', padding: '5px 10px', border: '1px solid #d4d2ca', borderRadius: 6 }}>Call</a>}
                  {p.email && <a href={`mailto:${p.email}`} title="Email" style={{ fontSize: 12, color: teal, textDecoration: 'none', padding: '5px 10px', border: '1px solid #d4d2ca', borderRadius: 6 }}>Email</a>}
                  <button onClick={() => removeFavorite(p.id)} title="Remove" style={{ fontSize: 16, color: '#bbb', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>×</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Referral builder */}
      {favorites.length > 0 && (
        <div style={{ marginTop: 24, paddingTop: 22, borderTop: '1px solid #eee' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: dark, marginBottom: 4 }}>Create a referral</h3>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
            {selectedProviders.length === 0
              ? 'Check one or more providers above to include them.'
              : `${selectedProviders.length} selected: ${selectedProviders.map(displayName).join(', ')}`}
          </p>

          <Label>Referral type</Label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            <button onClick={() => setType('client')} style={{ flex: 1, textAlign: 'left', padding: '12px 14px', borderRadius: 10, cursor: 'pointer', border: type === 'client' ? `2px solid ${teal}` : '1px solid #d4d2ca', background: type === 'client' ? mint : 'white' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: type === 'client' ? dark : '#333' }}>Send to a client</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Share provider info with your client to choose</div>
            </button>
            <button onClick={() => setType('provider')} style={{ flex: 1, textAlign: 'left', padding: '12px 14px', borderRadius: 10, cursor: 'pointer', border: type === 'provider' ? `2px solid ${teal}` : '1px solid #d4d2ca', background: type === 'provider' ? mint : 'white' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: type === 'provider' ? dark : '#333' }}>Warm handoff</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Refer directly to one provider</div>
            </button>
          </div>

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

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: dark, cursor: 'pointer', marginBottom: 18 }}>
            <input type="checkbox" checked={roi} onChange={(e) => setRoi(e.target.checked)} style={{ accentColor: teal }} />
            Request a Release of Information (ROI) so providers can communicate about this client
          </label>

          {error && <p style={{ fontSize: 14, color: '#b91c1c', marginBottom: 12 }}>{error}</p>}

          <button onClick={handleSend} disabled={sending} style={{ fontSize: 14, fontWeight: 500, padding: '11px 24px', borderRadius: 8, border: 'none', background: teal, color: 'white', cursor: sending ? 'default' : 'pointer', opacity: sending ? 0.6 : 1 }}>
            {sending ? 'Creating…' : type === 'client' ? 'Create referral & get link' : 'Send warm handoff'}
          </button>
        </div>
      )}
    </div>
  )
}
