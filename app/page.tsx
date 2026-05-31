import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const loggedIn = !!user

  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1a1a', background: '#f7f6f2' }}>

      {/* Top bar — sponsor credit left, navigation right */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', maxWidth: 1100, margin: '0 auto', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 14, color: '#999' }}>
          A community initiative sponsored by{' '}
          <a href="https://www.gnosiswellnesscollective.com" target="_blank" rel="noopener noreferrer" style={{ color: '#3e6a70', fontWeight: 500, textDecoration: 'none' }}>
            Gnosis Wellness Collective
          </a>
        </div>
        <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link href="/directory" style={{ fontSize: 15, color: '#2c4d52', textDecoration: 'none' }}>Find a provider</Link>
          {loggedIn ? (
            <Link href="/dashboard" style={{ fontSize: 15, fontWeight: 500, color: 'white', background: '#3e6a70', padding: '9px 18px', borderRadius: 8, textDecoration: 'none' }}>My dashboard</Link>
          ) : (
            <>
              <Link href="/login" style={{ fontSize: 15, color: '#2c4d52', textDecoration: 'none' }}>Provider login</Link>
              <Link href="/login" style={{ fontSize: 15, fontWeight: 500, color: 'white', background: '#3e6a70', padding: '9px 18px', borderRadius: 8, textDecoration: 'none' }}>Join the network</Link>
            </>
          )}
        </nav>
      </div>

      {/* Centered logo hero */}
      <div style={{ textAlign: 'center', padding: '16px 15px 0' }}>
        <img src="/logo.svg" alt="Tidal Care Network" style={{ height: 350, width: 'auto', margin: '0 auto' }} />
      </div>

      {/* Hero */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '0 32px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 42, fontWeight: 700, lineHeight: 1.15, marginBottom: 20, color: '#1a1a1a' }}>
          A trusted referral network for whole-person care
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: '#555', marginBottom: 32 }}>
          Serving the Lowcountry and South Carolina, Tidal Care Network connects vetted, values-aligned providers across therapy, psychiatry, primary care, integrative medicine, and beyond — so the right care is never more than a warm introduction away.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/directory" style={{ fontSize: 15, fontWeight: 500, color: 'white', background: '#3e6a70', padding: '12px 24px', borderRadius: 10, textDecoration: 'none' }}>Browse the directory</Link>
          <Link href="/login" style={{ fontSize: 15, fontWeight: 500, color: '#085041', background: 'white', border: '1px solid #d4d2ca', padding: '12px 24px', borderRadius: 10, textDecoration: 'none' }}>Join as a provider</Link>
        </div>
      </section>

      {/* What it is */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '32px' }}>
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e3dc', padding: '40px 48px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16, color: '#085041' }}>What is Tidal Care Network?</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: '#444', marginBottom: 16 }}>
            Tidal Care Network is a free, community-based referral network for licensed clinicians, holistic and integrative practitioners, and allied health professionals. We make it easier for providers to connect their clients to trusted, vetted colleagues across every dimension of wellness — mental health, psychiatry, primary and specialty medical care, nutrition, addiction recovery, speech-language services, bodywork, peer support, and more.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: '#444', marginBottom: 16 }}>
            Rooted in Charleston, South Carolina, serving the Lowcountry and growing across the state. We connect licensed clinicians, holistic and integrative practitioners, and allied health professionals — making it easier for providers to link their clients to trusted, vetted colleagues across every dimension of wellness.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '24px 32px 48px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24, color: '#085041', textAlign: 'center' }}>How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { n: '1', t: 'Providers join & get vetted', d: 'Licensed and credentialed providers apply, verify their credentials, sign our ethics commitments, and are vouched for by a professional colleague.' },
            { n: '2', t: 'Search & smart match', d: 'Find the right provider by specialty, insurance, location, cultural fit, and the specific needs of your client — across every type of care.' },
            { n: '3', t: 'Send a warm referral', d: 'Make a personal introduction on behalf of your client. Track the referral from sent to scheduled to seen.' },
            { n: '4', t: 'Build trusted connections', d: 'Rate and review referral experiences, keep availability current, and strengthen a network of care across the community.' },
          ].map((step) => (
            <div key={step.n} style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', padding: 24 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#E1F5EE', color: '#085041', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>{step.n}</div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{step.t}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: '#666' }}>{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values strip */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px 48px' }}>
        <div style={{ background: '#E1F5EE', borderRadius: 16, padding: '32px 48px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, color: '#085041' }}>Care that sees the whole person</h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: '#0a5a48' }}>
            Every provider commits to cultural competence, anti-discriminatory practice, affirming care for LGBTQ+ individuals, trauma-informed approaches, and ongoing professional growth. These aren't boxes to check — they're the foundation of how we believe care should be delivered.
          </p>
        </div>
      </section>

      {/* Footer with Gnosis credit */}
      <footer style={{ borderTop: '1px solid #e5e3dc', background: 'white' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px', display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#085041', marginBottom: 4 }}>Tidal Care Network</div>
            <div style={{ fontSize: 13, color: '#888' }}>A free community referral network for whole-person care.</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 2 }}>Hosted by</div>
            <a href="https://www.gnosiswellnesscollective.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, fontWeight: 600, color: '#444', textDecoration: 'none' }}>Gnosis Wellness Collective</a>
            <div><a href="mailto:info@gnosiswellnessco.com" style={{ fontSize: 13, color: '#3e6a70', textDecoration: 'none' }}>info@gnosiswellnessco.com</a></div>
          </div>
        </div>
      </footer>

    </main>
  )
}