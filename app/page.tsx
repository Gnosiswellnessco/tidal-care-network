import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/SignOutButton'
import SiteHeader from '@/components/SiteHeader'
import { BRAND, SERIF, LOGO } from '@/lib/brand'

export const dynamic = 'force-dynamic'

const navLink: React.CSSProperties = { fontSize: 14, color: '#4a5557', textDecoration: 'none' }
const navBtn: React.CSSProperties = { fontSize: 14, fontWeight: 500, color: 'white', background: BRAND.teal, padding: '9px 18px', borderRadius: 8, textDecoration: 'none' }

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const loggedIn = !!user

  const headerRight = loggedIn ? (
    <>
      <Link href="/directory" style={navLink}>Find a provider</Link>
      <Link href="/news" style={navLink}>News</Link>
      <Link href="/dashboard" style={navBtn}>My dashboard</Link>
      <SignOutButton />
    </>
  ) : (
    <>
      <Link href="/directory" style={navLink}>Find a provider</Link>
      <Link href="/news" style={navLink}>News</Link>
      <Link href="/login" style={navLink}>Provider login</Link>
      <Link href="/login" style={navBtn}>Join the network</Link>
    </>
  )

  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1a1a', background: BRAND.pageBg }}>
      <SiteHeader right={headerRight} />

      {/* Hero — full lockup + tagline + CTAs */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '44px 32px 8px', textAlign: 'center' }}>
        <img src={LOGO.full} alt="Tidal Care Network" style={{ height: 200, width: 'auto', margin: '0 auto 8px', display: 'block' }} />
        <div style={{ fontSize: 11, fontWeight: 500, color: '#8a9092', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 16 }}>Lowcountry &amp; South Carolina</div>
        <h1 style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, lineHeight: 1.2, color: BRAND.dark, margin: '0 auto 16px', maxWidth: 560, letterSpacing: '-0.01em' }}>
          A trusted referral network for whole-person care
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.65, color: '#5f6b6d', marginBottom: 28, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}>
          Connecting vetted, values-aligned providers across therapy, psychiatry, primary care, integrative medicine, and beyond — so the right care is never far away.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/directory" style={{ fontSize: 15, fontWeight: 500, color: 'white', background: BRAND.teal, padding: '12px 26px', borderRadius: 10, textDecoration: 'none' }}>Browse the directory</Link>
          <Link href="/login" style={{ fontSize: 15, fontWeight: 500, color: BRAND.teal, background: 'white', border: '1px solid #d4d2ca', padding: '12px 26px', borderRadius: 10, textDecoration: 'none' }}>Join as a provider</Link>
        </div>
      </section>

      {/* What it is */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px 8px' }}>
        <div style={{ background: BRAND.cardBg, borderRadius: 16, border: '0.5px solid ' + BRAND.hairline, padding: '36px 44px' }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, marginBottom: 14, color: BRAND.dark }}>What is Tidal Care Network?</h2>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: '#444', margin: 0 }}>
            A free, community-based referral network for licensed clinicians, holistic and integrative practitioners, and allied health professionals. Rooted in Charleston and serving the Lowcountry and South Carolina, we make it easier for providers to connect their clients to trusted, vetted colleagues across every dimension of wellness — mental health, psychiatry, primary and specialty medical care, nutrition, addiction recovery, bodywork, peer support, and more.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '24px 32px 8px' }}>
        <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, marginBottom: 22, color: BRAND.dark, textAlign: 'center' }}>How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { n: '1', t: 'Providers join & get vetted', d: 'Licensed and credentialed providers apply, verify their credentials, sign our ethics commitments, and are vouched for by a professional colleague.' },
            { n: '2', t: 'Search & smart match', d: 'Find the right provider by specialty, insurance, location, cultural fit, and the specific needs of your client — across every type of care.' },
            { n: '3', t: 'Access consults', d: 'Connect with a vetted colleague to talk through a client\u2019s needs and find the right next step.' },
            { n: '4', t: 'Build trusted connections', d: 'Rate referral experiences, keep availability current, and strengthen a network of care across the community.' },
          ].map((step) => (
            <div key={step.n} style={{ background: BRAND.cardBg, borderRadius: 12, border: '0.5px solid ' + BRAND.hairline, padding: 24 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid ' + BRAND.champagne, color: BRAND.champagneDark, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>{step.n}</div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: BRAND.dark }}>{step.t}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: '#6b7577', margin: 0 }}>{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values strip */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '24px 32px 56px' }}>
        <div style={{ background: BRAND.panelBg, borderRadius: 16, border: '0.5px solid #dde7e6', padding: '32px 48px', textAlign: 'center' }}>
          <div style={{ height: 2, width: 36, background: BRAND.champagne, margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, marginBottom: 12, color: BRAND.dark }}>Care that sees the whole person</h2>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: '#4a5557', maxWidth: 580, margin: '0 auto' }}>
            Every provider commits to cultural competence, anti-discriminatory practice, affirming care for LGBTQ+ individuals, trauma-informed approaches, and ongoing professional growth — the foundation of how we believe care should be delivered.
          </p>
        </div>
      </section>
    </main>
  )
}
