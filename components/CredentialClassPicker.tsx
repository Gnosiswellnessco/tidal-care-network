'use client'

import { useState } from 'react'
import { BRAND } from '@/lib/brand'
import {
  CREDENTIAL_CLASS_ORDER,
  CREDENTIAL_CLASSES,
  normalizeCredentialClasses,
  type CredentialClass,
} from '@/lib/care-families'

// Multi-select for the join form. Submits one hidden input per selected class
// under name="credential_classes", so a server action can read them with
// formData.getAll('credential_classes'). A provider may pick more than one.
export default function CredentialClassPicker({
  name = 'credential_classes',
  initial = [],
}: {
  name?: string
  initial?: string[]
}) {
  const [selected, setSelected] = useState<CredentialClass[]>(
    normalizeCredentialClasses(initial),
  )

  function toggle(c: CredentialClass) {
    setSelected((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {CREDENTIAL_CLASS_ORDER.map((c) => {
          const active = selected.includes(c)
          return (
            <button
              type="button"
              key={c}
              onClick={() => toggle(c)}
              aria-pressed={active}
              style={{
                textAlign: 'left',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid ' + (active ? BRAND.teal : BRAND.hairline),
                background: active ? '#eef3f3' : '#fff',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  flex: 'none',
                  marginTop: 1,
                  borderRadius: 5,
                  border: '1.5px solid ' + (active ? BRAND.teal : '#c4c2ba'),
                  background: active ? BRAND.teal : '#fff',
                  color: '#fff',
                  fontSize: 12,
                  lineHeight: '15px',
                  textAlign: 'center',
                }}
              >
                {active ? '✓' : ''}
              </span>
              <span>
                <span style={{ fontSize: 14, fontWeight: 600, color: BRAND.dark }}>
                  {CREDENTIAL_CLASSES[c].label}
                </span>
                <span style={{ display: 'block', fontSize: 12.5, color: '#6b7577', lineHeight: 1.5, marginTop: 2 }}>
                  {CREDENTIAL_CLASSES[c].meaning}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Hidden inputs carry the selection into the form submission */}
      {selected.map((c) => (
        <input key={c} type="hidden" name={name} value={c} />
      ))}

      <p style={{ fontSize: 12, color: '#8a9092', margin: '10px 0 0', lineHeight: 1.5 }}>
        Select all that apply. You can hold more than one — for example, a licensed
        clinician who is also a certified practitioner.
      </p>
    </div>
  )
}
