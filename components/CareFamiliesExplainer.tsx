import { BRAND, SERIF } from '@/lib/brand'
import {
  CARE_FAMILIES,
  CREDENTIAL_CLASSES,
  CREDENTIAL_DISCLAIMER,
  categoryLabel,
  type CredentialClass,
} from '@/lib/care-families'

const eyebrow: React.CSSProperties = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 10.5,
  fontWeight: 600,
  letterSpacing: '0.26em',
  textTransform: 'uppercase',
  color: '#a9925f',
}

const tag: React.CSSProperties = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 9.5,
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#7a8688',
}

// Short tag labels for the right-hand column (full meanings live in the
// directory's About panel and on each provider's profile).
const TAG_LABEL: Record<CredentialClass, string> = {
  licensed: 'Licensed',
  certified: 'Certified',
  peer: 'Peer',
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export default function CareFamiliesExplainer({
  heading = true,
}: {
  heading?: boolean
}) {
  return (
    <section style={{ maxWidth: 680, margin: '0 auto', padding: '44px 36px 40px', fontFamily: SERIF }}>
      {heading && (
        <div style={{ textAlign: 'center' }}>
          <div style={eyebrow}>Understanding the network</div>
          <h1 style={{ fontFamily: SERIF, fontSize: 46, fontWeight: 600, color: BRAND.dark, lineHeight: 1.05, letterSpacing: '-0.015em', margin: '14px 0 0' }}>
            The whole spectrum of care
          </h1>
          <div style={{ width: 42, height: 2, background: BRAND.champagne, margin: '22px auto 0' }} />
          <p style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 14.5, lineHeight: 1.75, color: '#54625f', maxWidth: 520, margin: '22px auto 0' }}>
            Our providers span many kinds of care. Below is how they group together — and the credentials you tend to find in each. The labels are neutral: each is a distinct, valued role, suited to different needs.
          </p>
        </div>
      )}

      <div style={{ marginTop: heading ? 30 : 0 }}>
        {CARE_FAMILIES.map((fam, i) => (
          <div
            key={fam.key}
            style={{
              display: 'flex',
              gap: 20,
              padding: '20px 0',
              borderTop: '1px solid ' + BRAND.hairline,
              borderBottom: i === CARE_FAMILIES.length - 1 ? '1px solid ' + BRAND.hairline : undefined,
            }}
          >
            <div style={{ fontSize: 30, fontWeight: 500, color: '#cfc4a6', lineHeight: 1, minWidth: 42 }}>{pad(i + 1)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 23, fontWeight: 600, color: BRAND.dark, lineHeight: 1.15 }}>{fam.label}</div>
              <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 12.5, color: '#6b7577', lineHeight: 1.6, marginTop: 4 }}>
                {fam.categoryKeys.map((k) => categoryLabel(k)).join(' · ')}
              </div>
            </div>
            <div style={{ textAlign: 'right', minWidth: 96, paddingTop: 5 }}>
              {fam.credentials.map((c, j) => (
                <div key={c} style={{ ...tag, marginTop: j === 0 ? 0 : 5 }}>{TAG_LABEL[c]}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* A note on choosing care — pull quote */}
      <div style={{ marginTop: 34, paddingLeft: 20, borderLeft: '2px solid ' + BRAND.champagne }}>
        <div style={{ ...eyebrow, marginBottom: 8 }}>A note on choosing care</div>
        <p style={{ fontFamily: SERIF, fontSize: 20, fontStyle: 'italic', fontWeight: 500, color: '#3a4a4c', lineHeight: 1.5, margin: 0 }}>
          None of these is &ldquo;better&rdquo; or &ldquo;worse&rdquo; — they are different kinds of support. If you&rsquo;re unsure what&rsquo;s right for you, your doctor is a good person to ask.
        </p>
      </div>

      {/* Compact key so the labels stay self-explanatory on this page */}
      <div style={{ marginTop: 30, paddingTop: 18, borderTop: '1px solid ' + BRAND.hairline, display: 'flex', flexWrap: 'wrap', gap: '8px 22px' }}>
        {(['licensed', 'certified', 'peer'] as CredentialClass[]).map((c) => (
          <div key={c} style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 11.5, color: '#6b7577', lineHeight: 1.5 }}>
            <span style={{ ...tag, color: BRAND.dark, marginRight: 6 }}>{TAG_LABEL[c]}</span>
            {CREDENTIAL_CLASSES[c].short}
          </div>
        ))}
      </div>

      <p style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 11.5, color: '#9aa0a1', lineHeight: 1.6, margin: '12px 0 0' }}>
        {CREDENTIAL_DISCLAIMER}
      </p>
    </section>
  )
}
