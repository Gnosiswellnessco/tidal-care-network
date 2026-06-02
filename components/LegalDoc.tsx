import Link from 'next/link'
import BrandLogo from '@/components/BrandLogo'

const teal = '#3e6a70'
const dark = '#2c4d52'
const mint = '#e8eff0'

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
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1a1a', background: '#f7f6f2', minHeight: '100vh' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', maxWidth: 860, margin: '0 auto' }}>
        <Link href="/"><BrandLogo height={140} /></Link>
        <Link href="/" style={{ fontSize: 14, color: teal, textDecoration: 'none' }}>← Back to site</Link>
      </header>

      <article style={{ maxWidth: 760, margin: '0 auto', padding: '16px 40px 96px' }}>
        <div style={{ borderBottom: '2px solid ' + mint, paddingBottom: 20, marginBottom: 28 }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: dark, margin: '0 0 8px', lineHeight: 1.2 }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 15, color: '#666', margin: '0 0 6px', lineHeight: 1.5 }}>{subtitle}</p>}
          {effective && <p style={{ fontSize: 13, color: '#999', margin: 0 }}>Effective: {effective}</p>}
        </div>

        <div style={{ fontSize: 15, lineHeight: 1.75, color: '#333' }}>
          {children}
        </div>

        <div style={{ marginTop: 48, paddingTop: 20, borderTop: '1px solid #e5e3dc', fontSize: 13, color: '#999', textAlign: 'center' }}>
          Tidal Care Network &nbsp;|&nbsp; <Link href="/" style={{ color: teal, textDecoration: 'none' }}>tidalcare.org</Link> &nbsp;|&nbsp; <a href="mailto:info@tidalcare.org" style={{ color: teal, textDecoration: 'none' }}>info@tidalcare.org</a>
        </div>
      </article>
    </main>
  )
}

// Shared styled sub-components for consistent doc formatting.
export function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2c4d52', margin: '36px 0 12px', lineHeight: 1.3 }}>{children}</h2>
}
export function H3({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2c4d52', margin: '24px 0 8px' }}>{children}</h3>
}
export function P({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: '0 0 14px' }}>{children}</p>
}
export function UL({ children }: { children: React.ReactNode }) {
  return <ul style={{ margin: '0 0 16px', paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 7 }}>{children}</ul>
}
export function LI({ children }: { children: React.ReactNode }) {
  return <li style={{ lineHeight: 1.65 }}>{children}</li>
}
