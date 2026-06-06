import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

// Placing this file in the same folder as the news detail route makes Next
// automatically attach og:image (and twitter:image) for that page — no edits
// to page.tsx needed. Output is the 1200x630 link-preview card.
export const runtime = 'edge'
export const alt = 'Tidal Care Network'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const TYPE_LABEL: Record<string, string> = { news: 'News', event: 'Event', announcement: 'Announcement', resource: 'Resource' }
const TYPE_DOT: Record<string, string> = { news: '#3e6a70', event: '#b5aa8e', announcement: '#e8b54a', resource: '#5ba1a9' }

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let title = 'Tidal Care Network'
  let postType = 'news'
  let imageUrl: string | null = null
  let author = ''

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { data: post } = await supabase
      .from('provider_posts')
      .select('title, post_type, image_url, provider_id')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    if (post) {
      title = post.title || title
      postType = post.post_type || 'news'
      imageUrl = post.image_url || null
      const { data: prov } = await supabase
        .from('providers')
        .select('full_name, credentials, practice_name, is_org')
        .eq('id', post.provider_id)
        .maybeSingle()
      if (prov) {
        author = prov.is_org
          ? (prov.practice_name || prov.full_name)
          : `${prov.full_name}${prov.credentials ? ', ' + prov.credentials : ''}`
      }
    }
  } catch {
    // fall back to brand-only card
  }

  const dot = TYPE_DOT[postType] || '#3e6a70'
  const label = (TYPE_LABEL[postType] || 'News').toUpperCase()

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0f3034', position: 'relative' }}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} width={1200} height={630} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : null}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', background: imageUrl ? 'linear-gradient(180deg, rgba(15,48,52,0.20) 0%, rgba(15,48,52,0.92) 80%)' : 'linear-gradient(135deg, #3e6a70 0%, #2c4d52 100%)' }} />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 64, width: '100%', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 16, height: 16, borderRadius: 999, background: dot, display: 'flex' }} />
            <div style={{ fontSize: 24, letterSpacing: 4, color: 'white', fontWeight: 700 }}>{label}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 62, lineHeight: 1.1, color: 'white', fontWeight: 700, maxWidth: 1000 }}>{title}</div>
            {author ? <div style={{ fontSize: 28, color: '#cfe0e1', marginTop: 18, display: 'flex' }}>{author}</div> : null}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 30 }}>
              <div style={{ height: 3, width: 44, background: '#b5aa8e', display: 'flex' }} />
              <div style={{ fontSize: 26, color: 'white', fontWeight: 700 }}>Tidal Care Network</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
