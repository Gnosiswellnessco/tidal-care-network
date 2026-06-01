import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES } from '@/lib/taxonomy'
import PrintControls from './PrintControls'
import QRCodeImage from '@/components/QRCode'

export const dynamic = 'force-dynamic'

function categoryLabel(key: string) {
  return CATEGORIES.find((c) => c.key === key)?.label || key
}

export default async function PrintReferralPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  const { data: referral } = await supabase
    .from('referrals').select('*').eq('share_token', token).maybeSingle()
  if (!referral) notFound()

  const { data: links } = await supabase
    .from('referral_providers').select('provider_id').eq('referral_id', referral.id)
  const providerIds = (links || []).map((l) => l.provider_id)

  const { data: providers } = await supabase
    .from('providers').select('*')
    .in('id', providerIds.length ? providerIds : ['00000000-0000-0000-0000-000000000000'])
    .eq('vetting_status', 'approved')

  const ids = (providers || []).map((p) => p.id)
  const { data: cats } = await supabase
    .from('provider_categories').select('provider_id, category, is_primary')
    .in('provider_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])

  const withCats = (providers || []).map((p) => ({
    ...p, cats: (cats || []).filter((c) => c.provider_id === p.id),
  }))

  const link = `https://tidalcare.org/r/${token}`

  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1a1a', background: 'white', minHeight: '100vh', maxWidth: 760, margin: '0 auto', padding: '32px 40px' }}>
      <PrintControls />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, borderBottom: '2px solid #e8eff0', paddingBottom: 20, marginBottom: 24 }}>
        <div>
          <img src="/tidal-care-network.svg" alt="Tidal Care Network" style={{ height: 90, width: 'auto', marginBottom: 8 }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2c4d52', margin: '8px 0 4px' }}>Your referral</h1>
          <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.5, maxWidth: 380 }}>
            Scan the code or visit the link to see full contact details for the recommended provider{withCats.length > 1 ? 's' : ''}.
          </p>
        </div>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <QRCodeImage value={link} size={130} />
          <div style={{ fontSize: 10, color: '#888', marginTop: 4, wordBreak: 'break-all', maxWidth: 130 }}>{link}</div>
        </div>
      </div>

      {referral.note && (
        <div style={{ padding: 14, background: '#f4f8f8', borderRadius: 8, fontSize: 13, color: '#2c4d52', lineHeight: 1.6, marginBottom: 24, border: '1px solid #e0e9e9' }}>
          <strong>Note from your provider:</strong><br />{referral.note}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {withCats.map((p) => (
          <div key={p.id} style={{ border: '1px solid #e5e3dc', borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 17, fontWeight: 600, color: '#2c4d52', marginBottom: 2 }}>
              {p.is_org ? (p.practice_name || p.full_name) : `${p.full_name}${p.credentials ? `, ${p.credentials}` : ''}`}
            </div>
            <div style={{ fontSize: 13, color: '#777', marginBottom: 8 }}>
              {p.cats.map((c: { category: string }) => categoryLabel(c.category)).join(' · ')}{p.offers_telehealth ? ' · Telehealth available' : ''}
            </div>
            <div style={{ fontSize: 14, color: '#333', lineHeight: 1.7 }}>
              {p.phone && <div>Phone: {p.phone}</div>}
              {p.email && <div>Email: {p.email}</div>}
              {p.website && <div>Web: {p.website}</div>}
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 28, lineHeight: 1.6 }}>
        Referral provided through Tidal Care Network · tidalcare.org · These providers are vetted members of the network.
      </p>
    </main>
  )
}
