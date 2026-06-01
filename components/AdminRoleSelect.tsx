'use client'

type Props = {
  email: string
  role: string
  allowOwner: boolean
  action: (formData: FormData) => void
}

const selectStyle: React.CSSProperties = {
  fontSize: 13, padding: '6px 30px 6px 10px', border: '1px solid #d4d2ca', borderRadius: 8, color: '#1a1a1a', background: 'white',
  appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%233e6a70' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 11px center', cursor: 'pointer',
}

export default function AdminRoleSelect({ email, role, allowOwner, action }: Props) {
  return (
    <form action={action}>
      <input type="hidden" name="email" value={email} />
      <select
        name="role"
        defaultValue={role}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        style={selectStyle}
      >
        <option value="admin">Admin</option>
        <option value="super_admin">Super admin</option>
        {allowOwner && <option value="owner">Owner</option>}
      </select>
    </form>
  )
}
