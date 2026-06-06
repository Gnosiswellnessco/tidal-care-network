'use client'

import { useEffect, useState } from 'react'
import { BRAND } from '@/lib/brand'

// A lightweight share sheet for news posts. Link-based social sharing
// (no PII, no server) plus the native share sheet on mobile — which is
// also the route that reaches Instagram, Messages, etc. Shown as a
// centered modal so nothing gets clipped by card overflow.
export default function ShareSheet({
  title,
  slug,
  onClose,
}: {
  title: string
  slug: string
  onClose: () => void
}) {
  const [url, setUrl] = useState('')
  const [hasNative, setHasNative] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(`${window.location.origin}/news/${slug}`)
      setHasNative(typeof navigator !== 'undefined' && !!navigator.share)
    }
  }, [slug])

  // Close on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function popup(shareUrl: string) {
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=640')
  }

  async function nativeShare() {
    try { await navigator.share({ title, url }) } catch { /* user cancelled */ }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Fallback: select-prompt
      window.prompt('Copy this link:', url)
    }
  }

  const enc = encodeURIComponent
  const options: { key: string; label: string; mark: React.ReactNode; bg: string; onClick: () => void }[] = [
    ...(hasNative ? [{
      key: 'native', label: 'Share…', bg: BRAND.teal,
      mark: <Glyph>⤴</Glyph>,
      onClick: nativeShare,
    }] : []),
    {
      key: 'facebook', label: 'Share on Facebook', bg: '#1877F2',
      mark: <Glyph>f</Glyph>,
      onClick: () => popup(`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`),
    },
    {
      key: 'x', label: 'Share on X', bg: '#000000',
      mark: <Glyph>𝕏</Glyph>,
      onClick: () => popup(`https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`),
    },
    {
      key: 'linkedin', label: 'Share on LinkedIn', bg: '#0A66C2',
      mark: <Glyph style={{ fontSize: 13 }}>in</Glyph>,
      onClick: () => popup(`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`),
    },
    {
      key: 'copy', label: copied ? 'Link copied' : 'Copy link', bg: copied ? '#5a9b6b' : '#8a9092',
      mark: <Glyph>{copied ? '✓' : '🔗'}</Glyph>,
      onClick: copyLink,
    },
  ]

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(28,44,46,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 360, background: 'white', borderRadius: 16, border: '0.5px solid ' + BRAND.hairline, boxShadow: '0 8px 30px rgba(28,44,46,0.18)', padding: 20 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: BRAND.dark }}>Share this</div>
          <button aria-label="Close" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, lineHeight: 1, color: '#9aa0a1', cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ fontSize: 13, color: '#6b7577', lineHeight: 1.5, marginBottom: 16 }}>{title}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {options.map((o) => (
            <button
              key={o.key}
              onClick={o.onClick}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid ' + BRAND.hairline, background: 'white', cursor: 'pointer', fontSize: 14, color: BRAND.dark, fontWeight: 500 }}
            >
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: o.bg, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{o.mark}</span>
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Glyph({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1, ...style }}>{children}</span>
}
