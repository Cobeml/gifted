import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
});

export async function createPaymentIntent(amount: number, metadata: Record<string, string> = {}) {
  return stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata,
  });
}

export async function createSubscription(customerId: string, priceId: string) {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId);
}

export async function updateSubscription(subscriptionId: string, priceId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    items: [{ price: priceId }],
  });
}

export async function createCustomer(email: string, name?: string) {
  return stripe.customers.create({
    email,
    name,
  });
}

export async function retrieveCustomer(customerId: string) {
  return stripe.customers.retrieve(customerId);
}

export async function listSubscriptions(customerId: string) {
  return stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
  });
}

// Price IDs for our subscription tiers
export const SUBSCRIPTION_PRICES = {
  SINGLE_GIFT: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SINGLE_GIFT,
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SINGLE_GIFT,
  },
  QUARTERLY: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_QUARTERLY,
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_QUARTERLY_ANNUAL,
  },
  LUXURY: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_LUXURY,
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_LUXURY_ANNUAL,
  },
} as const; 