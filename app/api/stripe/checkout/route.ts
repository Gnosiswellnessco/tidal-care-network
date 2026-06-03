import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe, planFor } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const { plan } = await request.json()
    const chosen = planFor(plan)
    if (!chosen) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    // Who is this?
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    // Find their provider record
    const admin = createAdminClient()
    const { data: provider } = await admin
      .from('providers')
      .select('id, full_name, email, stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (!provider) return NextResponse.json({ error: 'No provider profile' }, { status: 400 })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tidalcare.org'

    // Reuse an existing Stripe customer if we have one, else let Checkout create one.
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: chosen.price, quantity: 1 }],
      ...(provider.stripe_customer_id
        ? { customer: provider.stripe_customer_id }
        : { customer_email: provider.email || user.email || undefined }),
      // Pass our provider id through so the webhook knows who paid.
      client_reference_id: provider.id,
      subscription_data: {
        metadata: { provider_id: provider.id },
      },
      metadata: { provider_id: provider.id },
      success_url: `${siteUrl}/dashboard/premium?upgraded=1`,
      cancel_url: `${siteUrl}/dashboard/premium?canceled=1`,
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('checkout error', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
