import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

// Generates a branded, Instagram-ready image for a news post.
//   /api/news-image?slug=<slug>&format=square   -> 1080x1080 (feed + Stories)
//   /api/news-image?slug=<slug>&format=story    -> 1080x1920 (full-screen Story)
export const runtime = 'edge'

const TYPE_LABEL: Record<string, string> = { news: 'News', event: 'Event', announcement: 'Announcement', resource: 'Resource' }
const TYPE_DOT: Record<string, string> = { news: '#3e6a70', event: '#b5aa8e', announcement: '#e8b54a', resource: '#5ba1a9' }

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug') || ''
  const format = searchParams.get('format') === 'story' ? 'story' : 'square'
  const story = format === 'story'
  const W = 1080
  const H = story ? 1920 : 1080
  const imgH = story ? 1080 : 620

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
    // brand-only fallback
  }

  const dot = TYPE_DOT[postType] || '#3e6a70'
  const label = (TYPE_LABEL[postType] || 'News').toUpperCase()
  const titleSize = story ? 76 : 64

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#f7f6f2' }}>
        {/* Image band */}
        <div style={{ width: '100%', height: imgH, display: 'flex', position: 'relative', background: '#dde6e3' }}>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} width={W} height={imgH} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', background: 'linear-gradient(135deg, #3e6a70 0%, #2c4d52 100%)' }} />
          )}
        </div>
        {/* Text panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: story ? 'flex-start' : 'space-between', padding: story ? 80 : 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ width: 20, height: 20, borderRadius: 999, background: dot, display: 'flex' }} />
            <div style={{ fontSize: 30, letterSpacing: 5, color: '#2c4d52', fontWeight: 700 }}>{label}</div>
          </div>
          <div style={{ fontSize: titleSize, lineHeight: 1.12, color: '#2c4d52', fontWeight: 700, display: 'flex' }}>{title}</div>
          {author ? <div style={{ fontSize: 34, color: '#3e6a70', marginTop: 24, display: 'flex' }}>{author}</div> : null}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: story ? 48 : 0 }}>
            <div style={{ height: 4, width: 56, background: '#b5aa8e', display: 'flex' }} />
            <div style={{ fontSize: 30, color: '#2c4d52', fontWeight: 700 }}>Tidal Care Network</div>
          </div>
        </div>
      </div>
    ),
    { width: W, height: H },
  )
}
