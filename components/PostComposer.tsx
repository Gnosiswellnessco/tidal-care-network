'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { POST_TYPES, POST_POPULATIONS, POST_TOPICS, postTypeLabel, slugify, type PostType } from '@/lib/news-taxonomy'

const teal = '#3e6a70'
const dark = '#2c4d52'
const PREMIUM = '#b5aa8e'
const PREMIUM_DARK = '#7d7256'
const PREMIUM_TINT = '#efe9dc'

const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, background: 'white', color: '#1a1a1a', boxSizing: 'border-box' }

type Post = {
  id: string
  post_type: string
  title: string
  status: string
  event_date: string | null
  expires_at: string | null
  published_at: string
}

function rnd() { return Math.random().toString(36).slice(2, 8) }

export default function PostComposer({ providerId, userId }: { providerId: string; userId: string }) {
  const supabase = createClient()

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const [postType, setPostType] = useState<PostType>('news')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [pops, setPops] = useState<Set<string>>(new Set())
  const [topics, setTopics] = useState<Set<string>>(new Set())

  const [linkUrl, setLinkUrl] = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [location, setLocation] = useState('')
  const [cost, setCost] = useState('')
  const [resourceFileUrl, setResourceFileUrl] = useState('')
  const [audienceNote, setAudienceNote] = useState('')
  const [shelfLife, setShelfLife] = useState(30)

  const [agreed, setAgreed] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [err, setErr] = useState('')

  const loadPosts = useCallback(async () => {
    const { data } = await supabase
      .from('provider_posts')
      .select('id, post_type, title, status, event_date, expires_at, published_at')
      .eq('provider_id', providerId)
      .order('published_at', { ascending: false })
    setPosts((data as Post[]) || [])
    setLoading(false)
  }, [providerId, supabase])

  useEffect(() => { loadPosts() }, [loadPosts])

  function toggle(set: Set<string>, v: string, setter: (s: Set<string>) => void) {
    const n = new Set(set)
    if (n.has(v)) n.delete(v); else n.add(v)
    setter(n)
  }

  function resetForm() {
    setPostType('news'); setTitle(''); setBody(''); setImageUrl(''); setPops(new Set()); setTopics(new Set())
    setLinkUrl(''); setLinkLabel(''); setEventDate(''); setEventTime(''); setLocation(''); setCost('')
    setResourceFileUrl(''); setAudienceNote(''); setShelfLife(30); setErr(''); setAgreed(false)
  }

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>, kind: 'image' | 'file') {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 8 * 1024 * 1024) { setErr('File must be under 8MB.'); return }
    if (kind === 'image' && !file.type.startsWith('image/')) { setErr('Please upload an image file.'); return }
    setUploading(true); setErr('')
    const ext = file.name.split('.').pop()
    const prefix = kind === 'image' ? 'news' : 'news-files'
    const path = `${prefix}/${userId}-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('provider-photos').upload(path, file, { upsert: true })
    if (upErr) { setErr('Upload failed: ' + upErr.message); setUploading(false); return }
    const { data } = supabase.storage.from('provider-photos').getPublicUrl(path)
    if (kind === 'image') setImageUrl(data.publicUrl); else setResourceFileUrl(data.publicUrl)
    setUploading(false)
    e.target.value = ''
  }

  function validate(): string {
    if (!title.trim()) return 'Please add a title.'
    if (postType === 'event' && !eventDate) return 'Events need an event date.'
    if (postType === 'resource' && !resourceFileUrl && !linkUrl.trim()) return 'Resources need a file or a link.'
    if (!agreed) return 'Please confirm you agree to the posting standards.'
    return ''
  }

  async function publish() {
    const v = validate()
    if (v) { setErr(v); return }
    setPublishing(true); setErr('')

    const now = new Date()
    let expiresAt: string
    if (postType === 'event' && eventDate) {
      const d = new Date(eventDate + 'T00:00:00'); d.setDate(d.getDate() + 1); expiresAt = d.toISOString()
    } else {
      const d = new Date(now); d.setDate(d.getDate() + shelfLife); expiresAt = d.toISOString()
    }

    const slug = `${slugify(title)}-${rnd()}`

    const { error } = await supabase.from('provider_posts').insert({
      provider_id: providerId,
      post_type: postType,
      title: title.trim(),
      body: body.trim() || null,
      image_url: imageUrl || null,
      slug,
      populations: Array.from(pops),
      topics: Array.from(topics),
      link_url: linkUrl.trim() || null,
      link_label: linkLabel.trim() || null,
      event_date: postType === 'event' ? eventDate : null,
      event_time: postType === 'event' ? (eventTime.trim() || null) : null,
      location: postType === 'event' ? (location.trim() || null) : null,
      cost: postType === 'event' ? (cost.trim() || null) : null,
      resource_file_url: postType === 'resource' ? (resourceFileUrl || null) : null,
      audience_note: postType === 'resource' ? (audienceNote.trim() || null) : null,
      status: 'published',
      published_at: now.toISOString(),
      expires_at: expiresAt,
    })

    setPublishing(false)
    if (error) { setErr('Could not publish: ' + error.message); return }
    resetForm(); setOpen(false); loadPosts()
  }

  async function removePost(id: string) {
    const { error } = await supabase.from('provider_posts').delete().eq('id', id)
    if (!error) setPosts((cur) => cur.filter((p) => p.id !== id))
  }

  const linkLabelPlaceholder = postType === 'event' ? 'Register / RSVP'
    : postType === 'resource' ? 'Visit website'
    : postType === 'announcement' ? 'Learn more'
    : 'Read more'

  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', borderTop: '2px solid ' + PREMIUM, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: dark }}>News &amp; updates</div>
          <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, margin: '4px 0 0' }}>Share news, events, announcements, and resources on the public Tidal Care updates page.</p>
        </div>
        {!open && <button type="button" onClick={() => setOpen(true)} style={{ fontSize: 13, fontWeight: 500, color: 'white', background: PREMIUM, border: 'none', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ New post</button>}
      </div>

      {open && (
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid #eee' }}>
          {/* Type picker */}
          <label style={lbl}>Type</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {POST_TYPES.map((t) => (
              <button key={t.key} type="button" onClick={() => setPostType(t.key)}
                style={{ fontSize: 13, padding: '8px 14px', borderRadius: 8, cursor: 'pointer', border: postType === t.key ? '1px solid ' + PREMIUM_DARK : '1px solid #d4d2ca', background: postType === t.key ? PREMIUM_TINT : 'white', color: postType === t.key ? PREMIUM_DARK : '#555', fontWeight: postType === t.key ? 600 : 400 }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Shared: title + body */}
          <label style={lbl}>Title</label>
          <input style={{ ...inp, marginBottom: 14 }} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A short, clear headline" />

          <label style={lbl}>Details</label>
          <textarea style={{ ...inp, minHeight: 90, resize: 'vertical', marginBottom: 14 }} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Describe your news, event, announcement, or resource. Do not include any client or patient information." />

          {/* Image */}
          <label style={lbl}>Image / flyer (optional)</label>
          <div style={{ marginBottom: 14 }}>
            {imageUrl
              ? <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><img src={imageUrl} alt="" style={{ width: 90, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e3dc' }} /><button type="button" onClick={() => setImageUrl('')} style={{ fontSize: 12, color: '#991b1b', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button></div>
              : <label style={uploadBtn}>{uploading ? 'Uploading…' : '+ Add image'}<input type="file" accept="image/*" onChange={(e) => uploadFile(e, 'image')} disabled={uploading} style={{ display: 'none' }} /></label>}
          </div>

          {/* EVENT fields */}
          {postType === 'event' && (
            <div style={typeBox}>
              <label style={lbl}>Event date</label>
              <input type="date" style={{ ...inp, marginBottom: 12 }} value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              <label style={lbl}>Time (optional)</label>
              <input style={{ ...inp, marginBottom: 12 }} value={eventTime} onChange={(e) => setEventTime(e.target.value)} placeholder="6:00–7:30 PM" />
              <label style={lbl}>Location (optional)</label>
              <input style={{ ...inp, marginBottom: 12 }} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Venue & address, or “Online”" />
              <label style={lbl}>Cost (optional)</label>
              <input style={{ ...inp, marginBottom: 0 }} value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Free · or e.g. $20" />
            </div>
          )}

          {/* RESOURCE fields */}
          {postType === 'resource' && (
            <div style={typeBox}>
              <label style={lbl}>Who it&apos;s for (optional)</label>
              <input style={{ ...inp, marginBottom: 12 }} value={audienceNote} onChange={(e) => setAudienceNote(e.target.value)} placeholder="e.g. Parents and caregivers of teens" />
              <label style={lbl}>Downloadable file (optional)</label>
              <div>
                {resourceFileUrl
                  ? <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: 13, color: teal }}>File attached</span><button type="button" onClick={() => setResourceFileUrl('')} style={{ fontSize: 12, color: '#991b1b', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button></div>
                  : <label style={uploadBtn}>{uploading ? 'Uploading…' : '+ Upload file'}<input type="file" onChange={(e) => uploadFile(e, 'file')} disabled={uploading} style={{ display: 'none' }} /></label>}
              </div>
            </div>
          )}

          {/* Shared link (RSVP / CTA / source / external) */}
          <label style={lbl}>Link (optional)</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input style={{ ...inp, flex: 2 }} value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…" />
            <input style={{ ...inp, flex: 1 }} value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} placeholder={linkLabelPlaceholder} />
          </div>

          {/* Populations */}
          <label style={lbl}>Who is this for? (optional)</label>
          <div style={chipBox}>
            {POST_POPULATIONS.map((p) => (
              <button key={p} type="button" onClick={() => toggle(pops, p, setPops)} style={chip(pops.has(p))}>{p}</button>
            ))}
          </div>

          {/* Topics */}
          <label style={lbl}>Topics (optional)</label>
          <div style={chipBox}>
            {POST_TOPICS.map((t) => (
              <button key={t} type="button" onClick={() => toggle(topics, t, setTopics)} style={chip(topics.has(t))}>{t}</button>
            ))}
          </div>

          {/* Shelf life (non-event) */}
          {postType !== 'event' && (
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>How long should it show?</label>
              <select style={{ ...inp, width: 'auto' }} value={shelfLife} onChange={(e) => setShelfLife(Number(e.target.value))}>
                <option value={7}>1 week</option>
                <option value={14}>2 weeks</option>
                <option value={30}>30 days (default)</option>
              </select>
            </div>
          )}
          {postType === 'event' && (
            <p style={{ fontSize: 12, color: '#888', margin: '0 0 14px' }}>Events automatically drop off the day after the event date.</p>
          )}

          {/* Community standards */}
          <div style={{ background: '#faf9f5', border: '1px solid #eee', borderRadius: 8, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: dark, marginBottom: 6 }}>Posting standards</div>
            <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6, margin: '0 0 8px' }}>
              Your post must be truthful and about your own services, events, or resources, and stay within your scope. It must contain <strong>no client or patient information</strong> of any kind, give no individualized medical advice, make no guarantees or misleading claims, and include only content and images you have the rights to use. Posts are public. Tidal Care Network may edit or remove any post at its discretion.
            </p>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: dark, cursor: 'pointer' }}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 2 }} />
              I have read and agree to the posting standards.
            </label>
          </div>

          {err && <p style={{ fontSize: 13, color: '#b91c1c', marginBottom: 12 }}>{err}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={publish} disabled={publishing} style={{ fontSize: 14, fontWeight: 500, padding: '11px 24px', borderRadius: 8, border: 'none', background: PREMIUM, color: 'white', cursor: publishing ? 'default' : 'pointer', opacity: publishing ? 0.6 : 1 }}>
              {publishing ? 'Publishing…' : 'Publish'}
            </button>
            <button type="button" onClick={() => { resetForm(); setOpen(false) }} style={{ fontSize: 14, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Existing posts */}
      {!loading && posts.length > 0 && (
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #eee' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Your posts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {posts.map((p) => {
              const expired = p.expires_at ? new Date(p.expires_at) < new Date() : false
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#faf9f5', borderRadius: 8, border: '1px solid #eee' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: PREMIUM_DARK, textTransform: 'uppercase', letterSpacing: '0.06em', minWidth: 84 }}>{postTypeLabel(p.post_type)}</span>
                  <span style={{ flex: 1, fontSize: 13, color: dark, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                  <span style={{ fontSize: 11, color: expired ? '#b08968' : '#9aa0a1' }}>{p.status === 'removed' ? 'Removed by admin' : expired ? 'Expired' : 'Live'}</span>
                  <button type="button" onClick={() => removePost(p.id)} title="Delete" style={{ fontSize: 16, color: '#bbb', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>×</button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }
const uploadBtn: React.CSSProperties = { display: 'inline-block', fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 8, border: '1px solid ' + teal, background: 'white', color: teal, cursor: 'pointer' }
const typeBox: React.CSSProperties = { background: PREMIUM_TINT, borderRadius: 8, padding: '14px 16px', marginBottom: 14 }
const chipBox: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 150, overflowY: 'auto', padding: '8px', border: '1px solid #eee', borderRadius: 8, marginBottom: 14, background: '#fcfbf8' }
function chip(on: boolean): React.CSSProperties {
  return { fontSize: 12, padding: '5px 11px', borderRadius: 999, cursor: 'pointer', border: on ? '1px solid ' + teal : '1px solid #d4d2ca', background: on ? '#e8eff0' : 'white', color: on ? dark : '#666', fontWeight: on ? 500 : 400 }
}
