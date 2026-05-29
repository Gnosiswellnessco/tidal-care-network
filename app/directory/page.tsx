import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES } from '@/lib/taxonomy'

function categoryLabel(key: string) {
  return CATEGORIES.find((c) => c.key === key)?.label || key
}

export const dynamic = 'force-dynamic'

export default async function DirectoryPage() {
  const supabase = await createClient()

  const { data: rawProviders } = await supabase
    .from('providers')
    .select('*')
    .eq('vetting_status', 'approved')
    .eq('is_active', true)
    .order('full_name')

  const ids = (rawProviders || []).map((p) => p.id)
  const { data: cats } = await supabase
    .from('provider_categories')
    .select('provider_id, category, is_primary')
    .in('provider_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])

  const providers = (rawProviders || []).map((p) => ({
    ...p,
    provider_categories: (cats || []).filter((c) => c.provider_id === p.id),
  }))

  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1a1a', background: '#f7f6f2', minHeight: '100vh' }}>

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/">
          <img src="/logo.svg" alt="Tidal Care Network" style={{ height: 56, width: 'auto' }} />
        </Link>
        <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link href="/directory" style={{ fontSize: 15, color: '#3e6a70', fontWeight: 500, textDecoration: 'none' }}>Find a provider</Link>
          <Link href="/login" style={{ fontSize: 15, color: '#2c4d52', textDecoration: 'none' }}>Provider login</Link>
          <Link href="/login" style={{ fontSize: 15, fontWeight: 500, color: 'white', background: '#3e6a70', padding: '9px 18px', borderRadius: 8, textDecoration: 'none' }}>Join the network</Link>
        </nav>
      </header>

      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 40px 16px' }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: '#2c4d52', marginBottom: 8 }}>Provider directory</h1>
        <p style={{ fontSize: 16, color: '#666' }}>
          {providers?.length ?? 0} vetted provider{providers?.length === 1 ? '' : 's'} in the network
        </p>
      </section>

      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 40px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {providers && providers.length > 0 ? (
            providers.map((p) => (
              <Link key={p.id} href={`/provider/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', padding: 24, cursor: 'pointer', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#e8eff0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e3dc' }}>
                    {p.photo_url ? (
                      <img src={p.photo_url} alt={p.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 20, fontWeight: 600, color: '#3e6a70' }}>{(p.full_name || '?').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 600, color: '#2c4d52', marginBottom: 2 }}>
                      {p.is_org
                        ? (p.practice_name || p.full_name)
                        : `${p.full_name}${p.credentials ? `, ${p.credentials}` : ''}`}
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
                {p.bio && (
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: '#555', marginBottom: 12 }}>{p.bio}</p>
                )}
                {p.provider_categories && p.provider_categories.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {p.provider_categories.map((pc: { category: string }) => (
                      <span key={pc.category} style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 99, background: '#e8eff0', color: '#2c4d52' }}>
                        {categoryLabel(pc.category)}
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6, background: '#e8eff0', color: '#2c4d52' }}>✓ Vetted</span>
                  {p.availability_status === 'accepting' && (
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6, background: '#eaf3de', color: '#27500a' }}>Accepting clients</span>
                  )}
                </div>
              </div>
              </Link>
            ))
          ) : (
            <p style={{ fontSize: 15, color: '#888' }}>No providers in the network yet. Check back soon.</p>
          )}
        </div>
      </section>

    </main>
  )
}