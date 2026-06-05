'use client'

import { useState } from 'react'

const dark = '#2c4d52'

export default function PostShareRow({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false)

  function url() {
    return typeof window !== 'undefined' ? `${window.location.origin}/news/${slug}` : `https://tidalcare.org/news/${slug}`
  }
  function email() {
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url())}`
  }
  function copy() {
    navigator.clipboard.writeText(url()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid #d4d2ca', background: 'white', color: dark, cursor: 'pointer' }

  return (
    <div style={{ borderTop: '0.5px solid #e5e3dc', paddingTop: 14, marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#8a9092', marginBottom: 8 }}>Share this</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={email} style={btn}>✉ Share via email</button>
        <button type="button" onClick={copy} style={btn}>{copied ? '✓ Copied' : '⧉ Copy link'}</button>
      </div>
    </div>
  )
}
