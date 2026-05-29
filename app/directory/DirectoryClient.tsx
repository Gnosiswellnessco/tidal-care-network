'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { CATEGORIES, TAGS } from '@/lib/taxonomy'

const teal = '#3e6a70'
const dark = '#2c4d52'
const mint = '#e8eff0'
const selectStyle: React.CSSProperties = {
  padding: '10px 36px 10px 12px',
  fontSize: 14,
  border: '1px solid #d4d2ca',
  borderRadius: 8,
  color: '#1a1a1a',
  background: 'white',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%233e6a70' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  cursor: 'pointer',
}

function categoryLabel(key: string) {
  return CATEGORIES.find((c) => c.key === key)?.label || key
}

type Provider = {
  id: string
  full_name: string
  credentials: string | null
  practice_name: string | null
  primary_area: string | null
  bio: string | null
  photo_url: string | null
  is_org: boolean
  offers_telehealth: boolean
  availability_status: string
  provider_categories: { category: string; is_primary: boolean }[]
  provider_tags: { tag_type: string; tag_value: string }[]
}

export default function DirectoryClient({ providers }: { providers: Provider[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [teleOnly, setTeleOnly] = useState(false)
  const [acceptingOnly, setAcceptingOnly] = useState(false)

  // Sub-specialty options depend on the chosen category
  const specialtyOptions = useMemo(() => {
    if (!category) return []
    const sections = TAGS[category] || []
    return sections.flatMap((s) => s.options)
  }, [category])

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase()
        const hay = `${p.full_name} ${p.practice_name || ''} ${p.bio || ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (category && !p.provider_categories.some((c) => c.category === category)) return false
      if (specialty && !p.provider_tags.some((t) => t.tag_value === specialty)) return false
      if (teleOnly && !p.offers_telehealth) return false
      if (acceptingOnly && p.availability_status !== 'accepting') return false
      return true
    })
  }, [providers, search, category, specialty, teleOnly, acceptingOnly])

  function resetFilters() {
    setSearch(''); setCategory(''); setSpecialty(''); setTeleOnly(false); setAcceptingOnly(false)
  }

  const hasFilters = search || category || specialty || teleOnly || acceptingOnly

  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1a1a', background: '#f7f6f2', minHeight: '100vh' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/"><img src="/logo.svg" alt="Tidal Care Network" style={{ height: 56, width: 'auto' }} /></Link>
        <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link href="/directory" style={{ fontSize: 15, color: teal, fontWeight: 500, textDecoration: 'none' }}>Find a provider</Link>
          <Link href="/login" style={{ fontSize: 15, color: dark, textDecoration: 'none' }}>Provider login</Link>
          <Link href="/login?next=/join" style={{ fontSize: 15, fontWeight: 500, color: 'white', background: teal, padding: '9px 18px', borderRadius: 8, textDecoration: 'none' }}>Join the network</Link>
        </nav>
      </header>

      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 40px 8px' }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: dark, marginBottom: 8 }}>Provider directory</h1>
        <p style={{ fontSize: 16, color: '#666' }}>{filtered.length} of {providers.length} provider{providers.length === 1 ? '' : 's'}</p>
      </section>

      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '8px 40px 16px' }}>
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', padding: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, practice, or keyword…"
              style={{ flex: '1 1 220px', padding: '10px 12px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, color: '#1a1a1a', background: 'white' }}
            />
            <select value={category} onChange={(e) => { setCategory(e.target.value); setSpecialty('') }} style={selectStyle}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} disabled={!category}
              style={{ ...selectStyle, color: category ? '#1a1a1a' : '#aaa', opacity: category ? 1 : 0.6 }}>
              <option value="">{category ? 'All specialties' : 'Pick a category first'}</option>
              {specialtyOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 14, paddingTop: 14, borderTop: '1px solid #f0f0f0', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: dark, cursor: 'pointer' }}>
              <input type="checkbox" checked={teleOnly} onChange={(e) => setTeleOnly(e.target.checked)} /> Telehealth available
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: dark, cursor: 'pointer' }}>
              <input type="checkbox" checked={acceptingOnly} onChange={(e) => setAcceptingOnly(e.target.checked)} /> Accepting new clients
            </label>
            {hasFilters && (
              <button onClick={resetFilters} style={{ fontSize: 13, color: teal, background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}>Clear filters</button>
            )}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '8px 40px 64px' }}>
        {filtered.length === 0 ? (
          <p style={{ fontSize: 15, color: '#888', padding: '32px 0', textAlign: 'center' }}>No providers match your filters. Try broadening your search.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map((p) => (
              <Link key={p.id} href={`/provider/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', padding: 24, cursor: 'pointer', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: mint, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e3dc' }}>
                      {p.photo_url ? (
                        <img src={p.photo_url} alt={p.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 20, fontWeight: 600, color: teal }}>{(p.full_name || '?').charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 600, color: dark, marginBottom: 2 }}>
                        {p.is_org ? (p.practice_name || p.full_name) : `${p.full_name}${p.credentials ? `, ${p.credentials}` : ''}`}
                      </div>
                      {p.is_org ? (
                        <div style={{ fontSize: 13, color: '#888' }}>
                          {p.full_name ? `Contact: ${p.full_name}${p.credentials ? `, ${p.credentials}` : ''}` : 'Organization'}{p.primary_area ? ` · ${p.primary_area}` : ''}{p.offers_telehealth ? ' · Telehealth' : ''}
                        </div>
                      ) : (
                        <div style={{ fontSize: 13, color: '#888' }}>
                          {p.practice_name ? `${p.practice_name} · ` : ''}{p.primary_area}{p.offers_telehealth ? ' · Telehealth available' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  {p.bio && <p style={{ fontSize: 14, lineHeight: 1.6, color: '#555', marginBottom: 12 }}>{p.bio}</p>}
                  {p.provider_categories.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                      {p.provider_categories.map((pc) => (
                        <span key={pc.category} style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 99, background: mint, color: dark }}>{categoryLabel(pc.category)}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6, background: mint, color: dark }}>✓ Vetted</span>
                    {p.availability_status === 'accepting' && (
                      <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6, background: '#eaf3de', color: '#27500a' }}>Accepting clients</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
