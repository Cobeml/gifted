import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { authOptions } from "../../auth/auth-options";
import { Gift } from "@/utils/dynamodb-schema";

const dynamoDb = DynamoDBDocument.from(new DynamoDB({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION,
}));

type Context = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, context: Context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await dynamoDb.query({
      TableName: process.env.AWS_DYNAMODB_GIFTS_TABLE,
      KeyConditionExpression: "pk = :pk AND sk = :sk",
      ExpressionAttributeValues: {
        ":pk": `USER#${session.user.email}`,
        ":sk": `GIFT#${context.params.id}`,
      },
    });

    if (!result.Items?.length) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    return NextResponse.json({ gift: result.Items[0] });
  } catch (error) {
    console.error("Error fetching gift:", error);
    return NextResponse.json({ error: "Failed to fetch gift" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: Context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const now = new Date().toISOString();

    // First, verify the gift exists and belongs to the user
    const existingGift = await dynamoDb.query({
      TableName: process.env.AWS_DYNAMODB_GIFTS_TABLE,
      KeyConditionExpression: "pk = :pk AND sk = :sk",
      ExpressionAttributeValues: {
        ":pk": `USER#${session.user.email}`,
        ":sk": `GIFT#${context.params.id}`,
      },
    });

    if (!existingGift.Items?.length) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    const gift: Gift = {
      ...existingGift.Items[0] as Gift,
      recipientName: data.recipientName,
      occasion: data.occasion,
      dueDate: data.dueDate,
      recipientStyle: data.recipientStyle,
      recipientInterests: data.recipientInterests,
      relationshipContext: data.relationshipContext,
      aestheticImages: data.aestheticImages,
      additionalInfo: data.additionalInfo,
      shippingAddress: data.shippingAddress,
      updatedAt: now,
    };

    await dynamoDb.put({
      TableName: process.env.AWS_DYNAMODB_GIFTS_TABLE,
      Item: gift,
    });

    return NextResponse.json({ gift });
  } catch (error) {
    console.error("Error updating gift:", error);
    return NextResponse.json({ error: "Failed to update gift" }, { status: 500 });
  }
} 