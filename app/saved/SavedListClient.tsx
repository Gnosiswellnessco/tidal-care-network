'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@/lib/taxonomy'
import SiteHeader from '@/components/SiteHeader'
import { BRAND, SERIF } from '@/lib/brand'

const teal = BRAND.teal
const dark = BRAND.dark
const mint = BRAND.mint
const hairline = BRAND.hairline
const cardShadow = '0 1px 3px rgba(44,77,82,0.05)'

function categoryLabel(key: string | null | undefined) {
  if (!key) return ''
  return CATEGORIES.find((c) => c.key === key)?.label || key
}

type Provider = {
  id: string
  full_name: string
  credentials: string | null
  practice_name: string | null
  primary_area: string | null
  photo_url: string | null
  is_org: boolean
  availability_status: string
  offers_telehealth: boolean
  primary_category?: string | null
}

export default function SavedListClient({ providers, unavailableCount }: { providers: Provider[]; unavailableCount: number }) {
  const [list, setList] = useState(providers)
  const [busy, setBusy] = useState<string | null>(null)

  async function remove(id: string) {
    if (busy) return
    setBusy(id)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('member_provider_list').delete().eq('user_id', user.id).eq('provider_id', id)
    }
    setList((cur) => cur.filter((p) => p.id !== id))
    setBusy(null)
  }

  const pill: React.CSSProperties = { fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 99, background: 'white', border: '0.5px solid ' + hairline, color: '#5f6b6d' }

  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1a1a', background: BRAND.pageBg, minHeight: '100vh' }}>
      <SiteHeader right={<Link href="/directory" style={{ fontSize: 14, color: teal, textDecoration: 'none' }}>← Back to directory</Link>} />

      <section style={{ maxWidth: 760, margin: '0 auto', padding: '28px 40px 64px' }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, color: dark, marginBottom: 6, letterSpacing: '-0.01em' }}>Your saved providers</h1>
        <p style={{ fontSize: 15, color: '#6b7577', marginBottom: 24 }}>
          {list.length === 0 ? 'You haven\u2019t saved any providers yet.' : `${list.length} saved provider${list.length === 1 ? '' : 's'}.`}
          {unavailableCount > 0 && ` (${unavailableCount} previously saved ${unavailableCount === 1 ? 'provider is' : 'providers are'} not currently listed.)`}
        </p>

        {list.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 14, border: '0.5px solid ' + hairline, boxShadow: cardShadow, padding: 32, textAlign: 'center' }}>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, margin: '0 0 16px' }}>
              Browse the directory and tap the bookmark on any provider to save them here for later.
            </p>
            <Link href="/directory" style={{ display: 'inline-block', fontSize: 14, fontWeight: 500, color: 'white', background: teal, padding: '10px 22px', borderRadius: 8, textDecoration: 'none' }}>
              Find a provider
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {list.map((p) => (
              <div key={p.id} style={{ background: 'white', borderRadius: 14, border: '0.5px solid ' + hairline, boxShadow: cardShadow, padding: 24, position: 'relative' }}>
                <button onClick={() => remove(p.id)} disabled={busy === p.id} title="Remove from your list"
                  style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: busy === p.id ? 'default' : 'pointer', padding: 0, lineHeight: 1, display: 'flex', opacity: busy === p.id ? 0.5 : 1 }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill={teal} stroke={teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                </button>

                <Link href={`/provider/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, paddingRight: 40 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: mint, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid ' + hairline }}>
                      {p.photo_url ? <img src={p.photo_url} alt={p.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 20, fontWeight: 600, color: teal }}>{(p.full_name || '?').charAt(0).toUpperCase()}</span>}
                    </div>
                    <div>
                      <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: dark, marginBottom: 2, letterSpacing: '-0.01em', lineHeight: 1.15 }}>{p.is_org ? (p.practice_name || p.full_name) : `${p.full_name}${p.credentials ? `, ${p.credentials}` : ''}`}</div>
                      <div style={{ fontSize: 13, color: '#888' }}>{p.practice_name && !p.is_org ? `${p.practice_name} \u00b7 ` : ''}{p.primary_area}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {p.primary_category && <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: mint, color: dark }}>{categoryLabel(p.primary_category)}</span>}
                    {p.availability_status === 'accepting' && <span style={pill}><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#5a9b6b', marginRight: 5, verticalAlign: 'middle' }} />Accepting clients</span>}
                    {p.offers_telehealth && <span style={pill}>Telehealth</span>}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
