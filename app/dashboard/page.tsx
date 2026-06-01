import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EndorsementRequest from '@/components/EndorsementRequest'
import ReferralSources from '@/components/ReferralSources'
import SignOutButton from '@/components/SignOutButton'
import BrandLogo from '@/components/BrandLogo'
import OrgManagement from '@/components/OrgManagement'
import { getAdminInfo } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if this user already has a provider profile
  const { data: provider } = await supabase
    .from('providers')
    .select('id, full_name, vetting_status, is_org')
    .eq('user_id', user.id)
    .maybeSingle()

  const adminInfo = await getAdminInfo(user.email)


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
            </p>
            {provider.vetting_status === 'approved' && (
              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                <Link href="/refer" style={{ display: 'inline-block', fontSize: 14, fontWeight: 500, color: 'white', background: '#3e6a70', padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>
                  Create a referral →
                </Link>
                <Link href="/dashboard/edit" style={{ display: 'inline-block', fontSize: 14, fontWeight: 500, color: '#3e6a70', background: 'white', border: '1px solid #3e6a70', padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>
                  Edit profile
                </Link>
              </div>
            )}
            
            <div style={{ marginTop: 20, padding: '14px 16px', background: '#e8eff0', borderRadius: 10 }}>
              <p style={{ fontSize: 13, color: '#2c4d52', lineHeight: 1.6, margin: 0 }}>
                <strong>Boost your visibility.</strong> Providers with peer endorsements appear higher in the directory search results. Request an endorsement from a colleague below — it only takes them one click to confirm.
              </p>
            </div>
            <div>
              <EndorsementRequest providerId={provider.id} />
            </div>
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #eee' }}>
              <ReferralSources providerId={provider.id} />
            </div>
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #eee' }}>
              <OrgManagement providerId={provider.id} isOrg={!!provider.is_org} />
            </div>
           
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', padding: 28 }}>
            <p style={{ fontSize: 16, color: '#333', marginBottom: 16 }}>
              You're signed in, but you haven't completed your provider profile yet.
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
