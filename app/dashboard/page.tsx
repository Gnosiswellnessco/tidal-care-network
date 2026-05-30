import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EndorsementRequest from '@/components/EndorsementRequest'

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
    .select('id, full_name, vetting_status')
    .eq('user_id', user.id)
    .maybeSingle()

  console.log('DASHBOARD provider object:', JSON.stringify(provider))

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f7f6f2' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', maxWidth: 900, margin: '0 auto' }}>
        <Link href="/"><img src="/logo.svg" alt="Tidal Care Network" style={{ height: 48, width: 'auto' }} /></Link>
        <span style={{ fontSize: 14, color: '#666' }}>{user.email}</span>
      </header>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 40px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#2c4d52', marginBottom: 16 }}>Your dashboard</h1>

        {provider ? (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', padding: 28 }}>
            <p style={{ fontSize: 16, color: '#333', marginBottom: 8 }}>
              Welcome back, <strong>{provider.full_name}</strong>.
            </p>
            {provider.vetting_status === 'approved' && (
              <Link href="/refer" style={{ display: 'inline-block', marginTop: 16, fontSize: 14, fontWeight: 500, color: 'white', background: '#3e6a70', padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>
                Create a referral →
              </Link>
            )}
            <div>
              <EndorsementRequest providerId={provider.id} />
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