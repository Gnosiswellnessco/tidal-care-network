import Link from 'next/link'
import LoginForm from '@/components/LoginForm'
import { BRAND } from '@/lib/brand'

export const metadata = { title: 'Member sign in — Tidal Care Network' }

export default function MemberLoginPage() {
  return (
    <LoginForm
      heading="Welcome to Tidal Care Network"
      subtitle="Sign in to save providers, build your shortlist, and keep track of the care that fits you."
      defaultNext="/saved"
      footer={
        <>
          Are you a provider?{' '}
          <Link href="/login" style={{ color: BRAND.teal, textDecoration: 'none', fontWeight: 500 }}>Provider sign in</Link>
        </>
      }
    />
  )
}
