import Link from 'next/link'
import LoginForm from '@/components/LoginForm'
import { BRAND } from '@/lib/brand'

export const metadata = { title: 'Provider sign in — Tidal Care Network' }

export default function LoginPage() {
  return (
    <LoginForm
      heading="Provider sign in"
      subtitle="Sign in to join or manage your provider profile"
      defaultNext="/dashboard"
      footer={
        <>
          Looking to save providers or build a shortlist?{' '}
          <Link href="/member-login" style={{ color: BRAND.teal, textDecoration: 'none', fontWeight: 500 }}>Member sign in</Link>
        </>
      }
    />
  )
}
