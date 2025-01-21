import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/auth-options";
import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION,
});

const ddbDocClient = DynamoDBDocument.from(client);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      );
    }

    const result = await ddbDocClient.get({
      TableName: process.env.AWS_DYNAMODB_USERS_TABLE!,
      Key: {
        pk: `USER#${session.user.id}`,
        sk: `PROFILE#${session.user.id}`,
      },
      ProjectionExpression: "giftingPreferences",
    });

    return new NextResponse(
      JSON.stringify({ preferences: result.Item?.giftingPreferences || null }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch preferences" }),
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      );
    }

    const { preferences } = await req.json();

    await ddbDocClient.update({
      TableName: process.env.AWS_DYNAMODB_USERS_TABLE!,
      Key: {
        pk: `USER#${session.user.id}`,
        sk: `PROFILE#${session.user.id}`,
      },
      UpdateExpression: "SET giftingPreferences = :preferences",
      ExpressionAttributeValues: {
        ":preferences": {
          ...preferences,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    return new NextResponse(
      JSON.stringify({ message: "Preferences updated successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating preferences:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to update preferences" }),
      { status: 500 }
    );
  }
} 