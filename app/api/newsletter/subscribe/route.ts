import { dynamoDb } from "@/utils/aws-config";
import { NewsletterSubscriber, TableNames, validateNewsletterSubscriber } from "@/utils/dynamodb-schema";
import { EmailService } from "@/utils/email-service";
import crypto from "crypto";

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
      if (existingSubscriber.Item.status === "active") {
        return new Response(
          JSON.stringify({ message: "Already subscribed" }),
          { status: 200 }
        );
      } else if (existingSubscriber.Item.status === "pending") {
        // Resend verification email
        await EmailService.sendNewsletterVerification({
          email: existingSubscriber.Item.email,
          status: existingSubscriber.Item.status,
          subscribed_at: existingSubscriber.Item.subscribed_at,
          verification_token: existingSubscriber.Item.verification_token,
        });
        return new Response(
          JSON.stringify({ message: "Verification email resent" }),
          { status: 200 }
        );
      }
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create new subscriber item
    const newSubscriber: NewsletterSubscriber = {
      email,
      subscribed_at: new Date().toISOString(),
      status: "pending",
      verification_token: verificationToken,
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

    // Send verification email
    await EmailService.sendNewsletterVerification(newSubscriber);

    return new Response(
      JSON.stringify({ message: "Please check your email to verify your subscription" }),
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