import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth-options";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { updateUserSubscription } from "@/utils/db/subscription";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { TableNames } from "@/utils/dynamodb-schema";

const client = new DynamoDB({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION,
});

const docClient = DynamoDBDocument.from(client);

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await context.params;
    
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      );
    }

    const subscriptionId = id;
    
    // Cancel the subscription in Stripe
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    // Get the plan from the subscription metadata or items
    const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
    const plan = price.metadata.plan || subscription.metadata.plan;

    if (!plan) {
      throw new Error('No plan found in metadata');
    }

    // Update the subscription in the subscriptions table
    await docClient.update({
      TableName: TableNames.SUBSCRIPTIONS,
      Key: {
        pk: `USER#${session.user.id}`,
        sk: `SUB#${subscriptionId}`,
      },
      UpdateExpression: 'SET cancelAtPeriodEnd = :cancel, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':cancel': true,
        ':updatedAt': new Date().toISOString(),
      },
    });

    // Update the user's subscription record
    await updateUserSubscription(session.user.id, {
      id: subscription.id,
      status: subscription.status as 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid',
      plan: plan as 'single_gift' | 'quarterly' | 'quarterly_luxury',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    return new NextResponse(
      JSON.stringify({ 
        message: "Subscription cancelled successfully",
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to cancel subscription" }),
      { status: 500 }
    );
  }
} 