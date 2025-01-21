import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/auth-options"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Use actual userId instead of email
    const userId = session.user.id;
    const userEmail = session.user.email;

    console.log('Creating checkout session for user:', {
      userId,
      email: userEmail
    });

    const { priceId, successUrl, cancelUrl, plan } = await req.json();

    if (!priceId || !successUrl || !cancelUrl || !plan) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Determine if this is a one-time payment or subscription based on the price ID
    const price = await stripe.prices.retrieve(priceId);
    const isSubscription = price.type === "recurring";

    // Update price metadata if it doesn't have plan
    if (!price.metadata.plan) {
      await stripe.prices.update(priceId, {
        metadata: {
          plan,
        },
      });
    }

    // Get or create Stripe customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      // Update customer metadata if it doesn't have userId
      if (!customer.metadata.userId || customer.metadata.userId !== userId) {
        console.log('Updating customer metadata with correct userId:', {
          customerId: customer.id,
          oldUserId: customer.metadata.userId,
          newUserId: userId
        });
        customer = await stripe.customers.update(customer.id, {
          metadata: {
            userId,
          },
        });
      }
    } else {
      console.log('Creating new customer:', {
        email: userEmail,
        userId
      });
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId,
        },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: isSubscription ? "subscription" : "payment",
      payment_method_types: ["card"],
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      metadata: {
        userId,
        plan,
      },
      subscription_data: isSubscription ? {
        metadata: {
          userId,
          plan,
        }
      } : undefined,
      payment_intent_data: !isSubscription ? {
        metadata: {
          userId,
          plan,
        },
      } : undefined,
    });

    console.log('Created checkout session:', {
      id: checkoutSession.id,
      plan,
      mode: checkoutSession.mode,
      customerId: checkoutSession.customer,
      userId
    });

    return NextResponse.json({ id: checkoutSession.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Error creating checkout session" },
      { status: 500 }
    );
  }
} 