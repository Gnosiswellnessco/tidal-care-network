import Link from 'next/link'

export default function ThankYouPage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f7f6f2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ maxWidth: 480, textAlign: 'center', background: 'white', borderRadius: 16, border: '1px solid #e5e3dc', padding: '48px 40px' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🌊</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2c4d52', marginBottom: 12 }}>Application received</h1>
        <p style={{ fontSize: 15, color: '#555', lineHeight: 1.6, marginBottom: 24 }}>
          Thank you for applying to join Tidal Care Network. Your application is now in review. We'll verify your credentials and reach out by email with next steps, including the peer attestation and ethics agreement.
        </p>
        <Link href="/" style={{ fontSize: 14, fontWeight: 500, color: 'white', background: '#3e6a70', padding: '10px 22px', borderRadius: 8, textDecoration: 'none' }}>Back to home</Link>
      </div>
    </main>
  )
}