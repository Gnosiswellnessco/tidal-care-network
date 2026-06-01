import { createAdminClient } from '@/lib/supabase/admin'

// The permanent owner — always recognized even if the admins table is empty,
// so you can never lock yourself out.
export const OWNER_EMAIL = 'info@tidalcare.org'

export type AdminRole = 'owner' | 'super_admin' | 'admin'

export type AdminInfo = {
  isAdmin: boolean
  role: AdminRole | null
  canManageAdmins: boolean // owner or super_admin
  isOwner: boolean
}

const NOT_ADMIN: AdminInfo = { isAdmin: false, role: null, canManageAdmins: false, isOwner: false }

// Given an email, return what kind of admin (if any) they are.
export async function getAdminInfo(email: string | null | undefined): Promise<AdminInfo> {
  if (!email) return NOT_ADMIN
  const normalized = email.trim().toLowerCase()

  // Hardcoded owner is always an owner, regardless of the table.
  if (normalized === OWNER_EMAIL.toLowerCase()) {
    return { isAdmin: true, role: 'owner', canManageAdmins: true, isOwner: true }
  }

  const admin = createAdminClient()
  const { data } = await admin.from('admins').select('role').eq('email', normalized).maybeSingle()
  if (!data) return NOT_ADMIN

  const role = data.role as AdminRole
  return {
    isAdmin: true,
    role,
    canManageAdmins: role === 'owner' || role === 'super_admin',
    isOwner: role === 'owner',
  }
}
