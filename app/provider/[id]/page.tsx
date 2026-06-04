import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES, TAGS } from '@/lib/taxonomy'
import { RatingDisplay, RatingSubmit } from '@/components/RatingWidget'
import { isPremium, showsSupporterBadge, hasBooking, bookingAction, PREMIUM_ACCENT } from '@/lib/subscription'
import PeerRecommendButton from '@/components/PeerRecommendButton'
import RecordProfileView from '@/components/RecordProfileView'

export const dynamic = 'force-dynamic'

function categoryLabel(key: string) {
  return CATEGORIES.find((c) => c.key === key)?.label || key
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

  const { data: ratingRows } = await supabase
    .from('ratings')
    .select('stars')
    .eq('provider_id', id)

  const ratingCount = ratingRows?.length || 0
  const ratingAvg = ratingCount > 0 ? (ratingRows!.reduce((a, r) => a + r.stars, 0) / ratingCount) : null
  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1a1a', background: '#f7f6f2', minHeight: '100vh' }}>
      <RecordProfileView providerId={id} />
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', maxWidth: 900, margin: '0 auto' }}>
        <Link href="/"><img src="/tidal-care-network.svg" alt="Tidal Care Network" style={{ height: 180, width: 'auto' }} /></Link>
        <Link href="/directory" style={{ fontSize: 14, color: '#3e6a70', textDecoration: 'none' }}>← Back to directory</Link>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 40px 64px' }}>

        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e3dc', padding: 32, position: 'relative' }}>

          <div style={{ position: 'absolute', top: 24, right: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/vetted.svg" alt="Vetted" style={{ height: 26, width: 'auto', display: 'block' }} />
            {isEndorsed && <img src="/endorsed.svg" alt="Peer endorsed" style={{ height: 26, width: 'auto', display: 'block' }} />}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#e8eff0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e3dc' }}>
              {p.photo_url ? (
                <img src={p.photo_url} alt={p.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 32, fontWeight: 600, color: '#3e6a70' }}>{(p.full_name || '?').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: '#2c4d52', marginBottom: 4 }}>
                {p.is_org ? (p.practice_name || p.full_name) : `${p.full_name}${p.credentials ? `, ${p.credentials}` : ''}`}
              </h1>
              <div style={{ fontSize: 14, color: '#888' }}>
                {p.is_org && p.full_name ? `Contact: ${p.full_name} · ` : ''}
                {p.primary_area}{p.offers_telehealth ? ' · Telehealth available' : ''}
              </div>
              {p.availability_status === 'accepting' && (
                <span style={{ display: 'inline-block', marginTop: 8, fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 6, background: '#eaf3de', color: '#27500a' }}>Accepting new clients</span>
              )}
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <RatingDisplay avg={ratingAvg} count={ratingCount} size={18} />
                {(recommendCount || 0) > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#3e6a70', background: '#e8eff0', padding: '4px 11px', borderRadius: 999 }}>
                    <img src="/thumbs-up.svg" alt="" style={{ height: 15, width: 'auto', display: 'block' }} />
                    {recommendCount} peer recommendation{recommendCount === 1 ? '' : 's'}
                  </span>
                )}
                <PeerRecommendButton profileProviderId={id} />
              </div>
              {showSupporter && (
                <div style={{ marginTop: 12 }}>
                  <img src="/Supporter.svg" alt="Network supporter" style={{ height: 32, width: 'auto', display: 'block' }} />
                </div>
              )}
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
                  <div key={g.id} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e3dc' }}>
                    <img src={g.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {cats && cats.length > 0 && (
            <Section title="Areas of care">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {cats.map((c) => (
                  <span key={c.category} style={{ fontSize: 12, fontWeight: 500, padding: '4px 11px', borderRadius: 99, background: '#e8eff0', color: '#2c4d52' }}>{categoryLabel(c.category)}</span>
                ))}
              </div>
            </Section>
          )}

          {tags && tags.length > 0 && (
            <Section title="Specialties">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {tags.map((t, i) => (
                  <span key={i} style={{ fontSize: 12, padding: '4px 11px', borderRadius: 99, background: '#f1efe8', color: '#444' }}>{t.tag_value}</span>
                ))}
              </div>
            </Section>
          )}

          {insurance && insurance.length > 0 && (
            <Section title="Insurance & payment">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {insurance.map((ins, i) => (
                  <span key={i} style={{ fontSize: 12, padding: '4px 11px', borderRadius: 99, background: '#f1efe8', color: '#444' }}>{ins.insurance}</span>
                ))}
              </div>
            </Section>
          )}

          {customLinks.length > 0 && (
            <Section title="Links">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {customLinks.map((l, i) => (
                  <a key={i} href={l.url.startsWith('http') ? l.url : `https://${l.url}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 500, color: '#3e6a70', background: '#e8eff0', padding: '6px 14px', borderRadius: 99, textDecoration: 'none' }}>{l.label} ↗</a>
                ))}
              </div>
            </Section>
          )}

          <Section title="Contact this provider">
            <div style={{ fontSize: 14, color: '#444', lineHeight: 1.8, marginBottom: 14 }}>
              {p.email && <div>Email: <a href={`mailto:${p.email}`} style={{ color: '#3e6a70' }}>{p.email}</a></div>}
              {p.phone && <div>Phone: <a href={`tel:${p.phone}`} style={{ color: '#3e6a70' }}>{p.phone}</a></div>}
              {p.website && <div>Website: <a href={p.website} target="_blank" rel="noopener noreferrer" style={{ color: '#3e6a70' }}>{p.website}</a></div>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {booking && (
                <a href={booking.href} target={p.booking_type === 'link' ? '_blank' : undefined} rel={p.booking_type === 'link' ? 'noopener noreferrer' : undefined}
                  style={{ fontSize: 14, fontWeight: 500, color: 'white', background: PREMIUM_ACCENT, padding: '10px 20px', borderRadius: 8, textDecoration: 'none', letterSpacing: '0.02em' }}>
                  {booking.label}
                </a>
              )}
              {p.email && (
                <a href={`mailto:${p.email}?subject=${encodeURIComponent('Connecting via Tidal Care Network')}`} style={{ fontSize: 14, fontWeight: 500, color: 'white', background: '#3e6a70', padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>
                  Email this provider
                </a>
              )}
              {p.phone && (
                <a href={`tel:${p.phone}`} style={{ fontSize: 14, fontWeight: 500, color: '#3e6a70', background: 'white', border: '1px solid #3e6a70', padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>
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
    <div style={{ marginBottom: 20, paddingTop: 20, borderTop: '1px solid #f0f0f0' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  )
}
