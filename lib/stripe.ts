import Stripe from 'stripe'

// Server-side Stripe client. The secret key lives only in env (Vercel), never in code.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
})

// Price IDs for the two Premium plans (TEST mode values).
// When you switch to live mode, replace these with the live price_… IDs.
export const PRICE_MONTHLY = 'price_1TeIe0CXYW3pDzuWGdbfjRZ2' // $5/mo
export const PRICE_YEARLY = 'price_1TeIe0CXYW3pDzuW8W1pStyH'  // $50/yr

// Map a plan key to its price ID + the cents we store for grandfathering.
export function planFor(key: string): { price: string; cents: number; interval: 'month' | 'year' } | null {
  if (key === 'monthly') return { price: PRICE_MONTHLY, cents: 500, interval: 'month' }
  if (key === 'yearly') return { price: PRICE_YEARLY, cents: 5000, interval: 'year' }
  return null
}

// Reverse lookup: given a Stripe price ID, return the cents/interval we store.
export function priceMeta(priceId: string | null | undefined): { cents: number; interval: 'month' | 'year' } | null {
  if (priceId === PRICE_MONTHLY) return { cents: 500, interval: 'month' }
  if (priceId === PRICE_YEARLY) return { cents: 5000, interval: 'year' }
  return null
}
