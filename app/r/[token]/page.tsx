import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES } from '@/lib/taxonomy'

export const dynamic = 'force-dynamic'

function categoryLabel(key: string) {
  return CATEGORIES.find((c) => c.key === key)?.label || key
}

export default async function ClientReferralPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  const { data: referral } = await supabase
    .from('referrals')
    .select('*')
    .eq('share_token', token)
    .maybeSingle()

  if (!referral) notFound()

  const { data: links } = await supabase
    .from('referral_providers')
    .select('provider_id')
    .eq('referral_id', referral.id)

  const providerIds = (links || []).map((l) => l.provider_id)
  const { data: providers } = await supabase
    .from('providers')
    .select('*')
    .in('id', providerIds.length ? providerIds : ['00000000-0000-0000-0000-000000000000'])
    .eq('vetting_status', 'approved')

  const ids = (providers || []).map((p) => p.id)
  const { data: cats } = await supabase
    .from('provider_categories')
    .select('provider_id, category, is_primary')
    .in('provider_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])

  // Attach categories and determine each provider's primary category for grouping
  const withCats = (providers || []).map((p) => {
    const pCats = (cats || []).filter((c) => c.provider_id === p.id)
    const primary = pCats.find((c) => c.is_primary)?.category || pCats[0]?.category || 'other'
    return { ...p, cats: pCats, groupKey: primary }
  })

  // Group providers by their primary category, preserving taxonomy order
  const groups: { key: string; label: string; providers: typeof withCats }[] = []
  const orderedKeys = [...CATEGORIES.map((c) => c.key), 'other']
  for (const key of orderedKeys) {
    const inGroup = withCats.filter((p) => p.groupKey === key)
    if (inGroup.length > 0) {
      groups.push({ key, label: key === 'other' ? 'Other' : categoryLabel(key), providers: inGroup })
    }
  }

  const multiple = withCats.length > 1

  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1a1a', background: '#f7f6f2', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', padding: '32px 40px 8px' }}>
        <img src="/tidal-care-network.svg" alt="Tidal Care Network" style={{ height: 64, width: 'auto' }} />
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 40px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#2c4d52', marginBottom: 8 }}>
            {referral.client_name ? `${referral.client_name}, here ${multiple ? 'are' : 'is'} your referral${multiple ? 's' : ''}` : 'Your referral'}
          </h1>
          <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6 }}>
            {multiple
              ? `You've been referred to ${withCats.length} trusted providers, organized by type of care. Review them and reach out to whichever feels like the best fit.`
              : `You've been referred to a trusted provider. Their information is below.`}
          </p>
          {referral.note && (
            <div style={{ marginTop: 16, padding: 14, background: '#e8eff0', borderRadius: 10, fontSize: 14, color: '#2c4d52', lineHeight: 1.6, textAlign: 'left' }}>
              <strong>A note from your referring provider:</strong><br />{referral.note}
            </div>
          )}
        </div>

        {groups.map((group) => (
          <div key={group.key} style={{ marginBottom: 28 }}>
            {multiple && (
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#3e6a70', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, paddingBottom: 6, borderBottom: '2px solid #e8eff0' }}>
                {group.label}
              </h2>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {group.providers.map((p) => (
                <div key={p.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#e8eff0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e3dc' }}>
                      {p.photo_url ? <img src={p.photo_url} alt={p.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 24, fontWeight: 600, color: '#3e6a70' }}>{(p.full_name || '?').charAt(0).toUpperCase()}</span>}
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: '#2c4d52' }}>{p.is_org ? (p.practice_name || p.full_name) : `${p.full_name}${p.credentials ? `, ${p.credentials}` : ''}`}</div>
                      <div style={{ fontSize: 13, color: '#888' }}>{p.primary_area}{p.offers_telehealth ? ' · Telehealth available' : ''}</div>
                    </div>
                  </div>
                  {p.bio && <p style={{ fontSize: 14, lineHeight: 1.6, color: '#555', marginBottom: 12 }}>{p.bio}</p>}
                  {p.cats.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                      {p.cats.map((c: { category: string }) => <span key={c.category} style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 99, background: '#e8eff0', color: '#2c4d52' }}>{categoryLabel(c.category)}</span>)}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 14 }}>
                    {p.phone && <a href={`tel:${p.phone}`} style={{ color: '#3e6a70', textDecoration: 'none', fontWeight: 500, padding: '8px 14px', border: '1px solid #d4d2ca', borderRadius: 8 }}>Call {p.phone}</a>}
                    {p.email && <a href={`mailto:${p.email}`} style={{ color: '#3e6a70', textDecoration: 'none', fontWeight: 500, padding: '8px 14px', border: '1px solid #d4d2ca', borderRadius: 8 }}>Email</a>}
                    {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" style={{ color: '#3e6a70', textDecoration: 'none', fontWeight: 500, padding: '8px 14px', border: '1px solid #d4d2ca', borderRadius: 8 }}>Website</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 28, lineHeight: 1.6 }}>
          Referral provided through Tidal Care Network. These providers are vetted members of the network.
        </p>
      </div>
    </main>
  )
}
