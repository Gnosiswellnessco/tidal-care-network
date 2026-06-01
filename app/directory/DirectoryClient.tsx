'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, TAGS } from '@/lib/taxonomy'
import { RatingDisplay } from '@/components/RatingWidget'
import DirectoryMap from '@/components/DirectoryMap'
import SignOutButton from '@/components/SignOutButton'
import BrandLogo from '@/components/BrandLogo'
import QRCodeImage from '@/components/QRCode'
import { REGIONS, METROS_BY_REGION, regionForZip, type Region } from '@/lib/sc-regions'


const teal = '#3e6a70'
const dark = '#2c4d52'
const mint = '#e8eff0'

function categoryLabel(key: string) {
  return CATEGORIES.find((c) => c.key === key)?.label || key
}

type Provider = {
  id: string; full_name: string; credentials: string | null; practice_name: string | null
  primary_area: string | null; primary_zip: string | null; bio: string | null; photo_url: string | null; is_org: boolean
  offers_telehealth: boolean; availability_status: string; phone?: string | null; email?: string | null; website?: string | null
  provider_categories: { category: string; is_primary: boolean }[]
  provider_tags: { tag_type: string; tag_value: string }[]
  is_endorsed?: boolean
  rating_avg?: number | null
  rating_count?: number
  map_lat?: number | null
  map_lng?: number | null
  map_label?: string | null
  map_visibility?: string
}

