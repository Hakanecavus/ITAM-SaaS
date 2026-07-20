import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is missing. Stripe integrations will fail.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fallback', {
  apiVersion: '2026-06-24.dahlia',
  appInfo: {
    name: 'ITAM SaaS',
    version: '1.0.0',
  },
});
