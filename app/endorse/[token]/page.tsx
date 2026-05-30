import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

async function confirm(formData: FormData) {
  'use server'
  const token = formData.get('token') as string
  const decision = formData.get('decision') as string
  const admin = createAdminClient()
  await admin.from('endorsements')
    .update({ status: decision === 'confirm' ? 'confirmed' : 'declined', confirmed_at: new Date().toISOString() })
    .eq('confirm_token', token)
  revalidatePath(`/endorse/${token}`)
}

export default async function EndorsePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  const { data: e } = await supabase
    .from('endorsements')
    .select('*, providers(full_name, credentials, practice_name)')
    .eq('confirm_token', token)
    .maybeSingle()

  if (!e) notFound()
  const provider = Array.isArray(e.providers) ? e.providers[0] : e.providers
  const providerName = `${provider?.full_name || 'A colleague'}${provider?.credentials ? ', ' + provider.credentials : ''}`

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f7f6f2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 16, maxWidth: 460, padding: 36, textAlign: 'center', border: '1px solid #e5e3dc' }}>
        <img src="/logo.svg" alt="Tidal Care Network" style={{ height: 48, width: 'auto', marginBottom: 20 }} />
        {e.status === 'pending' ? (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2c4d52', marginBottom: 12 }}>Endorse {provider?.full_name}?</h1>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.6, marginBottom: 16 }}>
              <strong>{providerName}</strong>{provider?.practice_name ? ` of ${provider.practice_name}` : ''} has asked you to endorse them as a professional colleague on Tidal Care Network.
            </p>
            <div style={{ textAlign: 'left', background: '#e8eff0', borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: '#2c4d52', lineHeight: 1.6, margin: 0 }}>
                By endorsing this provider, I affirm that I know them professionally and that, to the best of my knowledge, they abide by the ethical standards of their profession, are competent in their area of practice, and that I know of no reason clients should not be referred to them.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <form action={confirm}>
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="decision" value="confirm" />
                <button type="submit" style={{ fontSize: 14, fontWeight: 500, padding: '11px 22px', borderRadius: 8, border: 'none', background: '#3e6a70', color: 'white', cursor: 'pointer' }}>Yes, I endorse them</button>
              </form>
              <form action={confirm}>
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="decision" value="decline" />
                <button type="submit" style={{ fontSize: 14, padding: '11px 22px', borderRadius: 8, border: '1px solid #d4d2ca', background: 'white', color: '#777', cursor: 'pointer' }}>Decline</button>
              </form>
            </div>
          </>
        ) : e.status === 'confirmed' ? (
          <>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2c4d52', marginBottom: 12 }}>Thank you</h1>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.6 }}>Your endorsement of {provider?.full_name} has been recorded. Thank you for supporting your colleague and the network.</p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2c4d52', marginBottom: 12 }}>Endorsement declined</h1>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.6 }}>You've declined this endorsement request. No further action is needed.</p>
          </>
        )}
      </div>
    </main>
  )
}