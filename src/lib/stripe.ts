import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Warning: STRIPE_SECRET_KEY is not defined in environment variables.');
}

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2023-10-16' as any,
});
