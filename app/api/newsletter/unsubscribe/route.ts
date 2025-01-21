import { dynamoDb } from "@/utils/aws-config";
import { TableNames } from "@/utils/dynamodb-schema";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400 }
      );
    }

    // Update subscriber status
    await dynamoDb.update({
      TableName: TableNames.NEWSLETTER!,
      Key: { email },
      UpdateExpression: "SET #status = :status",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":status": "unsubscribed"
      },
      ReturnValues: "NONE"
    }).promise();

    // Redirect to confirmation page
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribed?email=${encodeURIComponent(email)}`
      }
    });
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to unsubscribe" }),
      { status: 500 }
    );
  }
} 