import Link from 'next/link'

const teal = '#3e6a70'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #e5e3dc', background: '#f7f6f2', padding: '28px 40px', marginTop: 40 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, color: '#888' }}>
          © {new Date().getFullYear()} Tidal Care Network · Administered by Gnosis Wellness Collective
        </div>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 18, fontSize: 13 }}>
          <Link href="/news" style={{ color: teal, textDecoration: 'none' }}>News</Link>
          <Link href="/terms-of-participation" style={{ color: teal, textDecoration: 'none' }}>Provider Terms</Link>
          <Link href="/ethics" style={{ color: teal, textDecoration: 'none' }}>Ethics Agreement</Link>
          <Link href="/privacy" style={{ color: teal, textDecoration: 'none' }}>Privacy Policy</Link>
          <a href="mailto:info@tidalcare.org" style={{ color: teal, textDecoration: 'none' }}>Contact</a>
        </nav>
      </div>
    </footer>
  )
}
