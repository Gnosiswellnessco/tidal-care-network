import { createClient } from '@/lib/supabase/server'
import { PREMIUM_ACCENT, PREMIUM_ACCENT_DARK } from '@/lib/subscription'

const dark = '#2c4d52'

// Server component. Reads the provider's OWN engagement data only — no rank,
// no comparison to other providers. All figures are about this provider.
export default async function PremiumInsights({ providerId }: { providerId: string }) {
  const supabase = await createClient()

  // --- Profile views: total + last 30 days, plus a per-day series for the trend ---
  const since = new Date()
  since.setDate(since.getDate() - 29) // 30-day window inclusive of today
  since.setHours(0, 0, 0, 0)

  const { count: viewsTotal } = await supabase
    .from('profile_views')
    .select('id', { count: 'exact', head: true })
    .eq('provider_id', providerId)

  const { data: recentViews } = await supabase
    .from('profile_views')
    .select('viewed_at')
    .eq('provider_id', providerId)
    .gte('viewed_at', since.toISOString())

  // Bucket recent views into 30 daily counts (oldest -> newest)
  const days: { label: string; count: number }[] = []
  const byDay: Record<string, number> = {}
  for (const row of recentViews || []) {
    const d = new Date(row.viewed_at as string)
    const key = d.toISOString().slice(0, 10)
    byDay[key] = (byDay[key] || 0) + 1
  }
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ label: key, count: byDay[key] || 0 })
  }
  const views30 = days.reduce((a, d) => a + d.count, 0)
  const maxDay = Math.max(1, ...days.map((d) => d.count))

  // --- Saved as a referral source (how many providers favorited this one) ---
  const { count: savedCount } = await supabase
    .from('provider_favorites')
    .select('owner_provider_id', { count: 'exact', head: true })
    .eq('favorite_provider_id', providerId)

  // --- Times included in a referral ---
  const { count: referralCount } = await supabase
    .from('referral_providers')
    .select('referral_id', { count: 'exact', head: true })
    .eq('provider_id', providerId)

  return (
    <div style={{ borderRadius: 10, border: '1px solid #e5e3dc', borderTop: '2px solid ' + PREMIUM_ACCENT, overflow: 'hidden', marginBottom: 24 }}>
      <div style={{ padding: '16px 18px', background: '#fcfbf8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
          <span style={{ fontSize: 15, color: PREMIUM_ACCENT_DARK }}>★</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: dark }}>Your insights</span>
        </div>
        <p style={{ fontSize: 12, color: '#888', margin: '0 0 16px', lineHeight: 1.5 }}>
          Engagement with your listing. These figures are about your profile only — they don&apos;t reflect or affect where you appear in the directory, which always stays based on merit.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 18 }}>
          <Stat label="Profile views (all time)" value={viewsTotal ?? 0} />
          <Stat label="Profile views (30 days)" value={views30} />
          <Stat label="Saved as a referral source" value={savedCount ?? 0} />
          <Stat label="Times included in a referral" value={referralCount ?? 0} />
        </div>

        <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
          Profile views — last 30 days
        </div>
        {views30 === 0 ? (
          <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>No profile views in the last 30 days yet.</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 64 }}>
            {days.map((d) => (
              <div key={d.label} title={`${d.label}: ${d.count} view${d.count === 1 ? '' : 's'}`}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                <div style={{
                  height: `${Math.round((d.count / maxDay) * 100)}%`,
                  minHeight: d.count > 0 ? 3 : 0,
                  background: PREMIUM_ACCENT,
                  borderRadius: '2px 2px 0 0',
                }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 8, padding: '12px 14px' }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: dark, lineHeight: 1.1 }}>{value.toLocaleString()}</div>
      <div style={{ fontSize: 12, color: '#888', marginTop: 4, lineHeight: 1.3 }}>{label}</div>
    </div>
  )
}
