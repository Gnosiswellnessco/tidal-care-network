import { BRAND, SERIF } from '@/lib/brand'
import {
  CARE_FAMILIES,
  CREDENTIAL_CLASSES,
  CREDENTIAL_CLASS_ORDER,
  categoryLabel,
  type CredentialClass,
} from '@/lib/care-families'

// Neutral pill palette — matches CredentialPill. Deliberately not good/bad.
const PILL: Record<CredentialClass, React.CSSProperties> = {
  licensed: { background: '#e6eef0', color: '#2c4d52' },
  certified: { background: '#efe9dc', color: '#7a6322' },
  peer: { background: '#eceae4', color: '#5a564c' },
}

const pillBase: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 600,
  letterSpacing: '0.02em',
  padding: '3px 9px',
  borderRadius: 99,
  display: 'inline-block',
  marginRight: 5,
  marginBottom: 5,
  lineHeight: 1.4,
}

export default function CareFamiliesExplainer({
  heading = true,
}: {
  heading?: boolean
}) {
  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '24px 32px' }}>
      {heading && (
        <div style={{ textAlign: 'center', maxWidth: 580, margin: '0 auto 22px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: BRAND.champagneDark, marginBottom: 6 }}>
            Understanding the network
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: BRAND.dark, margin: 0, letterSpacing: '-0.01em' }}>
            The whole spectrum of care, by family
          </h2>
          <p style={{ fontSize: 14, color: '#5f6b6d', lineHeight: 1.6, margin: '8px 0 0' }}>
            Our providers span many kinds of care. Here&apos;s how they group together — and the kinds of credentials you tend to find in each. The labels are neutral: each is a distinct, valued role.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
        {CARE_FAMILIES.map((fam) => (
          <div key={fam.key} style={{ background: BRAND.cardBg, border: '0.5px solid ' + BRAND.hairline, borderRadius: 12, padding: '16px 17px' }}>
            <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: BRAND.dark, margin: '0 0 4px' }}>{fam.label}</div>
            <div style={{ fontSize: 12.5, color: '#5f6b6d', lineHeight: 1.55, margin: '0 0 11px' }}>
              {fam.categoryKeys.map((k) => categoryLabel(k)).join(' · ')}
            </div>
            <div>
              {fam.credentials.map((c) => (
                <span key={c} style={{ ...pillBase, ...PILL[c] }}>{CREDENTIAL_CLASSES[c].label}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend — what the credential labels mean */}
      <div style={{ background: BRAND.cardBg, border: '0.5px solid ' + BRAND.hairline, borderRadius: 12, padding: '14px 17px', marginTop: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: BRAND.champagneDark, marginBottom: 10 }}>
          What the credential labels mean
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {CREDENTIAL_CLASS_ORDER.map((c) => (
            <div key={c} style={{ fontSize: 12.5, color: '#4a5557', lineHeight: 1.5 }}>
              <span style={{ ...pillBase, ...PILL[c] }}>{CREDENTIAL_CLASSES[c].label}</span>
              {CREDENTIAL_CLASSES[c].short}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
