'use client'

import { useEffect, useState } from 'react'
import { BRAND } from '@/lib/brand'

// Quiet, editorial share row for the news article page: a small "Share"
// eyebrow followed by minimal monochrome icon buttons. Link-based shares
// (native sheet, Facebook, X, LinkedIn, copy) plus Instagram, which generates
// the branded square image and hands the file to the native share sheet
// (reaching Instagram/Stories) with a download fallback on desktop.
const I = {
  share: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" /><line x1="15.4" y1="6.5" x2="8.6" y2="10.5" /></svg>
  ),
  facebook: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13 22v-8h2.7l.4-3H13V9.2c0-.87.24-1.46 1.5-1.46H16V5.07A21 21 0 0 0 13.9 5C11.6 5 10 6.4 10 9v2H7.3v3H10v8z" /></svg>
  ),
  x: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.24 2H21.5l-7.5 8.57L22.5 22h-6.9l-4.6-6.02L5.7 22H2.44l8-9.16L1.5 2h7.05l4.16 5.5zm-1.2 18h1.8L7.04 3.9H5.1z" /></svg>
  ),
  linkedin: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0M.4 8.1h4.2V22H.4zm7 0h4v1.9h.06c.56-1.06 1.93-2.18 3.97-2.18 4.25 0 5.04 2.8 5.04 6.43V22h-4.2v-6.06c0-1.45-.03-3.3-2.02-3.3-2.02 0-2.33 1.58-2.33 3.2V22h-4.2z" /></svg>
  ),
  instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" /></svg>
  ),
  link: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
  ),
}

export default function NewsShareRow({ title, slug }: { title: string; slug: string }) {
  const [url, setUrl] = useState('')
  const [hasNative, setHasNative] = useState(false)
  const [copied, setCopied] = useState(false)
  const [igBusy, setIgBusy] = useState(false)
  const [note, setNote] = useState('')

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
  async function shareInstagram() {
    setIgBusy(true); setNote('')
    try {
      const res = await fetch(`/api/news-image?slug=${enc(slug)}&format=square`)
      if (!res.ok) throw new Error('image')
      const blob = await res.blob()
      const file = new File([blob], `tidal-care-${slug}.png`, { type: 'image/png' })
      const canShareFiles = typeof navigator !== 'undefined' && !!navigator.canShare && navigator.canShare({ files: [file] })
      if (canShareFiles) {
        await navigator.share({ files: [file], title })
      } else {
        const objUrl = URL.createObjectURL(file)
        const a = document.createElement('a')
        a.href = objUrl
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(objUrl)
        setNote('Image saved — open Instagram and post it from your photos.')
      }
    } catch {
      setNote('Could not prepare the image. Please try again.')
    } finally {
      setIgBusy(false)
    }
  }

  const items: { key: string; label: string; icon: React.ReactNode; onClick: () => void; busy?: boolean; active?: boolean }[] = [
    ...(hasNative ? [{ key: 'native', label: 'Share', icon: I.share, onClick: nativeShare }] : []),
    { key: 'facebook', label: 'Share on Facebook', icon: I.facebook, onClick: () => popup(`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`) },
    { key: 'x', label: 'Share on X', icon: I.x, onClick: () => popup(`https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`) },
    { key: 'linkedin', label: 'Share on LinkedIn', icon: I.linkedin, onClick: () => popup(`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`) },
    { key: 'instagram', label: 'Share image to Instagram', icon: I.instagram, onClick: shareInstagram, busy: igBusy },
    { key: 'copy', label: copied ? 'Link copied' : 'Copy link', icon: copied ? I.check : I.link, onClick: copyLink, active: copied },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a9092' }}>Share</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {items.map((b) => (
            <button
              key={b.key}
              onClick={b.onClick}
              aria-label={b.label}
              title={b.label}
              disabled={!!b.busy}
              style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid ' + BRAND.hairline, background: 'white', color: b.active ? '#5a9b6b' : BRAND.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: b.busy ? 'default' : 'pointer', opacity: b.busy ? 0.5 : 1, padding: 0 }}
            >
              {b.icon}
            </button>
          ))}
        </div>
      </div>
      {note ? <p style={{ fontSize: 12, color: BRAND.teal, margin: '10px 0 0', lineHeight: 1.5 }}>{note}</p> : null}
    </div>
  )
}
