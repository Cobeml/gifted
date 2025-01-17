import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION,
});

const ddbDocClient = DynamoDBDocument.from(client);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    await ddbDocClient.send(
      new PutCommand({
        TableName: process.env.AWS_DYNAMODB_NEWSLETTER_TABLE,
        Item: {
          email,
          subscribed_at: timestamp,
          status: "active",
        },
        ConditionExpression: "attribute_not_exists(email)",
      })
    );

    // Send welcome email using the existing email infrastructure
    // This is optional and can be implemented later
    // await sendWelcomeEmail(email);

    return new Response(
      JSON.stringify({ message: "Successfully subscribed to newsletter" }),
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      return new Response(
        JSON.stringify({ error: "Email already subscribed" }),
        { status: 409 }
      );
    }

    console.error("Newsletter subscription error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to subscribe to newsletter" }),
      { status: 500 }
    );
  }
} 