'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, TAGS, INSURANCE_OPTIONS, AGE_GROUPS, IDENTITY_TAGS } from '@/lib/taxonomy'

const teal = '#3e6a70'
const dark = '#2c4d52'
const mint = '#e8eff0'

export default function JoinPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Text fields
  const [fullName, setFullName] = useState('')
  const [credentials, setCredentials] = useState('')
  const [practiceName, setPracticeName] = useState('')
  const [practiceType, setPracticeType] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [npiNumber, setNpiNumber] = useState('')
  const [issuingBody, setIssuingBody] = useState('')
  const [availabilityStatus, setAvailabilityStatus] = useState('accepting')
  const [primaryZip, setPrimaryZip] = useState('')
  const [telehealth, setTelehealth] = useState('none')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')

  // Multi-select fields
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedInsurance, setSelectedInsurance] = useState<string[]>([])
  const [selectedAges, setSelectedAges] = useState<string[]>([])
  const [selectedIdentity, setSelectedIdentity] = useState<string[]>([])

  function toggle(value: string, list: string[], setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])
  }

  async function handleSubmit() {
    setErrorMsg('')
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Please provide at least your name and email (Step 1 and Step 6).')
      return
    }
    setSaving(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setErrorMsg('Please sign in first to submit your application.')
      setSaving(false)
      return
    }

    // Map availability label to status code
    const availMap: Record<string, string> = {
      'Yes — accepting now': 'accepting',
      'Limited — contact to inquire': 'limited',
      'Waitlist only': 'waitlist',
      'Not accepting': 'closed',
    }
    const availCode = availMap[availabilityStatus] || 'accepting'
    const offersTele = telehealth !== 'No — in-person only' && telehealth !== 'none'

    // 1. Insert the provider
    const { data: provider, error: provErr } = await supabase
      .from('providers')
      .insert({
        full_name: fullName,
        user_id: user.id,
        credentials,
        practice_name: practiceName || null,
        practice_type: practiceType || null,
        license_number: licenseNumber || null,
        npi_number: npiNumber || null,
        issuing_body: issuingBody || null,
        availability_status: availCode,
        primary_zip: primaryZip || null,
        offers_telehealth: offersTele,
        bio: bio || null,
        email,
        phone: phone || null,
        website: website || null,
        vetting_status: 'pending',
        is_active: true,
      })
      .select()
      .single()

    if (provErr || !provider) {
      setErrorMsg('Could not save your application: ' + (provErr?.message || 'unknown error'))
      setSaving(false)
      return
    }

    // 2. Insert categories
    if (selectedCats.length > 0) {
      await supabase.from('provider_categories').insert(
        selectedCats.map((cat, i) => ({ provider_id: provider.id, category: cat, is_primary: i === 0 }))
      )
    }

    // 3. Insert tags (stored as "category:tagvalue")
    if (selectedTags.length > 0) {
      await supabase.from('provider_tags').insert(
        selectedTags.map((t) => {
          const [tagType, ...rest] = t.split(':')
          return { provider_id: provider.id, tag_type: tagType, tag_value: rest.join(':') }
        })
      )
    }

    // 4. Insert insurance
    if (selectedInsurance.length > 0) {
      await supabase.from('provider_insurance').insert(
        selectedInsurance.map((ins) => ({ provider_id: provider.id, insurance: ins }))
      )
    }

    setSaving(false)
    router.push('/join/thank-you')
  }

  const steps = ['Practice info', 'Categories', 'Specialties', 'Access & logistics', 'Identity & culture', 'Profile & contact']

  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1a1a', background: '#f7f6f2', minHeight: '100vh' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', maxWidth: 900, margin: '0 auto' }}>
        <Link href="/"><img src="/logo.svg" alt="Tidal Care Network" style={{ height: 48, width: 'auto' }} /></Link>
        <Link href="/" style={{ fontSize: 14, color: teal, textDecoration: 'none' }}>Cancel</Link>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 40px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: dark, marginBottom: 4 }}>Join the network</h1>
        <p style={{ fontSize: 15, color: '#666', marginBottom: 20 }}>Your answers shape how you appear in search and referrals.</p>

        <div style={{ display: 'flex', gap: 4, marginBottom: 28, flexWrap: 'wrap' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, minWidth: 90, padding: '7px 6px', textAlign: 'center', fontSize: 11, fontWeight: 500, borderRadius: 6, background: i === step ? teal : i < step ? mint : '#efeee9', color: i === step ? 'white' : i < step ? dark : '#999' }}>
              {i + 1}. {s}
            </div>
          ))}
        </div>

        {step === 0 && (
          <Card>
            <Field label="Full name"><input style={inp} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="First and last name" /></Field>
            <Field label="Credentials / title"><input style={inp} value={credentials} onChange={(e) => setCredentials(e.target.value)} placeholder="e.g. LCSW, MD, RD, OTR/L, LAc" /></Field>
            <Field label="Practice or organization name (optional)"><input style={inp} value={practiceName} onChange={(e) => setPracticeName(e.target.value)} placeholder="Leave blank if solo practice" /></Field>
            <Field label="Practice type">
              <select style={inp} value={practiceType} onChange={(e) => setPracticeType(e.target.value)}>
                <option value="">Select…</option>
                <option value="individual">Individual / solo practice</option>
                <option value="group_owner">Group practice — I am the org admin</option>
                <option value="institution">Institution / hospital system</option>
              </select>
            </Field>
            <Field label="SC license or certification number"><input style={inp} value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="e.g. LCS-12345, OT-9876" /></Field>
            <Field label="NPI number (if applicable)"><input style={inp} value={npiNumber} onChange={(e) => setNpiNumber(e.target.value)} placeholder="10-digit NPI" /></Field>
            <Field label="Issuing body (if no SC license)"><input style={inp} value={issuingBody} onChange={(e) => setIssuingBody(e.target.value)} placeholder="e.g. NCCAOM, NBCC, AOTA, DONA" /></Field>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <p style={hint}>Select every resource category you practice in. This determines how you appear in smart match. You can choose more than one.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
              {CATEGORIES.map((c) => {
                const on = selectedCats.includes(c.key)
                return (
                  <button key={c.key} type="button" onClick={() => toggle(c.key, selectedCats, setSelectedCats)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3, padding: '12px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left', border: on ? '2px solid ' + teal : '1px solid #d4d2ca', background: on ? mint : 'white' }}>
                    <span style={{ fontSize: 20 }}>{c.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: on ? dark : '#333' }}>{c.label}</span>
                    <span style={{ fontSize: 11, color: '#888', lineHeight: 1.4 }}>{c.description}</span>
                  </button>
                )
              })}
            </div>
            {selectedCats.length > 0 && <p style={{ ...hint, marginTop: 12, marginBottom: 0 }}>{selectedCats.length} selected</p>}
          </Card>
        )}

        {step === 2 && (
          <Card>
            {selectedCats.length === 0 ? (
              <p style={hint}>Go back and select at least one category first.</p>
            ) : (
              selectedCats.map((catKey) => {
                const cat = CATEGORIES.find((c) => c.key === catKey)
                return (
                  <div key={catKey} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #eee' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: dark, marginBottom: 10 }}>{cat?.icon} {cat?.label}</div>
                    {TAGS[catKey]?.map((section) => (
                      <div key={section.title} style={{ marginBottom: 12 }}>
                        <div style={secLabel}>{section.title}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {section.options.map((opt) => {
                            const on = selectedTags.includes(catKey + ':' + opt)
                            return (
                              <button key={opt} type="button" onClick={() => toggle(catKey + ':' + opt, selectedTags, setSelectedTags)} style={pill(on)}>{opt}</button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })
            )}
          </Card>
        )}

        {step === 3 && (
          <Card>
            <Field label="Currently accepting new clients?">
              <select style={inp} value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value)}>
                <option>Yes — accepting now</option>
                <option>Limited — contact to inquire</option>
                <option>Waitlist only</option>
                <option>Not accepting</option>
              </select>
            </Field>
            <Field label="Primary practice zip code"><input style={inp} value={primaryZip} onChange={(e) => setPrimaryZip(e.target.value)} placeholder="e.g. 29401" maxLength={5} /></Field>
            <div style={{ marginBottom: 14 }}>
              <div style={secLabel}>Insurance accepted</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {INSURANCE_OPTIONS.map((opt) => (
                  <button key={opt} type="button" onClick={() => toggle(opt, selectedInsurance, setSelectedInsurance)} style={pill(selectedInsurance.includes(opt))}>{opt}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={secLabel}>Age groups served</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {AGE_GROUPS.map((opt) => (
                  <button key={opt} type="button" onClick={() => toggle(opt, selectedAges, setSelectedAges)} style={pill(selectedAges.includes(opt))}>{opt}</button>
                ))}
              </div>
            </div>
            <Field label="Telehealth offered?">
              <select style={inp} value={telehealth} onChange={(e) => setTelehealth(e.target.value)}>
                <option value="No — in-person only">No — in-person only</option>
                <option value="Yes — telehealth available">Yes — telehealth available</option>
                <option value="Telehealth only">Telehealth only</option>
              </select>
            </Field>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <p style={hint}>Select what genuinely reflects your training, experience, or demonstrated practice. This helps clients find providers who understand their lived experience.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {IDENTITY_TAGS.map((opt) => (
                <button key={opt} type="button" onClick={() => toggle(opt, selectedIdentity, setSelectedIdentity)} style={pill(selectedIdentity.includes(opt))}>{opt}</button>
              ))}
            </div>
          </Card>
        )}

        {step === 5 && (
          <Card>
            <Field label="Professional bio (shown on your profile)">
              <textarea style={{ ...inp, minHeight: 90, resize: 'vertical' }} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Describe your approach and what clients can expect. Write in first person." />
            </Field>
            <Field label="Professional email"><input style={inp} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></Field>
            <Field label="Phone (optional)"><input style={inp} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(843) 555-0000" /></Field>
            <Field label="Website (optional)"><input style={inp} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" /></Field>
            <div style={{ ...hint, padding: 12, background: mint, borderRadius: 8, color: dark, marginBottom: 0 }}>
              Photo upload and address details come next — we'll add those after saving works.
            </div>
          </Card>
        )}

        {errorMsg && <p style={{ fontSize: 14, color: '#b91c1c', marginTop: 12 }}>{errorMsg}</p>}

        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0 64px' }}>
          <button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
            style={{ fontSize: 14, padding: '10px 18px', borderRadius: 8, border: '1px solid #d4d2ca', background: 'white', color: step === 0 ? '#bbb' : dark, cursor: step === 0 ? 'default' : 'pointer' }}>
            ← Back
          </button>
          {step < 5 ? (
            <button type="button" onClick={() => setStep(step + 1)}
              style={{ fontSize: 14, fontWeight: 500, padding: '10px 22px', borderRadius: 8, border: 'none', background: teal, color: 'white', cursor: 'pointer' }}>
              Next →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={saving}
              style={{ fontSize: 14, fontWeight: 500, padding: '10px 22px', borderRadius: 8, border: 'none', background: teal, color: 'white', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Submitting…' : 'Submit application'}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, background: 'white', color: '#1a1a1a' }
const hint: React.CSSProperties = { fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 14 }
const secLabel: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }

function pill(on: boolean): React.CSSProperties {
  return { fontSize: 12, padding: '4px 11px', borderRadius: 99, cursor: 'pointer', border: on ? '1px solid ' + teal : '1px solid #d4d2ca', background: on ? mint : 'white', color: on ? dark : '#666', fontWeight: on ? 500 : 400 }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', padding: '24px 28px' }}>{children}</div>
}