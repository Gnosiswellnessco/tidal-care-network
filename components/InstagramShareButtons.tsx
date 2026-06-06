'use client'

import { useState } from 'react'
import { BRAND } from '@/lib/brand'

// Drop <InstagramShareButtons title={post.title} slug={post.slug} /> on the
// news detail page. Generates a branded image (square or story) and hands the
// FILE to the phone's native share sheet — the only route that reaches
// Instagram (it opens Stories). "Download" saves the image so it can be posted
// to the feed manually. On desktop (no file share) both buttons download.
export default function InstagramShareButtons({ title, slug }: { title: string; slug: string }) {
  const [format, setFormat] = useState<'square' | 'story'>('square')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')

  function imageHref(fmt: 'square' | 'story') {
    return `/api/news-image?slug=${encodeURIComponent(slug)}&format=${fmt}`
  }

  async function getFile(fmt: 'square' | 'story') {
    const res = await fetch(imageHref(fmt))
    if (!res.ok) throw new Error('Could not generate image')
    const blob = await res.blob()
    return new File([blob], `tidal-care-${slug}-${fmt}.png`, { type: 'image/png' })
  }

  function downloadFile(file: File) {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function share() {
    setBusy(true); setNote('')
    try {
      const file = await getFile(format)
      const canShareFiles =
        typeof navigator !== 'undefined' &&
        !!navigator.canShare &&
        navigator.canShare({ files: [file] })
      if (canShareFiles) {
        await navigator.share({ files: [file], title })
      } else {
        downloadFile(file)
        setNote('Image saved — open Instagram and post it from your photos.')
      }
    } catch {
      setNote('Could not share the image. Try the Download button.')
    } finally {
      setBusy(false)
    }
  }

  async function download() {
    setBusy(true); setNote('')
    try {
      downloadFile(await getFile(format))
      setNote('Image saved to your device.')
    } catch {
      setNote('Could not generate the image. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const tab = (f: 'square' | 'story', label: string) => (
    <button
      onClick={() => setFormat(f)}
      style={{ fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', border: '1px solid ' + (format === f ? BRAND.teal : BRAND.hairline), background: format === f ? BRAND.mint : 'white', color: format === f ? BRAND.dark : '#777' }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.dark }}>Share to Instagram</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {tab('square', 'Square (feed)')}
        {tab('story', 'Story')}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={share}
          disabled={busy}
          style={{ fontSize: 14, fontWeight: 600, padding: '10px 20px', borderRadius: 8, border: 'none', background: BRAND.teal, color: 'white', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 }}
        >
          {busy ? 'Preparing…' : 'Share image'}
        </button>
        <button
          onClick={download}
          disabled={busy}
          style={{ fontSize: 14, fontWeight: 600, padding: '10px 20px', borderRadius: 8, border: '1px solid ' + BRAND.teal, background: 'white', color: BRAND.teal, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 }}
        >
          Download image
        </button>
      </div>
      <p style={{ fontSize: 12, color: '#7d8a87', lineHeight: 1.5, margin: 0 }}>
        On a phone, “Share image” opens your share sheet (Instagram posts it to your Story). For a feed post, use “Download image,” then upload it in Instagram.
      </p>
      {note ? <p style={{ fontSize: 12, color: BRAND.teal, margin: 0 }}>{note}</p> : null}
    </div>
  )
}
