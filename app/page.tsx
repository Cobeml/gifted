"use client";

export const dynamic = 'force-dynamic';

import { HowItWorks } from "@/app/components/ui/how-it-works";
import { NavBar } from "@/app/components/ui/tubelight-navbar";
import { PricingSection } from "@/app/components/ui/pricing-section";
import { Button } from "@/app/components/ui/button";
import { Gift, HomeIcon, CreditCard, Send, UserCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import Image from "next/image";
import { InfiniteSlider } from "@/app/components/ui/infinite-slider";
import { Footerdemo } from "@/app/components/ui/footer-section";
import { AuthModal } from "@/app/components/ui/auth-modal";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { loadStripe } from "@stripe/stripe-js";
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { PricingTier } from "@/app/components/ui/pricing-card";
import Link from "next/link";

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
      "Gift scheduling"
    ],
    cta: "Choose Luxury"
  }
];

export default function Home() {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const { toast } = useToast();

  const handleSignIn = () => {
    setAuthMode("signin");
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setAuthMode("signup");
    setShowAuthModal(true);
  };

  const handlePlanSelect = async (tier: PricingTier, frequency: string) => {
    if (!session) {
      // Store plan selection and show auth modal
      sessionStorage.setItem(
        "selected_plan",
        JSON.stringify({ tier, frequency })
      );
      setAuthMode("signup");
      setShowAuthModal(true);
      return;
    }

    // Create Stripe checkout session
    try {
      const priceId = tier.priceIds[frequency as keyof typeof tier.priceIds];
      if (!priceId) throw new Error("Invalid price ID");

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          plan: tier.name.toLowerCase().replace(/\s+/g, '_'),
          successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.href,
        }),
      });

      if (response.status === 401) {
        setAuthMode("signin");
        setShowAuthModal(true);
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create checkout session");
      }

      const { id: sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    }
  };

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
        <div className="flex items-center gap-4">
          <NavBar items={navItems} />
          {session ? (
            <div className="flex items-center gap-2">
              <div className="relative group">
                <Link href="/dashboard">
                  <Button
                    variant="secondary"
                    className="relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors hover:bg-secondary/80"
                  >
                    <UserCircle className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <div className="absolute right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Button
                    onClick={() => signOut()}
                    variant="default"
                    className="relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full bg-black text-white hover:bg-black/90 whitespace-nowrap"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSignIn}
                variant="secondary"
                className="relative cursor-pointer text-sm lg:text-base font-semibold px-4 lg:px-6 py-2 rounded-full transition-colors hover:bg-secondary/80"
              >
                Sign In
              </Button>
              <Button
                onClick={handleSignUp}
                variant="default"
                className="relative cursor-pointer text-sm lg:text-base font-semibold px-4 lg:px-6 py-2 rounded-full transition-colors"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />

      <div className="min-h-screen overflow-auto">
        <section id="home" className="relative min-h-screen w-full">
          <div className="relative flex flex-col gap-4 sm:gap-6 md:gap-8 items-center justify-center px-4 h-screen w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
              className="w-full flex justify-center items-center relative"
            >
              <h1 className="text-[5rem] sm:text-[8rem] md:text-[10rem] lg:text-[14rem] font-bold dark:text-white text-black font-garamond relative z-10">
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
              className="text-xl sm:text-2xl md:text-3xl dark:text-neutral-200 text-neutral-800 font-garamond text-center max-w-3xl relative z-10"
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
              className="relative z-10 mt-8 sm:mt-12 md:mt-16"
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
                <Button 
                  variant="ghost"
                  className="relative cursor-pointer text-lg sm:text-xl md:text-2xl font-semibold px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full bg-muted text-primary hover:bg-muted hover:text-primary"
                >
                  Start Gifting Today
                </Button>
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
                "/gifts/Candle Resize from TinyPNG.jpg",
                "/gifts/Flowers Resized from TinyPNG.jpg",
                "/gifts/Grill Resize Image from TinyPNG.jpg",
                "/gifts/Le Creuset Image (1).jpg",
                "/gifts/Maple Cream Image.jpg"
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
                  className="relative w-[200px] sm:w-[250px] md:w-[300px] h-[300px] sm:h-[350px] md:h-[400px] rounded-xl overflow-hidden flex-shrink-0"
                >
                  <Image
                    src={imagePath}
                    alt={`Gift example ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
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
                "/gifts/Resize Images Design from TinyPNG.jpg",
                "/gifts/Tea Resize Image from TinyPNG.jpg",
                "/gifts/Wallet Image from TinyPNG.jpg",
                "/gifts/Resize Images.jpg",
                "/gifts/Compressed Image.jpg"
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
                  className="relative w-[200px] sm:w-[250px] md:w-[300px] h-[300px] sm:h-[350px] md:h-[400px] rounded-xl overflow-hidden flex-shrink-0"
                >
                  <Image
                    src={imagePath}
                    alt={`Gift example ${i + 6}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
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
          className="min-h-screen px-4 mb-16"
        >
          <div className="relative">
            <div className="w-full max-w-7xl mx-auto bg-[hsl(51.95,100%,88%)] border-2 border-black rounded-2xl px-4 sm:px-6 md:px-8 shadow-lg">
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
          className="min-h-screen px-4 mb-16"
        >
          <div className="relative">
            <div className="w-full max-w-7xl mx-auto bg-[hsl(51.95,100%,88%)] border-2 border-black rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
              <PricingSection
                title="Choose Your Plan"
                subtitle="Find the perfect gifting plan for your needs"
                tiers={pricingTiers}
                frequencies={["monthly", "yearly"]}
                onPlanSelect={handlePlanSelect}
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
