import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DirectoryPage() {
  const supabase = await createClient()

  const { data: providers } = await supabase
    .from('providers')
    .select('*')
    .eq('vetting_status', 'approved')
    .eq('is_active', true)
    .order('full_name')

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
              <div key={p.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', padding: 24 }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: '#2c4d52', marginBottom: 2 }}>
                  {p.full_name}{p.credentials ? `, ${p.credentials}` : ''}
                </div>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
                  {p.primary_area}{p.offers_telehealth ? ' · Telehealth available' : ''}
                </div>
                {p.bio && (
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: '#555', marginBottom: 12 }}>{p.bio}</p>
                )}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6, background: '#e8eff0', color: '#2c4d52' }}>✓ Vetted</span>
                  {p.availability_status === 'accepting' && (
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6, background: '#eaf3de', color: '#27500a' }}>Accepting clients</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p style={{ fontSize: 15, color: '#888' }}>No providers in the network yet. Check back soon.</p>
          )}
        </div>
      </section>

    </main>
  )
}