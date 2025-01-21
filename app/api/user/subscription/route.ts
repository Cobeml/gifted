import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getUserSubscriptionStatus, getAllUserSubscriptions } from "@/utils/db/subscription";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in subscription route:', {
      userId: session?.user?.id,
      email: session?.user?.email
    });

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      );
    }

    // Get both active subscription and all subscriptions
    const [activeSubscription, allSubscriptions] = await Promise.all([
      getUserSubscriptionStatus(session.user.id),
      getAllUserSubscriptions(session.user.id)
    ]);

    console.log('Retrieved subscription data:', {
      active: activeSubscription,
      all: allSubscriptions
    });

    return new NextResponse(
      JSON.stringify({ 
        subscription: activeSubscription,
        allSubscriptions 
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch subscription status" }),
      { status: 500 }
    );
  }
} 