// Stripe temporarily disabled for demo mode
// import Stripe from 'stripe'
// import { loadStripe } from '@stripe/stripe-js'

// Mock Stripe client to prevent initialization errors
export const stripe = {
  // Mock methods to prevent errors
  checkout: {
    sessions: {
      create: () => Promise.resolve({ url: null })
    }
  }
} as any

export const getStripe = () => {
  return Promise.resolve(null)
}

export const SUBSCRIPTION_PLANS = {
  pro: {
    name: 'Pro',
    price: 999, // $9.99 per month in cents
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      'Unlimited API calls',
      'Advanced tools',
      '10GB storage',
      'Priority support',
      'Export capabilities'
    ],
    limits: {
      apiCalls: -1, // unlimited
      storage: 10 * 1024 * 1024 * 1024 // 10GB in bytes
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 2999, // $29.99 per month in cents
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Custom integrations',
      '100GB storage',
      'Dedicated support',
      'SSO integration'
    ],
    limits: {
      apiCalls: -1, // unlimited
      storage: 100 * 1024 * 1024 * 1024 // 100GB in bytes
    }
  }
} as const

export const FREE_PLAN_LIMITS = {
  apiCalls: 100, // per month
  storage: 100 * 1024 * 1024 // 100MB in bytes
}