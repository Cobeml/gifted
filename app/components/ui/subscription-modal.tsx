import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: {
    id: string;
    status: string;
    plan: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd?: boolean;
  } | null;
  onSubscriptionUpdated: () => void;
}

export function SubscriptionModal({ 
  isOpen, 
  onClose, 
  subscription,
  onSubscriptionUpdated 
}: SubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/subscription/${subscription.id}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel subscription');
      }

      const result = await response.json();

      toast({
        title: "Subscription Updated",
        description: "Your subscription will be cancelled at the end of the billing period.",
      });

      if (subscription) {
        subscription.cancelAtPeriodEnd = result.cancelAtPeriodEnd;
        subscription.currentPeriodEnd = result.currentPeriodEnd;
      }

      onSubscriptionUpdated();
      onClose();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    if (!subscription) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/subscription/${subscription.id}/resume`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to resume subscription');
      }

      const result = await response.json();

      toast({
        title: "Subscription Updated",
        description: "Your subscription will continue to auto-renew.",
      });

      if (subscription) {
        subscription.cancelAtPeriodEnd = result.cancelAtPeriodEnd;
        subscription.currentPeriodEnd = result.currentPeriodEnd;
      }

      onSubscriptionUpdated();
      onClose();
    } catch (error) {
      console.error('Error resuming subscription:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resume subscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!subscription) return null;

  const formattedPlan = subscription.plan.replace('_', ' ');
  const renewalDate = new Date(subscription.currentPeriodEnd).toLocaleDateString();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Subscription Details</DialogTitle>
          <DialogDescription>
            Manage your {formattedPlan} subscription
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Current Plan</p>
            <p className="text-sm text-muted-foreground capitalize">{formattedPlan}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Status</p>
            <p className="text-sm text-muted-foreground capitalize">{subscription.status}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Renewal</p>
            <p className="text-sm text-muted-foreground">
              {subscription.cancelAtPeriodEnd
                ? `Will cancel on ${renewalDate}`
                : `Will auto-renew on ${renewalDate}`
              }
            </p>
          </div>

          {subscription.status === 'active' && (
            <div className="pt-4">
              {subscription.cancelAtPeriodEnd ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleResumeSubscription}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      "Resuming..."
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resume Auto-renewal
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Your subscription will continue to renew automatically
                  </p>
                </>
              ) : (
                <>
                  <Button
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Cancelling..." : "Cancel Subscription"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Your subscription will remain active until the end of the billing period
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 