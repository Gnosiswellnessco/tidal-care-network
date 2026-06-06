'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BRAND } from '@/lib/brand'
import { CARE_FAMILIES, FEATURED_CATEGORIES, categoryLabel } from '@/lib/care-families'

const chipStyle: React.CSSProperties = {
  fontSize: 13,
  padding: '6px 13px',
  borderRadius: 99,
  background: BRAND.mint,
  color: BRAND.dark,
  textDecoration: 'none',
  display: 'inline-block',
  lineHeight: 1.2,
}

const groupLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: BRAND.champagneDark,
  margin: '16px 0 8px',
}

export default function HomeCategoryExplorer() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      {!open ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {FEATURED_CATEGORIES.map((c) => (
            <Link key={c.key} href={`/directory?category=${c.key}`} style={chipStyle}>
              {c.label}
            </Link>
          ))}
        </div>
      ) : (
        <div>
          {CARE_FAMILIES.map((fam) => (
            <div key={fam.key}>
              <div style={groupLabelStyle}>{fam.label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {fam.categoryKeys.map((key) => (
                  <Link key={key} href={`/directory?category=${key}`} style={chipStyle}>
                    {categoryLabel(key)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Option 1 toggle — eyebrow style between two hairline rules */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
        <div style={{ flex: 1, height: 1, background: BRAND.hairline }} />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: BRAND.teal,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 4px',
            whiteSpace: 'nowrap',
          }}
        >
          {open ? 'Show fewer' : 'Show all 23 categories'}
        </button>
        <div style={{ flex: 1, height: 1, background: BRAND.hairline }} />
      </div>
    </div>
  )
}
