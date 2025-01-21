"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Gift, Plus, UserCircle, CreditCard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ProfileModal } from "@/app/components/ui/profile-modal";
import { GiftModal } from "@/app/components/ui/gift-modal";
import { SubscriptionModal } from "@/app/components/ui/subscription-modal";
import { Gift as GiftType } from "@/utils/dynamodb-schema";

interface UserSubscription {
  id: string;
  status: string;
  plan: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: boolean;
}

interface SubscriptionResponse {
  subscription: UserSubscription | null;
  allSubscriptions: UserSubscription[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [upcomingGifts, setUpcomingGifts] = useState<GiftType[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [allSubscriptions, setAllSubscriptions] = useState<UserSubscription[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState<GiftType | undefined>(undefined);
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null);

  const handleGiftClick = (gift: GiftType) => {
    setSelectedGift(gift);
    setShowGiftModal(true);
  };

  const handleCloseGiftModal = () => {
    setShowGiftModal(false);
    setSelectedGift(undefined);
  };

  const handleSubscriptionClick = (sub: UserSubscription) => {
    setSelectedSubscription(sub);
    setShowSubscriptionModal(true);
  };

  const handleSubscriptionModalClose = () => {
    setShowSubscriptionModal(false);
    setSelectedSubscription(null);
  };

  const handleSubscriptionUpdated = () => {
    // Refetch subscription data
    fetch("/api/user/subscription")
      .then((res) => res.json())
      .then((data: SubscriptionResponse) => {
        setSubscription(data.subscription);
        setAllSubscriptions(data.allSubscriptions);
      })
      .catch(console.error);
  };

  const fetchGifts = async () => {
    try {
      const response = await fetch("/api/gifts");
      if (!response.ok) throw new Error("Failed to fetch gifts");
      const { gifts } = await response.json();
      setUpcomingGifts(gifts);
    } catch (error) {
      console.error("Error fetching gifts:", error);
    }
  };

  useEffect(() => {
    // Redirect if not authenticated
    if (!session) {
      router.push("/");
      return;
    }

    // Fetch subscription data
    fetch("/api/user/subscription")
      .then((res) => res.json())
      .then((data: SubscriptionResponse) => {
        setSubscription(data.subscription);
        setAllSubscriptions(data.allSubscriptions);
      })
      .catch(console.error);

    // Fetch gifts
    fetchGifts();
  }, [session, router]);

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div 
        className="fixed inset-0 w-full h-full -z-10"
        style={{
          backgroundImage: 'url("/bg.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-4 z-50">
        <Link href="/" className="cursor-pointer pl-4">
          <Image
            src="/logo.svg"
            alt="Gifted Logo"
            width={85}
            height={85}
            priority
          />
        </Link>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white/90"
            onClick={() => setShowProfileModal(true)}
          >
            <UserCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </Button>
        </div>
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <GiftModal
        isOpen={showGiftModal}
        onClose={handleCloseGiftModal}
        onSuccess={fetchGifts}
        gift={selectedGift}
      />

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={handleSubscriptionModalClose}
        subscription={selectedSubscription}
        onSubscriptionUpdated={handleSubscriptionUpdated}
      />

      {/* Main Content */}
      <main className="pt-24 px-4 max-w-7xl mx-auto">

        {/* Upcoming Gifts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-black/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Gift className="h-6 w-6" />
                Upcoming Gifts
              </h2>
              <Button onClick={() => setShowGiftModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Gift
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingGifts.map((gift) => (
                <motion.div
                  key={gift.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl border-2 border-black/10 p-4 cursor-pointer"
                  onClick={() => handleGiftClick(gift)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{gift.recipientName}</h3>
                    <Badge>{gift.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{gift.occasion}</p>
                  <p className="text-sm mb-2">
                    Due: {new Date(gift.dueDate).toLocaleDateString()}
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-muted-foreground">
                      Our AI and expert curators are crafting personalized gift options. You&apos;ll receive an email with suggestions within 2-3 business days.
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {upcomingGifts.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No upcoming gifts</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowGiftModal(true)}
                  >
                    Schedule Your First Gift
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.section>

         {/* Subscription Status */}
         <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-black/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CreditCard className="h-6 w-6" />
                Subscriptions
              </h2>
              <Button variant="outline" onClick={() => router.push("/#pricing")}>
                Add Plan
              </Button>
            </div>
            {subscription ? (
              <div className="space-y-4">
                <div 
                  className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSubscriptionClick(subscription)}
                >
                  <div>
                    <p className="text-lg font-semibold capitalize">{subscription.plan.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">
                      {subscription.cancelAtPeriodEnd 
                        ? `Will cancel on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                        : `Will auto-renew on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                      }
                    </p>
                  </div>
                  <Badge variant={subscription.status === 'active' ? 'success' : 'warning'}>
                    {subscription.status}
                  </Badge>
                </div>
                
                {allSubscriptions.length > 1 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2">Subscription History</h3>
                    <div className="space-y-2">
                      {allSubscriptions
                        .filter(sub => sub.id !== subscription.id)
                        .map((sub, index) => (
                          <div 
                            key={index}
                            className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between bg-white/50 p-3 rounded-lg cursor-pointer hover:bg-white/60 transition-colors"
                            onClick={() => handleSubscriptionClick(sub)}
                          >
                            <div>
                              <p className="font-medium capitalize">{sub.plan.replace('_', ' ')}</p>
                              <p className="text-xs text-muted-foreground">
                                {sub.cancelAtPeriodEnd 
                                  ? `Cancelled on ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`
                                  : `Auto-renewed on ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`
                                }
                              </p>
                            </div>
                            <Badge variant={sub.status === 'active' ? 'success' : 'secondary'}>
                              {sub.status}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No active subscription</p>
            )}
          </div>
        </motion.section>
        
      </main>
    </div>
  );
} 