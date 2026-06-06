// Shared premium / subscription helpers.
// One source of truth so every gate (dashboard, profile, directory card) agrees.

export type SubscriptionFields = {
  is_premium?: boolean | null
  comped_premium?: boolean | null
  subscription_status?: string | null
  subscription_interval?: string | null
  subscription_price_cents?: number | null
  subscription_renews_at?: string | null
}

// A provider counts as premium if the flag is on AND the status isn't a dead state.
// While Stripe is not yet wired, you can simply set is_premium = true in Supabase to test.
export function isPremium(p: SubscriptionFields | null | undefined): boolean {
  if (!p) return false
  // Admin-granted complimentary premium (e.g. veteran-serving orgs) — always on,
  // independent of Stripe.
  if (p.comped_premium) return true
  if (!p.is_premium) return false
  const status = p.subscription_status || 'none'
  // 'canceled' here means fully ended; a Stripe "cancel at period end" should keep
  // is_premium true until the period actually lapses, so we honor the flag.
  return status !== 'canceled'
}

// Should the supporter badge be shown publicly?
// Must be premium AND the provider opted to display it.
export function showsSupporterBadge(
  p: (SubscriptionFields & { show_supporter_badge?: boolean | null }) | null | undefined
): boolean {
  return isPremium(p) && !!p?.show_supporter_badge
}

// Does this provider have a usable booking action configured? (premium only)
export function hasBooking(
  p: (SubscriptionFields & { booking_type?: string | null; booking_value?: string | null }) | null | undefined
): boolean {
  if (!isPremium(p)) return false
  const t = p?.booking_type
  const v = (p?.booking_value || '').trim()
  return (t === 'phone' || t === 'link') && v.length > 0
}

// Build the booking button's label + href from the stored type/value.
export function bookingAction(
  p: { booking_type?: string | null; booking_value?: string | null } | null | undefined
): { label: string; href: string } | null {
  const t = p?.booking_type
  const v = (p?.booking_value || '').trim()
  if (!v) return null
  if (t === 'phone') {
    const tel = v.replace(/[^\d+]/g, '')
    return { label: 'Call to book', href: `tel:${tel}` }
  }
  if (t === 'link') {
    const href = v.startsWith('http') ? v : `https://${v}`
    return { label: 'Book online', href }
  }
  return null
}

// Human price label from cents + interval (uses the grandfathered price stored on the row).
export function priceLabel(p: SubscriptionFields | null | undefined): string {
  const cents = p?.subscription_price_cents
  if (cents == null) return ''
  const dollars = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)
  const per = p?.subscription_interval === 'year' ? 'yr' : p?.subscription_interval === 'month' ? 'mo' : ''
  return per ? `$${dollars}/${per}` : `$${dollars}`
}

// Premium brand accent — champagne taupe.
export const PREMIUM_ACCENT = '#b5aa8e'
export const PREMIUM_ACCENT_DARK = '#7d7256'
export const PREMIUM_TINT = '#efe9dc'