export default function DirectoryClient({ providers }: { providers: Provider[] }) {
  const [search, setSearch] = useState('')
  const [agreed, setAgreed] = useState(true)
  const [category, setCategory] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [region, setRegion] = useState<Region | ''>('')
  const [area, setArea] = useState('')
  const [teleOnly, setTeleOnly] = useState(false)
  const [acceptingOnly, setAcceptingOnly] = useState(false)

  const [selected, setSelected] = useState<Provider[]>([])
  const [trayOpen, setTrayOpen] = useState(false)
  const [step, setStep] = useState<'list' | 'done'>('list')

  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [myProviderId, setMyProviderId] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [loggedIn, setLoggedIn] = useState(false)
  const [view, setView] = useState<'list' | 'map'>('list')

  useState(() => {
    if (typeof window !== 'undefined') {
      const ok = window.localStorage.getItem('tcn_terms_agreed')
      if (!ok) setAgreed(false)
    }
  })

  function acceptTerms() {
    window.localStorage.setItem('tcn_terms_agreed', 'yes')
    setAgreed(true)
  }
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setLoggedIn(true)
      const { data: me } = await supabase.from('providers').select('id').eq('user_id', user.id).maybeSingle()
      if (!me) return
      setMyProviderId(me.id)
      const { data: favs } = await supabase.from('provider_favorites').select('favorite_provider_id').eq('owner_provider_id', me.id)
      setFavorites((favs || []).map((f) => f.favorite_provider_id))
    })
  }, [])

  async function toggleFavorite(targetId: string) {
    if (!myProviderId) return
    const supabase = createClient()
    if (favorites.includes(targetId)) {
      await supabase.from('provider_favorites').delete().eq('owner_provider_id', myProviderId).eq('favorite_provider_id', targetId)
      setFavorites((cur) => cur.filter((id) => id !== targetId))
    } else {
      await supabase.from('provider_favorites').insert({ owner_provider_id: myProviderId, favorite_provider_id: targetId })
      setFavorites((cur) => [...cur, targetId])
    }
  }

  const specialtyOptions = useMemo(() => {
    if (!category) return []
    return (TAGS[category] || []).flatMap((s) => s.options)
  }, [category])

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase()
        if (!`${p.full_name} ${p.practice_name || ''} ${p.bio || ''}`.toLowerCase().includes(q)) return false
      }
      if (category && !p.provider_categories.some((c) => c.category === category)) return false
      if (specialty && !p.provider_tags.some((t) => t.tag_value === specialty)) return false
      if (teleOnly && !p.offers_telehealth) return false
      if (acceptingOnly && p.availability_status !== 'accepting') return false
      if (region) {
        const r = regionForZip(p.primary_zip)
        if (r.region !== region) return false
        if (area && r.metro !== area) return false
      }
      return true
    })
  }, [providers, search, category, specialty, teleOnly, acceptingOnly, region, area])

  function toggleSelect(p: Provider) {
    setSelected((cur) => cur.some((s) => s.id === p.id) ? cur.filter((s) => s.id !== p.id) : [...cur, p])
    setTrayOpen(true)
  }
  const isSelected = (id: string) => selected.some((s) => s.id === id)

  // Create an ANONYMOUS referral: no client name/email is ever stored.
  async function handleCreate() {
    setError('')
    if (selected.length === 0) { setError('Select at least one provider.'); return }
    setSending(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let fromId: string | null = null
    if (user) {
      const { data: me } = await supabase.from('providers').select('id').eq('user_id', user.id).maybeSingle()
      fromId = me?.id || null
    }

    const token = crypto.randomUUID().replace(/-/g, '')

    const { data: referral, error: refErr } = await supabase
      .from('referrals')
      .insert({
        from_provider_id: fromId,
        referral_type: 'client',
        note: note || null,
        share_token: token,
        status: 'sent',
      }).select().single()

    if (refErr || !referral) { setError('Could not create referral: ' + (refErr?.message || 'unknown')); setSending(false); return }

    await supabase.from('referral_providers').insert(selected.map((p) => ({ referral_id: referral.id, provider_id: p.id })))

    setSending(false)
    setShareUrl(`${window.location.origin}/r/${token}`)
    setStep('done')
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function resetAll() {
    setSelected([]); setStep('list'); setNote(''); setShareUrl(''); setError(''); setTrayOpen(false); setCopied(false)
  }

  const mailtoHref = `mailto:?subject=${encodeURIComponent('A referral from Tidal Care Network')}&body=${encodeURIComponent(`You've been referred to a provider through Tidal Care Network. View the details and contact information here:\n\n${shareUrl}\n\nThese are vetted members of the network.`)}`

  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1a1a', background: '#f7f6f2', minHeight: '100vh' }}>
      {!agreed && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,30,32,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 16, maxWidth: 480, padding: 32, textAlign: 'center' }}>
            <img src="/tidal-care-network.svg" alt="Tidal Care Network" style={{ height: 48, width: 'auto', marginBottom: 16 }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: dark, marginBottom: 12 }}>Before you browse</h2>
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 16, textAlign: 'left' }}>
              Tidal Care Network is a directory only. The providers listed are independent professionals — we are not responsible for the care they provide, and a listing is not an endorsement or guarantee. You are responsible for evaluating any provider and verifying their credentials before engaging them.
            </p>
            <div style={{ background: '#fbeef0', border: '1px solid #f3c9d0', borderRadius: 8, padding: 12, marginBottom: 16, textAlign: 'left' }}>
              <p style={{ fontSize: 13, color: '#7a2230', lineHeight: 1.6, margin: 0 }}>
                <strong>In a crisis, this directory is not the right tool.</strong> If you or someone else is in danger, call <strong>911</strong>. For mental health or suicidal crisis, call or text <strong>988</strong> (Suicide &amp; Crisis Lifeline), available 24/7, or visit your <strong>nearest emergency room</strong>.
              </p>
            </div>
            <p style={{ fontSize: 13, color: '#777', marginBottom: 20, textAlign: 'left' }}>
              By continuing, you agree to our <Link href="/terms" target="_blank" style={{ color: teal }}>Terms of Use</Link>.
            </p>
            <button onClick={acceptTerms} style={{ fontSize: 14, fontWeight: 500, padding: '11px 24px', borderRadius: 8, border: 'none', background: teal, color: 'white', cursor: 'pointer' }}>
              I understand and agree
            </button>
          </div>
        </div>
      )}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/"><img src="/tidal-care-network.svg" alt="Tidal Care Network" style={{ height: 180, width: 'auto' }} /></Link>
        <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link href="/directory" style={{ fontSize: 15, color: teal, fontWeight: 500, textDecoration: 'none' }}>Find a provider</Link>
          {myProviderId ? (
            <>
              <Link href="/dashboard" style={{ fontSize: 15, fontWeight: 500, color: 'white', background: teal, padding: '9px 18px', borderRadius: 8, textDecoration: 'none' }}>My dashboard</Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" style={{ fontSize: 15, color: dark, textDecoration: 'none' }}>Provider login</Link>
              <Link href="/login?next=/join" style={{ fontSize: 15, fontWeight: 500, color: 'white', background: teal, padding: '9px 18px', borderRadius: 8, textDecoration: 'none' }}>Join the network</Link>
            </>
          )}
        </nav>
      </header>

      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 40px 8px' }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: dark, marginBottom: 8 }}>Provider directory</h1>
        <p style={{ fontSize: 16, color: '#666' }}>{filtered.length} of {providers.length} provider{providers.length === 1 ? '' : 's'} · check providers to build a referral</p>
      </section>

      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '8px 40px 16px' }}>
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', padding: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, practice, or keyword…" style={{ flex: '1 1 220px', padding: '10px 12px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, color: '#1a1a1a', background: 'white' }} />
            <select value={category} onChange={(e) => { setCategory(e.target.value); setSpecialty('') }} style={selectStyle}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} disabled={!category} style={{ ...selectStyle, color: category ? '#1a1a1a' : '#aaa', opacity: category ? 1 : 0.6 }}>
              <option value="">{category ? 'All specialties' : 'Pick a category first'}</option>
              {specialtyOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={region} onChange={(e) => { setRegion(e.target.value as Region | ''); setArea('') }} style={selectStyle}>
              <option value="">All regions</option>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={area} onChange={(e) => setArea(e.target.value)} disabled={!region} style={{ ...selectStyle, color: region ? '#1a1a1a' : '#aaa', opacity: region ? 1 : 0.6 }}>
              <option value="">{region ? 'All areas' : 'Pick a region first'}</option>
              {region && METROS_BY_REGION[region as Region].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 14, paddingTop: 14, borderTop: '1px solid #f0f0f0', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: dark, cursor: 'pointer' }}><input type="checkbox" checked={teleOnly} onChange={(e) => setTeleOnly(e.target.checked)} /> Telehealth available</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: dark, cursor: 'pointer' }}><input type="checkbox" checked={acceptingOnly} onChange={(e) => setAcceptingOnly(e.target.checked)} /> Accepting new clients</label>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '8px 40px 100px' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          <button onClick={() => setView('list')} style={{ fontSize: 13, fontWeight: 500, padding: '8px 18px', borderRadius: 8, cursor: 'pointer', border: view === 'list' ? `2px solid ${teal}` : '1px solid #d4d2ca', background: view === 'list' ? mint : 'white', color: dark }}>List</button>
          <button onClick={() => setView('map')} style={{ fontSize: 13, fontWeight: 500, padding: '8px 18px', borderRadius: 8, cursor: 'pointer', border: view === 'map' ? `2px solid ${teal}` : '1px solid #d4d2ca', background: view === 'map' ? mint : 'white', color: dark }}>Map</button>
        </div>

        {view === 'map' ? (
          <DirectoryMap
            providers={filtered.filter((p) => p.map_lat != null && p.map_lng != null).map((p) => ({
              id: p.id, full_name: p.full_name, practice_name: p.practice_name, is_org: p.is_org, credentials: p.credentials,
              latitude: p.map_lat as number, longitude: p.map_lng as number, label: p.map_label ?? null, visibility: p.map_visibility ?? 'full',
              categories: p.provider_categories.map((c) => categoryLabel(c.category)),
              tags: p.provider_tags.map((t) => t.tag_value),
              bio: p.bio,
            }))}
            selectedIds={selected.map((s) => s.id)}
            onAddToReferral={(id) => {
              const prov = providers.find((p) => p.id === id)
              if (prov && !selected.some((s) => s.id === id)) { setSelected((cur) => [...cur, prov]); setTrayOpen(true) }
            }}
          />
        ) : filtered.length === 0 ? (
          <p style={{ fontSize: 15, color: '#888', padding: '32px 0', textAlign: 'center' }}>No providers match your filters.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map((p) => (
              <div key={p.id} style={{ background: 'white', borderRadius: 12, border: isSelected(p.id) ? `2px solid ${teal}` : '1px solid #e5e3dc', padding: 24, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                  {myProviderId && myProviderId !== p.id && (
                    <button onClick={() => toggleFavorite(p.id)} title={favorites.includes(p.id) ? 'Remove from referral sources' : 'Add to referral sources'} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, display: 'flex' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={favorites.includes(p.id) ? '#d6536d' : 'none'} stroke={favorites.includes(p.id) ? '#d6536d' : '#c9c6bd'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </button>
                  )}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: teal, cursor: 'pointer', fontWeight: 500 }}>
                    <input type="checkbox" checked={isSelected(p.id)} onChange={() => toggleSelect(p)} /> Refer
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <img src="/vetted.svg" alt="Vetted" style={{ height: 20, width: 'auto', display: 'block' }} />
                  {p.is_endorsed && <img src="/endorsed.svg" alt="Peer endorsed" style={{ height: 20, width: 'auto', display: 'block' }} />}
                </div>

                <Link href={`/provider/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, paddingRight: 60 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: mint, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e3dc' }}>
                      {p.photo_url ? <img src={p.photo_url} alt={p.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 20, fontWeight: 600, color: teal }}>{(p.full_name || '?').charAt(0).toUpperCase()}</span>}
                    </div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 600, color: dark, marginBottom: 2 }}>{p.is_org ? (p.practice_name || p.full_name) : `${p.full_name}${p.credentials ? `, ${p.credentials}` : ''}`}</div>
                      <div style={{ fontSize: 13, color: '#888' }}>{p.practice_name && !p.is_org ? `${p.practice_name} · ` : ''}{p.primary_area}{p.offers_telehealth ? ' · Telehealth' : ''}</div>
                    </div>
                  </div>
                  {p.bio && <p style={{ fontSize: 14, lineHeight: 1.6, color: '#555', marginBottom: 12 }}>{p.bio}</p>}
                  {p.provider_categories.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                      {p.provider_categories.map((pc) => <span key={pc.category} style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 99, background: mint, color: dark }}>{categoryLabel(pc.category)}</span>)}
                    </div>
                  )}
                  {p.availability_status === 'accepting' && <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6, background: '#eaf3de', color: '#27500a' }}>Accepting clients</span>}
                  <div style={{ marginTop: 8 }}>
                    <RatingDisplay avg={p.rating_avg ?? null} count={p.rating_count ?? 0} size={14} />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {selected.length > 0 && (
        <>
          {!trayOpen && (
            <button onClick={() => setTrayOpen(true)} aria-label="Open referral tray"
              style={{ position: 'fixed', top: '50%', right: 0, transform: 'translateY(-50%)', zIndex: 49, background: teal, color: 'white', border: 'none', borderRadius: '10px 0 0 10px', padding: '16px 10px', cursor: 'pointer', writingMode: 'vertical-rl', fontSize: 13, fontWeight: 600, boxShadow: '-2px 2px 12px rgba(0,0,0,0.15)' }}>
              Referral ({selected.length})
            </button>
          )}

          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(420px, 100vw)', background: '#f7f6f2', zIndex: 50, boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', overflowY: 'auto', padding: 24, transform: trayOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.28s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: dark }}>Your referral</h2>
              <button onClick={() => setTrayOpen(false)} aria-label="Hide tray" style={{ fontSize: 13, fontWeight: 500, color: teal, background: 'none', border: 'none', cursor: 'pointer' }}>Hide →</button>
            </div>

            {step !== 'done' && (
              <p style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.5, background: mint, padding: '8px 12px', borderRadius: 8 }}>
                Keep browsing and checking "Refer" on any provider to add them here. When you're ready, create a private referral link to share, show as a QR code, or print.
              </p>
            )}

            {step === 'done' ? (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>✓</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: dark, marginBottom: 8 }}>Referral link ready</h3>
                <p style={{ fontSize: 14, color: '#555', marginBottom: 16, lineHeight: 1.6 }}>Share this link, show the QR code for the person to scan, or print it. It contains no personal information about them.</p>

                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                  <QRCodeImage value={shareUrl} size={150} />
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input readOnly value={shareUrl} style={{ flex: 1, padding: '9px 10px', fontSize: 12, border: '1px solid #d4d2ca', borderRadius: 8, color: '#1a1a1a', background: '#faf9f5' }} />
                  <button onClick={copyLink} style={{ fontSize: 13, fontWeight: 500, padding: '9px 14px', borderRadius: 8, border: 'none', background: teal, color: 'white', cursor: 'pointer', whiteSpace: 'nowrap' }}>{copied ? 'Copied!' : 'Copy'}</button>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <a href={`/r/${shareUrl.split('/r/')[1]}/print`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontSize: 13, fontWeight: 500, padding: '9px 14px', borderRadius: 8, border: '1px solid ' + teal, background: 'white', color: teal, cursor: 'pointer', textDecoration: 'none' }}>Print</a>
                  <a href={mailtoHref} style={{ flex: 1, fontSize: 13, fontWeight: 500, padding: '9px 14px', borderRadius: 8, border: '1px solid ' + teal, background: 'white', color: teal, cursor: 'pointer', textDecoration: 'none' }}>Email from my app</a>
                </div>

                <button onClick={resetAll} style={{ fontSize: 14, fontWeight: 500, padding: '10px 20px', borderRadius: 8, border: '1px solid #d4d2ca', background: 'white', color: dark, cursor: 'pointer', width: '100%' }}>Done</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {selected.map((p) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'white', borderRadius: 8, border: '1px solid #e5e3dc' }}>
                      <span style={{ fontSize: 13, color: dark, fontWeight: 500 }}>{p.is_org ? (p.practice_name || p.full_name) : `${p.full_name}${p.credentials ? `, ${p.credentials}` : ''}`}</span>
                      <button onClick={() => toggleSelect(p)} style={{ fontSize: 12, color: '#991b1b', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', padding: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: dark, marginBottom: 6 }}>Optional note</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="A short, general note (optional)." style={{ ...trayInp, minHeight: 60, resize: 'vertical' }} />
                  <p style={{ fontSize: 11, color: '#b3504f', marginTop: -6, marginBottom: 14, lineHeight: 1.5 }}>
                    Please do <strong>not</strong> include any personal health information about the client in this note. It appears on the referral page and printout.
                  </p>
                  {error && <p style={{ fontSize: 13, color: '#b91c1c', marginBottom: 12 }}>{error}</p>}
                  <button onClick={handleCreate} disabled={sending} style={{ width: '100%', fontSize: 14, fontWeight: 500, padding: '11px', borderRadius: 8, border: 'none', background: teal, color: 'white', cursor: sending ? 'default' : 'pointer', opacity: sending ? 0.6 : 1 }}>
                    {sending ? 'Creating…' : 'Create referral link'}
                  </button>
                  <p style={{ fontSize: 11, color: '#888', marginTop: 10, lineHeight: 1.5 }}>
                    This creates a private link with no personal information about the person you&apos;re referring. You deliver it yourself — by sharing the link, showing the QR code, printing it, or emailing it from your own email app.
                  </p>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </main>
  )
}

const selectStyle: React.CSSProperties = {
  padding: '10px 36px 10px 12px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, color: '#1a1a1a', background: 'white',
  appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%233e6a70' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', cursor: 'pointer',
}
const trayInp: React.CSSProperties = { width: '100%', padding: '9px 11px', fontSize: 13, border: '1px solid #d4d2ca', borderRadius: 8, color: '#1a1a1a', background: 'white', marginBottom: 12 }
