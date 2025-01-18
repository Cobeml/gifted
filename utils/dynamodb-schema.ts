import { CreateTableCommandInput } from "@aws-sdk/client-dynamodb";

// Type definitions for table items
export interface NewsletterSubscriber {
  email: string;
  subscribed_at: string;
  status: 'active' | 'unsubscribed';
}

// DynamoDB table schema definitions
export const TableSchemas = {
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
  NEWSLETTER: process.env.AWS_DYNAMODB_NEWSLETTER_TABLE
} as const;

// Utility function to validate item against schema
export function validateNewsletterSubscriber(item: any): item is NewsletterSubscriber {
  return (
    typeof item.email === 'string' &&
    typeof item.subscribed_at === 'string' &&
    (item.status === 'active' || item.status === 'unsubscribed')
  );
} 