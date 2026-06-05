import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BrandLogo from '@/components/BrandLogo'
import NewsClient from './NewsClient'

export const dynamic = 'force-dynamic'

export default async function NewsPage() {
  const supabase = await createClient()
  const nowISO = new Date().toISOString()

  const { data: rawPosts } = await supabase
    .from('provider_posts')
    .select('*')
    .eq('status', 'published')
    .or(`expires_at.is.null,expires_at.gt.${nowISO}`)
    .order('published_at', { ascending: false })

  const posts = rawPosts || []
  const providerIds = Array.from(new Set(posts.map((p) => p.provider_id)))
  const safe = providerIds.length ? providerIds : ['00000000-0000-0000-0000-000000000000']

  const { data: authors } = await supabase
    .from('providers')
    .select('id, full_name, credentials, practice_name, is_org')
    .in('id', safe)

  const { data: cats } = await supabase
    .from('provider_categories')
    .select('provider_id, category, is_primary')
    .in('provider_id', safe)

  const authorById = new Map((authors || []).map((a) => [a.id, a]))
  function catsFor(pid: string) {
    return (cats || []).filter((c) => c.provider_id === pid).map((c) => c.category)
  }

  const enriched = posts.map((p) => {
    const a = authorById.get(p.provider_id)
    return {
      ...p,
      author: a ? { full_name: a.full_name, credentials: a.credentials, practice_name: a.practice_name, is_org: a.is_org } : null,
      categories: catsFor(p.provider_id),
    }
  })

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f7f6f2' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', maxWidth: 1000, margin: '0 auto' }}>
        <Link href="/"><BrandLogo height={180} /></Link>
        <Link href="/directory" style={{ fontSize: 14, fontWeight: 500, color: 'white', background: '#3e6a70', padding: '9px 18px', borderRadius: 8, textDecoration: 'none' }}>Find a provider</Link>
      </header>

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '16px 40px 64px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#2c4d52', margin: 0, letterSpacing: '-0.01em' }}>News &amp; updates</h1>
        <p style={{ fontSize: 15, color: '#6b7577', margin: '4px 0 0' }}>Announcements, events, and resources from the providers of the Tidal Care Network.</p>
        <div style={{ height: 2, width: 46, background: '#b5aa8e', margin: '16px 0 24px' }} />

        <NewsClient posts={enriched} />
      </div>
    </main>
  )
}
