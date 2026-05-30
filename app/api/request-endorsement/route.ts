import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Tidal Care Network <noreply@tidalcare.org>'
const teal = '#3e6a70'

export async function POST(request: Request) {
  try {
    const { endorsementId } = await request.json()
    const supabase = await createClient()

    const { data: e } = await supabase
      .from('endorsements')
      .select('*, providers(full_name, credentials, practice_name)')
      .eq('id', endorsementId)
      .maybeSingle()

    if (!e) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const provider = Array.isArray(e.providers) ? e.providers[0] : e.providers
    const providerName = `${provider?.full_name || 'A colleague'}${provider?.credentials ? ', ' + provider.credentials : ''}`
    const link = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tidalcare.org'}/endorse/${e.confirm_token}`

    const resp = await resend.emails.send({
      from: FROM,
      to: e.endorser_email,
      subject: `${provider?.full_name || 'A colleague'} has requested your endorsement`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
          <h2 style="color: ${teal};">You've been asked for an endorsement</h2>
          <p>Hello${e.endorser_name ? ' ' + e.endorser_name : ''},</p>
          <p><strong>${providerName}</strong>${provider?.practice_name ? ` of ${provider.practice_name}` : ''} has joined Tidal Care Network, a community wellness provider directory, and has listed you as a professional colleague who can endorse them.</p>
          <p>By endorsing, you affirm that you know this provider professionally and that, to the best of your knowledge, they abide by the ethical standards of their profession, are competent in their area of practice, and that you know of no reason clients should not be referred to them.</p>
          <p><a href="${link}" style="display:inline-block;background:${teal};color:white;padding:11px 22px;border-radius:8px;text-decoration:none;font-weight:500;">Review the request</a></p>
          <p style="color:#888;font-size:13px;margin-top:24px;">If you don't recognize this provider, you can safely ignore this email or decline on the page above.</p>
        </div>`,
    })

    if (resp.error) return NextResponse.json({ error: resp.error }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}