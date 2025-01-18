"use client";

export const dynamic = 'force-dynamic';

import { HowItWorks } from "@/app/components/ui/how-it-works";
import { NavBar } from "@/app/components/ui/tubelight-navbar";
import { PricingSection } from "@/app/components/ui/pricing-section";
import { ElegantButton } from "@/app/components/ui/elegant-button";
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
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SINGLE_GIFT,
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SINGLE_GIFT
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
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_QUARTERLY,
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_QUARTERLY_ANNUAL
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
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_LUXURY,
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_LUXURY_ANNUAL
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

  return (
    <div className="relative">
      <div 
        className="fixed inset-0 w-full h-full -z-10"
        style={{
          backgroundImage: 'url("/bg.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
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
            width={150}
            height={75}
            priority
          />
        </div>
        <NavBar items={navItems} />
      </div>
      <div className="min-h-screen overflow-auto">
        <section id="home" className="relative min-h-screen w-full">
          <div className="relative flex flex-col gap-8 items-center justify-center px-4 h-screen w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
              className="w-full flex justify-center items-center relative"
            >
              <h1 className="text-40xl md:text-[12rem] lg:text-[14rem] font-bold dark:text-white text-black font-garamond relative z-10">
                Gifted
              </h1>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                ease: "easeOut",
              }}
              className="text-2xl md:text-3xl dark:text-neutral-200 text-neutral-800 font-garamond relative z-10"
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
              className="relative z-10"
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
                className="relative z-10"
              >
                <ElegantButton 
                  className="mt-8 text-xl"
                >
                  Start Gifting Today
                </ElegantButton>
              </div>
            </motion.div>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0.0, y: 100, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.3,
            duration: 1,
            ease: "easeOut",
          }}
          className="min-h-screen flex flex-col items-center justify-center gap-16 py-20 px-4"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.8,
              ease: "easeOut",
            }}
            className="text-5xl font-bold text-center font-heading"
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
              {[
                "/gifts/Candle.jpg",
                "/gifts/Flowers.jpg",
                "/gifts/Grill.jpg",
                "/gifts/Le Creuset.jpg",
                "/gifts/Maple-Cream__08629.jpg"
              ].map((imagePath, i) => (
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
                    src={imagePath}
                    alt={`Gift example ${i + 1}`}
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
              {[
                "/gifts/Ring.jpg",
                "/gifts/Tea.jpg",
                "/gifts/Wallet.jpg",
                "/gifts/Untitled design (2).jpg",
                "/gifts/Untitled design (3).jpg"
              ].map((imagePath, i) => (
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
                    src={imagePath}
                    alt={`Gift example ${i + 6}`}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              ))}
            </InfiniteSlider>
          </motion.div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0.0, y: 100, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.3,
            duration: 1,
            ease: "easeOut",
          }}
          id="how-it-works"
          className="min-h-screen px-4"
        >
          <div className="relative">
            <div className="w-full max-w-7xl mx-auto bg-[hsl(51.95,100%,88%)] border-2 border-black rounded-2xl px-8 shadow-lg">
              <HowItWorks />
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0.0, y: 100, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.3,
            duration: 1,
            ease: "easeOut",
          }}
          id="pricing"
          className="min-h-screen px-4"
        >
          <div className="relative">
            <div className="w-full max-w-7xl mx-auto bg-[hsl(51.95,100%,88%)] border-2 border-black rounded-2xl p-8 shadow-lg">
              <PricingSection
                title="Choose Your Plan"
                subtitle="Find the perfect gifting plan for your needs"
                tiers={pricingTiers}
                frequencies={["monthly", "yearly"]}
              />
            </div>
          </div>
        </motion.section>

        <section id="contact" className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <Footerdemo />
        </section>
      </div>
    </div>
  );
}
