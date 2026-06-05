'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, TAGS, POPULATIONS, INSURANCE_OPTIONS } from '@/lib/taxonomy'
import { RatingDisplay } from '@/components/RatingWidget'
import DirectoryMap from '@/components/DirectoryMap'
import SignOutButton from '@/components/SignOutButton'
import QRCodeImage from '@/components/QRCode'
import SiteHeader from '@/components/SiteHeader'
import { BRAND, SERIF } from '@/lib/brand'
import { REGIONS, METROS_BY_REGION, regionForZip, type Region } from '@/lib/sc-regions'
import { showsSupporterBadge, hasBooking, bookingAction, PREMIUM_ACCENT } from '@/lib/subscription'


const teal = BRAND.teal
const dark = BRAND.dark
const mint = BRAND.mint
const hairline = BRAND.hairline
const champagne = BRAND.champagne
const cardShadow = '0 1px 3px rgba(44,77,82,0.05)'

function categoryLabel(key: string) {
  return CATEGORIES.find((c) => c.key === key)?.label || key
}

type Provider = {
  id: string; full_name: string; credentials: string | null; practice_name: string | null
  primary_area: string | null; primary_zip: string | null; bio: string | null; photo_url: string | null; is_org: boolean
  offers_telehealth: boolean; availability_status: string; phone?: string | null; email?: string | null; website?: string | null
  provider_categories: { category: string; is_primary: boolean }[]
  provider_tags: { tag_type: string; tag_value: string }[]
  provider_insurance?: string[]
  provider_populations?: string[]
  is_endorsed?: boolean
  rating_avg?: number | null
  rating_count?: number
  peer_rec_count?: number
  map_lat?: number | null
  map_lng?: number | null
  map_label?: string | null
  map_visibility?: string
  is_premium?: boolean | null
  subscription_status?: string | null
  show_supporter_badge?: boolean | null
  booking_type?: string | null
  booking_value?: string | null
}

