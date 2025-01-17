import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
});

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        await handlePaymentSuccess(event.data.object);
        break;
      case 'customer.subscription.created':
        // Handle subscription creation
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        // Handle subscription updates
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        await handleSubscriptionCancelled(event.data.object);
        break;
    }

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: 'Webhook handler failed' }),
      { status: 400 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  // TODO: Implement payment success logic
  // - Update order status
  // - Send confirmation email
  // - Update user credits/status
  console.log('Payment succeeded:', paymentIntent.id);
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  // TODO: Implement subscription creation logic
  // - Update user subscription status
  // - Add subscription benefits
  // - Send welcome email
  console.log('Subscription created:', subscription.id);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // TODO: Implement subscription update logic
  // - Update user benefits
  // - Handle plan changes
  // - Send notification email
  console.log('Subscription updated:', subscription.id);
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  // TODO: Implement subscription cancellation logic
  // - Update user status
  // - Remove benefits
  // - Send feedback survey
  console.log('Subscription cancelled:', subscription.id);
} 