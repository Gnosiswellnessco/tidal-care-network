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

      {/* Looking for care? — consumer entry point */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px 8px' }}>
        <div style={{ background: BRAND.cardBg, borderRadius: 16, border: '0.5px solid ' + BRAND.hairline, padding: '36px 44px' }}>
          <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 340px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: BRAND.champagneDark, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>Looking for care?</div>
              <h2 style={{ fontFamily: SERIF, fontSize: 25, fontWeight: 600, marginBottom: 12, color: BRAND.dark, letterSpacing: '-0.01em' }}>Find the right provider for you or someone you love</h2>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: '#444', margin: '0 0 20px' }}>
                Anyone can search the network — it&apos;s completely free, and you don&apos;t need an account. Browse vetted providers by specialty, insurance, location, telehealth, and the communities they serve, then reach out to them directly.
              </p>
              <Link href="/directory" style={{ display: 'inline-block', fontSize: 15, fontWeight: 500, color: 'white', background: BRAND.teal, padding: '12px 26px', borderRadius: 10, textDecoration: 'none' }}>Find a provider</Link>
            </div>
            <div style={{ flex: '0 1 240px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#7d8a87', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Search by what matters</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Therapy', 'Psychiatry', 'Primary care', 'Nutrition', 'Recovery', 'Telehealth', 'Insurance', 'Near you'].map((t) => (
                  <span key={t} style={{ fontSize: 13, fontWeight: 500, padding: '6px 12px', borderRadius: 99, background: BRAND.mint, color: BRAND.dark }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Crisis safety line */}
          <div style={{ background: '#fbeef0', border: '1px solid #f3c9d0', borderRadius: 10, padding: '12px 16px', marginTop: 24 }}>
            <p style={{ fontSize: 13, color: '#7a2230', lineHeight: 1.6, margin: 0 }}>
              <strong>In a crisis, this directory isn&apos;t the right tool.</strong> If you or someone else is in danger, call <strong>911</strong>. For mental health or suicidal crisis, call or text <strong>988</strong> (Suicide &amp; Crisis Lifeline), available 24/7, or go to your nearest emergency room.
            </p>
          </div>
        </div>
      </section>

      {/* What it is */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '24px 32px 8px' }}>
        <div style={{ background: BRAND.cardBg, borderRadius: 16, border: '0.5px solid ' + BRAND.hairline, padding: '36px 44px' }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, marginBottom: 14, color: BRAND.dark }}>What is Tidal Care Network?</h2>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: '#444', margin: 0 }}>
            A free, community-based referral network for licensed clinicians, holistic and integrative practitioners, and allied health professionals. Rooted in Charleston and serving the Lowcountry and South Carolina, we make it easier for people to find trusted, vetted care — and for providers to connect their clients to colleagues across every dimension of wellness: mental health, psychiatry, primary and specialty medical care, nutrition, addiction recovery, bodywork, peer support, and more.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '24px 32px 8px' }}>
        <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, marginBottom: 22, color: BRAND.dark, textAlign: 'center' }}>How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { n: '1', t: 'Providers join & get vetted', d: 'Licensed and credentialed providers apply, verify their credentials, sign our ethics commitments, and are vouched for by a professional colleague.' },
            { n: '2', t: 'Search & smart match', d: 'Anyone — a person seeking care or a provider making a referral — can find the right match by specialty, insurance, location, cultural fit, and specific needs.' },
            { n: '3', t: 'Connect directly', d: 'Reach out to a vetted provider to ask about availability and next steps, or talk through a client\u2019s needs as a colleague.' },
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
