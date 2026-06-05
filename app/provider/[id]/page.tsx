import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES, TAGS } from '@/lib/taxonomy'
import { RatingDisplay, RatingSubmit } from '@/components/RatingWidget'
import { isPremium, showsSupporterBadge, hasBooking, bookingAction, PREMIUM_ACCENT } from '@/lib/subscription'
import PeerRecommendButton from '@/components/PeerRecommendButton'
import RecordProfileView from '@/components/RecordProfileView'
import SiteHeader from '@/components/SiteHeader'
import { BRAND, SERIF } from '@/lib/brand'

export const dynamic = 'force-dynamic'

const teal = BRAND.teal
const dark = BRAND.dark
const mint = BRAND.mint
const hairline = BRAND.hairline
const champagne = BRAND.champagne
const cardShadow = '0 1px 3px rgba(44,77,82,0.05)'
const demoPill: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 99, background: '#fbe7c2', color: '#92610a' }

const POST_DOT: Record<string, string> = { news: '#3e6a70', event: '#b5aa8e', announcement: '#e8b54a', resource: '#5ba1a9' }
const POST_LABEL: Record<string, string> = { news: 'News', event: 'Event', announcement: 'Announcement', resource: 'Resource' }

function categoryLabel(key: string) {
  return CATEGORIES.find((c) => c.key === key)?.label || key
}

function shortDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// Turn a YouTube or Vimeo URL into an embeddable URL. Returns null if unrecognized.
function videoEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const u = url.trim()
  let m = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/)
  if (m) return `https://www.youtube.com/embed/${m[1]}`
  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (m) return `https://player.vimeo.com/video/${m[1]}`
  return null
}

