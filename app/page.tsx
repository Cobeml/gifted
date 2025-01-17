"use client";

export const dynamic = 'force-dynamic';

import { AuroraBackground } from "@/app/components/ui/aurora-background";
import { HowItWorks } from "@/app/components/ui/how-it-works";
import { NavBar } from "@/app/components/ui/tubelight-navbar";
import { PricingSection } from "@/app/components/ui/pricing-section";
import { RainbowButton } from "@/app/components/ui/rainbow-button";
import { SparklesText } from "@/app/components/ui/sparkles-text";
import { Gift, HomeIcon, CreditCard, Send } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import Image from "next/image";
import { InfiniteSlider } from "@/app/components/ui/infinite-slider";
import { Footerdemo } from "@/app/components/ui/footer-section";

const navItems = [
  { name: "Home", url: "#home", icon: HomeIcon },
  { name: "How It Works", url: "#how-it-works", icon: Gift },
  { name: "Pricing", url: "#pricing", icon: CreditCard },
  { name: "Contact", url: "#contact", icon: Send },
];

const pricingTiers = [
  {
    name: "Single Gift",
    price: { 
      monthly: 129,
      yearly: 129
    },
    description: "Perfect for one-time gifting",
    features: [
      "One premium gift",
      "AI-powered suggestions",
      "Expert curation",
      "Premium gift wrapping",
      "Delivery included"
    ],
    cta: "Purchase"
  },
  {
    name: "Quarterly",
    price: { 
      monthly: 99,
      yearly: 79
    },
    description: "Best for regular gift-givers",
    features: [
      "Three premium gifts per quarter",
      "Priority AI suggestions",
      "Expert curation",
      "Premium gift wrapping",
      "Free priority shipping",
      "Gift scheduling"
    ],
    popular: true,
    cta: "Choose Quarterly"
  },
  {
    name: "Quarterly Luxury",
    price: { 
      monthly: 299,
      yearly: 239
    },
    description: "For luxury gifting experience",
    features: [
      "2 premium & 2 luxury gifts per quarter",
      "Advanced AI suggestions",
      "Dedicated gift curator",
      "Premium gift wrapping",
      "Free priority shipping",
      "Gift scheduling",
      "VIP concierge service"
    ],
    cta: "Choose Luxury"
  }
];

export default function Home() {
  const { theme } = useTheme();
  const sparkleColors = theme === 'dark' 
    ? { first: "#9E7AFF", second: "#FE8BBB" }
    : { first: "#7C3AED", second: "#EC4899" };

  return (
    <div className="relative">
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 z-50">
        <div 
          className="py-4 cursor-pointer" 
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Image
            src="/logo.svg"
            alt="Gifted Logo"
            width={100}
            height={50}
            priority
          />
        </div>
        <NavBar items={navItems} />
      </div>
      <div className="min-h-screen overflow-auto">
        <section id="home" className="relative min-h-screen">
          <AuroraBackground>
            <div
              className="relative flex flex-col gap-8 items-center justify-center px-4 h-screen"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                }}
                className="flex flex-col gap-12 items-center"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                >
                  <SparklesText 
                    text="Gifted" 
                    className="text-[12rem] md:text-[18rem] font-bold text-[hsl(0,59%,30%)] dark:text-[hsl(0,59%,40%)]"
                    colors={sparkleColors}
                    sparklesCount={20}
                    style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
                  />
                </motion.div>
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.2,
                  duration: 0.8,
                  ease: "easeOut",
                }}
                className="text-xl md:text-2xl text-[hsl(0,59%,30%)] dark:text-[hsl(0,59%,40%)]"
              >
                AI-Powered Personal Gifting, Curated with Human Touch
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.4,
                  duration: 0.8,
                  ease: "easeOut",
                }}
              >
                <div 
                  onClick={() => {
                    const element = document.querySelector('#pricing');
                    if (element && element instanceof HTMLElement) {
                      const offset = 80;
                      const top = element.offsetTop - offset;
                      window.scrollTo({
                        top,
                        behavior: "smooth"
                      });
                    }
                  }}
                  className="relative z-30"
                >
                  <RainbowButton 
                    className="mt-8 text-lg py-6 px-12"
                  >
                    Start Gifting Today
                  </RainbowButton>
                </div>
              </motion.div>
            </div>
          </AuroraBackground>
        </section>

        <motion.section
          initial={{ opacity: 0.0, y: 100, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.3,
            duration: 1,
            ease: "easeOut",
          }}
          className="bg-background min-h-screen flex flex-col items-center justify-center gap-16 py-20"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.8,
              ease: "easeOut",
            }}
            className="text-4xl font-bold text-center"
          >
            Curated with Care
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.5,
              duration: 1.2,
              ease: "easeOut",
            }}
            className="w-full"
          >
            <InfiniteSlider duration={20} direction="horizontal" gap={32}>
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.1 * i,
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                  className="relative w-[300px] h-[400px] rounded-xl overflow-hidden flex-shrink-0"
                >
                  <Image
                    src={`/gifts/gift-${i}.jpg`}
                    alt={`Gift example ${i}`}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              ))}
            </InfiniteSlider>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.7,
              duration: 1.2,
              ease: "easeOut",
            }}
            className="w-full"
          >
            <InfiniteSlider duration={15} direction="horizontal" gap={32} reverse>
              {[6, 7, 8, 9, 10].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.1 * (i - 5),
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                  className="relative w-[300px] h-[400px] rounded-xl overflow-hidden flex-shrink-0"
                >
                  <Image
                    src={`/gifts/gift-${i}.jpg`}
                    alt={`Gift example ${i}`}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              ))}
            </InfiniteSlider>
          </motion.div>
        </motion.section>

        <motion.section
          id="how-it-works"
          initial={{ opacity: 0.0, y: 100, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.3,
            duration: 1,
            ease: "easeOut",
          }}
          className="bg-background min-h-screen"
        >
          <div>
            <HowItWorks />
          </div>
        </motion.section>

        <motion.section
          id="pricing"
          initial={{ opacity: 0.0, y: 100, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.3,
            duration: 1,
            ease: "easeOut",
          }}
          className="bg-background h-screen"
        >
          <div>
            <PricingSection
              title="Choose Your Plan"
              subtitle="Find the perfect gifting plan for your needs"
              tiers={pricingTiers}
              frequencies={["monthly", "yearly"]}
            />
          </div>
        </motion.section>

        <section id="contact">
          <Footerdemo />
        </section>
      </div>
    </div>
  );
}
