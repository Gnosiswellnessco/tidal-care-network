import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import BrandLogo from '@/components/BrandLogo'
import { categoryLabel, postTypeLabel } from '@/lib/news-taxonomy'
import { BRAND, SERIF } from '@/lib/brand'
import NewsShareRow from '@/components/NewsShareRow'

export const dynamic = 'force-dynamic'

const DOT: Record<string, string> = { news: '#3e6a70', event: '#b5aa8e', announcement: '#e8b54a', resource: '#5ba1a9' }

function fmtFull(d: string) {
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}
function fmtEvent(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}
function authorName(a: { full_name: string; credentials: string | null; practice_name: string | null; is_org: boolean } | null) {
  if (!a) return ''
  return a.is_org ? (a.practice_name || a.full_name) : `${a.full_name}${a.credentials ? `, ${a.credentials}` : ''}`
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('provider_posts')
    .select('title, body')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (!post) return { title: 'Tidal Care Network' }
  const description = (post.body || '').replace(/\s+/g, ' ').trim().slice(0, 155) || undefined
  // og:image is supplied automatically by opengraph-image.tsx in this folder.
  return {
    title: `${post.title} — Tidal Care Network`,
    description,
    openGraph: { title: post.title, description, type: 'article' },
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: p } = await supabase
    .from('provider_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (!p) notFound()

  const { data: author } = await supabase
    .from('providers')
    .select('id, full_name, credentials, practice_name, is_org, vetting_status, is_active')
    .eq('id', p.provider_id)
    .maybeSingle()

  const { data: catRows } = await supabase
    .from('provider_categories')
    .select('category')
    .eq('provider_id', p.provider_id)

  const dot = DOT[p.post_type] || BRAND.teal
  const populations: string[] = Array.isArray(p.populations) ? p.populations : []
  const topics: string[] = Array.isArray(p.topics) ? p.topics : []
  const categories: string[] = (catRows || []).map((c) => c.category)
  const linkLabel = p.link_label || (p.post_type === 'event' ? 'Register / RSVP' : p.post_type === 'resource' ? 'Visit website' : 'Learn more')
  const authorIsLive = author && author.vetting_status === 'approved' && author.is_active

  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1a1a', background: BRAND.pageBg, minHeight: '100vh' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', maxWidth: 1000, margin: '0 auto' }}>
        <Link href="/"><BrandLogo height={180} /></Link>
        <Link href="/news" style={{ fontSize: 14, color: BRAND.teal, textDecoration: 'none' }}>← All updates</Link>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '12px 40px 64px' }}>
        <article style={{ background: 'white', borderRadius: 18, border: '0.5px solid ' + BRAND.hairline, boxShadow: '0 1px 3px rgba(44,77,82,0.05)', overflow: 'hidden' }}>
          {p.image_url && (
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#e5e3dc', overflow: 'hidden' }}>
              <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          <div style={{ padding: '32px 40px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.dark, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{postTypeLabel(p.post_type)}</span>
              {p.is_demo && <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 99, background: '#fbe7c2', color: '#92610a' }}>Demo</span>}
            </div>

            <h1 style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, color: BRAND.dark, lineHeight: 1.15, letterSpacing: '-0.01em', margin: '0 0 12px' }}>{p.title}</h1>

            <div style={{ fontSize: 14, color: '#6b7577', marginBottom: 4 }}>
              {author && (
                authorIsLive ? (
                  <Link href={`/provider/${author.id}`} style={{ color: BRAND.teal, textDecoration: 'none', fontWeight: 500 }}>{authorName(author)}</Link>
                ) : (
                  <span style={{ color: BRAND.teal, fontWeight: 500 }}>{authorName(author)}</span>
                )
              )}
            </div>
            <div style={{ fontSize: 13, color: '#9aa0a1', marginBottom: 24 }}>{fmtFull(p.published_at)}</div>

            {p.post_type === 'event' && (
              <div style={{ background: BRAND.mint, borderRadius: 12, padding: '16px 18px', marginBottom: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, color: BRAND.dark }}>
                  {p.event_date && <div><strong>When:</strong> {fmtEvent(p.event_date)}{p.event_time ? ` · ${p.event_time}` : ''}</div>}
                  {p.location && <div><strong>Where:</strong> {p.location}</div>}
                  {p.cost && <div><strong>Cost:</strong> {p.cost}</div>}
                </div>
              </div>
            )}

            {p.post_type === 'resource' && p.audience_note && (
              <div style={{ fontSize: 13, color: '#54625f', marginBottom: 20 }}><strong>Who it&apos;s for:</strong> {p.audience_note}</div>
            )}

            {p.body && (
              <div style={{ fontSize: 16, lineHeight: 1.75, color: '#3a4446', whiteSpace: 'pre-wrap', marginBottom: 24 }}>{p.body}</div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
              {p.link_url && (
                <a href={p.link_url.startsWith('http') ? p.link_url : `https://${p.link_url}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-block', fontSize: 15, fontWeight: 500, color: 'white', background: BRAND.teal, padding: '11px 24px', borderRadius: 8, textDecoration: 'none' }}>
                  {linkLabel}
                </a>
              )}
              {p.resource_file_url && (
                <a href={p.resource_file_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-block', fontSize: 15, fontWeight: 500, color: BRAND.teal, background: 'white', border: '1px solid ' + BRAND.teal, padding: '11px 24px', borderRadius: 8, textDecoration: 'none' }}>
                  Download file
                </a>
              )}
            </div>

            {(categories.length > 0 || topics.length > 0 || populations.length > 0) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 20 }}>
                {categories.map((c) => (
                  <span key={'c' + c} style={{ fontSize: 12, padding: '4px 11px', borderRadius: 999, background: BRAND.mint, color: BRAND.dark, fontWeight: 500 }}>{categoryLabel(c)}</span>
                ))}
                {topics.map((t) => (
                  <span key={'t' + t} style={{ fontSize: 12, padding: '4px 11px', borderRadius: 999, background: '#f1efe8', color: '#6b7577' }}>{t}</span>
                ))}
                {populations.map((pop) => (
                  <span key={'p' + pop} style={{ fontSize: 12, padding: '4px 11px', borderRadius: 999, background: '#f1efe8', color: '#6b7577' }}>{pop}</span>
                ))}
              </div>
            )}

            {/* Share */}
            <div style={{ marginTop: 28, paddingTop: 24, borderTop: '0.5px solid ' + BRAND.hairline }}>
              <NewsShareRow title={p.title} slug={p.slug} />
            </div>
          </div>
        </article>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link href="/news" style={{ fontSize: 14, color: BRAND.teal, textDecoration: 'none' }}>← Back to all updates</Link>
        </div>
      </div>
    </main>
  )
}
