import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { getAdminInfo, OWNER_EMAIL, type AdminRole } from '@/lib/admin-auth'
import AdminRoleSelect from '@/components/AdminRoleSelect'

export const dynamic = 'force-dynamic'

async function approveProvider(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const admin = createAdminClient()
  await admin.from('providers').update({ vetting_status: 'approved' }).eq('id', id)
  revalidatePath('/admin')
}

async function approveWithOverride(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const admin = createAdminClient()
  await admin.from('providers').update({ vetting_status: 'approved', admin_override: true }).eq('id', id)
  revalidatePath('/admin')
}

async function declineProvider(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const admin = createAdminClient()
  await admin.from('providers').update({ vetting_status: 'removed', is_active: false }).eq('id', id)
  revalidatePath('/admin')
}

async function approveTagRequest(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const providerId = formData.get('provider_id') as string
  const category = formData.get('category') as string
  const section = (formData.get('section') as string) || 'General'
  const tag = formData.get('tag') as string
  const admin = createAdminClient()
  await admin.from('taxonomy_tags').upsert(
    { category, section, tag_value: tag, is_approved: true },
    { onConflict: 'category,section,tag_value' }
  )
  if (providerId) {
    await admin.from('provider_tags').insert({ provider_id: providerId, tag_type: category, tag_value: tag })
  }
  await admin.from('tag_requests').update({ status: 'approved' }).eq('id', id)
  revalidatePath('/admin')
}

async function declineTagRequest(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const admin = createAdminClient()
  await admin.from('tag_requests').update({ status: 'declined' }).eq('id', id)
  revalidatePath('/admin')
}

async function addAdmin(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const me = await getAdminInfo(user?.email)
  if (!me.canManageAdmins) return

  const email = ((formData.get('email') as string) || '').trim().toLowerCase()
  const role = (formData.get('role') as string) || 'admin'
  if (!email) return
  const safeRole: AdminRole = role === 'owner' && !me.isOwner ? 'super_admin' : (role as AdminRole)

  const admin = createAdminClient()
  await admin.from('admins').upsert(
    { email, role: safeRole, added_by: user?.email || 'unknown' },
    { onConflict: 'email' }
  )
  revalidatePath('/admin')
}

async function removeAdmin(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const me = await getAdminInfo(user?.email)
  if (!me.canManageAdmins) return

  const email = ((formData.get('email') as string) || '').trim().toLowerCase()
  if (!email) return
  if (email === OWNER_EMAIL.toLowerCase()) return

  const admin = createAdminClient()
  const { data: target } = await admin.from('admins').select('role').eq('email', email).maybeSingle()
  if (target?.role === 'owner' && !me.isOwner) return

  await admin.from('admins').delete().eq('email', email)
  revalidatePath('/admin')
}

async function changeAdminRole(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const me = await getAdminInfo(user?.email)
  if (!me.canManageAdmins) return

  const email = ((formData.get('email') as string) || '').trim().toLowerCase()
  const role = (formData.get('role') as string) || 'admin'
  if (!email) return
  if (email === OWNER_EMAIL.toLowerCase()) return

  const admin = createAdminClient()
  const { data: target } = await admin.from('admins').select('role').eq('email', email).maybeSingle()
  if (target?.role === 'owner' && !me.isOwner) return
  const safeRole: AdminRole = role === 'owner' && !me.isOwner ? 'super_admin' : (role as AdminRole)

  await admin.from('admins').update({ role: safeRole }).eq('email', email)
  revalidatePath('/admin')
}

