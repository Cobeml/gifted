"use client"

import * as React from "react"
import { PricingCard, type PricingTier } from "@/app/components/ui/pricing-card"
import { Tab } from "@/app/components/ui/pricing-tab"

interface PricingSectionProps {
  title: string
  subtitle: string
  tiers: PricingTier[]
  frequencies: string[]
  onPlanSelect: (tier: PricingTier, frequency: string) => void
}

export function PricingSection({
  title,
  subtitle,
  tiers,
  frequencies,
  onPlanSelect,
}: PricingSectionProps) {
  const [selectedFrequency, setSelectedFrequency] = React.useState(frequencies[0])

  return (
    <section className="flex flex-col items-center gap-10">
      <div className="space-y-7 text-center">
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium font-heading">{title}</h1>
          <p className="text-sm sm:text-base text-muted-foreground font-body">{subtitle}</p>
        </div>
        <div className="mx-auto flex w-fit rounded-full bg-muted p-1">
          {frequencies.map((freq) => (
            <Tab
              key={freq}
              text={freq}
              selected={selectedFrequency === freq}
              setSelected={setSelectedFrequency}
              discount={freq === "yearly"}
            />
          ))}
        </div>
      </div>

      <div className="grid w-full max-w-5xl gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier) => (
          <PricingCard
            key={tier.name}
            tier={tier}
            paymentFrequency={selectedFrequency}
            onSelect={() => onPlanSelect(tier, selectedFrequency)}
          />
        ))}
      </div>
    </section>
  )
} 