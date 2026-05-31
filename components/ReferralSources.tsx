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

export default function ReferralSources({ providerId }: { providerId: string }) {
  const [favorites, setFavorites] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Provider[]>([])
  const [searching, setSearching] = useState(false)

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
    // exclude self and already-favorited
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
    if (!error) setFavorites((cur) => cur.filter((f) => f.id !== id))
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: dark }}>My referral sources</h2>
        {!adding && <button onClick={() => setAdding(true)} style={{ fontSize: 13, fontWeight: 500, color: teal, background: 'white', border: `1px solid ${teal}`, padding: '7px 14px', borderRadius: 8, cursor: 'pointer' }}>+ Add</button>}
      </div>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 14, lineHeight: 1.5 }}>Your go-to providers for quick referrals. Add colleagues from the network you refer to often.</p>

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
        <p style={{ fontSize: 13, color: '#aaa', padding: '16px 0' }}>No referral sources yet. Tap “+ Add” to build your list.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {favorites.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'white', borderRadius: 10, border: '1px solid #e5e3dc' }}>
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
                <Link href={`/directory?refer=${p.id}`} style={{ fontSize: 12, fontWeight: 500, color: 'white', background: teal, textDecoration: 'none', padding: '6px 12px', borderRadius: 6 }}>Refer</Link>
                <button onClick={() => removeFavorite(p.id)} title="Remove" style={{ fontSize: 16, color: '#bbb', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
