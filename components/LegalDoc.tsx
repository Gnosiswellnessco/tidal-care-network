import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import { BRAND, SERIF } from '@/lib/brand'

const teal = BRAND.teal
const dark = BRAND.dark
const champagne = BRAND.champagne
const hairline = BRAND.hairline

export default function LegalDoc({
  title,
  subtitle,
  effective,
  children,
}: {
  title: string
  subtitle?: string
  effective?: string
  children: React.ReactNode
}) {
  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1a1a', background: BRAND.pageBg, minHeight: '100vh' }}>
      <SiteHeader right={<Link href="/" style={{ fontSize: 14, color: teal, textDecoration: 'none' }}>← Back to site</Link>} />

      <article style={{ maxWidth: 760, margin: '0 auto', padding: '28px 40px 96px' }}>
        <div style={{ paddingBottom: 22, marginBottom: 30 }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 600, color: dark, margin: '0 0 12px', lineHeight: 1.12, letterSpacing: '-0.01em' }}>{title}</h1>
          <div style={{ height: 2, width: 38, background: champagne, marginBottom: 14 }} />
          {subtitle && <p style={{ fontSize: 15.5, color: '#5f6b6d', margin: '0 0 6px', lineHeight: 1.55 }}>{subtitle}</p>}
          {effective && <p style={{ fontSize: 13, color: '#9aa0a1', margin: 0 }}>Effective: {effective}</p>}
        </div>

        <div style={{ fontSize: 15.5, lineHeight: 1.8, color: '#3a4042' }}>
          {children}
        </div>

        <div style={{ marginTop: 48, paddingTop: 20, borderTop: '0.5px solid ' + hairline, fontSize: 13, color: '#9aa0a1', textAlign: 'center' }}>
          Tidal Care Network &nbsp;|&nbsp; <Link href="/" style={{ color: teal, textDecoration: 'none' }}>tidalcare.org</Link> &nbsp;|&nbsp; <a href="mailto:info@tidalcare.org" style={{ color: teal, textDecoration: 'none' }}>info@tidalcare.org</a>
        </div>
      </article>
    </main>
  )
}

// Shared styled sub-components for consistent doc formatting.
export function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontFamily: SERIF, fontSize: 25, fontWeight: 600, color: dark, margin: '38px 0 12px', lineHeight: 1.25, letterSpacing: '-0.01em' }}>{children}</h2>
}
export function H3({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 16, fontWeight: 600, color: dark, margin: '26px 0 8px' }}>{children}</h3>
}
export function P({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: '0 0 14px' }}>{children}</p>
}
export function UL({ children }: { children: React.ReactNode }) {
  return <ul style={{ margin: '0 0 16px', paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 7 }}>{children}</ul>
}
export function LI({ children }: { children: React.ReactNode }) {
  return <li style={{ lineHeight: 1.7 }}>{children}</li>
}
