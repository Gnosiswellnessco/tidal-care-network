import { redirect } from 'next/navigation'

// Referrals are now created from "My preferred referral sources" in the dashboard.
// This page used to host the standalone referral form; it now redirects there.
export default function ReferPage() {
  redirect('/dashboard')
}
