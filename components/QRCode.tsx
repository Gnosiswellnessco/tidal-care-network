'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

// Renders a QR code for `value` entirely in-browser (nothing leaves the page).
export default function QRCodeImage({ value, size = 160 }: { value: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState('')

  useEffect(() => {
    let active = true
    QRCode.toDataURL(value, { width: size, margin: 1, color: { dark: '#2c4d52', light: '#ffffff' } })
      .then((url) => { if (active) setDataUrl(url) })
      .catch(() => { if (active) setDataUrl('') })
    return () => { active = false }
  }, [value, size])

  if (!dataUrl) return <div style={{ width: size, height: size, background: '#f0f0f0', borderRadius: 8 }} />
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt="Referral QR code" width={size} height={size} style={{ display: 'block' }} />
}
