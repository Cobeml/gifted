import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { TableNames, Subscription, PaymentRecord, User } from "../dynamodb-schema";

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
  throw new Error('AWS credentials or region not configured');
}

const client = new DynamoDB({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

const docClient = DynamoDBDocument.from(client);

// Validate table names
if (!TableNames.USERS || !TableNames.SUBSCRIPTIONS || !TableNames.PAYMENTS) {
  throw new Error('DynamoDB table names not configured');
}

export async function updateUserSubscription(
  userId: string,
  subscriptionData: Partial<User['subscription']>
) {
  console.log('Updating user subscription:', { userId, subscriptionData });
  
  try {
    // Initialize the subscription object with all fields
    const subscription = {
      id: subscriptionData?.id || null,
      status: subscriptionData?.status || null,
      plan: subscriptionData?.plan || null,
      currentPeriodEnd: subscriptionData?.currentPeriodEnd || null,
      cancelAtPeriodEnd: subscriptionData?.cancelAtPeriodEnd ?? false,
    };

    await docClient.update({
      TableName: TableNames.USERS,
      Key: {
        pk: `USER#${userId}`,
        sk: `PROFILE#${userId}`,
      },
      UpdateExpression: 'SET subscription = :subscription',
      ExpressionAttributeValues: {
        ':subscription': subscription,
      },
    });
    
    console.log('User subscription updated successfully:', subscription);
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}

export async function setStripeCustomerId(userId: string, stripeCustomerId: string) {
  await docClient.update({
    TableName: TableNames.USERS,
    Key: {
      pk: `USER#${userId}`,
      sk: `PROFILE#${userId}`,
    },
    UpdateExpression: 'SET stripeCustomerId = :stripeCustomerId',
    ExpressionAttributeValues: {
      ':stripeCustomerId': stripeCustomerId,
    },
  });
}

export async function createSubscriptionRecord(subscription: Omit<Subscription, 'pk' | 'sk' | 'GSI1PK' | 'GSI1SK'>) {
  const now = new Date().toISOString();
  const subscriptionRecord: Subscription = {
    pk: `USER#${subscription.userId}`,
    sk: `SUB#${subscription.stripeSubscriptionId}`,
    GSI1PK: `SUB#${subscription.status}`,
    GSI1SK: subscription.currentPeriodEnd,
    ...subscription,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.put({
    TableName: TableNames.SUBSCRIPTIONS,
    Item: subscriptionRecord,
  });

  return subscriptionRecord;
}

export async function createPaymentRecord(payment: Omit<PaymentRecord, 'pk' | 'sk' | 'GSI1PK' | 'GSI1SK'>) {
  const now = new Date().toISOString();
  const paymentRecord: PaymentRecord = {
    pk: `USER#${payment.userId}`,
    sk: `PAYMENT#${payment.stripePaymentIntentId}`,
    GSI1PK: `PAYMENT#${payment.status}`,
    GSI1SK: now,
    ...payment,
    createdAt: now,
  };

  await docClient.put({
    TableName: TableNames.PAYMENTS,
    Item: paymentRecord,
  });

  return paymentRecord;
}

export async function getUserSubscriptionStatus(userId: string): Promise<User['subscription'] | null> {
  console.log('Getting subscription status for user:', userId);
  
  try {
    // First get the active subscription from the subscriptions table
    const subscriptionResult = await docClient.query({
      TableName: TableNames.SUBSCRIPTIONS,
      KeyConditionExpression: 'pk = :pk',
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':status': 'active'
      }
    });

    console.log('Retrieved subscription data:', subscriptionResult.Items);

    if (!subscriptionResult.Items || subscriptionResult.Items.length === 0) {
      console.log('No active subscription found');
      return null;
    }

    // Get the most recent active subscription
    const latestSubscription = subscriptionResult.Items.reduce((latest, current) => {
      if (!latest || new Date(current.currentPeriodEnd) > new Date(latest.currentPeriodEnd)) {
        return current;
      }
      return latest;
    });

    // Format the subscription data according to the User schema
    return {
      id: latestSubscription.stripeSubscriptionId,
      status: latestSubscription.status,
      plan: latestSubscription.plan,
      currentPeriodEnd: latestSubscription.currentPeriodEnd,
      cancelAtPeriodEnd: latestSubscription.cancelAtPeriodEnd
    };
  } catch (error) {
    console.error('Error getting user subscription status:', error);
    throw error;
  }
}

export async function getAllUserSubscriptions(userId: string): Promise<Subscription[]> {
  console.log('Getting all subscriptions for user:', userId);
  
  try {
    const result = await docClient.query({
      TableName: TableNames.SUBSCRIPTIONS,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`
      }
    });

    console.log('Retrieved all subscriptions:', result.Items);

    return result.Items as Subscription[];
  } catch (error) {
    console.error('Error getting user subscriptions:', error);
    throw error;
  }
} 