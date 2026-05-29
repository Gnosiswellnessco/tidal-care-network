import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

async function approveProvider(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const admin = createAdminClient()
  await admin.from('providers').update({ vetting_status: 'approved' }).eq('id', id)
  revalidatePath('/admin')
}

async function declineProvider(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const admin = createAdminClient()
  await admin.from('providers').update({ vetting_status: 'removed', is_active: false }).eq('id', id)
  revalidatePath('/admin')
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/')
  }

  const admin = createAdminClient()
  const { data: providers } = await admin
    .from('providers')
    .select('*')
    .order('created_at', { ascending: false })

  const pending = providers?.filter((p) => p.vetting_status === 'pending') || []
  const approved = providers?.filter((p) => p.vetting_status === 'approved') || []
  const total = providers?.length || 0

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f7f6f2' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', maxWidth: 1000, margin: '0 auto' }}>
        <Link href="/"><img src="/logo.svg" alt="Tidal Care Network" style={{ height: 48, width: 'auto' }} /></Link>
        <span style={{ fontSize: 13, color: '#888' }}>Admin · {user.email}</span>
      </header>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 40px 64px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#2c4d52', marginBottom: 20 }}>Admin dashboard</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
          <Stat label="Pending review" value={pending.length} />
          <Stat label="Approved" value={approved.length} />
          <Stat label="Total" value={total} />
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#2c4d52', marginBottom: 12 }}>Pending applications</h2>
        {pending.length === 0 ? (
          <p style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>No pending applications right now.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {pending.map((p) => (
              <div key={p.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#2c4d52' }}>
                      {p.full_name}{p.credentials ? `, ${p.credentials}` : ''}
                      {p.is_org && <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 6, background: '#e8eff0', color: '#2c4d52', marginLeft: 8 }}>Organization</span>}
                    </div>
                    <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{p.email}{p.phone ? ` · ${p.phone}` : ''}</div>
                    <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                      {p.practice_name ? `${p.practice_name} · ` : ''}{p.practice_type || '—'}{p.primary_zip ? ` · ${p.primary_zip}` : ''}
                    </div>
                    {p.license_number && <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>License: {p.license_number}{p.issuing_body ? ` (${p.issuing_body})` : ''}</div>}
                    {p.bio && <p style={{ fontSize: 13, color: '#555', marginTop: 8, lineHeight: 1.5 }}>{p.bio}</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <form action={approveProvider}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" style={{ fontSize: 13, fontWeight: 500, padding: '8px 18px', borderRadius: 8, border: 'none', background: '#3e6a70', color: 'white', cursor: 'pointer', width: '100%' }}>Approve</button>
                    </form>
                    <form action={declineProvider}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" style={{ fontSize: 13, padding: '8px 18px', borderRadius: 8, border: '1px solid #d4d2ca', background: 'white', color: '#991b1b', cursor: 'pointer', width: '100%' }}>Decline</button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#2c4d52', marginBottom: 12 }}>All providers</h2>
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', overflow: 'hidden' }}>
          {providers && providers.length > 0 ? providers.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: i < providers.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <div>
                <span style={{ fontSize: 14, color: '#333' }}>{p.full_name}{p.credentials ? `, ${p.credentials}` : ''}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 6, background: p.vetting_status === 'approved' ? '#eaf3de' : p.vetting_status === 'pending' ? '#faeeda' : '#fcebeb', color: p.vetting_status === 'approved' ? '#27500a' : p.vetting_status === 'pending' ? '#633806' : '#791f1f' }}>
                {p.vetting_status}
              </span>
            </div>
          )) : (
            <p style={{ fontSize: 14, color: '#888', padding: 20 }}>No providers yet.</p>
          )}
        </div>
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e3dc', padding: 16 }}>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#2c4d52' }}>{value}</div>
    </div>
  )
}