export default async function ProviderProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: p } = await supabase
    .from('providers')
    .select('*')
    .eq('id', id)
    .eq('vetting_status', 'approved')
    .eq('is_active', true)
    .maybeSingle()

  if (!p) notFound()

  const { data: cats } = await supabase.from('provider_categories').select('category, is_primary').eq('provider_id', id)
  const { data: tags } = await supabase.from('provider_tags').select('tag_type, tag_value').eq('provider_id', id)
  const { data: insurance } = await supabase.from('provider_insurance').select('insurance').eq('provider_id', id)
  const { data: endorsements } = await supabase
    .from('endorsements')
    .select('id')
    .eq('provider_id', id)
    .eq('status', 'confirmed')

  const isEndorsed = (endorsements?.length || 0) > 0

  const { count: recommendCount } = await supabase
    .from('peer_recommendations')
    .select('id', { count: 'exact', head: true })
    .eq('recommended_provider_id', id)

  const premium = isPremium(p)
  const showSupporter = showsSupporterBadge(p)
  const booking = hasBooking(p) ? bookingAction(p) : null
  const embed = premium ? videoEmbedUrl(p.intro_video_url) : null
  const customLinks: { label: string; url: string }[] = premium && Array.isArray(p.custom_links) ? p.custom_links : []

  let gallery: { id: string; image_url: string }[] = []
  if (premium) {
    const { data: g } = await supabase
      .from('provider_gallery')
      .select('id, image_url')
      .eq('provider_id', id)
      .order('sort_order', { ascending: true })
    gallery = g || []
  }

  // Premium: this provider's recent published posts (for "Latest from …")
  type ProfilePost = {
    id: string; slug: string; post_type: string; title: string; image_url: string | null
    event_date: string | null; published_at: string
  }
  let recentPosts: ProfilePost[] = []
  let hasMorePosts = false
  if (premium) {
    const nowISO = new Date().toISOString()
    const { data: pp } = await supabase
      .from('provider_posts')
      .select('id, slug, post_type, title, image_url, event_date, published_at')
      .eq('provider_id', id)
      .eq('status', 'published')
      .or(`expires_at.is.null,expires_at.gt.${nowISO}`)
      .order('published_at', { ascending: false })
      .limit(4)
    const all = (pp as ProfilePost[]) || []
    recentPosts = all.slice(0, 3)
    hasMorePosts = all.length > 3
  }

  const { data: ratingRows } = await supabase
    .from('ratings')
    .select('stars')
    .eq('provider_id', id)

  const ratingCount = ratingRows?.length || 0
  const ratingAvg = ratingCount > 0 ? (ratingRows!.reduce((a, r) => a + r.stars, 0) / ratingCount) : null

  // Group specialty tags under their category, ordered by the provider's areas of care.
  const tagsByType = new Map<string, string[]>()
  ;(tags || []).forEach((t) => {
    const arr = tagsByType.get(t.tag_type) || []
    arr.push(t.tag_value)
    tagsByType.set(t.tag_type, arr)
  })
  const orderedKeys: string[] = []
  ;(cats || []).forEach((c) => { if (!orderedKeys.includes(c.category)) orderedKeys.push(c.category) })
  ;(tags || []).forEach((t) => { if (!orderedKeys.includes(t.tag_type)) orderedKeys.push(t.tag_type) })

  // Build the meta line cleanly so there are no empty segments / double middots.
  const metaParts: string[] = []
  if (p.is_org && p.full_name) metaParts.push(`Contact: ${p.full_name}`)
  if (p.primary_area) metaParts.push(p.primary_area)
  if (p.offers_telehealth) metaParts.push('Telehealth available')
  const metaLine = metaParts.join(' · ')

  const providerLabel = p.is_org ? (p.practice_name || p.full_name) : (p.full_name || 'this provider')

  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1a1a', background: BRAND.pageBg, minHeight: '100vh' }}>
      <RecordProfileView providerId={id} />

      <SiteHeader right={<Link href="/directory" style={{ fontSize: 14, color: teal, textDecoration: 'none' }}>← Back to directory</Link>} />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 40px 64px' }}>

        <div style={{ background: 'white', borderRadius: 18, border: '0.5px solid ' + hairline, boxShadow: cardShadow, padding: 36 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            {p.is_demo && <span style={demoPill}>Demo listing</span>}
            <img src="/vetted.svg" alt="Vetted" style={{ height: 26, width: 'auto', display: 'block' }} />
            {isEndorsed && <img src="/endorsed.svg" alt="Peer endorsed" style={{ height: 26, width: 'auto', display: 'block' }} />}
            {showSupporter && <img src="/Supporter.svg" alt="Network supporter" style={{ height: 26, width: 'auto', display: 'block' }} />}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: mint, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid ' + hairline }}>
              {p.photo_url ? (
                <img src={p.photo_url} alt={p.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 32, fontWeight: 600, color: teal }}>{(p.full_name || '?').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div style={{ minWidth: 0, paddingTop: 2 }}>
              <h1 style={{ fontFamily: SERIF, fontSize: 31, fontWeight: 600, color: dark, marginBottom: 4, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                {p.is_org ? (p.practice_name || p.full_name) : `${p.full_name}${p.credentials ? `, ${p.credentials}` : ''}`}
              </h1>
              {metaLine && <div style={{ fontSize: 14, color: '#888' }}>{metaLine}</div>}
              {p.availability_status === 'accepting' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', marginTop: 8, fontSize: 12, fontWeight: 500, padding: '4px 11px', borderRadius: 99, background: 'white', border: '0.5px solid ' + hairline, color: '#5f6b6d' }}>
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#5a9b6b', marginRight: 6 }} />Accepting new clients
                </span>
              )}
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <RatingDisplay avg={ratingAvg} count={ratingCount} size={18} />
                {(recommendCount || 0) > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: teal, background: mint, padding: '4px 11px', borderRadius: 999 }}>
                    <img src="/thumbs-up.svg" alt="" style={{ height: 15, width: 'auto', display: 'block' }} />
                    {recommendCount} peer recommendation{recommendCount === 1 ? '' : 's'}
                  </span>
                )}
                <PeerRecommendButton profileProviderId={id} />
              </div>
            </div>
          </div>

          {booking && (
            <a href={booking.href} target={p.booking_type === 'link' ? '_blank' : undefined} rel={p.booking_type === 'link' ? 'noopener noreferrer' : undefined}
              style={{ display: 'inline-block', fontSize: 15, fontWeight: 500, color: 'white', background: PREMIUM_ACCENT, padding: '11px 24px', borderRadius: 8, textDecoration: 'none', marginBottom: 24, letterSpacing: '0.02em' }}>
              {booking.label}
            </a>
          )}

          {p.bio && <p style={{ fontSize: 15, lineHeight: 1.7, color: '#444', marginBottom: premium && p.extended_bio ? 12 : 24 }}>{p.bio}</p>}
          {premium && p.extended_bio && <p style={{ fontSize: 15, lineHeight: 1.7, color: '#444', marginBottom: 24 }}>{p.extended_bio}</p>}

          {embed && (
            <Section title="Intro video">
              <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', borderRadius: 10, overflow: 'hidden', background: '#000' }}>
                <iframe src={embed} title="Intro video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
              </div>
            </Section>
          )}

          {gallery.length > 0 && (
            <Section title="Gallery">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                {gallery.map((g) => (
                  <div key={g.id} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '0.5px solid ' + hairline }}>
                    <img src={g.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {orderedKeys.length > 0 && (
            <Section title="Areas of care & specialties">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {orderedKeys.map((key) => {
                  const items = tagsByType.get(key) || []
                  return (
                    <div key={key}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: dark, marginBottom: 4 }}>{categoryLabel(key)}</div>
                      {items.length > 0 && <p style={{ fontSize: 14.5, lineHeight: 1.75, color: '#54625f', margin: 0 }}>{items.join(', ')}</p>}
                    </div>
                  )
                })}
              </div>
            </Section>
          )}

          {insurance && insurance.length > 0 && (
            <Section title="Insurance & payment">
              <p style={{ fontSize: 14.5, lineHeight: 1.75, color: '#54625f', margin: 0 }}>{insurance.map((ins) => ins.insurance).join(', ')}</p>
            </Section>
          )}

          {premium && recentPosts.length > 0 && (
            <Section title={`Latest from ${providerLabel}`}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {recentPosts.map((post) => (
                  <Link key={post.id} href={`/news/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit', background: 'white', border: '0.5px solid ' + hairline, borderRadius: 12, overflow: 'hidden', display: 'block' }}>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: post.image_url ? '#e5e3dc' : '#dde6e3', overflow: 'hidden' }}>
                      {post.image_url && <img src={post.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                    </div>
                    <div style={{ padding: '13px 15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: POST_DOT[post.post_type] || teal }} />
                        <span style={{ fontSize: 10, fontWeight: 500, color: dark, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{POST_LABEL[post.post_type] || post.post_type}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: dark, lineHeight: 1.35, marginBottom: 6 }}>{post.title}</div>
                      <div style={{ fontSize: 11, color: '#9aa0a1' }}>
                        {post.post_type === 'event' && post.event_date ? `Event ${shortDate(post.event_date)}` : shortDate(post.published_at)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {hasMorePosts && (
                <div style={{ marginTop: 14 }}>
                  <Link href="/news" style={{ fontSize: 13, fontWeight: 500, color: teal, textDecoration: 'none' }}>View all updates →</Link>
                </div>
              )}
            </Section>
          )}

          {customLinks.length > 0 && (
            <Section title="Links">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {customLinks.map((l, i) => (
                  <a key={i} href={l.url.startsWith('http') ? l.url : `https://${l.url}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 500, color: teal, background: mint, padding: '6px 14px', borderRadius: 99, textDecoration: 'none' }}>{l.label} ↗</a>
                ))}
              </div>
            </Section>
          )}

          <Section title="Contact this provider">
            <div style={{ fontSize: 14, color: '#444', lineHeight: 1.8, marginBottom: 14 }}>
              {p.email && <div>Email: <a href={`mailto:${p.email}`} style={{ color: teal }}>{p.email}</a></div>}
              {p.phone && <div>Phone: <a href={`tel:${p.phone}`} style={{ color: teal }}>{p.phone}</a></div>}
              {p.website && <div>Website: <a href={p.website} target="_blank" rel="noopener noreferrer" style={{ color: teal }}>{p.website}</a></div>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {booking && (
                <a href={booking.href} target={p.booking_type === 'link' ? '_blank' : undefined} rel={p.booking_type === 'link' ? 'noopener noreferrer' : undefined}
                  style={{ fontSize: 14, fontWeight: 500, color: 'white', background: PREMIUM_ACCENT, padding: '10px 20px', borderRadius: 8, textDecoration: 'none', letterSpacing: '0.02em' }}>
                  {booking.label}
                </a>
              )}
              {p.email && (
                <a href={`mailto:${p.email}?subject=${encodeURIComponent('Connecting via Tidal Care Network')}`} style={{ fontSize: 14, fontWeight: 500, color: 'white', background: teal, padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>
                  Email this provider
                </a>
              )}
              {p.phone && (
                <a href={`tel:${p.phone}`} style={{ fontSize: 14, fontWeight: 500, color: teal, background: 'white', border: '1px solid ' + teal, padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>
                  Call
                </a>
              )}
            </div>
            <p style={{ fontSize: 11, color: '#999', marginTop: 10, lineHeight: 1.5 }}>
              The email button opens your device&apos;s default mail app. Please don&apos;t include anyone&apos;s personal health information in your message.
            </p>
          </Section>

          <Section title="Reviews">
            <RatingSubmit providerId={id} />
          </Section>

        </div>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22, paddingTop: 22, borderTop: '0.5px solid ' + hairline }}>
      <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: dark, letterSpacing: '-0.01em' }}>{title}</div>
      <div style={{ height: 2, width: 30, background: champagne, margin: '7px 0 14px' }} />
      {children}
    </div>
  )
}
