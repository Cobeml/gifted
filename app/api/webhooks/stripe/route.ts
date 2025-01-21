import { headers } from 'next/headers';
import Stripe from 'stripe';
import { 
  createPaymentRecord, 
  createSubscriptionRecord, 
  updateUserSubscription,
  setStripeCustomerId 
} from '@/utils/db/subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
});

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  // Debug logging
  console.log('Webhook received:', {
    hasSignature: !!signature,
    hasSecret: !!endpointSecret,
    bodyLength: body.length
  });

  let event: Stripe.Event;

  try {
    if (!signature) {
      console.error('No stripe signature found in request');
      return new Response(
        JSON.stringify({ error: 'No stripe signature found' }), 
        { status: 400 }
      );
    }

    if (!endpointSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }), 
        { status: 500 }
      );
    }
    
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    console.log('Webhook event constructed:', {
      type: event.type,
      id: event.id
    });
  } catch (err) {
    console.error('Webhook signature verification failed:', {
      error: err instanceof Error ? err.message : 'Unknown error',
      signature: signature.slice(0, 20) + '...'
    });
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), 
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Processing checkout.session.completed:', {
          sessionId: session.id,
          customerId: session.customer,
          mode: session.mode
        });
        
        // Retrieve customer to get metadata
        const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
        const userId = customer.metadata.userId;
        
        if (!userId) {
          console.error('No userId found in customer metadata:', {
            customerId: customer.id,
            email: customer.email
          });
          throw new Error('No userId found in customer metadata');
        }

        if (session.mode === 'subscription') {
          if (!session.subscription) {
            console.error('No subscription found in session:', {
              sessionId: session.id
            });
            throw new Error('No subscription found in session');
          }
          
          // Retrieve the subscription
          const subscription = await stripe.subscriptions.retrieve(
            typeof session.subscription === 'string' ? session.subscription : session.subscription.id
          );
          
          console.log('Processing subscription:', {
            subscriptionId: subscription.id,
            status: subscription.status,
            customerId: subscription.customer
          });
          
          await handleSubscriptionCreated(subscription);
        } else if (session.payment_intent) {
          // Handle one-time payment
          const paymentIntent = await stripe.paymentIntents.retrieve(
            typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id
          );
          
          console.log('Processing payment:', {
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount,
            status: paymentIntent.status
          });
          
          await handlePaymentSuccess(paymentIntent);
        }
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Processing ${event.type}:`, {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status
        });
        await handleSubscriptionUpdated(subscription);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Processing subscription cancellation:', {
          subscriptionId: subscription.id,
          customerId: subscription.customer
        });
        await handleSubscriptionCancelled(subscription);
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Processing successful payment:', {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          customerId: paymentIntent.customer
        });
        await handlePaymentSuccess(paymentIntent);
        break;
      }
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error('Error processing webhook:', {
      error: err instanceof Error ? err.message : 'Unknown error',
      type: err instanceof Error ? err.constructor.name : 'Unknown type',
      eventType: event.type
    });
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), 
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Creating subscription record:', {
    subscriptionId: subscription.id,
    customerId: subscription.customer
  });

  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  const userId = customer.metadata.userId;
  
  if (!userId) {
    console.error('No userId found in customer metadata:', {
      customerId: customer.id,
      email: customer.email
    });
    throw new Error('No userId found in customer metadata');
  }

  console.log('Processing subscription for user:', {
    userId,
    customerEmail: customer.email,
    subscriptionId: subscription.id
  });

  const status = subscription.status as 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid';
  
  // Get the price object to access its metadata
  const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
  const plan = price.metadata.plan || subscription.metadata.plan;
  
  if (!plan) {
    console.error('No plan found in price or subscription metadata:', {
      priceId: subscription.items.data[0].price.id,
      subscriptionId: subscription.id
    });
    throw new Error('No plan found in metadata');
  }

  const now = new Date().toISOString();

  // Create subscription record
  await createSubscriptionRecord({
    userId,
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    status,
    plan: plan as 'single_gift' | 'quarterly' | 'quarterly_luxury',
    priceId: subscription.items.data[0].price.id,
    quantity: subscription.items.data[0].quantity || 1,
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    createdAt: now,
    updatedAt: now,
  });

  // Update user subscription status
  await updateUserSubscription(userId, {
    id: subscription.id,
    status,
    plan: plan as 'single_gift' | 'quarterly' | 'quarterly_luxury',
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  console.log('Subscription record created successfully:', {
    subscriptionId: subscription.id,
    userId,
    status,
    plan
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Updating subscription:', {
    subscriptionId: subscription.id,
    customerId: subscription.customer
  });

  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  const userId = customer.metadata.userId;
  
  if (!userId) {
    throw new Error('No userId found in customer metadata');
  }

  const status = subscription.status as 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid';
  
  // Get the price object to access its metadata
  const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
  const plan = price.metadata.plan || subscription.metadata.plan;
  
  if (!plan) {
    console.error('No plan found in price or subscription metadata:', {
      priceId: subscription.items.data[0].price.id,
      subscriptionId: subscription.id
    });
    throw new Error('No plan found in metadata');
  }

  await updateUserSubscription(userId, {
    id: subscription.id,
    status,
    plan: plan as 'single_gift' | 'quarterly' | 'quarterly_luxury',
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  console.log('Subscription updated successfully:', {
    subscriptionId: subscription.id,
    userId,
    status,
    plan
  });
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  console.log('Cancelling subscription:', {
    subscriptionId: subscription.id,
    customerId: subscription.customer
  });

  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  const userId = customer.metadata.userId;
  
  if (!userId) {
    throw new Error('No userId found in customer metadata');
  }

  // Get the price object to access its metadata
  const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
  const plan = price.metadata.plan || subscription.metadata.plan;
  
  if (!plan) {
    console.error('No plan found in price or subscription metadata:', {
      priceId: subscription.items.data[0].price.id,
      subscriptionId: subscription.id
    });
    throw new Error('No plan found in metadata');
  }

  await updateUserSubscription(userId, {
    id: subscription.id,
    status: 'canceled',
    plan: plan as 'single_gift' | 'quarterly' | 'quarterly_luxury',
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: true,
  });

  console.log('Subscription cancelled successfully:', {
    subscriptionId: subscription.id,
    userId,
    plan
  });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('Recording payment success:', {
    paymentIntentId: paymentIntent.id,
    customerId: paymentIntent.customer
  });

  const customer = await stripe.customers.retrieve(paymentIntent.customer as string) as Stripe.Customer;
  const userId = customer.metadata.userId;
  
  if (!userId) {
    throw new Error('No userId found in customer metadata');
  }

  await createPaymentRecord({
    userId,
    stripeCustomerId: paymentIntent.customer as string,
    stripePaymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'succeeded',
    paymentMethod: paymentIntent.payment_method as string,
    createdAt: new Date().toISOString(),
  });

  console.log('Payment record created successfully:', {
    paymentIntentId: paymentIntent.id,
    userId,
    amount: paymentIntent.amount
  });
} 