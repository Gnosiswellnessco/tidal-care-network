'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const teal = '#3e6a70'
const dark = '#2c4d52'
const mint = '#e8eff0'

type ProviderLite = { id: string; full_name: string; practice_name: string | null; credentials: string | null; email: string | null; is_org: boolean }
type Affiliation = {
  id: string; provider_id: string; org_id: string; initiated_by: 'provider' | 'org'; status: string
  provider?: ProviderLite; org?: ProviderLite
}

export default function OrgManagement({ providerId, isOrg }: { providerId: string; isOrg: boolean }) {
  const [loading, setLoading] = useState(true)
  const [affiliations, setAffiliations] = useState<Affiliation[]>([])
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<ProviderLite[]>([])
  const [searching, setSearching] = useState(false)
  const [msg, setMsg] = useState('')

  const [emailInput, setEmailInput] = useState('')
  const [emailMsg, setEmailMsg] = useState('')
  const [emailSending, setEmailSending] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: rows } = await supabase
      .from('org_affiliations')
      .select('*')
      .or(`provider_id.eq.${providerId},org_id.eq.${providerId}`)
      .order('created_at', { ascending: false })

    const affs = (rows || []) as Affiliation[]
    const otherIds = Array.from(new Set(affs.flatMap((a) => [a.provider_id, a.org_id]).filter((id) => id !== providerId)))
    if (otherIds.length > 0) {
      const { data: people } = await supabase
        .from('providers')
        .select('id, full_name, practice_name, credentials, email, is_org')
        .in('id', otherIds)
      const byId = new Map((people || []).map((p) => [p.id, p as ProviderLite]))
      affs.forEach((a) => { a.provider = byId.get(a.provider_id); a.org = byId.get(a.org_id) })
    }
    setAffiliations(affs)
    setLoading(false)
  }, [providerId])

  useEffect(() => { load() }, [load])

  async function runSearch() {
    if (!search.trim()) return
    setSearching(true); setMsg('')
    const supabase = createClient()
    let q = supabase.from('providers')
      .select('id, full_name, practice_name, credentials, email, is_org')
      .eq('vetting_status', 'approved').eq('is_active', true)
      .neq('id', providerId)
      .ilike('full_name', `%${search.trim()}%`)
    q = isOrg ? q.eq('is_org', false) : q.eq('is_org', true)
    const { data, error } = await q.limit(8)
    if (error) { console.error('Org search error:', JSON.stringify(error)); setMsg('Search error: ' + error.message) }
    else if (!data || data.length === 0) { setMsg('No matching ' + (isOrg ? 'providers' : 'organizations') + ' found.') }
    setResults((data || []) as ProviderLite[])
    setSearching(false)
  }

  async function inviteMember(target: ProviderLite) {
    setMsg('')
    const supabase = createClient()
    const row = isOrg
      ? { provider_id: target.id, org_id: providerId, initiated_by: 'org', status: 'pending' }
      : { provider_id: providerId, org_id: target.id, initiated_by: 'provider', status: 'pending' }
    const { error } = await supabase.from('org_affiliations').insert(row)
    if (error) {
      setMsg(error.message.includes('duplicate') ? 'An affiliation with them already exists.' : 'Could not send: ' + error.message)
      return
    }
    try {
      await fetch('/api/org-invite', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'member', providerId: row.provider_id, orgId: row.org_id, initiatedBy: row.initiated_by }),
      })
    } catch {}
    setMsg(isOrg ? `Invite sent to ${target.full_name}.` : `Request sent to ${target.practice_name || target.full_name}.`)
    setResults([]); setSearch('')
    load()
  }

  async function sendEmailInvites() {
    const emails = emailInput.split(/[\s,;]+/).map((e) => e.trim()).filter(Boolean)
    if (emails.length === 0) { setEmailMsg('Enter at least one email address.'); return }
    setEmailSending(true); setEmailMsg('')
    try {
      const res = await fetch('/api/org-invite', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'email', inviterId: providerId, inviterIsOrg: isOrg, emails }),
      })
      const out = await res.json()
      if (out.error) { setEmailMsg('Could not send: ' + out.error) }
      else {
        const linked = (out.results || []).filter((r: {outcome:string}) => r.outcome === 'linked-existing-member').length
        const invited = (out.results || []).filter((r: {outcome:string}) => r.outcome === 'invited-new').length
        const invalid = (out.results || []).filter((r: {outcome:string}) => r.outcome === 'invalid').length
        const parts = []
        if (invited) parts.push(`${invited} new invite${invited === 1 ? '' : 's'} sent`)
        if (linked) parts.push(`${linked} existing member${linked === 1 ? '' : 's'} linked`)
        if (invalid) parts.push(`${invalid} invalid skipped`)
        setEmailMsg(parts.join(' · ') || 'Done.')
        setEmailInput('')
        load()
      }
    } catch {
      setEmailMsg('Could not send invites.')
    }
    setEmailSending(false)
  }

  async function setStatus(aff: Affiliation, status: 'approved' | 'declined') {
    const supabase = createClient()
    await supabase.from('org_affiliations').update({ status }).eq('id', aff.id)
    if (status === 'approved') {
      await supabase.from('providers').update({ org_id: aff.org_id, org_status: 'approved' }).eq('id', aff.provider_id)
    }
    load()
  }

  async function removeAff(aff: Affiliation) {
    const supabase = createClient()
    await supabase.from('org_affiliations').delete().eq('id', aff.id)
    if (aff.status === 'approved') {
      await supabase.from('providers').update({ org_id: null, org_status: null }).eq('id', aff.provider_id)
    }
    load()
  }

  if (loading) return <p style={{ fontSize: 13, color: '#888' }}>Loading affiliations…</p>

  const approved = affiliations.filter((a) => a.status === 'approved')
  const needsMyAction = affiliations.filter((a) =>
    a.status === 'pending' && ((isOrg && a.initiated_by === 'provider') || (!isOrg && a.initiated_by === 'org')))
  const awaitingOther = affiliations.filter((a) =>
    a.status === 'pending' && ((isOrg && a.initiated_by === 'org') || (!isOrg && a.initiated_by === 'provider')))

  const otherOf = (a: Affiliation) => (isOrg ? a.provider : a.org)
  const label = (p?: ProviderLite) => p ? (p.is_org ? (p.practice_name || p.full_name) : `${p.full_name}${p.credentials ? ', ' + p.credentials : ''}`) : 'Unknown'

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: dark, marginBottom: 4 }}>
        {isOrg ? 'Your organization' : 'Organization affiliation'}
      </h2>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 1.5 }}>
        {isOrg
          ? 'Invite providers to affiliate with your organization, and approve providers who request to join.'
          : 'Request to join an organization, or accept an invitation from one.'}
      </p>

      {/* Requests / invitations needing my response */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#633806', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
          {isOrg ? 'Requests to join' : 'Invitations to you'}
        </div>
        {needsMyAction.length === 0 ? (
          <p style={{ fontSize: 13, color: '#999' }}>{isOrg ? 'No pending requests.' : 'No pending invitations.'}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {needsMyAction.map((a) => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#faeeda', borderRadius: 8, border: '1px solid #e8c98a', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, color: dark }}>{label(otherOf(a))}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setStatus(a, 'approved')} style={{ fontSize: 13, fontWeight: 500, padding: '6px 14px', borderRadius: 8, border: 'none', background: teal, color: 'white', cursor: 'pointer' }}>{isOrg ? 'Approve' : 'Accept'}</button>
                  <button onClick={() => setStatus(a, 'declined')} style={{ fontSize: 13, padding: '6px 14px', borderRadius: 8, border: '1px solid #d4d2ca', background: 'white', color: '#991b1b', cursor: 'pointer' }}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {approved.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            {isOrg ? 'Affiliated providers' : 'Affiliated with'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {approved.map((a) => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#faf9f5', borderRadius: 8, border: '1px solid #eee', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, color: dark }}>{label(otherOf(a))}</span>
                <button onClick={() => removeAff(a)} style={{ fontSize: 12, color: '#991b1b', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {awaitingOther.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Pending (awaiting response)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {awaitingOther.map((a) => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'white', borderRadius: 8, border: '1px solid #e5e3dc', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, color: '#666' }}>{label(otherOf(a))} · pending</span>
                <button onClick={() => removeAff(a)} style={{ fontSize: 12, color: '#991b1b', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite existing members by name */}
      <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid #eee' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
          {isOrg ? 'Invite a provider already in the network' : 'Request to join an organization in the network'}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); runSearch() } }}
            placeholder={isOrg ? 'Search providers by name' : 'Search organizations by name'}
            style={{ flex: '1 1 220px', padding: '9px 12px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, color: '#1a1a1a', background: 'white' }}
          />
          <button onClick={runSearch} disabled={searching} style={{ fontSize: 13, fontWeight: 500, padding: '9px 16px', borderRadius: 8, border: 'none', background: teal, color: 'white', cursor: 'pointer' }}>
            {searching ? 'Searching…' : 'Search'}
          </button>
        </div>
        {msg && <p style={{ fontSize: 13, color: msg.startsWith('Could not') || msg.includes('already') ? '#b91c1c' : '#27500a', marginTop: 10 }}>{msg}</p>}
        {results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {results.map((r) => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 14px', background: mint, borderRadius: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, color: dark }}>{label(r)}</span>
                <button onClick={() => inviteMember(r)} style={{ fontSize: 13, fontWeight: 500, padding: '6px 14px', borderRadius: 8, border: 'none', background: teal, color: 'white', cursor: 'pointer' }}>
                  {isOrg ? 'Invite' : 'Request to join'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite by email (members or non-members, batch supported) */}
      <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #eee' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
          {isOrg ? 'Invite providers by email' : 'Invite your organization by email'}
        </div>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 8, lineHeight: 1.5 }}>
          {isOrg
            ? 'Enter one or more email addresses (separated by commas, spaces, or new lines). People already in the network will get an affiliation request; others will get an invitation to join.'
            : 'Enter your organization&apos;s contact email. If they&apos;re already in the network they&apos;ll get a request; otherwise they&apos;ll be invited to join.'}
        </p>
        <textarea
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder={isOrg ? 'provider1@example.com, provider2@example.com' : 'office@myorganization.com'}
          style={{ width: '100%', minHeight: 60, padding: '9px 12px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, color: '#1a1a1a', background: 'white', resize: 'vertical', marginBottom: 8 }}
        />
        <button onClick={sendEmailInvites} disabled={emailSending} style={{ fontSize: 13, fontWeight: 500, padding: '9px 18px', borderRadius: 8, border: 'none', background: teal, color: 'white', cursor: emailSending ? 'default' : 'pointer', opacity: emailSending ? 0.6 : 1 }}>
          {emailSending ? 'Sending…' : isOrg ? 'Send invites' : 'Send invite'}
        </button>
        {emailMsg && <p style={{ fontSize: 13, color: emailMsg.startsWith('Could not') ? '#b91c1c' : '#27500a', marginTop: 10 }}>{emailMsg}</p>}
      </div>
    </div>
  )
}
