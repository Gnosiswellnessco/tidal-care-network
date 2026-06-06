'use client'

import { useState } from 'react'
import { BRAND } from '@/lib/brand'
import {
  CREDENTIAL_CLASSES,
  CREDENTIAL_DISCLAIMER,
  normalizeCredentialClasses,
  type CredentialClass,
} from '@/lib/care-families'

// Neutral palette — deliberately NOT good/bad. Each class gets a distinct but
// equal-weight tint so no pill reads as a quality ranking. These are separate
// from the Vetted / Endorsed quality badges, which live elsewhere on a card.
const PILL_STYLES: Record<CredentialClass, React.CSSProperties> = {
  licensed: { background: '#e6eef0', color: '#2c4d52' },
  certified: { background: '#efe9dc', color: '#7a6322' },
  peer: { background: '#eceae4', color: '#5a564c' },
}

const basePill: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.02em',
  padding: '3px 9px',
  borderRadius: 99,
  display: 'inline-block',
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
}

export default function CredentialPill({
  classes,
  expandable = false,
}: {
  classes: unknown
  expandable?: boolean
}) {
  const list = normalizeCredentialClasses(classes)
  const [open, setOpen] = useState(false)

  if (list.length === 0) return null

  // Compact, non-interactive pills — for directory cards.
  if (!expandable) {
    return (
      <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6 }}>
        {list.map((c) => (
          <span key={c} style={{ ...basePill, ...PILL_STYLES[c] }}>
            {CREDENTIAL_CLASSES[c].label}
          </span>
        ))}
      </span>
    )
  }

  // Expandable explainer — for the provider profile view.
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {list.map((c) => (
          <span key={c} style={{ ...basePill, ...PILL_STYLES[c] }}>
            {CREDENTIAL_CLASSES[c].label}
          </span>
        ))}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            fontSize: 11,
            color: BRAND.teal,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
          }}
          aria-expanded={open}
        >
          {open ? 'Hide' : 'What does this mean?'}
        </button>
      </div>

      {open && (
        <div
          style={{
            marginTop: 10,
            border: '0.5px solid ' + BRAND.hairline,
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {list.map((c, i) => (
            <div
              key={c}
              style={{
                padding: '12px 14px',
                borderTop: i === 0 ? 'none' : '0.5px solid ' + BRAND.hairline,
                background: i % 2 === 0 ? '#fff' : BRAND.pageBg,
              }}
            >
              <div style={{ fontSize: 12.5, fontWeight: 600, color: BRAND.dark, marginBottom: 4 }}>
                {CREDENTIAL_CLASSES[c].label}
              </div>
              <div style={{ fontSize: 12.5, color: '#4a5557', lineHeight: 1.55 }}>
                {CREDENTIAL_CLASSES[c].meaning}
              </div>
              <div style={{ fontSize: 12, color: '#7a6a55', lineHeight: 1.55, marginTop: 4 }}>
                <strong style={{ fontWeight: 600 }}>What it doesn&apos;t mean:</strong>{' '}
                {CREDENTIAL_CLASSES[c].limits}
              </div>
            </div>
          ))}
          <div style={{ padding: '10px 14px', borderTop: '0.5px solid ' + BRAND.hairline, background: BRAND.pageBg }}>
            <div style={{ fontSize: 11.5, color: '#7a6a55', lineHeight: 1.55 }}>{CREDENTIAL_DISCLAIMER}</div>
          </div>
        </div>
      )}
    </div>
  )
}
