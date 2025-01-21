"use client"

import * as React from "react"
import { BadgeCheck, ArrowRight } from "lucide-react"
import NumberFlow from "@number-flow/react"
import { loadStripe, Stripe } from "@stripe/stripe-js"
import { clientConfig } from "@/config/client"
import { toast } from "sonner"
import { useSession, signIn } from "next-auth/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { Card } from "@/app/components/ui/card"

// Initialize Stripe outside of the component
let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = () => {
  if (!stripePromise && clientConfig.stripe.publishableKey) {
    stripePromise = loadStripe(clientConfig.stripe.publishableKey);
  }
  return stripePromise;
};

export interface PricingTier {
  name: string
  price: Record<string, number | string>
  priceIds: {
    monthly?: string
    yearly?: string
  }
  description: string
  features: string[]
  cta: string
  highlighted?: boolean
  popular?: boolean
}

interface PricingCardProps {
  tier: PricingTier
  paymentFrequency: string
  onSelect: () => void
}

export function PricingCard({ tier, paymentFrequency, onSelect }: PricingCardProps) {
  const [loading, setLoading] = React.useState(false)
  const { data: session } = useSession()
  const price = tier.price[paymentFrequency]
  const priceId = tier.priceIds?.[paymentFrequency as keyof typeof tier.priceIds]
  const isHighlighted = tier.highlighted
  const isPopular = tier.popular

  const handleClick = async () => {
    if (!session) {
      // Store plan selection and trigger email sign in
      sessionStorage.setItem(
        "selected_plan",
        JSON.stringify({ tier: tier.name, frequency: paymentFrequency })
      );
      signIn();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.href,
          plan: tier.name.toLowerCase().replace(" ", "_"),
        }),
      });

      const { id: sessionId } = await response.json();

      // Get Stripe.js instance
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error("Failed to load Stripe");
      }

      // Redirect to Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className={cn(
        "relative flex flex-col gap-8 overflow-hidden p-6",
        isHighlighted
          ? "bg-foreground text-background"
          : "bg-background text-foreground",
        isPopular && "ring-2 ring-primary"
      )}
    >
      {isHighlighted && <HighlightedBackground />}
      {isPopular && <PopularBackground />}

      <h2 className="flex items-center gap-3 text-lg sm:text-xl font-medium capitalize font-heading">
        {tier.name}
        {isPopular && (
          <Badge variant="secondary" className="mt-1 z-10">
            🔥 Most Popular
          </Badge>
        )}
      </h2>

      <div className="relative h-12">
        {typeof price === "number" ? (
          <>
            <NumberFlow
              format={{
                style: "currency",
                currency: "USD",
                trailingZeroDisplay: "stripIfInteger",
              }}
              value={price}
              className="text-3xl sm:text-4xl font-medium font-heading"
            />
            <p className="-mt-2 text-xs text-muted-foreground font-body">
              {tier.name === "Single Gift" ? "One time" : "Per month"}
            </p>
          </>
        ) : (
          <h1 className="text-3xl sm:text-4xl font-medium font-heading">{price}</h1>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <h3 className="text-xs sm:text-sm font-medium font-heading">{tier.description}</h3>
        <ul className="space-y-2 font-body">
          {tier.features.map((feature, index) => (
            <li
              key={index}
              className={cn(
                "flex items-center gap-2 text-xs sm:text-sm font-medium",
                isHighlighted ? "text-background" : "text-muted-foreground"
              )}
            >
              <BadgeCheck className="h-3 w-3 sm:h-4 sm:w-4" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-30">
        <Button
          variant={isHighlighted ? "secondary" : "default"}
          className="w-full"
          onClick={onSelect}
          disabled={loading}
        >
          {loading ? "Loading..." : tier.cta}
          {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </Card>
  )
}

const HighlightedBackground = () => (
  <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:45px_45px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
)

const PopularBackground = () => (
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
)