export default function DirectoryClient({ providers }: { providers: Provider[] }) {
  const [search, setSearch] = useState('')
  const [agreed, setAgreed] = useState(true)
  const [category, setCategory] = useState('')
  const [specialties, setSpecialties] = useState<string[]>([])
  const [specMode, setSpecMode] = useState<'any' | 'all'>('any')
  const [specOpen, setSpecOpen] = useState(false)
  const [insurances, setInsurances] = useState<string[]>([])
  const [insOpen, setInsOpen] = useState(false)
  const [pops, setPops] = useState<string[]>([])
  const [popMode, setPopMode] = useState<'any' | 'all'>('any')
  const [popOpen, setPopOpen] = useState(false)
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
  const [canRecommend, setCanRecommend] = useState(false)
  const [recommended, setRecommended] = useState<string[]>([])
  const [recCounts, setRecCounts] = useState<Record<string, number>>({})
  const [recBusy, setRecBusy] = useState<string | null>(null)
  const [view, setView] = useState<'list' | 'map'>('list')

  const specRef = useRef<HTMLDivElement>(null)
  const insRef = useRef<HTMLDivElement>(null)
  const popRef = useRef<HTMLDivElement>(null)

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
      const { data: me } = await supabase.from('providers').select('id, vetting_status, is_active').eq('user_id', user.id).maybeSingle()
      if (!me) return
      setMyProviderId(me.id)
      setCanRecommend(me.vetting_status === 'approved' && me.is_active !== false)
      const { data: favs } = await supabase.from('provider_favorites').select('favorite_provider_id').eq('owner_provider_id', me.id)
      setFavorites((favs || []).map((f) => f.favorite_provider_id))
      const { data: myRecs } = await supabase.from('peer_recommendations').select('recommended_provider_id').eq('recommender_provider_id', me.id)
      setRecommended((myRecs || []).map((r) => r.recommended_provider_id))
    })
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (specRef.current && !specRef.current.contains(e.target as Node)) setSpecOpen(false)
      if (insRef.current && !insRef.current.contains(e.target as Node)) setInsOpen(false)
      if (popRef.current && !popRef.current.contains(e.target as Node)) setPopOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
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

  async function toggleRecommend(targetId: string) {
    if (!myProviderId || !canRecommend || recBusy) return
    setRecBusy(targetId)
    const supabase = createClient()
    const already = recommended.includes(targetId)
    const baseCount = recCounts[targetId] ?? (providers.find((p) => p.id === targetId)?.peer_rec_count ?? 0)
    if (already) {
      const { error } = await supabase.from('peer_recommendations').delete().eq('recommender_provider_id', myProviderId).eq('recommended_provider_id', targetId)
      if (!error) {
        setRecommended((cur) => cur.filter((id) => id !== targetId))
        setRecCounts((cur) => ({ ...cur, [targetId]: Math.max(0, baseCount - 1) }))
      }
    } else {
      const { error } = await supabase.from('peer_recommendations').insert({ recommender_provider_id: myProviderId, recommended_provider_id: targetId })
      if (!error) {
        setRecommended((cur) => [...cur, targetId])
        setRecCounts((cur) => ({ ...cur, [targetId]: baseCount + 1 }))
      }
    }
    setRecBusy(null)
  }

  const specialtySections = useMemo(() => {
    if (!category) return []
    return TAGS[category] || []
  }, [category])

  const insuranceOptions = INSURANCE_OPTIONS

  function toggleSpecialty(val: string) {
    setSpecialties((cur) => cur.includes(val) ? cur.filter((s) => s !== val) : [...cur, val])
  }
  function toggleInsurance(val: string) {
    setInsurances((cur) => cur.includes(val) ? cur.filter((s) => s !== val) : [...cur, val])
  }
  function togglePop(val: string) {
    setPops((cur) => cur.includes(val) ? cur.filter((s) => s !== val) : [...cur, val])
  }

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase()
        const hay = `${p.full_name} ${p.practice_name || ''} ${p.bio || ''} ${(p.provider_insurance || []).join(' ')} ${(p.provider_populations || []).join(' ')} ${p.provider_tags.map((t) => t.tag_value).join(' ')}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (category && !p.provider_categories.some((c) => c.category === category)) return false
      if (specialties.length > 0) {
        const pTags = p.provider_tags.map((t) => t.tag_value)
        if (specMode === 'all') {
          if (!specialties.every((s) => pTags.includes(s))) return false
        } else {
          if (!specialties.some((s) => pTags.includes(s))) return false
        }
      }
      if (insurances.length > 0) {
        const pIns = p.provider_insurance || []
        if (!insurances.some((i) => pIns.includes(i))) return false
      }
      if (pops.length > 0) {
        const pPops = p.provider_populations || []
        if (popMode === 'all') {
          if (!pops.every((x) => pPops.includes(x))) return false
        } else {
          if (!pops.some((x) => pPops.includes(x))) return false
        }
      }
      if (teleOnly && !p.offers_telehealth) return false
      if (acceptingOnly && p.availability_status !== 'accepting') return false
      if (region) {
        const r = regionForZip(p.primary_zip)
        if (r.region !== region) return false
        if (area && r.metro !== area) return false
      }
      return true
    })
  }, [providers, search, category, specialties, specMode, insurances, pops, popMode, teleOnly, acceptingOnly, region, area])

  function toggleSelect(p: Provider) {
    setSelected((cur) => cur.some((s) => s.id === p.id) ? cur.filter((s) => s.id !== p.id) : [...cur, p])
    setTrayOpen(true)
  }
  const isSelected = (id: string) => selected.some((s) => s.id === id)

  function clearFilters() {
    setCategory(''); setSpecialties([]); setInsurances([]); setPops([]); setRegion(''); setArea(''); setTeleOnly(false); setAcceptingOnly(false); setSearch('')
  }

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
      .insert({ from_provider_id: fromId, referral_type: 'client', note: note || null, share_token: token, status: 'sent' })
      .select().single()

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

  const activeSpecSet = new Set(specialties)
  const activeInsSet = new Set(insurances)
  const activePopSet = new Set(pops)

  const anyFilterActive = !!(category || specialties.length || insurances.length || pops.length || region || teleOnly || acceptingOnly || search)

  const headerRight = (
    <>
      <Link href="/directory" style={{ fontSize: 14, color: teal, fontWeight: 500, textDecoration: 'none' }}>Find a provider</Link>
      <Link href="/news" style={{ fontSize: 14, color: '#4a5557', textDecoration: 'none' }}>News</Link>
      {myProviderId ? (
        <>
          <Link href="/dashboard" style={{ fontSize: 14, fontWeight: 500, color: 'white', background: teal, padding: '9px 18px', borderRadius: 8, textDecoration: 'none' }}>My dashboard</Link>
          <SignOutButton />
        </>
      ) : (
        <>
          <Link href="/login" style={{ fontSize: 14, color: dark, textDecoration: 'none' }}>Provider login</Link>
          <Link href="/login?next=/join" style={{ fontSize: 14, fontWeight: 500, color: 'white', background: teal, padding: '9px 18px', borderRadius: 8, textDecoration: 'none' }}>Join the network</Link>
        </>
      )}
    </>
  )

  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1a1a', background: BRAND.pageBg, minHeight: '100vh' }}>
      {!agreed && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,30,32,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 16, maxWidth: 480, padding: 32, textAlign: 'center' }}>
            <img src="/tidal-care-network.svg" alt="Tidal Care Network" style={{ height: 96, width: 'auto', margin: '0 auto 16px', display: 'block' }} />
            <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: dark, marginBottom: 12 }}>Before you browse</h2>
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

      <SiteHeader right={headerRight} />

      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 40px 8px' }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, color: dark, marginBottom: 6, letterSpacing: '-0.01em' }}>Provider directory</h1>
        <p style={{ fontSize: 15, color: '#6b7577' }}>{filtered.length} of {providers.length} provider{providers.length === 1 ? '' : 's'} · check providers to build a referral</p>
      </section>

      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '8px 40px 0' }}>
        <div style={{ background: BRAND.panelBg, borderRadius: 14, border: '0.5px solid #dde7e6', padding: '18px 24px', fontSize: 13, color: '#54625f', lineHeight: 1.7 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#7d8a87', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>How to use this directory</div>
          <p style={{ margin: '0 0 8px' }}>
            Browse or filter providers by category, specialty, population, insurance, region, telehealth, and whether they&apos;re accepting new clients. Open any provider&apos;s profile to see their full details and contact information. To build a referral, check &quot;Refer&quot; on one or more providers, then create a private link you can share, show as a QR code, or print.
          </p>
          <p style={{ margin: 0 }}>
            Tidal Care Network is a directory only — providers are independent professionals, and a listing is not a guarantee or endorsement of care. In an emergency call <strong>911</strong>, or call/text <strong>988</strong> for mental health crisis support. By using this directory you agree to our <Link href="/terms" style={{ color: teal }}>Terms of Use</Link>.
          </p>
        </div>
      </section>


      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '16px 40px 16px' }}>
        <div style={{ background: 'white', borderRadius: 14, border: '0.5px solid ' + hairline, boxShadow: cardShadow, padding: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, practice, keyword, specialty, insurance, or population…" style={{ flex: '1 1 220px', padding: '10px 12px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, color: '#1a1a1a', background: 'white' }} />
            <select value={category} onChange={(e) => { setCategory(e.target.value); setSpecialties([]) }} style={selectStyle}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>

            {/* Specialty multi-select */}
            <div ref={specRef} style={{ position: 'relative' }}>
              <button onClick={() => category && setSpecOpen((o) => !o)} disabled={!category}
                style={{ ...selectStyle, minWidth: 170, textAlign: 'left', color: category ? '#1a1a1a' : '#aaa', opacity: category ? 1 : 0.6, cursor: category ? 'pointer' : 'default' }}>
                {specialties.length ? `Specialties (${specialties.length})` : (category ? 'All specialties' : 'Pick a category first')}
              </button>
              {specOpen && category && (
                <div style={panel}>
                  <div style={panelHeader}>
                    <span style={{ fontSize: 12, color: '#888', alignSelf: 'center' }}>Match:</span>
                    <button onClick={() => setSpecMode('any')} style={modeBtn(specMode === 'any')}>Any</button>
                    <button onClick={() => setSpecMode('all')} style={modeBtn(specMode === 'all')}>All</button>
                    {specialties.length > 0 && <button onClick={() => setSpecialties([])} style={clearBtn}>Clear</button>}
                  </div>
                  {specialtySections.map((sec) => (
                    <div key={sec.title} style={{ marginBottom: 10 }}>
                      <div style={panelSecLabel}>{sec.title}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {sec.options.map((opt) => (
                          <label key={opt} style={checkRow}>
                            <input type="checkbox" checked={specialties.includes(opt)} onChange={() => toggleSpecialty(opt)} />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Populations multi-select */}
            <div ref={popRef} style={{ position: 'relative' }}>
              <button onClick={() => setPopOpen((o) => !o)} style={{ ...selectStyle, minWidth: 160, textAlign: 'left' }}>
                {pops.length ? `Populations (${pops.length})` : 'All populations'}
              </button>
              {popOpen && (
                <div style={panel}>
                  <div style={panelHeader}>
                    <span style={{ fontSize: 12, color: '#888', alignSelf: 'center' }}>Match:</span>
                    <button onClick={() => setPopMode('any')} style={modeBtn(popMode === 'any')}>Any</button>
                    <button onClick={() => setPopMode('all')} style={modeBtn(popMode === 'all')}>All</button>
                    {pops.length > 0 && <button onClick={() => setPops([])} style={clearBtn}>Clear</button>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {POPULATIONS.map((opt) => (
                      <label key={opt} style={checkRow}>
                        <input type="checkbox" checked={pops.includes(opt)} onChange={() => togglePop(opt)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Insurance multi-select */}
            <div ref={insRef} style={{ position: 'relative' }}>
              <button onClick={() => setInsOpen((o) => !o)} style={{ ...selectStyle, minWidth: 150, textAlign: 'left' }}>
                {insurances.length ? `Insurance (${insurances.length})` : 'All insurance'}
              </button>
              {insOpen && (
                <div style={panel}>
                  {insurances.length > 0 && <button onClick={() => setInsurances([])} style={{ ...clearBtn, marginBottom: 6 }}>Clear</button>}
                  {insuranceOptions.length === 0 ? (
                    <p style={{ fontSize: 13, color: '#999', margin: 0 }}>No insurance data yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {insuranceOptions.map((opt) => (
                        <label key={opt} style={checkRow}>
                          <input type="checkbox" checked={insurances.includes(opt)} onChange={() => toggleInsurance(opt)} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <select value={region} onChange={(e) => { setRegion(e.target.value as Region | ''); setArea('') }} style={selectStyle}>
              <option value="">All regions</option>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={area} onChange={(e) => setArea(e.target.value)} disabled={!region} style={{ ...selectStyle, color: region ? '#1a1a1a' : '#aaa', opacity: region ? 1 : 0.6 }}>
              <option value="">{region ? 'All areas' : 'Pick a region first'}</option>
              {region && METROS_BY_REGION[region as Region].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 14, paddingTop: 14, borderTop: '1px solid #f0eee8', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: dark, cursor: 'pointer' }}><input type="checkbox" checked={teleOnly} onChange={(e) => setTeleOnly(e.target.checked)} /> Telehealth available</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: dark, cursor: 'pointer' }}><input type="checkbox" checked={acceptingOnly} onChange={(e) => setAcceptingOnly(e.target.checked)} /> Accepting new clients</label>
            {anyFilterActive && <button onClick={clearFilters} style={{ fontSize: 13, color: teal, background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto', fontWeight: 500 }}>Clear all filters</button>}
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginTop: 14, paddingTop: 14, borderTop: '1px solid #f0eee8', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/vetted.svg" alt="Vetted" style={{ height: 18, width: 'auto' }} />
              <span style={{ fontSize: 12, color: '#666' }}><strong style={{ color: dark }}>Vetted</strong> — credentials reviewed by the Network</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/endorsed.svg" alt="Endorsed" style={{ height: 18, width: 'auto' }} />
              <span style={{ fontSize: 12, color: '#666' }}><strong style={{ color: dark }}>Endorsed</strong> — vouched for by a peer provider</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/Supporter.svg" alt="Network supporter" style={{ height: 32, width: 'auto' }} />
              <span style={{ fontSize: 12, color: '#666' }}><strong style={{ color: dark }}>Supporter</strong> — helps fund the network; not a quality or ranking signal</span>
            </div>
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
              id: p.id, full_name: p.full_name, practice_name: p.practice_name, is_org: p.is_org, credentials: p.credentials, photo_url: p.photo_url,
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
            {filtered.map((p) => {
              const matchedSpecs = p.provider_tags.map((t) => t.tag_value).filter((t) => activeSpecSet.has(t))
              const matchedIns = (p.provider_insurance || []).filter((i) => activeInsSet.has(i))
              const matchedPops = (p.provider_populations || []).filter((x) => activePopSet.has(x))
              const primaryCat = p.provider_categories.find((c) => c.is_primary)?.category || p.provider_categories[0]?.category
              const supporter = showsSupporterBadge(p)
              const booking = hasBooking(p) ? bookingAction(p) : null
              const recCount = recCounts[p.id] ?? p.peer_rec_count ?? 0
              const isRec = recommended.includes(p.id)
              return (
              <div key={p.id} style={{ background: 'white', borderRadius: 14, border: isSelected(p.id) ? `2px solid ${teal}` : '0.5px solid ' + hairline, boxShadow: cardShadow, padding: 24, position: 'relative' }}>
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
                  {supporter && <img src="/Supporter.svg" alt="Network supporter" style={{ height: 32, width: 'auto', display: 'block' }} />}
                </div>

                <Link href={`/provider/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, paddingRight: 60 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: mint, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid ' + hairline }}>
                      {p.photo_url ? <img src={p.photo_url} alt={p.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 20, fontWeight: 600, color: teal }}>{(p.full_name || '?').charAt(0).toUpperCase()}</span>}
                    </div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 600, color: dark, marginBottom: 2 }}>{p.is_org ? (p.practice_name || p.full_name) : `${p.full_name}${p.credentials ? `, ${p.credentials}` : ''}`}</div>
                      <div style={{ fontSize: 13, color: '#888' }}>{p.practice_name && !p.is_org ? `${p.practice_name} · ` : ''}{p.primary_area}</div>
                    </div>
                  </div>
                  {p.bio && <p style={{ fontSize: 14, lineHeight: 1.6, color: '#555', marginBottom: 12 }}>{p.bio}</p>}

                  {(matchedSpecs.length > 0 || matchedIns.length > 0 || matchedPops.length > 0) && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                      {matchedSpecs.map((s) => <span key={'ms' + s} style={matchChip}>✓ {s}</span>)}
                      {matchedPops.map((x) => <span key={'mp' + x} style={matchChip}>✓ {x}</span>)}
                      {matchedIns.map((i) => <span key={'mi' + i} style={matchChip}>✓ {i}</span>)}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                    {primaryCat && <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 99, background: mint, color: dark }}>{categoryLabel(primaryCat)}</span>}
                    {p.availability_status === 'accepting' && <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 99, background: '#eaf3de', color: '#27500a' }}>Accepting clients</span>}
                    {p.offers_telehealth && <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 99, background: '#e8eff5', color: '#2c4d6e' }}>Telehealth</span>}
                    {(p.provider_insurance || []).slice(0, 2).map((i) => <span key={'ins' + i} style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 99, background: '#f1efe8', color: '#555' }}>{i}</span>)}
                    {(p.provider_insurance || []).length > 2 && <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 99, background: '#f1efe8', color: '#999' }}>+{(p.provider_insurance || []).length - 2} more</span>}
                  </div>

                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <RatingDisplay avg={p.rating_avg ?? null} count={p.rating_count ?? 0} size={14} />
                    {recCount > 0 && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: teal, background: mint, padding: '3px 9px', borderRadius: 999 }}>
                        <img src="/thumbs-up.svg" alt="" style={{ height: 13, width: 'auto', display: 'block' }} />
                        {recCount}
                      </span>
                    )}
                  </div>
                </Link>

                {canRecommend && myProviderId !== p.id && (
                  <button onClick={() => toggleRecommend(p.id)} disabled={recBusy === p.id}
                    title={isRec ? 'Remove your recommendation' : 'Recommend this provider to colleagues'}
                    style={{ marginTop: 12, marginRight: 8, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: isRec ? 'white' : teal, background: isRec ? teal : 'white', border: '1px solid ' + teal, padding: '7px 14px', borderRadius: 999, cursor: recBusy === p.id ? 'default' : 'pointer', opacity: recBusy === p.id ? 0.6 : 1 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={isRec ? 'white' : teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v11"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                    {isRec ? 'Recommended' : 'Recommend'}
                  </button>
                )}

                {booking && (
                  <a href={booking.href} target={p.booking_type === 'link' ? '_blank' : undefined} rel={p.booking_type === 'link' ? 'noopener noreferrer' : undefined}
                    style={{ display: 'inline-block', marginTop: 12, fontSize: 13, fontWeight: 500, color: 'white', background: PREMIUM_ACCENT, padding: '8px 16px', borderRadius: 8, textDecoration: 'none', letterSpacing: '0.02em' }}>
                    {booking.label}
                  </a>
                )}
              </div>
            )})}
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

          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(420px, 100vw)', background: BRAND.pageBg, zIndex: 50, boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', overflowY: 'auto', padding: 24, transform: trayOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.28s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: dark }}>Your referral</h2>
              <button onClick={() => setTrayOpen(false)} aria-label="Hide tray" style={{ fontSize: 13, fontWeight: 500, color: teal, background: 'none', border: 'none', cursor: 'pointer' }}>Hide →</button>
            </div>

            {step !== 'done' && (
              <p style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.5, background: mint, padding: '8px 12px', borderRadius: 8 }}>
                Keep browsing and checking &quot;Refer&quot; on any provider to add them here. When you&apos;re ready, create a private referral link to share, show as a QR code, or print.
              </p>
            )}

            {step === 'done' ? (
              <div style={{ background: 'white', borderRadius: 12, border: '0.5px solid ' + hairline, padding: 24, textAlign: 'center' }}>
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
                    <div key={p.id} style={{ padding: '10px 12px', background: 'white', borderRadius: 8, border: '0.5px solid ' + hairline }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontSize: 13, color: dark, fontWeight: 500 }}>{p.is_org ? (p.practice_name || p.full_name) : `${p.full_name}${p.credentials ? `, ${p.credentials}` : ''}`}</span>
                        <button onClick={() => toggleSelect(p)} style={{ fontSize: 12, color: '#991b1b', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>Remove</button>
                      </div>
                      {(p.email || p.phone) && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                          {p.email && <a href={`mailto:${p.email}?subject=${encodeURIComponent('Connecting via Tidal Care Network')}`} style={{ fontSize: 12, fontWeight: 500, color: teal, background: mint, padding: '5px 12px', borderRadius: 6, textDecoration: 'none' }}>Email</a>}
                          {p.phone && <a href={`tel:${p.phone}`} style={{ fontSize: 12, fontWeight: 500, color: teal, background: mint, padding: '5px 12px', borderRadius: 6, textDecoration: 'none' }}>Call</a>}
                          <Link href={`/provider/${p.id}`} style={{ fontSize: 12, color: '#888', padding: '5px 4px', textDecoration: 'none' }}>View profile →</Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ background: 'white', borderRadius: 12, border: '0.5px solid ' + hairline, padding: 20 }}>
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
const panel: React.CSSProperties = { position: 'absolute', top: '110%', left: 0, zIndex: 30, background: 'white', border: '1px solid #d4d2ca', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: 280, maxHeight: 360, overflowY: 'auto', padding: 12 }
const panelHeader: React.CSSProperties = { display: 'flex', gap: 6, marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #f0f0f0' }
const panelSecLabel: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }
const checkRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: dark, cursor: 'pointer', padding: '2px 0' }
const matchChip: React.CSSProperties = { fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: teal, color: 'white' }
function modeBtn(on: boolean): React.CSSProperties {
  return { fontSize: 12, padding: '4px 10px', borderRadius: 6, border: on ? `1.5px solid ${teal}` : '1px solid #d4d2ca', background: on ? mint : 'white', color: dark, cursor: 'pointer' }
}
const clearBtn: React.CSSProperties = { fontSize: 12, padding: '4px 8px', borderRadius: 6, border: 'none', background: 'none', color: '#991b1b', cursor: 'pointer', marginLeft: 'auto' }
