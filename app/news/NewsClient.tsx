'use client'

import { useState } from 'react'
import Link from 'next/link'
import { POST_TYPES, POST_POPULATIONS, POST_TOPICS, CATEGORY_GROUPS, categoryLabel, postTypeLabel } from '@/lib/news-taxonomy'

const dark = '#2c4d52'
const teal = '#3e6a70'

const DOT: Record<string, string> = { news: '#3e6a70', event: '#b5aa8e', announcement: '#e8b54a', resource: '#5ba1a9' }

type Author = { full_name: string; credentials: string | null; practice_name: string | null; is_org: boolean } | null
type Post = {
  id: string; post_type: string; title: string; body: string | null; image_url: string | null; slug: string
  populations: string[]; topics: string[]
  link_url: string | null; link_label: string | null
  event_date: string | null; event_time: string | null; location: string | null; cost: string | null
  resource_file_url: string | null; audience_note: string | null
  published_at: string; expires_at: string | null
  author: Author; categories: string[]
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
function authorName(a: Author) {
  if (!a) return ''
  return a.is_org ? (a.practice_name || a.full_name) : `${a.full_name}${a.credentials ? `, ${a.credentials}` : ''}`
}
function expiryLine(p: Post): string {
  if (p.post_type === 'event' && p.event_date) {
    const d = new Date(p.event_date + 'T00:00:00')
    return `Event ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
  }
  if (p.expires_at) return `Shows until ${fmt(p.expires_at)}`
  return ''
}

export default function NewsClient({ posts }: { posts: Post[] }) {
  const [active, setActive] = useState<{ type: Set<string>; category: Set<string>; population: Set<string>; topic: Set<string> }>({
    type: new Set(), category: new Set(), population: new Set(), topic: new Set(),
  })
  const [openFacet, setOpenFacet] = useState<string | null>(null)
  const [sort, setSort] = useState('newest')

  function toggle(facet: 'type' | 'category' | 'population' | 'topic', v: string) {
    setActive((cur) => {
      const next = { ...cur, [facet]: new Set(cur[facet]) }
      if (next[facet].has(v)) next[facet].delete(v); else next[facet].add(v)
      return next
    })
  }
  function clearAll() {
    setActive({ type: new Set(), category: new Set(), population: new Set(), topic: new Set() })
  }

  function matches(p: Post) {
    if (active.type.size && !active.type.has(p.post_type)) return false
    if (active.category.size && !p.categories.some((c) => active.category.has(c))) return false
    if (active.population.size && !p.populations.some((x) => active.population.has(x))) return false
    if (active.topic.size && !p.topics.some((x) => active.topic.has(x))) return false
    return true
  }
  function sortPosts(list: Post[]) {
    const a = list.slice()
    if (sort === 'category') a.sort((x, y) => (categoryLabel(x.categories[0] || '')).localeCompare(categoryLabel(y.categories[0] || '')))
    else if (sort === 'events') a.sort((x, y) => {
      const xe = x.post_type === 'event' ? 0 : 1, ye = y.post_type === 'event' ? 0 : 1
      if (xe !== ye) return xe - ye
      return (x.event_date || '').localeCompare(y.event_date || '')
    })
    else a.sort((x, y) => y.published_at.localeCompare(x.published_at))
    return a
  }

  function share(p: Post, e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    const url = `${window.location.origin}/news/${p.slug}`
    const nav = navigator as Navigator & { share?: (d: { title: string; url: string }) => Promise<void> }
    if (nav.share) { nav.share({ title: p.title, url }).catch(() => {}) }
    else { window.location.href = `mailto:?subject=${encodeURIComponent(p.title)}&body=${encodeURIComponent(url)}` }
  }

  const activeCount = active.type.size + active.category.size + active.population.size + active.topic.size
  const latest = posts.slice(0, 3)
  const browse = sortPosts(posts.filter(matches))

  if (posts.length === 0) {
    return <div style={{ background: 'white', border: '1px solid #e5e3dc', borderRadius: 12, padding: 32, textAlign: 'center', color: '#9aa0a1', fontSize: 14 }}>No updates yet — check back soon.</div>
  }

  const FACET_LABELS: Record<string, string> = { type: 'Type', category: 'Category', population: 'Population', topic: 'Topic' }

  return (
    <div>
      {/* LATEST */}
      <div style={{ fontSize: 11, fontWeight: 600, color: '#8a9092', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 12 }}>Latest</div>
      <div style={{ display: 'grid', gridTemplateColumns: latest.length > 1 ? '1.6fr 1fr' : '1fr', gap: 14, marginBottom: 32 }}>
        {latest[0] && <FeaturedCard p={latest[0]} onShare={share} />}
        {latest.length > 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {latest.slice(1, 3).map((p) => <SmallCard key={p.id} p={p} onShare={share} />)}
          </div>
        )}
      </div>

      {/* BROWSE ALL */}
      <div style={{ borderTop: '0.5px solid #e5e3dc', paddingTop: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#8a9092', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Browse all updates</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#9aa0a1' }}>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ fontSize: 13, padding: '6px 8px', border: '1px solid #d4d2ca', borderRadius: 8, background: 'white', color: dark }}>
              <option value="newest">Newest</option>
              <option value="category">By category</option>
              <option value="events">Upcoming events</option>
            </select>
          </div>
        </div>

        {/* Compact filter bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 12, borderBottom: '0.5px solid #e5e3dc' }}>
          {(['type', 'category', 'population', 'topic'] as const).map((f) => {
            const n = active[f].size
            const on = openFacet === f
            return (
              <button key={f} onClick={() => setOpenFacet(on ? null : f)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, height: 34, padding: '0 13px', borderRadius: 8, cursor: 'pointer', border: n > 0 ? '1px solid #3e6a70' : '1px solid #d4d2ca', background: n > 0 ? '#e8eff0' : 'white', color: '#3e6a70' }}>
                {FACET_LABELS[f]}{n > 0 ? ` (${n})` : ''} <span style={{ fontSize: 11 }}>▾</span>
              </button>
            )
          })}
        </div>

        {/* Open facet panel */}
        {openFacet && (
          <div style={{ padding: '14px 2px', borderBottom: '0.5px solid #e5e3dc' }}>
            {openFacet === 'type' && (
              <div style={chipWrap}>
                {POST_TYPES.map((t) => <Opt key={t.key} label={t.label} on={active.type.has(t.key)} onClick={() => toggle('type', t.key)} />)}
              </div>
            )}
            {openFacet === 'category' && (
              <div>
                {CATEGORY_GROUPS.map((g) => (
                  <div key={g.label} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#8a9092', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{g.label}</div>
                    <div style={chipWrap}>
                      {g.keys.map((k) => <Opt key={k} label={categoryLabel(k)} on={active.category.has(k)} onClick={() => toggle('category', k)} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {openFacet === 'population' && (
              <div style={{ ...chipWrap, maxHeight: 180, overflowY: 'auto' }}>
                {POST_POPULATIONS.map((p) => <Opt key={p} label={p} on={active.population.has(p)} onClick={() => toggle('population', p)} />)}
              </div>
            )}
            {openFacet === 'topic' && (
              <div style={chipWrap}>
                {POST_TOPICS.map((t) => <Opt key={t} label={t} on={active.topic.has(t)} onClick={() => toggle('topic', t)} />)}
              </div>
            )}
          </div>
        )}

        {/* Active chips */}
        {activeCount > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', padding: '12px 0' }}>
            {(['type', 'category', 'population', 'topic'] as const).flatMap((f) =>
              Array.from(active[f]).map((v) => (
                <span key={f + v} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '4px 6px 4px 11px', borderRadius: 999, background: '#e8eff0', color: dark, fontWeight: 500 }}>
                  {f === 'type' ? postTypeLabel(v) : f === 'category' ? categoryLabel(v) : v}
                  <span onClick={() => toggle(f, v)} style={{ cursor: 'pointer', fontSize: 14, color: teal }}>×</span>
                </span>
              ))
            )}
            <button onClick={clearAll} style={{ fontSize: 12, padding: '5px 10px', border: '1px solid #d4d2ca', borderRadius: 8, background: 'white', color: '#666', cursor: 'pointer' }}>Clear all</button>
          </div>
        )}

        <div style={{ fontSize: 13, color: '#6b7577', margin: '14px 0 12px' }}>{browse.length} of {posts.length} updates</div>

        {browse.length === 0 ? (
          <div style={{ fontSize: 14, color: '#9aa0a1', textAlign: 'center', padding: '24px 0' }}>No updates match those filters.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {browse.map((p) => <SmallCard key={p.id} p={p} onShare={share} />)}
          </div>
        )}
      </div>
    </div>
  )
}

const chipWrap: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 6 }
function Opt({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return <button onClick={onClick} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 999, cursor: 'pointer', border: on ? '1px solid #3e6a70' : '1px solid #d4d2ca', background: on ? '#e8eff0' : 'white', color: on ? '#2c4d52' : '#666', fontWeight: on ? 500 : 400 }}>{label}</button>
}

function TypeTag({ type }: { type: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: DOT[type] || teal }} />
      <span style={{ fontSize: 10, fontWeight: 500, color: dark, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{postTypeLabel(type)}</span>
    </div>
  )
}

function ShareBtn({ p, onShare }: { p: Post; onShare: (p: Post, e: React.MouseEvent) => void }) {
  return (
    <button aria-label="Share" onClick={(e) => onShare(p, e)} style={{ position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.92)', color: dark, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}>⤴</button>
  )
}

function Img({ url }: { url: string | null }) {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: url ? '#e5e3dc' : '#dde6e3', overflow: 'hidden' }}>
      {url && <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
    </div>
  )
}

function FeaturedCard({ p, onShare }: { p: Post; onShare: (p: Post, e: React.MouseEvent) => void }) {
  return (
    <Link href={`/news/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit', background: 'white', border: '0.5px solid #e5e3dc', borderRadius: 12, overflow: 'hidden', display: 'block' }}>
      <div style={{ position: 'relative' }}><Img url={p.image_url} /><ShareBtn p={p} onShare={onShare} /></div>
      <div style={{ padding: '16px 18px' }}>
        <div style={{ marginBottom: 9 }}><TypeTag type={p.post_type} /></div>
        <div style={{ fontSize: 18, fontWeight: 600, color: dark, lineHeight: 1.3, marginBottom: 7 }}>{p.title}</div>
        <div style={{ fontSize: 13, color: teal, marginBottom: 4 }}>{authorName(p.author)}</div>
        <div style={{ fontSize: 12, color: '#9aa0a1' }}>{p.categories[0] ? `${categoryLabel(p.categories[0])} · ` : ''}{expiryLine(p)}</div>
      </div>
    </Link>
  )
}

function SmallCard({ p, onShare }: { p: Post; onShare: (p: Post, e: React.MouseEvent) => void }) {
  return (
    <Link href={`/news/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit', background: 'white', border: '0.5px solid #e5e3dc', borderRadius: 12, overflow: 'hidden', display: 'block' }}>
      <div style={{ position: 'relative' }}><Img url={p.image_url} /><ShareBtn p={p} onShare={onShare} /></div>
      <div style={{ padding: '13px 15px' }}>
        <div style={{ marginBottom: 7 }}><TypeTag type={p.post_type} /></div>
        <div style={{ fontSize: 14, fontWeight: 600, color: dark, lineHeight: 1.35, marginBottom: 6 }}>{p.title}</div>
        <div style={{ fontSize: 11, color: '#9aa0a1' }}>{expiryLine(p)}</div>
      </div>
    </Link>
  )
}
