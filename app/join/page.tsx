'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, INSURANCE_OPTIONS, AGE_GROUPS, POPULATIONS } from '@/lib/taxonomy'
import { useMergedTags } from '@/hooks/useTaxonomy'
import { CategoryIcon } from '@/components/CategoryIcon'

const teal = '#3e6a70'
const dark = '#2c4d52'
const mint = '#e8eff0'

const ATTESTATIONS = [
  'I hold a current, valid license or certification in good standing in my field (where applicable).',
  'I have no unresolved board complaints, disciplinary actions, or license restrictions.',
  'I carry professional liability insurance, where applicable to my profession.',
  'I agree to abide by the ethical standards and scope of practice of my profession.',
  'I will provide care only within my areas of competence and training.',
  'The information I have provided in this application is true and accurate.',
]

type Org = { id: string; full_name: string; practice_name: string | null }
type Address = { label: string; street: string; city: string; state: string; zip: string }
type TagReq = { category: string; section: string; tag: string }

const emptyAddress = (): Address => ({ label: '', street: '', city: '', state: 'SC', zip: '' })

export default function JoinPage() {
  const router = useRouter()
  const TAGS = useMergedTags()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [fullName, setFullName] = useState('')
  const [credentials, setCredentials] = useState('')
  const [practiceName, setPracticeName] = useState('')
  const [practiceType, setPracticeType] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [npiNumber, setNpiNumber] = useState('')
  const [issuingBody, setIssuingBody] = useState('')
  const [availabilityStatus, setAvailabilityStatus] = useState('Yes — accepting now')
  const [primaryZip, setPrimaryZip] = useState('')
  const [telehealth, setTelehealth] = useState('No — in-person only')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedInsurance, setSelectedInsurance] = useState<string[]>([])
  const [selectedAges, setSelectedAges] = useState<string[]>([])
  const [selectedPopulations, setSelectedPopulations] = useState<string[]>([])
  const [addresses, setAddresses] = useState<Address[]>([emptyAddress()])

  // Tag requests collected during the form, saved after provider is created
  const [tagRequests, setTagRequests] = useState<TagReq[]>([])
  const [reqOpenFor, setReqOpenFor] = useState<string | null>(null) // "category|||section"
  const [reqText, setReqText] = useState('')

  const [orgs, setOrgs] = useState<Org[]>([])
  const [orgSearch, setOrgSearch] = useState('')
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null)
  const [orgNotListed, setOrgNotListed] = useState(false)
  const [inviteOrgName, setInviteOrgName] = useState('')
  const [inviteOrgEmail, setInviteOrgEmail] = useState('')
  const [attestations, setAttestations] = useState<string[]>([])

  const isOrgMode = practiceType === 'group_owner' || practiceType === 'institution'
  const isTelehealthOnly = telehealth === 'Telehealth only'

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('providers')
      .select('id, full_name, practice_name')
      .eq('is_org', true)
      .eq('vetting_status', 'approved')
      .then(({ data }) => { if (data) setOrgs(data as Org[]) })
  }, [])

  const filteredOrgs = orgSearch.trim()
    ? orgs.filter((o) => (o.practice_name || o.full_name).toLowerCase().includes(orgSearch.toLowerCase()))
    : []

  function toggle(value: string, list: string[], setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])
  }

  function addTagRequest(category: string, section: string) {
    if (!reqText.trim()) return
    setTagRequests((c) => [...c, { category, section, tag: reqText.trim() }])
    setReqText('')
    setReqOpenFor(null)
  }
  function removeTagRequest(idx: number) {
    setTagRequests((c) => c.filter((_, i) => i !== idx))
  }

  function updateAddress(i: number, field: keyof Address, value: string) {
    setAddresses((cur) => cur.map((a, idx) => idx === i ? { ...a, [field]: value } : a))
  }
  function addAddress() { setAddresses((cur) => [...cur, emptyAddress()]) }
  function removeAddress(i: number) { setAddresses((cur) => cur.filter((_, idx) => idx !== i)) }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setErrorMsg('Photo must be under 5MB.'); return }
    if (!file.type.startsWith('image/')) { setErrorMsg('Please upload an image file.'); return }
    setUploadingPhoto(true)
    setErrorMsg('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setErrorMsg('Please sign in first to upload a photo.'); setUploadingPhoto(false); return }
    const ext = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('provider-photos').upload(fileName, file, { upsert: true })
    if (uploadError) { setErrorMsg('Photo upload failed: ' + uploadError.message); setUploadingPhoto(false); return }
    const { data: urlData } = supabase.storage.from('provider-photos').getPublicUrl(fileName)
    setPhotoUrl(urlData.publicUrl)
    setUploadingPhoto(false)
  }

  function validateStep(s: number): string {
    if (s === 0) {
      if (!practiceType) return 'Please select a practice type.'
      if (!fullName.trim()) return isOrgMode ? 'Please enter the admin contact name.' : 'Please enter your full name.'
      if (!isOrgMode && !credentials.trim()) return 'Please enter your credentials or title.'
      if (!practiceName.trim() && isOrgMode) return 'Please enter your organization name.'
      if (!licenseNumber.trim()) return isOrgMode ? 'Please enter your group license or NPI.' : 'Please enter your license or certification number.'
    }
    if (s === 1) {
      if (selectedCats.length === 0) return 'Please select at least one category.'
    }
    if (s === 2) {
      if (selectedTags.length === 0 && tagRequests.length === 0) return 'Please select at least one specialty (or request one).'
    }
    if (s === 3) {
      if (!primaryZip.trim()) return 'Please enter your primary zip code.'
      if (!isTelehealthOnly) {
        const a = addresses[0]
        if (!a.street.trim() || !a.city.trim() || !a.zip.trim()) return 'Please enter at least your primary practice address (street, city, zip). It is optional only for telehealth-only providers.'
      }
    }
    if (s === 5) {
      if (!isOrgMode && !bio.trim()) return 'Please add a short professional bio.'
      if (!email.trim()) return 'Please enter your email.'
      if (!phone.trim()) return 'Please enter a phone number.'
    }
    return ''
  }

  function next() {
    const err = validateStep(step)
    if (err) { setErrorMsg(err); return }
    setErrorMsg('')
    setStep(step + 1)
  }

  async function handleSubmit() {
    setErrorMsg('')
    for (let s = 0; s <= 5; s++) {
      const err = validateStep(s)
      if (err) { setErrorMsg(err); setStep(s); return }
    }
    if (attestations.length < ATTESTATIONS.length) {
      setErrorMsg('Please confirm all provider attestations before submitting.')
      setStep(5)
      return
    }
    setSaving(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setErrorMsg('Please sign in first to submit your application.'); setSaving(false); return }

    const availMap: Record<string, string> = {
      'Yes — accepting now': 'accepting',
      'Limited — contact to inquire': 'limited',
      'Waitlist only': 'waitlist',
      'Not accepting': 'closed',
    }
    const availCode = availMap[availabilityStatus] || 'accepting'
    const offersTele = telehealth !== 'No — in-person only'

    const { data: provider, error: provErr } = await supabase
      .from('providers')
      .insert({
        user_id: user.id,
        full_name: fullName,
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
        photo_url: photoUrl || null,
        vetting_status: 'pending',
        is_active: true,
        is_org: isOrgMode,
        org_id: !isOrgMode && selectedOrg ? selectedOrg.id : null,
        org_status: !isOrgMode && selectedOrg ? 'pending' : 'none',
      })
      .select()
      .single()

    if (provErr || !provider) {
      setErrorMsg('Could not save your application: ' + (provErr?.message || 'unknown error'))
      setSaving(false)
      return
    }

    if (selectedCats.length > 0) {
      await supabase.from('provider_categories').insert(
        selectedCats.map((cat, i) => ({ provider_id: provider.id, category: cat, is_primary: i === 0 }))
      )
    }
    if (selectedTags.length > 0) {
      await supabase.from('provider_tags').insert(
        selectedTags.map((t) => {
          const [tagType, ...rest] = t.split(':')
          return { provider_id: provider.id, tag_type: tagType, tag_value: rest.join(':') }
        })
      )
    }
    if (selectedInsurance.length > 0) {
      await supabase.from('provider_insurance').insert(
        selectedInsurance.map((ins) => ({ provider_id: provider.id, insurance: ins }))
      )
    }
    if (selectedPopulations.length > 0) {
      await supabase.from('provider_populations').insert(
        selectedPopulations.map((pop) => ({ provider_id: provider.id, population: pop }))
      )
    }

    // Save any requested tags as pending tag_requests
    if (tagRequests.length > 0) {
      await supabase.from('tag_requests').insert(
        tagRequests.map((r) => ({
          provider_id: provider.id, category: r.category, section: r.section, requested_tag: r.tag, status: 'pending',
        }))
      )
    }

    const validAddresses = addresses.filter((a) => a.street.trim() || a.city.trim() || a.zip.trim())
    if (validAddresses.length > 0) {
      const rows = await Promise.all(validAddresses.map(async (a, i) => {
        let latitude = null
        let longitude = null
        try {
          const full = `${a.street}, ${a.city}, ${a.state} ${a.zip}`
          const res = await fetch('/api/geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: full }),
          })
          const geo = await res.json()
          if (geo.latitude != null) { latitude = geo.latitude; longitude = geo.longitude }
        } catch {}
        return {
          provider_id: provider.id,
          label: a.label || null,
          street: a.street || null,
          city: a.city || null,
          state: a.state || 'SC',
          zip: a.zip || null,
          visibility: 'full',
          is_primary: i === 0,
          latitude,
          longitude,
        }
      }))
      await supabase.from('provider_addresses').insert(rows)
    }

    if (!isOrgMode && orgNotListed && inviteOrgName.trim() && inviteOrgEmail.trim()) {
      await supabase.from('org_invitations').insert({
        requesting_provider_id: provider.id,
        org_name: inviteOrgName,
        org_contact_email: inviteOrgEmail,
      })
    }

    setSaving(false)
    router.push('/join/thank-you')
  }

  const steps = isOrgMode
    ? ['Org info', 'Care offered', 'Specialties', 'Access & locations', 'Communities served', 'Org profile']
    : ['Practice info', 'Categories', 'Specialties', 'Access & location', 'Communities served', 'Profile & contact']

  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1a1a', background: '#f7f6f2', minHeight: '100vh' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', maxWidth: 900, margin: '0 auto' }}>
        <Link href="/"><img src="/tidal-care-network.svg" alt="Tidal Care Network" style={{ height: 180, width: 'auto' }} /></Link>
        <Link href="/" style={{ fontSize: 14, color: teal, textDecoration: 'none' }}>Cancel</Link>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 40px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: dark, marginBottom: 4 }}>Join the network</h1>
        <p style={{ fontSize: 15, color: '#666', marginBottom: 20 }}>{isOrgMode ? 'Register your organization on Tidal Care Network.' : 'Your answers shape how you appear in search and referrals.'} <span style={{ color: '#b3504f' }}>*</span> marks required fields.</p>

        <div style={{ display: 'flex', gap: 4, marginBottom: 28, flexWrap: 'wrap' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, minWidth: 90, padding: '7px 6px', textAlign: 'center', fontSize: 11, fontWeight: 500, borderRadius: 6, background: i === step ? teal : i < step ? mint : '#efeee9', color: i === step ? 'white' : i < step ? dark : '#999' }}>
              {i + 1}. {s}
            </div>
          ))}
        </div>

        {step === 0 && (
          <Card>
            <Field label="Practice type" required>
              <select style={selectStyle} value={practiceType} onChange={(e) => setPracticeType(e.target.value)}>
                <option value="">Select…</option>
                <option value="individual">Individual / solo practice</option>
                <option value="group_owner">Group practice — I am the org admin</option>
                <option value="institution">Institution / hospital system</option>
              </select>
            </Field>

            <Field label={isOrgMode ? 'Admin contact name' : 'Full name'} required><input style={inp} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={isOrgMode ? 'Name of person managing this account' : 'First and last name'} /></Field>
            <Field label={isOrgMode ? 'Your title / role (optional)' : 'Credentials / title'} required={!isOrgMode}><input style={inp} value={credentials} onChange={(e) => setCredentials(e.target.value)} placeholder={isOrgMode ? 'e.g. Clinical Director, Office Manager' : 'e.g. LCSW, MD, RD, OTR/L'} /></Field>
            <Field label={isOrgMode ? 'Organization name' : 'Practice or organization name (optional)'} required={isOrgMode}><input style={inp} value={practiceName} onChange={(e) => setPracticeName(e.target.value)} placeholder={isOrgMode ? 'Your organization name' : 'Leave blank if solo practice'} /></Field>

            {isOrgMode && (
              <Field label="Brief organization description"><textarea style={{ ...inp, minHeight: 70, resize: 'vertical' }} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="What your organization does and the care it provides." /></Field>
            )}

            <Field label={isOrgMode ? 'Organization NPI / group license' : 'SC license or certification number'} required><input style={inp} value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder={isOrgMode ? 'Group NPI or license number' : 'e.g. LCS-12345, OT-9876'} /></Field>
            {!isOrgMode && <Field label="NPI number (if applicable)"><input style={inp} value={npiNumber} onChange={(e) => setNpiNumber(e.target.value)} placeholder="10-digit NPI" /></Field>}
            <Field label={isOrgMode ? 'Accreditation / certifying body (if applicable)' : 'Issuing body (if no SC license)'}><input style={inp} value={issuingBody} onChange={(e) => setIssuingBody(e.target.value)} placeholder={isOrgMode ? 'e.g. The Joint Commission, CARF' : 'e.g. NCCAOM, NBCC, AOTA'} /></Field>

            {!isOrgMode && (
              <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid #eee' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: dark, marginBottom: 4 }}>Are you part of an organization on Tidal Care Network?</div>
                <p style={{ fontSize: 12, color: '#888', marginBottom: 10, lineHeight: 1.5 }}>Search for your organization below. They&apos;ll receive a request to confirm your affiliation. If they&apos;re not on the network yet, you can invite them.</p>
                {selectedOrg ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: mint, borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: dark, fontWeight: 500 }}>{selectedOrg.practice_name || selectedOrg.full_name}</span>
                    <button type="button" onClick={() => setSelectedOrg(null)} style={{ fontSize: 12, color: teal, background: 'none', border: 'none', cursor: 'pointer' }}>Change</button>
                  </div>
                ) : (
                  <>
                    <input style={inp} value={orgSearch} onChange={(e) => { setOrgSearch(e.target.value); setOrgNotListed(false) }} placeholder="Search organizations…" />
                    {orgSearch.trim() && (
                      <div style={{ border: '1px solid #d4d2ca', borderRadius: 8, marginTop: 6, overflow: 'hidden' }}>
                        {filteredOrgs.length > 0 ? (
                          filteredOrgs.map((o) => (
                            <button key={o.id} type="button" onClick={() => { setSelectedOrg(o); setOrgSearch('') }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', fontSize: 13, color: '#333', background: 'white', border: 'none', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
                              {o.practice_name || o.full_name}
                            </button>
                          ))
                        ) : (
                          <div style={{ padding: '12px 14px', fontSize: 13, color: '#888' }}>
                            No member organizations match. <button type="button" onClick={() => { setOrgNotListed(true); setInviteOrgName(orgSearch); setOrgSearch('') }} style={{ color: teal, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Invite your organization →</button>
                          </div>
                        )}
                      </div>
                    )}
                    {!orgSearch.trim() && !orgNotListed && (
                      <button type="button" onClick={() => setOrgNotListed(true)} style={{ fontSize: 12, color: teal, background: 'none', border: 'none', cursor: 'pointer', marginTop: 8, padding: 0 }}>My organization isn&apos;t on Tidal Care Network yet →</button>
                    )}
                  </>
                )}
                {orgNotListed && !selectedOrg && (
                  <div style={{ marginTop: 12, padding: 14, background: '#faf9f5', borderRadius: 8, border: '1px solid #eee' }}>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>We&apos;ll send an invitation for your organization to join. Your affiliation will show once they register and confirm.</div>
                    <Field label="Organization name"><input style={inp} value={inviteOrgName} onChange={(e) => setInviteOrgName(e.target.value)} placeholder="Organization name" /></Field>
                    <Field label="Organization contact email"><input style={inp} type="email" value={inviteOrgEmail} onChange={(e) => setInviteOrgEmail(e.target.value)} placeholder="someone@theirorg.com" /></Field>
                    <button type="button" onClick={() => { setOrgNotListed(false); setInviteOrgName(''); setInviteOrgEmail('') }} style={{ fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Cancel</button>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {step === 1 && (
          <Card>
            <p style={hint}>{isOrgMode ? 'Select the categories of care your organization offers across all providers.' : 'Select every resource category you practice in. You can choose more than one.'} <span style={{ color: '#b3504f' }}>*</span></p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
              {CATEGORIES.map((c) => {
                const on = selectedCats.includes(c.key)
                return (
                  <button key={c.key} type="button" onClick={() => toggle(c.key, selectedCats, setSelectedCats)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3, padding: '12px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left', border: on ? '2px solid ' + teal : '1px solid #d4d2ca', background: on ? mint : 'white' }}>
                    <CategoryIcon name={c.key} />
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
            <p style={hint}>Select at least one specialty. Don&apos;t see one you need? Use &quot;Request to add&quot; under any group — we&apos;ll review it. <span style={{ color: '#b3504f' }}>*</span></p>
            {selectedCats.length === 0 ? (
              <p style={hint}>Go back and select at least one category first.</p>
            ) : (
              selectedCats.map((catKey) => {
                const cat = CATEGORIES.find((c) => c.key === catKey)
                return (
                  <div key={catKey} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #eee' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: dark, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}><CategoryIcon name={catKey} size={18} /> {cat?.label}</div>
                    {TAGS[catKey]?.map((section) => {
                      const reqKey = catKey + '|||' + section.title
                      const pendingForSection = tagRequests.filter((r) => r.category === catKey && r.section === section.title)
                      return (
                        <div key={section.title} style={{ marginBottom: 12 }}>
                          <div style={secLabel}>{section.title}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {section.options.map((opt) => {
                              const on = selectedTags.includes(catKey + ':' + opt)
                              return (<button key={opt} type="button" onClick={() => toggle(catKey + ':' + opt, selectedTags, setSelectedTags)} style={pill(on)}>{opt}</button>)
                            })}
                            {pendingForSection.map((r, i) => (
                              <span key={'req' + i} style={{ fontSize: 12, padding: '4px 11px', borderRadius: 99, background: '#fef3e2', color: '#9a6b1e', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                {r.tag} · pending
                                <button type="button" onClick={() => removeTagRequest(tagRequests.indexOf(r))} style={{ background: 'none', border: 'none', color: '#9a6b1e', cursor: 'pointer', padding: 0, fontSize: 13 }}>×</button>
                              </span>
                            ))}
                          </div>
                          {reqOpenFor === reqKey ? (
                            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                              <input autoFocus value={reqText} onChange={(e) => setReqText(e.target.value)} placeholder={`Suggest a ${section.title.toLowerCase()} tag`} style={{ ...inp, fontSize: 13, padding: '7px 10px' }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTagRequest(catKey, section.title) } }} />
                              <button type="button" onClick={() => addTagRequest(catKey, section.title)} style={{ fontSize: 12, fontWeight: 500, color: 'white', background: teal, border: 'none', padding: '0 14px', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>Request</button>
                              <button type="button" onClick={() => { setReqOpenFor(null); setReqText('') }} style={{ fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => { setReqOpenFor(reqKey); setReqText('') }} style={{ fontSize: 12, color: teal, background: 'none', border: 'none', cursor: 'pointer', marginTop: 8, padding: 0 }}>+ Request to add</button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })
            )}
          </Card>
        )}

        {step === 3 && (
          <Card>
            <Field label={isOrgMode ? 'Is your organization accepting new referrals?' : 'Currently accepting new clients?'} required>
              <select style={selectStyle} value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value)}>
                <option>Yes — accepting now</option>
                <option>Limited — contact to inquire</option>
                <option>Waitlist only</option>
                <option>Not accepting</option>
              </select>
            </Field>
            <Field label="Telehealth offered?" required>
              <select style={selectStyle} value={telehealth} onChange={(e) => setTelehealth(e.target.value)}>
                <option value="No — in-person only">No — in-person only</option>
                <option value="Yes — telehealth available">Yes — telehealth available</option>
                <option value="Telehealth only">Telehealth only</option>
              </select>
            </Field>
            <Field label="Primary zip code" required><input style={inp} value={primaryZip} onChange={(e) => setPrimaryZip(e.target.value)} placeholder="e.g. 29401" maxLength={5} /></Field>

            <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid #eee' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: dark, marginBottom: 4 }}>
                {isOrgMode ? 'Practice locations' : 'Practice address'} {!isTelehealthOnly && <span style={{ color: '#b3504f' }}>*</span>}
              </div>
              <p style={{ fontSize: 12, color: '#888', marginBottom: 12, lineHeight: 1.5 }}>
                {isTelehealthOnly
                  ? 'Optional for telehealth-only providers. You may still add an address if you have one.'
                  : isOrgMode
                    ? 'Add each location your organization operates.'
                    : 'Where you see clients in person.'}
              </p>

              {addresses.map((a, i) => (
                <div key={i} style={{ marginBottom: 14, padding: 14, background: '#faf9f5', borderRadius: 8, border: '1px solid #eee' }}>
                  {(isOrgMode || addresses.length > 1) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <input style={{ ...inp, marginBottom: 0, fontSize: 13 }} value={a.label} onChange={(e) => updateAddress(i, 'label', e.target.value)} placeholder={`Location label (e.g. ${i === 0 ? 'Main office' : 'Mount Pleasant office'})`} />
                      {addresses.length > 1 && <button type="button" onClick={() => removeAddress(i)} style={{ fontSize: 12, color: '#991b1b', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 10, whiteSpace: 'nowrap' }}>Remove</button>}
                    </div>
                  )}
                  <input style={{ ...inp, marginBottom: 8 }} value={a.street} onChange={(e) => updateAddress(i, 'street', e.target.value)} placeholder="Street address" />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input style={{ ...inp, marginBottom: 0, flex: 2 }} value={a.city} onChange={(e) => updateAddress(i, 'city', e.target.value)} placeholder="City" />
                    <input style={{ ...inp, marginBottom: 0, flex: 1 }} value={a.state} onChange={(e) => updateAddress(i, 'state', e.target.value)} placeholder="State" maxLength={2} />
                    <input style={{ ...inp, marginBottom: 0, flex: 1 }} value={a.zip} onChange={(e) => updateAddress(i, 'zip', e.target.value)} placeholder="Zip" maxLength={5} />
                  </div>
                </div>
              ))}

              {isOrgMode && (
                <button type="button" onClick={addAddress} style={{ fontSize: 13, fontWeight: 500, color: teal, background: 'white', border: '1px solid ' + teal, padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>
                  + Add another location
                </button>
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={secLabel}>Insurance accepted</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {INSURANCE_OPTIONS.map((opt) => (<button key={opt} type="button" onClick={() => toggle(opt, selectedInsurance, setSelectedInsurance)} style={pill(selectedInsurance.includes(opt))}>{opt}</button>))}
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={secLabel}>Age groups served</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {AGE_GROUPS.map((opt) => (<button key={opt} type="button" onClick={() => toggle(opt, selectedAges, setSelectedAges)} style={pill(selectedAges.includes(opt))}>{opt}</button>))}
              </div>
            </div>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <p style={hint}>{isOrgMode ? 'Select the communities your organization has specific experience and competence serving.' : 'Select the communities you have specific experience and competence serving. This helps people find providers who understand their background and lived experience.'}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {POPULATIONS.map((opt) => (<button key={opt} type="button" onClick={() => toggle(opt, selectedPopulations, setSelectedPopulations)} style={pill(selectedPopulations.includes(opt))}>{opt}</button>))}
            </div>
          </Card>
        )}

        {step === 5 && (
          <Card>
            <Field label={isOrgMode ? 'Organization logo or photo (optional)' : 'Profile photo or logo (optional)'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: mint, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d4d2ca' }}>
                  {photoUrl ? (
                    <img src={photoUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 24, color: teal }}>{(fullName || '?').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <label style={{ display: 'inline-block', fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 8, border: '1px solid ' + teal, background: 'white', color: teal, cursor: uploadingPhoto ? 'default' : 'pointer' }}>
                    {uploadingPhoto ? 'Uploading…' : photoUrl ? 'Change photo' : 'Upload photo'}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} style={{ display: 'none' }} />
                  </label>
                  <p style={{ fontSize: 11, color: '#888', marginTop: 6, lineHeight: 1.5, maxWidth: 300 }}>
                    Square images work best (at least 400×400px). Shown as a circle on your directory card. Max 5MB.
                  </p>
                </div>
              </div>
            </Field>

            {!isOrgMode && (
              <Field label="Professional bio (shown on your profile)" required>
                <textarea style={{ ...inp, minHeight: 90, resize: 'vertical' }} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Describe your approach and what clients can expect. Write in first person." />
              </Field>
            )}
            {isOrgMode && (
              <div style={{ ...hint, padding: 12, background: mint, borderRadius: 8, color: dark }}>Your organization description from Step 1 will appear on your profile. After approval, you&apos;ll be able to add or invite the individual providers in your organization.</div>
            )}
            <Field label={isOrgMode ? 'Main contact email' : 'Professional email'} required><input style={inp} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></Field>
            <Field label={isOrgMode ? 'Main phone' : 'Phone'} required><input style={inp} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(843) 555-0000" /></Field>
            <Field label="Website (optional)"><input style={inp} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" /></Field>

            <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid #eee' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: dark, marginBottom: 4 }}>Provider attestation <span style={{ color: '#b3504f' }}>*</span></div>
              <p style={{ fontSize: 12, color: '#888', marginBottom: 12, lineHeight: 1.5 }}>Please confirm each of the following. All are required to join the network.</p>
              {ATTESTATIONS.map((a) => {
                const on = attestations.includes(a)
                return (
                  <label key={a} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#444', cursor: 'pointer', marginBottom: 10, lineHeight: 1.5 }}>
                    <input type="checkbox" checked={on} onChange={() => toggle(a, attestations, setAttestations)} style={{ marginTop: 3, flexShrink: 0 }} />
                    <span>{a}</span>
                  </label>
                )
              })}
            </div>
          </Card>
        )}

        {errorMsg && <p style={{ fontSize: 14, color: '#b91c1c', marginTop: 12 }}>{errorMsg}</p>}

        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0 64px' }}>
          <button type="button" onClick={() => { setErrorMsg(''); setStep(Math.max(0, step - 1)) }} disabled={step === 0} style={{ fontSize: 14, padding: '10px 18px', borderRadius: 8, border: '1px solid #d4d2ca', background: 'white', color: step === 0 ? '#bbb' : dark, cursor: step === 0 ? 'default' : 'pointer' }}>← Back</button>
          {step < 5 ? (
            <button type="button" onClick={next} style={{ fontSize: 14, fontWeight: 500, padding: '10px 22px', borderRadius: 8, border: 'none', background: teal, color: 'white', cursor: 'pointer' }}>Next →</button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={saving} style={{ fontSize: 14, fontWeight: 500, padding: '10px 22px', borderRadius: 8, border: 'none', background: teal, color: 'white', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? 'Submitting…' : 'Submit application'}</button>
          )}
        </div>
      </div>
    </main>
  )
}

const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, background: 'white', color: '#1a1a1a' }
const selectStyle: React.CSSProperties = {
  width: '100%', padding: '10px 36px 10px 12px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, color: '#1a1a1a', background: 'white',
  appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%233e6a70' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', cursor: 'pointer',
}
const hint: React.CSSProperties = { fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 14 }
const secLabel: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }

function pill(on: boolean): React.CSSProperties {
  return { fontSize: 12, padding: '4px 11px', borderRadius: 99, cursor: 'pointer', border: on ? '1px solid ' + teal : '1px solid #d4d2ca', background: on ? mint : 'white', color: on ? dark : '#666', fontWeight: on ? 500 : 400 }
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (<div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 5 }}>{label}{required && <span style={{ color: '#b3504f' }}> *</span>}</label>{children}</div>)
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', padding: '24px 28px' }}>{children}</div>
}