type CredFile = { file_name: string | null; signedUrl: string | null; kind: string }
type EndoInfo = { hasConfirmed: boolean; pendingCount: number; endorserEmail: string | null }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const me = await getAdminInfo(user?.email)

  if (!me.isAdmin) {
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

  // --- Vetting data for pending applicants: credential files (signed) + endorsement status ---
  const pendingIds = pending.map((p) => p.id)
  const credsByProvider = new Map<string, CredFile[]>()
  const endoByProvider = new Map<string, EndoInfo>()

  if (pendingIds.length > 0) {
    const { data: creds } = await admin
      .from('provider_credentials')
      .select('provider_id, file_path, file_name, kind')
      .in('provider_id', pendingIds)

    for (const c of creds || []) {
      let signedUrl: string | null = null
      try {
        const { data: signed } = await admin.storage
          .from('provider-credentials')
          .createSignedUrl(c.file_path, 600) // valid 10 minutes
        signedUrl = signed?.signedUrl || null
      } catch {}
      const arr = credsByProvider.get(c.provider_id) || []
      arr.push({ file_name: c.file_name, signedUrl, kind: c.kind })
      credsByProvider.set(c.provider_id, arr)
    }

    const { data: endos } = await admin
      .from('endorsements')
      .select('provider_id, status, endorser_email')
      .in('provider_id', pendingIds)

    for (const e of endos || []) {
      const cur = endoByProvider.get(e.provider_id) || { hasConfirmed: false, pendingCount: 0, endorserEmail: null }
      if (e.status === 'confirmed') cur.hasConfirmed = true
      else cur.pendingCount += 1
      if (!cur.endorserEmail) cur.endorserEmail = e.endorser_email
      endoByProvider.set(e.provider_id, cur)
    }
  }

  const { data: tagReqs } = await admin
    .from('tag_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const providerNameById = new Map((providers || []).map((p) => [p.id, p.full_name]))

  let adminsList: { email: string; role: string; added_by: string | null }[] = []
  if (me.canManageAdmins) {
    const { data: rows } = await admin.from('admins').select('email, role, added_by').order('created_at', { ascending: true })
    adminsList = rows || []
    if (!adminsList.some((a) => a.email.toLowerCase() === OWNER_EMAIL.toLowerCase())) {
      adminsList = [{ email: OWNER_EMAIL, role: 'owner', added_by: 'system' }, ...adminsList]
    }
  }

  const roleLabel: Record<string, string> = { owner: 'Owner', super_admin: 'Super admin', admin: 'Admin' }
  const roleColor: Record<string, { bg: string; fg: string }> = {
    owner: { bg: '#e8eff0', fg: '#2c4d52' },
    super_admin: { bg: '#eef0e0', fg: '#4a5520' },
    admin: { bg: '#f0eef9', fg: '#473b6b' },
  }

  const npiLabel: Record<string, { text: string; bg: string; fg: string }> = {
    match: { text: 'NPI verified', bg: '#eaf3de', fg: '#27500a' },
    found: { text: 'NPI found · name mismatch', bg: '#faeeda', fg: '#633806' },
    not_found: { text: 'NPI not found', bg: '#fcebeb', fg: '#791f1f' },
    invalid: { text: 'NPI invalid', bg: '#fcebeb', fg: '#791f1f' },
    error: { text: 'NPI check failed', bg: '#f0eded', fg: '#666' },
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f7f6f2' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', maxWidth: 1000, margin: '0 auto' }}>
        <Link href="/"><img src="/tidal-care-network.svg" alt="Tidal Care Network" style={{ height: 180, width: 'auto' }} /></Link>
        <span style={{ fontSize: 13, color: '#888' }}>Admin · {user?.email}{me.role ? ` · ${roleLabel[me.role]}` : ''}</span>
      </header>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 40px 64px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#2c4d52', marginBottom: 20 }}>Admin dashboard</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
          <Stat label="Pending review" value={pending.length} />
          <Stat label="Approved" value={approved.length} />
          <Stat label="Tag requests" value={tagReqs?.length || 0} />
          <Stat label="Total" value={total} />
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#2c4d52', marginBottom: 12 }}>Pending applications</h2>
        {pending.length === 0 ? (
          <p style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>No pending applications right now.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {pending.map((p) => {
              const isLicensed = p.credential_type === 'State license'
              const endo = endoByProvider.get(p.id)
              const hasConfirmedEndo = endo?.hasConfirmed || false
              // Cert-holders need a confirmed endorsement before normal approval
              const endorsementRequired = !p.is_org && !isLicensed
              const canApproveNormally = !endorsementRequired || hasConfirmedEndo
              const files = credsByProvider.get(p.id) || []
              const npi = p.npi_verified_status ? npiLabel[p.npi_verified_status] : null
              return (
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

                      {/* Credential summary */}
                      <div style={{ marginTop: 10, padding: 12, background: '#faf9f5', borderRadius: 8, border: '1px solid #eee' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Credentials</div>
                        <div style={{ fontSize: 13, color: '#444' }}>
                          Type: <strong>{p.credential_type || '—'}</strong>
                          {p.license_number ? ` · No. ${p.license_number}` : ''}
                          {p.issuing_body ? ` · ${p.issuing_body}` : ''}
                        </div>
                        {p.npi_number && (
                          <div style={{ fontSize: 13, color: '#444', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            NPI: {p.npi_number}
                            {npi && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: npi.bg, color: npi.fg }}>{npi.text}</span>}
                            {p.npi_registry_name && <span style={{ fontSize: 12, color: '#888' }}>({p.npi_registry_name})</span>}
                          </div>
                        )}

                        {/* Uploaded files */}
                        <div style={{ marginTop: 8 }}>
                          {files.length === 0 ? (
                            <span style={{ fontSize: 12, color: '#b3504f' }}>No credential files uploaded.</span>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {files.map((f, i) => (
                                f.signedUrl ? (
                                  <a key={i} href={f.signedUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 500, padding: '5px 11px', borderRadius: 8, background: '#e8eff0', color: '#2c4d52', textDecoration: 'none' }}>
                                    📄 {f.file_name || 'file'} · {f.kind === 'license' ? 'License' : 'Cert'}
                                  </a>
                                ) : (
                                  <span key={i} style={{ fontSize: 12, color: '#888' }}>{f.file_name || 'file'} (link unavailable)</span>
                                )
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Endorsement status (cert-holders) */}
                        {endorsementRequired && (
                          <div style={{ marginTop: 8, fontSize: 13 }}>
                            {hasConfirmedEndo ? (
                              <span style={{ fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#eaf3de', color: '#27500a', fontSize: 11 }}>✓ Endorsement confirmed</span>
                            ) : endo && endo.pendingCount > 0 ? (
                              <span style={{ color: '#633806' }}>⏳ Endorsement requested{endo.endorserEmail ? ` (${endo.endorserEmail})` : ''} — awaiting confirmation</span>
                            ) : (
                              <span style={{ color: '#b3504f' }}>No endorsement on file</span>
                            )}
                          </div>
                        )}
                      </div>

                      {p.bio && <p style={{ fontSize: 13, color: '#555', marginTop: 8, lineHeight: 1.5 }}>{p.bio}</p>}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 180 }}>
                      {canApproveNormally ? (
                        <form action={approveProvider}>
                          <input type="hidden" name="id" value={p.id} />
                          <button type="submit" style={{ fontSize: 13, fontWeight: 500, padding: '8px 18px', borderRadius: 8, border: 'none', background: '#3e6a70', color: 'white', cursor: 'pointer', width: '100%' }}>Approve</button>
                        </form>
                      ) : (
                        <>
                          <button type="button" disabled title="A confirmed colleague endorsement is required before approval." style={{ fontSize: 13, fontWeight: 500, padding: '8px 18px', borderRadius: 8, border: 'none', background: '#cfd8d9', color: '#fff', cursor: 'not-allowed', width: '100%' }}>Approve (endorsement needed)</button>
                          <form action={approveWithOverride}>
                            <input type="hidden" name="id" value={p.id} />
                            <button type="submit" style={{ fontSize: 12, fontWeight: 500, padding: '7px 18px', borderRadius: 8, border: '1px solid #b3504f', background: 'white', color: '#b3504f', cursor: 'pointer', width: '100%' }}>Override &amp; approve</button>
                          </form>
                        </>
                      )}
                      <form action={declineProvider}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" style={{ fontSize: 13, padding: '8px 18px', borderRadius: 8, border: '1px solid #d4d2ca', background: 'white', color: '#991b1b', cursor: 'pointer', width: '100%' }}>Decline</button>
                      </form>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#2c4d52', marginBottom: 12 }}>Pending tag requests</h2>
        {!tagReqs || tagReqs.length === 0 ? (
          <p style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>No tag requests right now.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {tagReqs.map((t) => (
              <div key={t.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#2c4d52' }}>“{t.requested_tag}”</div>
                    <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                      Requested by {providerNameById.get(t.provider_id) || 'Unknown provider'}
                    </div>
                    <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
                      Category: {t.category}{t.section ? ` · Section: ${t.section}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <form action={approveTagRequest}>
                      <input type="hidden" name="id" value={t.id} />
                      <input type="hidden" name="provider_id" value={t.provider_id} />
                      <input type="hidden" name="category" value={t.category} />
                      <input type="hidden" name="section" value={t.section || ''} />
                      <input type="hidden" name="tag" value={t.requested_tag} />
                      <button type="submit" style={{ fontSize: 13, fontWeight: 500, padding: '8px 18px', borderRadius: 8, border: 'none', background: '#3e6a70', color: 'white', cursor: 'pointer', width: '100%' }}>Approve</button>
                    </form>
                    <form action={declineTagRequest}>
                      <input type="hidden" name="id" value={t.id} />
                      <button type="submit" style={{ fontSize: 13, padding: '8px 18px', borderRadius: 8, border: '1px solid #d4d2ca', background: 'white', color: '#991b1b', cursor: 'pointer', width: '100%' }}>Decline</button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {me.canManageAdmins && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#2c4d52', marginBottom: 12 }}>Manage admins</h2>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', padding: 20, marginBottom: 32 }}>
              <form action={addAdmin} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
                <input name="email" type="email" required placeholder="email@example.com" style={{ flex: '1 1 220px', padding: '9px 12px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, color: '#1a1a1a', background: 'white' }} />
                <select name="role" defaultValue="admin" style={selectStyle}>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super admin</option>
                  {me.isOwner && <option value="owner">Owner</option>}
                </select>
                <button type="submit" style={{ fontSize: 13, fontWeight: 500, padding: '9px 18px', borderRadius: 8, border: 'none', background: '#3e6a70', color: 'white', cursor: 'pointer' }}>Add admin</button>
              </form>
              <p style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.5 }}>
                Admins can review applications and tag requests. Super admins can also manage other admins. Anyone you add will have access the next time they log in with that email.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {adminsList.map((a) => {
                  const c = roleColor[a.role] || roleColor.admin
                  const isOwnerRow = a.email.toLowerCase() === OWNER_EMAIL.toLowerCase()
                  return (
                    <div key={a.email} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#faf9f5', borderRadius: 8, border: '1px solid #eee', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, color: '#333' }}>{a.email}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 99, background: c.bg, color: c.fg }}>{roleLabel[a.role] || a.role}</span>
                      </div>
                      {isOwnerRow ? (
                        <span style={{ fontSize: 12, color: '#aaa' }}>Permanent</span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <AdminRoleSelect email={a.email} role={a.role} allowOwner={me.isOwner} action={changeAdminRole} />
                          <form action={removeAdmin}>
                            <input type="hidden" name="email" value={a.email} />
                            <button type="submit" style={{ fontSize: 12, color: '#991b1b', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                          </form>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#2c4d52', marginBottom: 12 }}>All providers</h2>
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', overflow: 'hidden' }}>
          {providers && providers.length > 0 ? providers.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: i < providers.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <div>
                <span style={{ fontSize: 14, color: '#333' }}>{p.full_name}{p.credentials ? `, ${p.credentials}` : ''}</span>
                {p.admin_override && <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 99, background: '#f7ece2', color: '#b3504f', marginLeft: 8 }}>override</span>}
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

const selectStyle: React.CSSProperties = {
  padding: '9px 34px 9px 12px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, color: '#1a1a1a', background: 'white',
  appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%233e6a70' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 11px center', cursor: 'pointer',
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e5e3dc', padding: 16 }}>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#2c4d52' }}>{value}</div>
    </div>
  )
}
