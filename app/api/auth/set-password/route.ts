import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth-options";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";

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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      );
    }

    const { password } = await req.json();

    if (!password || password.length < 8) {
      return new NextResponse(
        JSON.stringify({ error: "Password must be at least 8 characters" }),
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user in DynamoDB with correct key structure and GSI1
    await ddbDocClient.update({
      TableName: process.env.AWS_DYNAMODB_USERS_TABLE!,
      Key: {
        pk: `USER#${session.user.id}`,
        sk: `PROFILE#${session.user.id}`,
      },
      UpdateExpression: "SET password = :password, GSI1PK = :gsi1pk, GSI1SK = :gsi1sk",
      ExpressionAttributeValues: {
        ":password": hashedPassword,
        ":gsi1pk": `EMAIL#${session.user.email.toLowerCase()}`,
        ":gsi1sk": `USER#${session.user.id}`,
      },
    });

    return new NextResponse(
      JSON.stringify({ message: "Password set successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error setting password:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to set password" }),
      { status: 500 }
    );
  }
} 