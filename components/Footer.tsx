import Link from 'next/link'
import { BRAND, LOGO } from '@/lib/brand'

const link: React.CSSProperties = { fontSize: 12.5, color: BRAND.teal, textDecoration: 'none' }

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer style={{ borderTop: '0.5px solid ' + BRAND.hairline, background: BRAND.pageBg, padding: '32px 40px', marginTop: 40 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'inline-block', textDecoration: 'none' }}>
            <img src={LOGO.full} alt="Tidal Care Network" style={{ height: 84, width: 'auto', display: 'block' }} />
          </Link>
          <nav style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/directory" style={link}>Find a provider</Link>
            <Link href="/news" style={link}>News</Link>
            <Link href="/how-care-works" style={link}>How care works</Link>
            <Link href="/terms-of-participation" style={link}>Provider Terms</Link>
            <Link href="/ethics" style={link}>Ethics Agreement</Link>
            <Link href="/privacy" style={link}>Privacy Policy</Link>
            <Link href="/report-concern" style={link}>Report a concern</Link>
            <a href="mailto:info@tidalcare.org" style={link}>Contact</a>
          </nav>
        </div>
        <div style={{ fontSize: 12, color: '#9aa0a1', marginTop: 18 }}>
          © {year} Tidal Care Network · Administered by Gnosis Wellness Collective
        </div>
      </div>
    </footer>
  )
}
