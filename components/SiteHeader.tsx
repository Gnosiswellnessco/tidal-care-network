import Link from 'next/link'
import { BRAND, SERIF, LOGO } from '@/lib/brand'
import LoginMenu from '@/components/LoginMenu'

// Shared site header: identical mark + serif wordmark on the left across every page.
// The right side carries page-specific links (passed via `right`) plus the
// global auth control (member/provider sign in, or saved/dashboard + sign out).
export default function SiteHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        padding: '16px 40px',
        maxWidth: 1100,
        margin: '0 auto',
        borderBottom: '0.5px solid ' + BRAND.hairline,
      }}
    >
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none' }}>
        <img src={LOGO.mark} alt="" style={{ height: 40, width: 'auto', display: 'block' }} />
        <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: BRAND.dark, letterSpacing: '-0.01em', lineHeight: 1 }}>
          Tidal Care Network
        </span>
      </Link>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
        {right}
        <LoginMenu />
      </nav>
    </header>
  )
}
