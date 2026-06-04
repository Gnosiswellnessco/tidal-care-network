import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EndorsementRequest from '@/components/EndorsementRequest'
import ReferralSources from '@/components/ReferralSources'
import SignOutButton from '@/components/SignOutButton'
import BrandLogo from '@/components/BrandLogo'
import OrgManagement from '@/components/OrgManagement'
import DashboardTabs from '@/components/DashboardTabs'
import { getAdminInfo } from '@/lib/admin-auth'
import { isPremium, priceLabel, PREMIUM_ACCENT, PREMIUM_ACCENT_DARK } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: provider } = await supabase
    .from('providers')
    .select('id, full_name, vetting_status, is_org, is_premium, subscription_status, subscription_interval, subscription_price_cents, subscription_renews_at')
    .eq('user_id', user.id)
    .maybeSingle()
      if (!provider) {
    redirect('/join')
  }


  const adminInfo = await getAdminInfo(user.email)
  const premium = isPremium(provider)
  const approved = provider?.vetting_status === 'approved'

  // --- Tab content pieces ---

  const overviewTab = (
    <div>
      <div style={{ marginBottom: 20, padding: '14px 16px', background: '#e8eff0', borderRadius: 10 }}>
        <p style={{ fontSize: 13, color: '#2c4d52', lineHeight: 1.6, margin: 0 }}>
          <strong>Boost your visibility.</strong> Providers with peer endorsements appear higher in the directory search results. Request an endorsement from a colleague in the Endorsements tab — it only takes them one click to confirm.
        </p>
      </div>

      {approved && (
        <div style={{ padding: '16px 18px', background: '#faf9f5', borderRadius: 10, border: '1px solid #eee' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#2c4d52', marginBottom: 8 }}>How your placement in the directory works</div>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, margin: '0 0 8px' }}>
            We don&apos;t sell placement, and you can&apos;t pay to rank higher — the directory stays merit-based so the people we serve can trust it. A few things genuinely help where you appear in results:
          </p>
          <ul style={{ fontSize: 13, color: '#555', lineHeight: 1.7, margin: '0 0 8px', paddingLeft: 18 }}>
            <li><strong>Being vetted</strong> — completing verification and staying in good standing.</li>
            <li><strong>Peer endorsements</strong> — colleagues vouching for you carries real weight.</li>
            <li><strong>Client ratings</strong> — positive reviews from people you&apos;ve worked with.</li>
            <li><strong>Keeping your status current</strong> — marking yourself as accepting new clients when you are, and keeping your profile complete and up to date.</li>
          </ul>
          <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, margin: 0 }}>
            We don&apos;t publish an exact formula — partly to keep it fair and resistant to gaming. The honest summary: do good work, stay verified, keep your profile current, and the directory reflects that.
          </p>
        </div>
      )}
    </div>
  )

  const premiumTab = (
    <div style={{ borderRadius: 10, border: '1px solid #e5e3dc', borderTop: '2px solid ' + PREMIUM_ACCENT, overflow: 'hidden' }}>
      <div style={{ padding: '16px 18px', background: '#fcfbf8' }}>
        {premium ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 15, color: PREMIUM_ACCENT_DARK }}>★</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#2c4d52' }}>Tidal Care Premium</span>
              </div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>
                Active{provider!.subscription_price_cents != null ? ` · ${priceLabel(provider)}` : ''}{provider!.subscription_renews_at ? ` · renews ${new Date(provider!.subscription_renews_at).toLocaleDateString()}` : ''}
              </div>
            </div>
            <Link href="/dashboard/premium" style={{ fontSize: 12, padding: '7px 14px', border: '1px solid #d4d2ca', background: 'white', borderRadius: 8, color: '#5f6b6d', textDecoration: 'none' }}>Manage premium features</Link>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <span style={{ fontSize: 15, color: PREMIUM_ACCENT_DARK }}>★</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#2c4d52' }}>Tidal Care Premium</span>
            </div>
            <p style={{ fontSize: 13, color: '#5f6b6d', lineHeight: 1.7, margin: '0 0 14px' }}>
              An enhanced profile with a photo gallery and intro video, a booking button on your card and profile, referral and profile analytics, and an optional supporter badge. Tools to help the right clients find you — your placement in the directory always stays based on merit.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/dashboard/premium" style={{ fontSize: 13, fontWeight: 500, padding: '9px 20px', border: 'none', borderRadius: 8, background: PREMIUM_ACCENT, color: 'white', letterSpacing: '0.02em', textDecoration: 'none' }}>Go Premium — $50/yr or $5/mo →</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const endorsementsTab = <EndorsementRequest providerId={provider!.id} />
  const referralTab = <ReferralSources providerId={provider!.id} isPremium={premium} />
  const orgTab = <OrgManagement providerId={provider!.id} isOrg={!!provider!.is_org} />

  const tabs = [
    { id: 'overview', label: 'Overview', content: overviewTab },
    ...(approved ? [{ id: 'premium', label: 'Premium', content: premiumTab }] : []),
    { id: 'endorsements', label: 'Endorsements', content: endorsementsTab },
    { id: 'referrals', label: 'My Preferred Referral sources', content: referralTab },
    ...(provider?.is_org ? [{ id: 'org', label: 'Organization', content: orgTab }] : []),
  ]

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f7f6f2' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', maxWidth: 900, margin: '0 auto' }}>
        <BrandLogo height={180} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {adminInfo.isAdmin && (
            <Link href="/admin" style={{ fontSize: 13, fontWeight: 600, color: 'white', background: '#3e6a70', padding: '7px 14px', borderRadius: 8, textDecoration: 'none' }}>Admin</Link>
          )}
          <span style={{ fontSize: 14, color: '#666' }}>{user.email}</span>
          <SignOutButton />
        </div>
      </header>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 40px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#2c4d52', marginBottom: 16 }}>Your dashboard</h1>

        {provider ? (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', padding: 28 }}>
            <p style={{ fontSize: 16, color: '#333', marginBottom: 8 }}>
              Welcome back, <strong>{provider.full_name}</strong>.
              {premium && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '3px 10px', borderRadius: 99, background: PREMIUM_ACCENT, color: 'white', letterSpacing: '0.04em', marginLeft: 10, verticalAlign: 'middle' }}>★ PREMIUM</span>
              )}
            </p>
            {approved && (
              <div style={{ display: 'flex', gap: 10, margin: '16px 0 28px', flexWrap: 'wrap' }}>
                <Link href="/dashboard/edit" style={{ display: 'inline-block', fontSize: 14, fontWeight: 500, color: '#3e6a70', background: 'white', border: '1px solid #3e6a70', padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>
                  Edit profile
                </Link>
              </div>
            )}

            <DashboardTabs tabs={tabs} />
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', padding: 28 }}>
            <p style={{ fontSize: 16, color: '#333', marginBottom: 16 }}>
              You&apos;re signed in, but you haven&apos;t completed your provider profile yet.
            </p>
            <Link href="/join" style={{ fontSize: 14, fontWeight: 500, color: 'white', background: '#3e6a70', padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>
              Complete your application →
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
