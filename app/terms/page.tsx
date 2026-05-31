import Link from 'next/link'

export const metadata = { title: 'Terms of Use · Tidal Care Network' }

export default function TermsPage() {
  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1a1a', background: '#f7f6f2', minHeight: '100vh' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', maxWidth: 800, margin: '0 auto' }}>
        <Link href="/"><img src="/tidal-care-network.svg" alt="Tidal Care Network" style={{ height: 180, width: 'auto' }} /></Link>
        <Link href="/directory" style={{ fontSize: 14, color: '#3e6a70', textDecoration: 'none' }}>Directory →</Link>
      </header>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '24px 40px 80px', lineHeight: 1.7, fontSize: 15, color: '#333' }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: '#2c4d52', marginBottom: 8 }}>Terms of Use</h1>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 28 }}>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <Section title="About Tidal Care Network">
          Tidal Care Network is a free, community-based directory that helps people find and connect with wellness and healthcare providers in South Carolina. We are a directory and referral platform only. We are not a healthcare provider, medical practice, or clinic, and we do not provide medical, psychological, or any other professional care.
        </Section>

        <Section title="We are not responsible for provider care">
          Providers listed in our directory are independent professionals. They are solely responsible for the services, advice, treatment, and care they provide. Tidal Care Network does not employ, supervise, direct, or control any listed provider, and is not responsible or liable for the quality, safety, legality, or outcomes of any care or services you receive from a provider you find through this directory.
        </Section>

        <Section title="No endorsement or guarantee">
          While we ask providers to attest to their credentials and ethics, a listing in our directory is not a guarantee, warranty, or endorsement of any provider's qualifications, competence, or fitness for your needs. You are responsible for independently evaluating any provider, verifying their credentials and licensure, and deciding whether they are appropriate for you. Ratings and endorsements shown reflect the views of those who submitted them, not of Tidal Care Network.
        </Section>

        <Section title="Your decisions and your care">
          Any decision to contact, engage, or receive care from a provider is solely your own. Information on this site is not medical advice and should not be used as a substitute for professional evaluation and treatment.
        </Section>

        <div style={{ background: '#fbeef0', border: '1px solid #f3c9d0', borderRadius: 10, padding: 16, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#7a2230', marginBottom: 6 }}>In a crisis</h2>
          <p style={{ margin: 0, color: '#7a2230' }}>
            If you or someone else is in immediate danger, call <strong>911</strong>. If you are experiencing a mental health or suicidal crisis, call or text <strong>988</strong> — the Suicide &amp; Crisis Lifeline — available free, 24/7, or visit your nearest <strong>emergency room</strong>. You can also reach the Crisis Text Line by texting HOME to 741741.
          </p>
        </div>

        <Section title="Limitation of liability">
          To the fullest extent permitted by law, Tidal Care Network, Gnosis Wellness Collective, and their organizers and affiliates are not liable for any harm, loss, or damages arising from your use of this directory or from any care or services provided by a listed provider.
        </Section>

        <Section title="Contact">
          Questions about these terms can be sent to info@gnosiswellnesscollective.com.
        </Section>

        <p style={{ marginTop: 32, fontSize: 13, color: '#999' }}>
          This is a community resource. By using the directory you acknowledge and agree to these terms.
        </p>
      </article>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#2c4d52', marginBottom: 8 }}>{title}</h2>
      <p>{children}</p>
    </section>
  )
}