'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import SiteHeader from '@/components/SiteHeader'
import { BRAND, SERIF } from '@/lib/brand'

export const dynamic = 'force-dynamic'

const inp: React.CSSProperties = {
  width: '100%', fontSize: 15, padding: '10px 12px', borderRadius: 8,
  border: '1px solid ' + BRAND.hairline, background: 'white', boxSizing: 'border-box',
}
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: BRAND.dark, marginBottom: 6 }

export default function ReportConcernPage() {
  const [providerName, setProviderName] = useState('')
  const [licensingBoard, setLicensingBoard] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [details, setDetails] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [reporterName, setReporterName] = useState('')
  const [reporterEmail, setReporterEmail] = useState('')
  const [reporterRole, setReporterRole] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setError('')
    if (!providerName.trim()) { setError('Please enter the provider\u2019s name.'); return }
    if (!details.trim()) { setError('Please describe the board action or concern.'); return }
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { error: insErr } = await supabase.from('board_action_reports').insert({
        provider_name: providerName.trim(),
        licensing_board: licensingBoard.trim() || null,
        license_number: licenseNumber.trim() || null,
        details: details.trim(),
        source_url: sourceUrl.trim() || null,
        reporter_name: reporterName.trim() || null,
        reporter_email: reporterEmail.trim() || null,
        reporter_role: reporterRole.trim() || null,
      })
      if (insErr) { setError('Something went wrong submitting your report. Please try again, or email info@tidalcare.org.'); setSubmitting(false); return }
      setDone(true)
    } catch {
      setError('Something went wrong submitting your report. Please try again, or email info@tidalcare.org.')
      setSubmitting(false)
    }
  }

  return (
    <main style={{ background: BRAND.pageBg, minHeight: '100vh' }}>
      <SiteHeader right={null} />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '36px 24px 64px' }}>
        <Link href="/" style={{ fontSize: 13, color: BRAND.teal, textDecoration: 'none' }}>← Home</Link>

        {done ? (
          <div style={{ background: 'white', border: '0.5px solid ' + BRAND.hairline, borderRadius: 14, padding: 32, marginTop: 18, textAlign: 'center' }}>
            <h1 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: BRAND.dark, margin: '0 0 10px' }}>Thank you — your report was received</h1>
            <p style={{ fontSize: 15, color: '#54625f', lineHeight: 1.65, margin: 0 }}>
              Our team will review it against the official board record and take any appropriate steps. We may follow up if you left contact details. Reports are reviewed confidentially.
            </p>
            <Link href="/directory" style={{ display: 'inline-block', marginTop: 20, fontSize: 14, fontWeight: 500, color: 'white', background: BRAND.teal, padding: '11px 22px', borderRadius: 8, textDecoration: 'none' }}>Back to the directory</Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: BRAND.dark, margin: '16px 0 8px', letterSpacing: '-0.01em' }}>Report a licensing-board action</h1>
            <p style={{ fontSize: 15, color: '#54625f', lineHeight: 1.65, margin: '0 0 8px' }}>
              If a state licensing board or professional body has taken disciplinary action against a provider listed in our network, you can let us know here. This is most often used by licensing boards and professional colleagues, but anyone may submit a report.
            </p>
            <p style={{ fontSize: 13.5, color: '#6b7577', lineHeight: 1.6, margin: '0 0 22px', background: '#f4f1ea', border: '0.5px solid ' + BRAND.hairline, borderRadius: 10, padding: '12px 14px' }}>
              A report is a signal for us to investigate — not an automatic action. We verify every report against the official board record before making any decision about a provider\u2019s listing.
            </p>

            <div style={{ background: 'white', border: '0.5px solid ' + BRAND.hairline, borderRadius: 14, padding: 26, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={label}>Provider name <span style={{ color: '#b3504f' }}>*</span></label>
                <input style={inp} value={providerName} onChange={(e) => setProviderName(e.target.value)} placeholder="Full name as listed" />
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 220px' }}>
                  <label style={label}>Licensing board / body</label>
                  <input style={inp} value={licensingBoard} onChange={(e) => setLicensingBoard(e.target.value)} placeholder="e.g. SC Board of Examiners" />
                </div>
                <div style={{ flex: '1 1 160px' }}>
                  <label style={label}>License number</label>
                  <input style={inp} value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="If known" />
                </div>
              </div>
              <div>
                <label style={label}>What action was taken? <span style={{ color: '#b3504f' }}>*</span></label>
                <textarea style={{ ...inp, minHeight: 96, resize: 'vertical' }} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Describe the board action — e.g. license suspended, revoked, or other discipline — and the date if known." />
              </div>
              <div>
                <label style={label}>Link to the board record (recommended)</label>
                <input style={inp} value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://… official board page or order" />
              </div>

              <div style={{ height: 1, background: BRAND.hairline, margin: '2px 0' }} />
              <p style={{ fontSize: 12.5, color: '#8a9092', margin: 0 }}>Your details (optional — helps us follow up; kept confidential):</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={label}>Your name</label>
                  <input style={inp} value={reporterName} onChange={(e) => setReporterName(e.target.value)} />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={label}>Your email</label>
                  <input style={inp} value={reporterEmail} onChange={(e) => setReporterEmail(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={label}>Your role (optional)</label>
                <input style={inp} value={reporterRole} onChange={(e) => setReporterRole(e.target.value)} placeholder="e.g. Licensing board staff, colleague, member of the public" />
              </div>

              {error && <p style={{ fontSize: 13.5, color: '#b3504f', margin: 0 }}>{error}</p>}

              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                style={{ alignSelf: 'flex-start', fontSize: 15, fontWeight: 500, color: 'white', background: BRAND.teal, border: 'none', padding: '12px 26px', borderRadius: 8, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? 'Submitting…' : 'Submit report'}
              </button>
            </div>

            <p style={{ fontSize: 12, color: '#9aa0a1', lineHeight: 1.6, margin: '16px 2px 0' }}>
              Please report only factual information you believe to be true, ideally with a link to the official board record. The Network does not publish reports and does not state that any provider has been disciplined unless and until it has independently verified the action.
            </p>
          </>
        )}
      </div>
    </main>
  )
}
