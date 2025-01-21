import { dynamoDb } from "@/utils/aws-config";
import { TableNames } from "@/utils/dynamodb-schema";
import { EmailService } from "@/utils/email-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return new Response(
        JSON.stringify({ error: "Invalid verification link" }),
        { status: 400 }
      );
    }

    // Get subscriber
    const subscriber = await dynamoDb.get({
      TableName: TableNames.NEWSLETTER!,
      Key: { email },
    }).promise();

    if (!subscriber.Item) {
      return new Response(
        JSON.stringify({ error: "Subscriber not found" }),
        { status: 404 }
      );
    }

    if (subscriber.Item.status === "active") {
      return new Response(
        JSON.stringify({ message: "Email already verified" }),
        { status: 200 }
      );
    }

    if (subscriber.Item.verification_token !== token) {
      return new Response(
        JSON.stringify({ error: "Invalid verification token" }),
        { status: 400 }
      );
    }

    // Update subscriber status
    await dynamoDb.update({
      TableName: TableNames.NEWSLETTER!,
      Key: { email },
      UpdateExpression: "SET #status = :status, verified_at = :verified_at",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": "active",
        ":verified_at": new Date().toISOString(),
      },
    }).promise();

    // Send welcome email
    await EmailService.sendNewsletterWelcome({ email, status: "active", subscribed_at: subscriber.Item.subscribed_at });

    return new Response(
      JSON.stringify({ message: "Email verified successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter verification error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to verify email" }),
      { status: 500 }
    );
  }
} 