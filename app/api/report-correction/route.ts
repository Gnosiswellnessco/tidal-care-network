import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Tidal Care Network <noreply@tidalcare.org>'
const teal = '#3e6a70'

export async function POST(request: Request) {
  try {
    const { providerId, reason, details, reporterEmail } = await request.json()
    if (!providerId || !reason) {
      return NextResponse.json({ error: 'Missing provider or reason' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Insert the report. deadline_at defaults to now() + 14 days in the DB.
    const { data: report, error: insErr } = await admin
      .from('profile_correction_reports')
      .insert({
        provider_id: providerId,
        reason,
        details: (details || '').trim() || null,
        reporter_email: (reporterEmail || '').trim() || null,
        status: 'open',
      })
      .select('id, deadline_at')
      .single()

    if (insErr || !report) {
      return NextResponse.json({ error: insErr?.message || 'Could not save report' }, { status: 500 })
    }

    // Look up the provider to notify them.
    const { data: provider } = await admin
      .from('providers')
      .select('full_name, email')
      .eq('id', providerId)
      .maybeSingle()

    // Notify the provider (best-effort; a failed email shouldn't fail the report).
    if (provider?.email) {
      const deadline = new Date(report.deadline_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
      const dashLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tidalcare.org'}/dashboard`
      try {
        await resend.emails.send({
          from: FROM,
          to: provider.email,
          subject: 'Action needed: a correction was reported on your Tidal Care listing',
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
              <h2 style="color: ${teal};">A correction was reported on your listing</h2>
              <p>Hello${provider.full_name ? ' ' + provider.full_name : ''},</p>
              <p>Someone reported a possible inaccuracy on your Tidal Care Network profile. Here is what they told us:</p>
              <div style="background:#f4f2ec;border-left:3px solid ${teal};padding:12px 16px;border-radius:6px;margin:14px 0;">
                <p style="margin:0 0 6px;"><strong>Reason:</strong> ${escapeHtml(reason)}</p>
                ${details ? `<p style="margin:0;"><strong>Details:</strong> ${escapeHtml(details)}</p>` : ''}
              </div>
              <p>Please review your profile, make any needed updates, and confirm the correction from your dashboard.
                 <strong>If you do not review and certify by ${deadline} (14 days), your listing will be temporarily hidden</strong> from the directory until you do.</p>
              <p><a href="${dashLink}" style="display:inline-block;background:${teal};color:white;padding:11px 22px;border-radius:8px;text-decoration:none;font-weight:500;">Review &amp; certify on your dashboard</a></p>
              <p style="color:#888;font-size:13px;margin-top:24px;">If the report is mistaken, you can still certify after reviewing — certifying simply tells us you've checked your listing. Questions? Reply to info@tidalcare.org.</p>
            </div>`,
        })
      } catch {
        // swallow — report is already saved
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
