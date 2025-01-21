import { CreateTableCommandInput } from "@aws-sdk/client-dynamodb";

// Type definitions for table items
export interface NewsletterSubscriber {
  email: string;
  subscribed_at: string;
  status: "pending" | "active" | "unsubscribed";
  verification_token?: string;
  verified_at?: string;
}

export interface EmailTrackingRecord {
  email_id: string;
  recipient: string;
  subject: string;
  sent_at: string;
  status: 'sent' | 'delivered' | 'failed';
  type: 'welcome' | 'newsletter' | 'notification';
  metadata?: Record<string, any>;
}

export interface User {
  pk: string;
  sk: string;
  GSI1PK: string;
  GSI1SK: string;
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified?: Date;
  // Subscription fields
  stripeCustomerId?: string;
  subscription?: {
    id: string;
    status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid';
    plan: 'single_gift' | 'quarterly' | 'quarterly_luxury';
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
  // Profile preferences
  giftingPreferences?: {
    interests: string[];
    style: string[];
    avoidCategories?: string[];
    notes?: string;
    updatedAt: string;
  };
}

// New interface for subscription records
export interface Subscription {
  pk: string; // USER#${userId}
  sk: string; // SUB#${subscriptionId}
  GSI1PK: string; // SUB#${status}
  GSI1SK: string; // ${currentPeriodEnd}
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid';
  plan: 'single_gift' | 'quarterly' | 'quarterly_luxury';
  priceId: string;
  quantity: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

// New interface for payment history
export interface PaymentRecord {
  pk: string; // USER#${userId}
  sk: string; // PAYMENT#${paymentId}
  GSI1PK: string; // PAYMENT#${status}
  GSI1SK: string; // ${createdAt}
  userId: string;
  stripeCustomerId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  paymentMethod: string;
  createdAt: string;
}

export interface Gift {
  pk: string; // USER#${userId}
  sk: string; // GIFT#${giftId}
  GSI1PK: string; // GIFT#${status}
  GSI1SK: string; // ${dueDate}
  id: string;
  userId: string;
  recipientName: string;
  occasion: string;
  dueDate: string;
  status: 'pending' | 'processing' | 'shipped';
  recipientStyle?: string[];
  recipientInterests?: string[];
  relationshipContext?: string;
  aestheticImages?: string[];
  additionalInfo?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

// DynamoDB table schema definitions
export const TableSchemas = {
  Users: {
    TableName: process.env.AWS_DYNAMODB_USERS_TABLE,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" },
      { AttributeName: "sk", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" },
      { AttributeName: "sk", AttributeType: "S" },
      { AttributeName: "GSI1PK", AttributeType: "S" },
      { AttributeName: "GSI1SK", AttributeType: "S" }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "GSI1",
        KeySchema: [
          { AttributeName: "GSI1PK", KeyType: "HASH" },
          { AttributeName: "GSI1SK", KeyType: "RANGE" }
        ],
        Projection: {
          ProjectionType: "ALL"
        }
      }
    ],
    BillingMode: "PAY_PER_REQUEST"
  } as CreateTableCommandInput,
  
  Subscriptions: {
    TableName: process.env.AWS_DYNAMODB_SUBSCRIPTIONS_TABLE,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" },
      { AttributeName: "sk", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" },
      { AttributeName: "sk", AttributeType: "S" },
      { AttributeName: "GSI1PK", AttributeType: "S" },
      { AttributeName: "GSI1SK", AttributeType: "S" }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "GSI1",
        KeySchema: [
          { AttributeName: "GSI1PK", KeyType: "HASH" },
          { AttributeName: "GSI1SK", KeyType: "RANGE" }
        ],
        Projection: {
          ProjectionType: "ALL"
        }
      }
    ],
    BillingMode: "PAY_PER_REQUEST"
  } as CreateTableCommandInput,

  Payments: {
    TableName: process.env.AWS_DYNAMODB_PAYMENTS_TABLE,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" },
      { AttributeName: "sk", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" },
      { AttributeName: "sk", AttributeType: "S" },
      { AttributeName: "GSI1PK", AttributeType: "S" },
      { AttributeName: "GSI1SK", AttributeType: "S" }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "GSI1",
        KeySchema: [
          { AttributeName: "GSI1PK", KeyType: "HASH" },
          { AttributeName: "GSI1SK", KeyType: "RANGE" }
        ],
        Projection: {
          ProjectionType: "ALL"
        }
      }
    ],
    BillingMode: "PAY_PER_REQUEST"
  } as CreateTableCommandInput,

  Gifts: {
    TableName: process.env.AWS_DYNAMODB_GIFTS_TABLE,
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" },
      { AttributeName: "sk", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" },
      { AttributeName: "sk", AttributeType: "S" },
      { AttributeName: "GSI1PK", AttributeType: "S" },
      { AttributeName: "GSI1SK", AttributeType: "S" }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "GSI1",
        KeySchema: [
          { AttributeName: "GSI1PK", KeyType: "HASH" },
          { AttributeName: "GSI1SK", KeyType: "RANGE" }
        ],
        Projection: {
          ProjectionType: "ALL"
        }
      }
    ],
    BillingMode: "PAY_PER_REQUEST"
  } as CreateTableCommandInput,

  Newsletter: {
    TableName: process.env.AWS_DYNAMODB_NEWSLETTER_TABLE,
    KeySchema: [
      {
        AttributeName: "email",
        KeyType: "HASH"
      }
    ],
    AttributeDefinitions: [
      {
        AttributeName: "email",
        AttributeType: "S"
      }
    ],
    BillingMode: "PAY_PER_REQUEST"
  } as CreateTableCommandInput
};

// Table names constants
export const TableNames = {
  USERS: process.env.AWS_DYNAMODB_USERS_TABLE,
  NEWSLETTER: process.env.AWS_DYNAMODB_NEWSLETTER_TABLE,
  EMAIL_TRACKING: process.env.AWS_DYNAMODB_EMAIL_TRACKING_TABLE,
  SUBSCRIPTIONS: process.env.AWS_DYNAMODB_SUBSCRIPTIONS_TABLE,
  PAYMENTS: process.env.AWS_DYNAMODB_PAYMENTS_TABLE,
} as const;

// Utility function to validate item against schema
export function validateNewsletterSubscriber(subscriber: NewsletterSubscriber): boolean {
  return (
    typeof subscriber.email === "string" &&
    typeof subscriber.subscribed_at === "string" &&
    ["pending", "active", "unsubscribed"].includes(subscriber.status) &&
    (subscriber.verification_token === undefined || typeof subscriber.verification_token === "string") &&
    (subscriber.verified_at === undefined || typeof subscriber.verified_at === "string")
  );
}

export const validateEmailTrackingRecord = (record: EmailTrackingRecord): boolean => {
  return !!(
    record.email_id &&
    record.recipient &&
    record.subject &&
    record.sent_at &&
    record.status &&
    record.type
  );
};

export function validateSubscription(item: any): item is Subscription {
  return !!(
    item.pk &&
    item.sk &&
    item.userId &&
    item.stripeCustomerId &&
    item.stripeSubscriptionId &&
    item.status &&
    item.plan &&
    item.currentPeriodStart &&
    item.currentPeriodEnd
  );
}

export function validatePaymentRecord(item: any): item is PaymentRecord {
  return !!(
    item.pk &&
    item.sk &&
    item.userId &&
    item.stripeCustomerId &&
    item.stripePaymentIntentId &&
    item.amount &&
    item.currency &&
    item.status &&
    item.createdAt
  );
} 