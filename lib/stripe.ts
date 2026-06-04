import Stripe from 'stripe'

// Lazily create the Stripe client so importing this file never throws at build time
// (the secret key is only present at runtime on Vercel, not during the build).
let _stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(key, { apiVersion: '2026-05-27.dahlia' })
  }
  return _stripe
}

// Price IDs for the two Premium plans (TEST mode values).
// When you switch to live mode, replace these with the live price_… IDs.
export const PRICE_MONTHLY = 'price_1TeMc7CXYW3pDzuWY3A45I2l' // $5/mo
export const PRICE_YEARLY = 'price_1TeMc7CXYW3pDzuWY5E5b85l'  // $50/yr

export function planFor(key: string): { price: string; cents: number; interval: 'month' | 'year' } | null {
  if (key === 'monthly') return { price: PRICE_MONTHLY, cents: 500, interval: 'month' }
  if (key === 'yearly') return { price: PRICE_YEARLY, cents: 5000, interval: 'year' }
  return null
}

export function priceMeta(priceId: string | null | undefined): { cents: number; interval: 'month' | 'year' } | null {
  if (priceId === PRICE_MONTHLY) return { cents: 500, interval: 'month' }
  if (priceId === PRICE_YEARLY) return { cents: 5000, interval: 'year' }
  return null
}
