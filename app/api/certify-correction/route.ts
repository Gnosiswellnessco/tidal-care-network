import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// A provider certifies they've reviewed/corrected a reported issue.
// Marks the report certified, and if no other open reports remain for that
// provider, clears the hidden_by_report flag.
export async function POST(request: Request) {
  try {
    const { reportId } = await request.json()
    if (!reportId) return NextResponse.json({ error: 'Missing report' }, { status: 400 })

    // Who's calling?
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const admin = createAdminClient()

    // Find the report and its provider, and verify the caller owns that provider.
    const { data: report } = await admin
      .from('profile_correction_reports')
      .select('id, provider_id, status')
      .eq('id', reportId)
      .maybeSingle()
    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

    const { data: provider } = await admin
      .from('providers')
      .select('id, user_id')
      .eq('id', report.provider_id)
      .maybeSingle()
    if (!provider || provider.user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized for this listing' }, { status: 403 })
    }

    // Mark certified.
    await admin
      .from('profile_correction_reports')
      .update({ status: 'certified', certified_at: new Date().toISOString() })
      .eq('id', reportId)

    // Any remaining open reports for this provider?
    const { count } = await admin
      .from('profile_correction_reports')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', provider.id)
      .eq('status', 'open')

    if (!count || count === 0) {
      await admin.from('providers').update({ hidden_by_report: false }).eq('id', provider.id)
    }

    return NextResponse.json({ ok: true, remainingOpen: count || 0 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
