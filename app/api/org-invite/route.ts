import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

const resend = new Resend(process.env.RESEND_API_KEY)
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://tidalcare.org'

// Handles two cases:
//  1. { mode: 'member', providerId, orgId, initiatedBy }  -> notify existing member
//  2. { mode: 'email', inviterId, inviterIsOrg, emails: [] } -> invite non-members (or link members) by email
export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const admin = createAdminClient()

    // ---------- CASE 1: existing-member notification ----------
    if (payload.mode === 'member') {
      const { providerId, orgId, initiatedBy } = payload
      const { data: people } = await admin
        .from('providers').select('id, full_name, practice_name, credentials, email').in('id', [providerId, orgId])
      const prov = (people || []).find((p) => p.id === providerId)
      const org = (people || []).find((p) => p.id === orgId)
      if (!prov || !org) return NextResponse.json({ error: 'not found' }, { status: 404 })
      const orgName = org.practice_name || org.full_name
      const provName = `${prov.full_name}${prov.credentials ? ', ' + prov.credentials : ''}`
      const to = initiatedBy === 'org' ? prov.email : org.email
      const subject = initiatedBy === 'org'
        ? `You've been invited to affiliate with ${orgName} on Tidal Care Network`
        : `${provName} has requested to join ${orgName} on Tidal Care Network`
      const body = initiatedBy === 'org'
        ? `Hello ${prov.full_name},\n\n${orgName} has invited you to affiliate with their organization on the Tidal Care Network.\n\nLog in to accept or decline:\n${SITE}/dashboard\n\nWarm regards,\nTidal Care Network`
        : `Hello,\n\n${provName} has requested to affiliate with ${orgName}.\n\nLog in to approve or decline:\n${SITE}/dashboard\n\nWarm regards,\nTidal Care Network`
      if (to) await resend.emails.send({ from: 'Tidal Care Network <info@tidalcare.org>', to, subject, text: body })
      return NextResponse.json({ sent: true })
    }

    // ---------- CASE 2: email invites (batch) ----------
    const { inviterId, inviterIsOrg, emails } = payload as { inviterId: string; inviterIsOrg: boolean; emails: string[] }
    const { data: inviterRows } = await admin.from('providers').select('id, full_name, practice_name').eq('id', inviterId)
    const inviter = (inviterRows || [])[0]
    if (!inviter) return NextResponse.json({ error: 'inviter not found' }, { status: 404 })
    const inviterName = inviter.practice_name || inviter.full_name

    const results: { email: string; outcome: string }[] = []

    for (const raw of emails) {
      const email = (raw || '').trim().toLowerCase()
      if (!email || !email.includes('@')) { results.push({ email: raw, outcome: 'invalid' }); continue }

      // Is this email already an approved member?
      const { data: matchRows } = await admin
        .from('providers').select('id, full_name, is_org').eq('email', email).eq('vetting_status', 'approved').eq('is_active', true).limit(1)
      const match = (matchRows || [])[0]

      if (match) {
        // Link as a real affiliation (pending), respecting direction
        const row = inviterIsOrg
          ? { provider_id: match.id, org_id: inviterId, initiated_by: 'org', status: 'pending' }
          : { provider_id: inviterId, org_id: match.id, initiated_by: 'provider', status: 'pending' }
        const { error: insErr } = await admin.from('org_affiliations').upsert(row, { onConflict: 'provider_id,org_id' })
        // notify them
        const subject = inviterIsOrg
          ? `You've been invited to affiliate with ${inviterName} on Tidal Care Network`
          : `${inviterName} has requested to join your organization on Tidal Care Network`
        const body = `Hello,\n\nLog in to your Tidal Care Network dashboard to respond:\n${SITE}/dashboard\n\nWarm regards,\nTidal Care Network`
        try { await resend.emails.send({ from: 'Tidal Care Network <info@tidalcare.org>', to: email, subject, text: body }) } catch {}
        results.push({ email, outcome: insErr ? 'member-error' : 'linked-existing-member' })
      } else {
        // Non-member: record the invite + send a "come join" email
        await admin.from('org_invitations').insert({
          inviter_provider_id: inviterId,
          inviter_is_org: inviterIsOrg,
          invitee_email: email,
          org_name: inviterIsOrg ? inviterName : null,
          org_contact_email: inviterIsOrg ? null : email,
          status: 'sent',
        })
        const subject = `${inviterName} invited you to join Tidal Care Network`
        const body = inviterIsOrg
          ? `Hello,\n\n${inviterName} has invited you to join the Tidal Care Network — a free, community-based referral network for South Carolina providers — and to affiliate with their organization.\n\nApply here to create your free provider profile:\n${SITE}/join\n\nWarm regards,\nTidal Care Network`
          : `Hello,\n\n${inviterName}, a provider on the Tidal Care Network, has invited your organization to join — a free, community-based referral network for South Carolina providers.\n\nLearn more and apply here:\n${SITE}/join\n\nWarm regards,\nTidal Care Network`
        try { await resend.emails.send({ from: 'Tidal Care Network <info@tidalcare.org>', to: email, subject, text: body }) } catch {}
        results.push({ email, outcome: 'invited-new' })
      }
    }

    return NextResponse.json({ results })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
