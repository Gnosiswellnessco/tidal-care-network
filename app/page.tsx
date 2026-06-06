import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/SignOutButton'
import SiteHeader from '@/components/SiteHeader'
import HomeCategoryExplorer from '@/components/HomeCategoryExplorer'
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

      {/* Hero — logo lockup + updated tagline naming both audiences */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '44px 32px 4px', textAlign: 'center' }}>
        <img src={LOGO.full} alt="Tidal Care Network" style={{ height: 200, width: 'auto', margin: '0 auto 8px', display: 'block' }} />
        <div style={{ fontSize: 11, fontWeight: 500, color: '#8a9092', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 16 }}>Lowcountry &amp; South Carolina</div>
        <p style={{ fontSize: 17, lineHeight: 1.65, color: '#5f6b6d', margin: '0 auto', maxWidth: 580 }}>
          A free, vetted network spanning the whole spectrum of care across South Carolina — whether you&apos;re looking for care, or looking to connect a client or patient to it.
        </p>
      </section>

      {/* Two paths — looking for care | for providers */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '28px 32px 8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

          {/* Looking for care */}
          <div style={{ background: BRAND.cardBg, borderRadius: 16, border: '0.5px solid ' + BRAND.hairline, padding: '28px 30px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: BRAND.mint, flex: 'none' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.teal, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Looking for care</span>
            </div>
            <h2 style={{ fontFamily: SERIF, fontSize: 25, fontWeight: 600, margin: '0 0 10px', color: BRAND.dark, letterSpacing: '-0.01em', lineHeight: 1.15 }}>Find the right provider for you or someone you love</h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: '#444', margin: '0 0 18px' }}>
              Search the network free, no account needed. Browse vetted providers by specialty, insurance, location, telehealth, and the communities they serve.
            </p>

            <HomeCategoryExplorer />

            <div style={{ marginTop: 22 }}>
              <Link href="/directory" style={{ display: 'inline-block', fontSize: 15, fontWeight: 500, color: 'white', background: BRAND.teal, padding: '12px 26px', borderRadius: 10, textDecoration: 'none' }}>Find a provider →</Link>
            </div>
          </div>

          {/* For providers */}
          <div style={{ background: BRAND.cardBg, borderRadius: 16, border: '0.5px solid ' + BRAND.hairline, padding: '28px 30px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: BRAND.champagne, flex: 'none' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.champagneDark, textTransform: 'uppercase', letterSpacing: '0.14em' }}>For providers</span>
            </div>
            <h2 style={{ fontFamily: SERIF, fontSize: 25, fontWeight: 600, margin: '0 0 10px', color: BRAND.dark, letterSpacing: '-0.01em', lineHeight: 1.15 }}>Join, and refer with confidence</h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: '#444', margin: '0 0 18px' }}>
              List alongside vetted, like-minded clinicians and holistic providers — get found by the right clients, and connect the people you treat to colleagues you trust. Placement always stays merit-based.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Free, vetted profile in the directory',
                'Refer patients & get peer endorsements',
                'Share news, events & resources',
              ].map((item) => (
                <li key={item} style={{ fontSize: 14, color: '#444', display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                  <span style={{ color: BRAND.teal, fontWeight: 700, lineHeight: 1.5 }}>✓</span>
                  <span style={{ lineHeight: 1.5 }}>{item}</span>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 'auto' }}>
              <Link href="/login" style={{ display: 'inline-block', fontSize: 15, fontWeight: 500, color: BRAND.teal, background: 'white', border: '1px solid ' + BRAND.teal, padding: '12px 26px', borderRadius: 10, textDecoration: 'none' }}>Join as a provider →</Link>
            </div>
          </div>

        </div>

        {/* Crisis safety line — full width under both paths */}
        <div style={{ background: '#fbeef0', border: '1px solid #f3c9d0', borderRadius: 10, padding: '12px 16px', marginTop: 16 }}>
          <p style={{ fontSize: 13, color: '#7a2230', lineHeight: 1.6, margin: 0 }}>
            <strong>In a crisis, this directory isn&apos;t the right tool.</strong> If you or someone else is in danger, call <strong>911</strong>. For mental health or suicidal crisis, call or text <strong>988</strong> (Suicide &amp; Crisis Lifeline), available 24/7, or go to your nearest emergency room.
          </p>
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
