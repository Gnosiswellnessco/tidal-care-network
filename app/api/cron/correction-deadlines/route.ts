import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Daily cron (see vercel.json). Hides any provider whose oldest OPEN
// correction report is past its deadline without certification.
// Protected by CRON_SECRET: Vercel Cron sends Authorization: Bearer <CRON_SECRET>.
export async function GET(request: Request) {
  const auth = request.headers.get('authorization') || ''
  const secret = process.env.CRON_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const nowIso = new Date().toISOString()

  // Open reports that are past deadline.
  const { data: overdue, error } = await admin
    .from('profile_correction_reports')
    .select('provider_id')
    .eq('status', 'open')
    .lte('deadline_at', nowIso)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const providerIds = Array.from(new Set((overdue || []).map((r) => r.provider_id)))
  if (providerIds.length === 0) return NextResponse.json({ ok: true, hidden: 0 })

  const { error: updErr } = await admin
    .from('providers')
    .update({ hidden_by_report: true })
    .in('id', providerIds)
    .eq('hidden_by_report', false) // only flip those not already hidden

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

  return NextResponse.json({ ok: true, hidden: providerIds.length })
}
