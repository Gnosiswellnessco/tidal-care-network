'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Credential = {
  id: string
  kind: string
  label: string | null
  file_name: string | null
  expiration_date: string | null
}

type Props = {
  vettingStatus: string | null
  listingStatus: string | null
  reasonCode: string | null
  statusNote: string | null
  isSelfPaused: boolean
  lastCertifiedAt: string | null
  credentials: Credential[]
}

const ADMIN_EMAIL = 'info@tidalcare.org'

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - startOfToday().getTime()) / 86400000)
}
function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}
function credName(c: Credential) {
  return c.label || c.file_name || (c.kind === 'license' ? 'License' : 'Certification')
}
function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

// Map an admin reason code to a provider-facing fix action.
function fixFor(reason: string | null): { label: string; href: string; external?: boolean } | null {
  switch (reason) {
    case 'credential_expired':
      return { label: 'Update credential', href: '/dashboard/edit' }
    case 'out_of_date':
      return { label: 'Review & update your info', href: '/dashboard/edit' }
    case 'incomplete_profile':
      return { label: 'Complete your profile', href: '/dashboard/edit' }
    case 'attestation_issue':
      return { label: 'Contact the Network', href: `mailto:${ADMIN_EMAIL}`, external: true }
    case 'conduct_review':
    case 'other':
    default:
      return { label: 'Contact the Network', href: `mailto:${ADMIN_EMAIL}`, external: true }
  }
}

const TONE = {
  red:   { bg: '#fcf0ee', border: '#e6b9b1', bar: '#c0492f', text: '#8a2c1a' },
  amber: { bg: '#fdf6e7', border: '#ecd9a6', bar: '#cf9a1f', text: '#7a5a08' },
  green: { bg: '#eef5ef', border: '#cfe3d2', bar: '#5a9b6b', text: '#2f5d3c' },
  blue:  { bg: '#eef3f4', border: '#cfe0e1', bar: '#3e6a70', text: '#234c50' },
}

function Banner({
  tone, title, children, action,
}: {
  tone: keyof typeof TONE
  title: string
  children?: React.ReactNode
  action?: React.ReactNode
}) {
  const t = TONE[tone]
  return (
    <div style={{ display: 'flex', gap: 14, background: t.bg, border: '1px solid ' + t.border, borderLeft: '4px solid ' + t.bar, borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: children ? 4 : 0 }}>{title}</div>
        {children && <div style={{ fontSize: 13, color: '#4a5557', lineHeight: 1.6 }}>{children}</div>}
      </div>
      {action && <div style={{ flexShrink: 0, alignSelf: 'center' }}>{action}</div>}
    </div>
  )
}

function btnStyle(filled: boolean, color = '#3e6a70'): React.CSSProperties {
  return {
    display: 'inline-block', fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
    textDecoration: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
    color: filled ? 'white' : color, background: filled ? color : 'white', border: '1px solid ' + color,
  }
}

export default function AccountStatusBanner(props: Props) {
  const { vettingStatus, listingStatus, reasonCode, statusNote, isSelfPaused, lastCertifiedAt, credentials } = props
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function act(action: 'pause' | 'unpause' | 'certify') {
    setBusy(true)
    try {
      const res = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const approved = vettingStatus === 'approved'
  const hidden = listingStatus === 'hidden'

  const expired = credentials.filter((c) => c.expiration_date && daysUntil(c.expiration_date) < 0)
  const expiringSoon = credentials.filter((c) => {
    if (!c.expiration_date) return false
    const d = daysUntil(c.expiration_date)
    return d >= 0 && d <= 30
  })
  const certifyDue = !lastCertifiedAt || daysSince(lastCertifiedAt) > 30

  // ---- HIDDEN (highest priority) ----
  if (hidden) {
    const fix = fixFor(reasonCode)
    const action = fix && (
      fix.external
        ? <a href={fix.href} style={btnStyle(true, '#c0492f')}>{fix.label}</a>
        : <Link href={fix.href} style={btnStyle(true, '#c0492f')}>{fix.label}</Link>
    )
    return (
      <Banner tone="red" title="Your profile is currently hidden" action={action}>
        {statusNote || 'Your listing has been hidden and is not visible in the directory.'}
        {reasonCode === 'credential_expired' && expired.length > 0 && (
          <div style={{ marginTop: 6 }}>
            Expired: {expired.map((c) => `${credName(c)} (${fmt(c.expiration_date!)})`).join(', ')}.
          </div>
        )}
      </Banner>
    )
  }

  // ---- NOT YET APPROVED ----
  if (!approved) {
    const map: Record<string, string> = {
      pending_review: 'Your application is under review. We’ll email you when it’s approved.',
      awaiting_attestation: 'We’re waiting on your professional attestor to complete their form.',
      draft: 'Your application isn’t finished yet.',
    }
    const msg = map[vettingStatus || ''] || 'Your application is being processed.'
    return <Banner tone="blue" title="Application in progress">{msg}</Banner>
  }

  // ---- APPROVED: live / paused + maintenance nudges ----
  return (
    <>
      {isSelfPaused ? (
        <Banner
          tone="amber"
          title="You’ve paused your listing"
          action={<button disabled={busy} onClick={() => act('unpause')} style={{ ...btnStyle(true), opacity: busy ? 0.6 : 1, border: 'none' }}>Make visible again</button>}
        >
          Your profile is hidden from the directory until you turn it back on. This is your own pause — you can lift it anytime.
        </Banner>
      ) : (
        <Banner
          tone="green"
          title="Your profile is live"
          action={<button disabled={busy} onClick={() => act('pause')} style={{ ...btnStyle(false), opacity: busy ? 0.6 : 1 }}>Pause my listing</button>}
        >
          You’re visible in the directory and accepting connections.
        </Banner>
      )}

      {expiringSoon.length > 0 && (
        <Banner
          tone="amber"
          title="A credential is expiring soon"
          action={<Link href="/dashboard/edit" style={btnStyle(true, '#cf9a1f')}>Update credential</Link>}
        >
          {expiringSoon.map((c) => `${credName(c)} expires ${fmt(c.expiration_date!)} (${daysUntil(c.expiration_date!)} days)`).join(' · ')}.
          {expiringSoon.some((c) => c.kind === 'license') && ' A license that lapses will hide your listing automatically until updated.'}
        </Banner>
      )}

      {certifyDue && (
        <Banner
          tone="blue"
          title="Confirm your profile is current"
          action={<button disabled={busy} onClick={() => act('certify')} style={{ ...btnStyle(true), opacity: busy ? 0.6 : 1, border: 'none' }}>Yes, it’s current</button>}
        >
          {lastCertifiedAt
            ? `Last confirmed ${fmt(lastCertifiedAt)}. A quick monthly check keeps the directory trustworthy.`
            : 'Take a moment to confirm your information is up to date. We’ll ask again monthly.'}
        </Banner>
      )}
    </>
  )
}
