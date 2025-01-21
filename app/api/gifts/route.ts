import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { v4 as uuidv4 } from "uuid";
import { Gift } from "@/utils/dynamodb-schema";

const dynamoDb = DynamoDBDocument.from(new DynamoDB({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION,
}));

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Query gifts for the current user
    const result = await dynamoDb.query({
      TableName: process.env.AWS_DYNAMODB_GIFTS_TABLE,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": `USER#${session.user.email}`,
      },
    });

    return new NextResponse(JSON.stringify({ gifts: result.Items }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching gifts:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch gifts" }), {
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const data = await request.json();
    const giftId = uuidv4();
    const now = new Date().toISOString();

    const gift: Gift = {
      pk: `USER#${session.user.email}`,
      sk: `GIFT#${giftId}`,
      GSI1PK: `GIFT#pending`,
      GSI1SK: data.dueDate,
      id: giftId,
      userId: session.user.email,
      recipientName: data.recipientName,
      occasion: data.occasion,
      dueDate: data.dueDate,
      status: "pending",
      recipientStyle: data.recipientStyle,
      recipientInterests: data.recipientInterests,
      relationshipContext: data.relationshipContext,
      aestheticImages: data.aestheticImages,
      additionalInfo: data.additionalInfo,
      createdAt: now,
      updatedAt: now,
    };

    await dynamoDb.put({
      TableName: process.env.AWS_DYNAMODB_GIFTS_TABLE,
      Item: gift,
    });

    return new NextResponse(JSON.stringify({ gift }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating gift:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to create gift" }), {
      status: 500,
    });
  }
} 