import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BrandLogo from '@/components/BrandLogo'
import PremiumFeatures from '@/components/PremiumFeatures'
import { isPremium, priceLabel, PREMIUM_ACCENT, PREMIUM_ACCENT_DARK } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

export default async function PremiumPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: provider } = await supabase
    .from('providers')
    .select('id, full_name, vetting_status, is_premium, subscription_status, subscription_interval, subscription_price_cents, subscription_renews_at, booking_type, booking_value, intro_video_url, extended_bio, custom_links, show_supporter_badge')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!provider) redirect('/dashboard')

  const premium = isPremium(provider)

  let gallery: { id: string; image_url: string; sort_order: number }[] = []
  if (premium) {
    const { data: g } = await supabase
      .from('provider_gallery')
      .select('id, image_url, sort_order')
      .eq('provider_id', provider.id)
      .order('sort_order', { ascending: true })
    gallery = g || []
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f7f6f2' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', maxWidth: 900, margin: '0 auto' }}>
        <BrandLogo height={180} />
        <Link href="/dashboard" style={{ fontSize: 14, color: '#3e6a70', textDecoration: 'none' }}>← Dashboard</Link>
      </header>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 40px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#2c4d52', margin: 0 }}>Premium features</h1>
          {premium && <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, background: PREMIUM_ACCENT, color: 'white', letterSpacing: '0.04em' }}>★ PREMIUM</span>}
        </div>

        {premium ? (
          <>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
              {provider.subscription_price_cents != null ? `Active · ${priceLabel(provider)}` : 'Active'}
              {provider.subscription_renews_at ? ` · renews ${new Date(provider.subscription_renews_at).toLocaleDateString()}` : ''}
            </p>
            <PremiumFeatures
              providerId={provider.id}
              userId={user.id}
              initial={{
                booking_type: provider.booking_type,
                booking_value: provider.booking_value,
                intro_video_url: provider.intro_video_url,
                extended_bio: provider.extended_bio,
                custom_links: (provider.custom_links as { label: string; url: string }[]) || [],
                show_supporter_badge: provider.show_supporter_badge,
              }}
              initialGallery={gallery}
            />
          </>
        ) : (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', borderTop: '2px solid ' + PREMIUM_ACCENT, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16, color: PREMIUM_ACCENT_DARK }}>★</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#2c4d52' }}>Tidal Care Premium</span>
            </div>
            <p style={{ fontSize: 14, color: '#5f6b6d', lineHeight: 1.7, marginBottom: 18 }}>
              Upgrade to unlock an enhanced profile with a photo gallery and intro video, a booking button on your card and profile, an extended bio with custom links, and an optional supporter badge. These are tools to help the right clients find you — your placement in the directory always stays based on merit.
            </p>
            <button type="button" disabled style={{ fontSize: 14, fontWeight: 500, padding: '11px 26px', border: 'none', borderRadius: 8, background: PREMIUM_ACCENT, color: 'white', letterSpacing: '0.02em', cursor: 'not-allowed', opacity: 0.7 }}>
              Upgrade — $50/yr or $5/mo
            </button>
            <p style={{ fontSize: 12, color: '#aaa', marginTop: 10 }}>Payment setup coming soon.</p>
          </div>
        )}
      </div>
    </main>
  )
}
