import { dynamoDb } from "@/utils/aws-config";
import { NewsletterSubscriber, TableNames, validateNewsletterSubscriber } from "@/utils/dynamodb-schema";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400 }
      );
    }

    // Check if subscriber already exists
    const existingSubscriber = await dynamoDb.get({
      TableName: TableNames.NEWSLETTER!,
      Key: { email },
    }).promise();

    if (existingSubscriber.Item) {
      return new Response(
        JSON.stringify({ message: "Already subscribed" }),
        { status: 200 }
      );
    }

    // Create new subscriber item
    const newSubscriber: NewsletterSubscriber = {
      email,
      subscribed_at: new Date().toISOString(),
      status: "active",
    };

    // Validate the item
    if (!validateNewsletterSubscriber(newSubscriber)) {
      throw new Error("Invalid subscriber data");
    }

    // Add new subscriber
    await dynamoDb.put({
      TableName: TableNames.NEWSLETTER!,
      Item: newSubscriber,
    }).promise();

    // TODO: Send welcome email using email service

    return new Response(
      JSON.stringify({ message: "Successfully subscribed" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to subscribe" }),
      { status: 500 }
    );
  }
} 