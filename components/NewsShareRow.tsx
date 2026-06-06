'use client'

import { useEffect, useState } from 'react'
import { BRAND } from '@/lib/brand'

// Inline share row for the news article page. Link-based social sharing plus
// the native share sheet on mobile (which also reaches Instagram, Messages,
// etc.). Drop <NewsShareRow title={post.title} slug={post.slug} /> anywhere
// on the detail page.
export default function NewsShareRow({ title, slug }: { title: string; slug: string }) {
  const [url, setUrl] = useState('')
  const [hasNative, setHasNative] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(`${window.location.origin}/news/${slug}`)
      setHasNative(typeof navigator !== 'undefined' && !!navigator.share)
    }
  }, [slug])

  const enc = encodeURIComponent
  function popup(shareUrl: string) {
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=640')
  }
  async function nativeShare() {
    try { await navigator.share({ title, url }) } catch { /* cancelled */ }
  }
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt('Copy this link:', url)
    }
  }

  const buttons: { key: string; label: string; mark: string; bg: string; onClick: () => void }[] = [
    ...(hasNative ? [{ key: 'native', label: 'Share', mark: '⤴', bg: BRAND.teal, onClick: nativeShare }] : []),
    { key: 'facebook', label: 'Facebook', mark: 'f', bg: '#1877F2', onClick: () => popup(`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`) },
    { key: 'x', label: 'X', mark: '𝕏', bg: '#000000', onClick: () => popup(`https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`) },
    { key: 'linkedin', label: 'LinkedIn', mark: 'in', bg: '#0A66C2', onClick: () => popup(`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`) },
    { key: 'copy', label: copied ? 'Copied' : 'Copy link', mark: copied ? '✓' : '🔗', bg: copied ? '#5a9b6b' : '#8a9092', onClick: copyLink },
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.dark, marginRight: 2 }}>Share</span>
      {buttons.map((b) => (
        <button
          key={b.key}
          onClick={b.onClick}
          aria-label={b.label}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, border: '1px solid ' + BRAND.hairline, background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: BRAND.dark }}
        >
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: b.bg, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{b.mark}</span>
          {b.label}
        </button>
      ))}
    </div>
  )
}
