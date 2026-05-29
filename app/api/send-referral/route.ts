import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Tidal Care Network <noreply@tidalcare.org>'
const teal = '#3e6a70'

export async function POST(request: Request) {
  try {
    const { referralId, notifyClient, notifyProvider } = await request.json()
    console.log('SEND-REFERRAL called:', { referralId, notifyClient, notifyProvider })
    const supabase = await createClient()

    // Load the referral
    const { data: referral } = await supabase
      .from('referrals')
      .select('*')
      .eq('id', referralId)
      .maybeSingle()

    if (!referral) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 })
    }
    console.log('Referral loaded:', { client_email: referral.client_email, type: referral.referral_type, token: referral.share_token })

    // Load the recommended providers
    const { data: links } = await supabase
      .from('referral_providers')
      .select('provider_id')
      .eq('referral_id', referralId)
    const ids = (links || []).map((l) => l.provider_id)

    const { data: providers } = await supabase
      .from('providers')
      .select('full_name, credentials, practice_name, email, phone, website, is_org')
      .in('id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])

    // Load the referring provider (for warm handoff info)
    let referrer: { full_name: string; credentials: string | null; email: string; phone: string | null; practice_name: string | null } | null = null
    if (referral.from_provider_id) {
      const { data } = await supabase
        .from('providers')
        .select('full_name, credentials, email, phone, practice_name')
        .eq('id', referral.from_provider_id)
        .maybeSingle()
      referrer = data
    }

    const sent: string[] = []

    // Email the client
    if (notifyClient && referral.client_email && referral.share_token) {
      const link = `https://tidalcare.org/r/${referral.share_token}`
      const providerNames = (providers || []).map((p) => p.is_org ? (p.practice_name || p.full_name) : `${p.full_name}${p.credentials ? `, ${p.credentials}` : ''}`).join(', ')
      const clientResp = await resend.emails.send({
        from: FROM,
        to: referral.client_email,
        subject: 'Your referral from Tidal Care Network',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
            <h2 style="color: ${teal};">Your referral is ready</h2>
            <p>Hello${referral.client_name ? ' ' + referral.client_name : ''},</p>
            <p>You've been referred to the following provider${(providers || []).length > 1 ? 's' : ''} through Tidal Care Network: <strong>${providerNames}</strong>.</p>
            ${referral.note ? `<p style="background:#e8eff0;padding:12px;border-radius:8px;"><em>${referral.note}</em></p>` : ''}
            <p>View their full details and contact information here:</p>
            <p><a href="${link}" style="display:inline-block;background:${teal};color:white;padding:11px 22px;border-radius:8px;text-decoration:none;font-weight:500;">View your referral</a></p>
            <p style="color:#888;font-size:13px;margin-top:24px;">These are vetted members of Tidal Care Network.</p>
          </div>`,
      })
      if (clientResp.error) {
        console.log('Resend client error:', JSON.stringify(clientResp.error))
      } else {
        sent.push('client')
      }
    }

    // Notify the receiving provider (warm handoff)
    if (notifyProvider && referral.referral_type === 'provider' && providers && providers[0]?.email) {
      const recv = providers[0]
      await resend.emails.send({
        from: FROM,
        to: recv.email,
        subject: 'You have received a warm handoff referral',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
            <h2 style="color: ${teal};">A colleague has referred a client to you</h2>
            <p>Hello ${recv.full_name},</p>
            <p>You've received a warm handoff referral through Tidal Care Network.</p>
            ${referrer ? `
              <div style="background:#e8eff0;padding:14px;border-radius:8px;margin:16px 0;">
                <strong>Referring provider:</strong><br/>
                ${referrer.full_name}${referrer.credentials ? ', ' + referrer.credentials : ''}<br/>
                ${referrer.practice_name ? referrer.practice_name + '<br/>' : ''}
                ${referrer.email ? 'Email: ' + referrer.email + '<br/>' : ''}
                ${referrer.phone ? 'Phone: ' + referrer.phone : ''}
              </div>` : ''}
            ${referral.note ? `<p><strong>Note:</strong> ${referral.note}</p>` : ''}
            <p><strong>Release of Information requested:</strong> ${referral.roi_requested ? 'Yes' : 'No'}</p>
            <p style="color:#888;font-size:13px;margin-top:24px;">Please reach out to the referring provider to coordinate care.</p>
          </div>`,
      })
      sent.push('provider')
    }

    console.log('SEND-REFERRAL result:', sent)
    return NextResponse.json({ ok: true, sent })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}