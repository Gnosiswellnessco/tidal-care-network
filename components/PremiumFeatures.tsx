'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const teal = '#3e6a70'
const dark = '#2c4d52'
const PREMIUM = '#b5aa8e'
const PREMIUM_DARK = '#7d7256'
const PREMIUM_TINT = '#efe9dc'

type GalleryItem = { id: string; image_url: string; sort_order: number }
type CustomLink = { label: string; url: string }

export default function PremiumFeatures({
  providerId,
  userId,
  initial,
  initialGallery,
}: {
  providerId: string
  userId: string
  initial: {
    booking_type: string | null
    booking_value: string | null
    intro_video_url: string | null
    extended_bio: string | null
    custom_links: CustomLink[] | null
    show_supporter_badge: boolean | null
  }
  initialGallery: GalleryItem[]
}) {
  const supabase = createClient()

  const [bookingType, setBookingType] = useState(initial.booking_type || '')
  const [bookingValue, setBookingValue] = useState(initial.booking_value || '')
  const [videoUrl, setVideoUrl] = useState(initial.intro_video_url || '')
  const [extendedBio, setExtendedBio] = useState(initial.extended_bio || '')
  const [links, setLinks] = useState<CustomLink[]>(initial.custom_links && initial.custom_links.length ? initial.custom_links : [])
  const [showBadge, setShowBadge] = useState(!!initial.show_supporter_badge)

  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery)
  const [uploading, setUploading] = useState(false)

  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  function addLink() { setLinks((c) => [...c, { label: '', url: '' }]) }
  function updateLink(i: number, field: keyof CustomLink, v: string) {
    setLinks((c) => c.map((l, idx) => idx === i ? { ...l, [field]: v } : l))
  }
  function removeLink(i: number) { setLinks((c) => c.filter((_, idx) => idx !== i)) }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setErr('Image must be under 5MB.'); return }
    if (!file.type.startsWith('image/')) { setErr('Please upload an image file.'); return }
    setUploading(true); setErr(''); setMsg('')
    const ext = file.name.split('.').pop()
    const path = `gallery/${userId}-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('provider-photos').upload(path, file, { upsert: true })
    if (upErr) { setErr('Upload failed: ' + upErr.message); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('provider-photos').getPublicUrl(path)
    const url = urlData.publicUrl
    const { data: row, error: insErr } = await supabase
      .from('provider_gallery')
      .insert({ provider_id: providerId, image_url: url, sort_order: gallery.length })
      .select()
      .single()
    if (insErr || !row) { setErr('Could not save image: ' + (insErr?.message || 'unknown')); setUploading(false); return }
    setGallery((c) => [...c, { id: row.id, image_url: url, sort_order: gallery.length }])
    setUploading(false)
    e.target.value = ''
  }

  async function removeGalleryItem(id: string) {
    const { error } = await supabase.from('provider_gallery').delete().eq('id', id)
    if (!error) setGallery((c) => c.filter((g) => g.id !== id))
  }

  async function save() {
    setSaving(true); setErr(''); setMsg('')
    const cleanLinks = links.filter((l) => l.label.trim() && l.url.trim())
    const { error } = await supabase
      .from('providers')
      .update({
        booking_type: bookingType || null,
        booking_value: bookingValue.trim() || null,
        intro_video_url: videoUrl.trim() || null,
        extended_bio: extendedBio.trim() || null,
        custom_links: cleanLinks,
        show_supporter_badge: showBadge,
      })
      .eq('id', providerId)
    setSaving(false)
    if (error) { setErr('Could not save: ' + error.message); return }
    setMsg('Saved.')
    setTimeout(() => setMsg(''), 2500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Booking */}
      <Section title="Booking button" desc="Choose how clients book with you. We show the matching button on your directory card and profile.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={radioRow(bookingType === 'phone')}>
            <input type="radio" name="bk" checked={bookingType === 'phone'} onChange={() => setBookingType('phone')} />
            <span style={{ fontWeight: 500 }}>Phone number</span>
            <span style={{ color: '#888' }}>— button reads &ldquo;Call to book&rdquo;</span>
          </label>
          <label style={radioRow(bookingType === 'link')}>
            <input type="radio" name="bk" checked={bookingType === 'link'} onChange={() => setBookingType('link')} />
            <span style={{ fontWeight: 500 }}>Online booking link</span>
            <span style={{ color: '#888' }}>— button reads &ldquo;Book online&rdquo;</span>
          </label>
          <label style={radioRow(bookingType === '')}>
            <input type="radio" name="bk" checked={bookingType === ''} onChange={() => { setBookingType(''); setBookingValue('') }} />
            <span style={{ fontWeight: 500 }}>No booking button</span>
          </label>
          {bookingType !== '' && (
            <input
              style={inp}
              value={bookingValue}
              onChange={(e) => setBookingValue(e.target.value)}
              placeholder={bookingType === 'phone' ? '(843) 555-0142' : 'https://calendly.com/your-link'}
            />
          )}
        </div>
      </Section>

      {/* Intro video */}
      <Section title="Intro video" desc="Paste a YouTube or Vimeo link. It appears on your profile.">
        <input style={inp} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=…" />
      </Section>

      {/* Photo gallery */}
      <Section title="Photo gallery" desc="Upload images of your space, team, or work. Shown on your profile.">
        {gallery.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 8, marginBottom: 10 }}>
            {gallery.map((g) => (
              <div key={g.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e3dc' }}>
                <img src={g.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => removeGalleryItem(g.id)} style={{ position: 'absolute', top: 4, right: 4, fontSize: 11, lineHeight: 1, padding: '3px 6px', borderRadius: 6, border: 'none', background: 'rgba(0,0,0,0.6)', color: 'white', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
          </div>
        )}
        <label style={{ display: 'inline-block', fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 8, border: '1px solid ' + teal, background: 'white', color: teal, cursor: uploading ? 'default' : 'pointer' }}>
          {uploading ? 'Uploading…' : '+ Add image'}
          <input type="file" accept="image/*" onChange={handleGalleryUpload} disabled={uploading} style={{ display: 'none' }} />
        </label>
      </Section>

      {/* Extended bio + links */}
      <Section title="Extended bio & links" desc="A longer description and custom links shown on your profile.">
        <textarea style={{ ...inp, minHeight: 90, resize: 'vertical', marginBottom: 10 }} value={extendedBio} onChange={(e) => setExtendedBio(e.target.value)} placeholder="Tell visitors more about your background, approach, and what to expect…" />
        {links.map((l, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input style={{ ...inp, flex: 1 }} value={l.label} onChange={(e) => updateLink(i, 'label', e.target.value)} placeholder="Label (e.g. My website)" />
            <input style={{ ...inp, flex: 2 }} value={l.url} onChange={(e) => updateLink(i, 'url', e.target.value)} placeholder="https://…" />
            <button type="button" onClick={() => removeLink(i)} style={{ fontSize: 12, color: '#991b1b', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addLink} style={{ fontSize: 12, color: teal, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>+ Add link</button>
      </Section>

      {/* Supporter badge */}
      <Section title="Supporter badge" desc="Display the Network Supporter mark on your profile and card. It signals that you help fund the network — it is not a quality or ranking signal, and the directory legend explains this to visitors.">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            role="switch"
            aria-checked={showBadge}
            aria-label="Show supporter badge on my profile"
            onClick={() => setShowBadge((v) => !v)}
            style={{ width: 42, height: 24, borderRadius: 99, background: showBadge ? PREMIUM : '#d4d2ca', position: 'relative', flexShrink: 0, border: 'none', padding: 0, cursor: 'pointer', transition: 'background 0.15s' }}
          >
            <span style={{ position: 'absolute', top: 2, left: showBadge ? 20 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.15s' }} />
          </button>
          <span style={{ fontSize: 14, color: dark }}>{showBadge ? 'Badge is shown on your profile' : 'Badge is hidden'}</span>
        </div>
        <div style={{ marginTop: 12 }}>
          <img src="/Supporter.svg" alt="Network supporter badge preview" style={{ height: 34, width: 'auto', opacity: showBadge ? 1 : 0.35 }} />
        </div>
      </Section>

      {err && <p style={{ fontSize: 14, color: '#b91c1c' }}>{err}</p>}
      {msg && <p style={{ fontSize: 14, color: '#27500a' }}>{msg}</p>}

      <div>
        <button type="button" onClick={save} disabled={saving} style={{ fontSize: 14, fontWeight: 500, padding: '11px 26px', borderRadius: 8, border: 'none', background: PREMIUM, color: 'white', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1, letterSpacing: '0.02em' }}>
          {saving ? 'Saving…' : 'Save premium features'}
        </button>
      </div>
    </div>
  )
}

const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, background: 'white', color: '#1a1a1a' }

function radioRow(on: boolean): React.CSSProperties {
  return { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#333', cursor: 'pointer', padding: '9px 12px', borderRadius: 8, border: on ? '1px solid ' + PREMIUM : '1px solid #e5e3dc', background: on ? PREMIUM_TINT : 'white' }
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', padding: '18px 20px' }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: dark, marginBottom: 4 }}>{title}</div>
      <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, margin: '0 0 14px' }}>{desc}</p>
      {children}
    </div>
  )
}
