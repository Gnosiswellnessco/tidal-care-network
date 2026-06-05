import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BrandLogo from '@/components/BrandLogo'
import PostShareRow from '@/components/PostShareRow'
import { categoryLabel, postTypeLabel } from '@/lib/news-taxonomy'

export const dynamic = 'force-dynamic'

const dark = '#2c4d52'
const teal = '#3e6a70'
const mint = '#e8eff0'
const CHAMP_TINT = '#efe9dc'
const CHAMP_DARK = '#7d7256'

const DOT: Record<string, string> = { news: '#3e6a70', event: '#b5aa8e', announcement: '#e8b54a', resource: '#5ba1a9' }

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('provider_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (!post) notFound()

  const { data: author } = await supabase
    .from('providers')
    .select('id, full_name, credentials, practice_name, is_org')
    .eq('id', post.provider_id)
    .maybeSingle()

  const { data: cats } = await supabase
    .from('provider_categories')
    .select('category, is_primary')
    .eq('provider_id', post.provider_id)

  const categoryKey = (cats || []).find((c) => c.is_primary)?.category || (cats || [])[0]?.category || null
  const authorDisplay = author
    ? (author.is_org ? (author.practice_name || author.full_name) : `${author.full_name}${author.credentials ? `, ${author.credentials}` : ''}`)
    : 'Tidal Care Network'
  const initial = (authorDisplay || '?').charAt(0).toUpperCase()
  const postedDate = new Date(post.published_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })

  const tags: string[] = [...(post.populations || []), ...(post.topics || [])]

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f7f6f2' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', maxWidth: 1000, margin: '0 auto' }}>
        <Link href="/"><BrandLogo height={180} /></Link>
        <Link href="/directory" style={{ fontSize: 14, fontWeight: 500, color: 'white', background: teal, padding: '9px 18px', borderRadius: 8, textDecoration: 'none' }}>Find a provider</Link>
      </header>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '8px 40px 64px' }}>
        <Link href="/news" style={{ fontSize: 13, color: teal, textDecoration: 'none' }}>← News &amp; updates</Link>

        <div style={{ background: 'white', border: '0.5px solid #e5e3dc', borderRadius: 14, padding: '18px 20px', marginTop: 14 }}>
          {post.image_url && (
            <div style={{ background: '#f0efe9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14, marginBottom: 16 }}>
              <img src={post.image_url} alt="" style={{ maxWidth: '100%', maxHeight: 440, objectFit: 'contain', borderRadius: 8, display: 'block' }} />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: DOT[post.post_type] || teal }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: dark, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{postTypeLabel(post.post_type)}</span>
            <span style={{ fontSize: 12, color: '#9aa0a1' }}>{categoryKey ? `${categoryLabel(categoryKey)} · ` : ''}posted {postedDate}</span>
          </div>

          <h1 style={{ fontSize: 23, fontWeight: 700, color: dark, lineHeight: 1.25, margin: '0 0 12px' }}>{post.title}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: mint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: teal }}>{initial}</div>
            {author
              ? <Link href={`/provider/${author.id}`} style={{ fontSize: 14, color: teal, textDecoration: 'none' }}>{authorDisplay}</Link>
              : <span style={{ fontSize: 14, color: teal }}>{authorDisplay}</span>}
          </div>

          {/* EVENT block */}
          {post.post_type === 'event' && (
            <div style={{ background: mint, borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
              {post.event_date && <div style={{ fontSize: 13, color: dark, marginBottom: post.location || post.cost ? 8 : 0 }}>📅 {new Date(post.event_date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}{post.event_time ? ` · ${post.event_time}` : ''}</div>}
              {post.location && <div style={{ fontSize: 13, color: dark, marginBottom: post.cost ? 8 : 0 }}>📍 {post.location}</div>}
              {post.cost && <div style={{ fontSize: 13, color: dark, marginBottom: post.link_url ? 12 : 0 }}>🎟 {post.cost}</div>}
              {post.link_url && <a href={post.link_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontSize: 13, fontWeight: 500, color: 'white', background: teal, padding: '9px 18px', borderRadius: 8, textDecoration: 'none', marginTop: 4 }}>{post.link_label || 'Register / RSVP'}</a>}
            </div>
          )}

          {/* RESOURCE block */}
          {post.post_type === 'resource' && (
            <div style={{ background: CHAMP_TINT, borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
              {post.audience_note && (<>
                <div style={{ fontSize: 12, fontWeight: 600, color: CHAMP_DARK, marginBottom: 4 }}>Who it&apos;s for</div>
                <div style={{ fontSize: 13, color: CHAMP_DARK, marginBottom: 12 }}>{post.audience_note}</div>
              </>)}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {post.resource_file_url && <a href={post.resource_file_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 500, color: 'white', background: CHAMP_DARK, padding: '9px 16px', borderRadius: 8, textDecoration: 'none' }}>⬇ Download</a>}
                {post.link_url && <a href={post.link_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 500, color: CHAMP_DARK, background: 'transparent', border: '1px solid ' + CHAMP_DARK, padding: '9px 16px', borderRadius: 8, textDecoration: 'none' }}>{post.link_label || 'Visit website'} ↗</a>}
              </div>
            </div>
          )}

          {/* Body */}
          {post.body && <div style={{ fontSize: 15, color: '#444', lineHeight: 1.7, marginBottom: 16, whiteSpace: 'pre-wrap' }}>{post.body}</div>}

          {/* ANNOUNCEMENT / NEWS link */}
          {(post.post_type === 'announcement' || post.post_type === 'news') && post.link_url && (
            <div style={{ marginBottom: 16 }}>
              {post.post_type === 'announcement'
                ? <a href={post.link_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontSize: 13, fontWeight: 500, color: 'white', background: teal, padding: '9px 18px', borderRadius: 8, textDecoration: 'none' }}>{post.link_label || 'Learn more'}</a>
                : <a href={post.link_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: teal, textDecoration: 'none' }}>↗ {post.link_label || 'Read more'}</a>}
            </div>
          )}

          <PostShareRow title={post.title} slug={post.slug} />

          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tags.map((t) => <span key={t} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 999, background: '#f1efe8', color: '#666' }}>{t}</span>)}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
