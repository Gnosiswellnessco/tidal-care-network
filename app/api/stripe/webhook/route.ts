import { NextResponse } from 'next/server'
import { getStripe, priceMeta } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

// Stripe needs the raw, unparsed body to verify the signature.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const stripe = getStripe()

  if (!sig || !secret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret)
  } catch (err) {
    console.error('Webhook signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Resolve our provider id from event metadata (or via the Stripe customer id).
  async function providerIdFromCustomer(customerId: string | null): Promise<string | null> {
    if (!customerId) return null
    const { data } = await admin.from('providers').select('id').eq('stripe_customer_id', customerId).maybeSingle()
    return data?.id || null
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const providerId = (session.metadata?.provider_id as string) || session.client_reference_id || null
        const customerId = typeof session.customer === 'string' ? session.customer : null
        const subId = typeof session.subscription === 'string' ? session.subscription : null

        if (providerId && subId) {
          // Pull the subscription to learn the price + period end.
          const sub = await stripe.subscriptions.retrieve(subId) as unknown as Stripe.Subscription
          const priceId = sub.items.data[0]?.price?.id || null
          const meta = priceMeta(priceId)
          const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end
          const renews = periodEnd ? new Date(periodEnd * 1000).toISOString() : null

          await admin.from('providers').update({
            is_premium: true,
            subscription_status: 'active',
            subscription_interval: meta?.interval || null,
            subscription_price_cents: meta?.cents || null,
            subscription_started_at: new Date().toISOString(),
            subscription_renews_at: renews,
            stripe_customer_id: customerId,
            stripe_subscription_id: subId,
          }).eq('id', providerId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : null
        const providerId = (sub.metadata?.provider_id as string) || await providerIdFromCustomer(customerId)
        if (providerId) {
          const priceId = sub.items.data[0]?.price?.id || null
          const meta = priceMeta(priceId)
          const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end
          const renews = periodEnd ? new Date(periodEnd * 1000).toISOString() : null
          // active or trialing => premium on; past_due/unpaid/canceled => keep flag but reflect status
          const active = sub.status === 'active' || sub.status === 'trialing'
          await admin.from('providers').update({
            is_premium: active,
            subscription_status: sub.status,
            subscription_interval: meta?.interval || null,
            subscription_price_cents: meta?.cents || null,
            subscription_renews_at: renews,
            stripe_subscription_id: sub.id,
            stripe_customer_id: customerId,
          }).eq('id', providerId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : null
        const providerId = (sub.metadata?.provider_id as string) || await providerIdFromCustomer(customerId)
        if (providerId) {
          await admin.from('providers').update({
            is_premium: false,
            subscription_status: 'canceled',
          }).eq('id', providerId)
        }
        break
      }

      default:
        // ignore other events
        break
    }
  } catch (err) {
    console.error('Webhook handler error', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
