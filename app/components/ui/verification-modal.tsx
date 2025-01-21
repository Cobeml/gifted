import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface VerificationModalProps {
  email: string;
  isOpen: boolean;
  onClose: () => void;
  onResend: () => Promise<void>;
  title?: string;
  description?: string;
}

export function VerificationModal({ 
  email, 
  isOpen, 
  onClose, 
  onResend,
  title = "Check your email",
  description = "Click the link in the email to verify your email address."
}: VerificationModalProps) {
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResend();
    } catch (error) {
      console.error("Error resending email:", error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#fafafa] border-2 border-black/10 rounded-2xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">Email Verification</DialogTitle>
          <DialogDescription className="sr-only">
            Please check your email for a verification link.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6 py-6">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            <div className="space-y-2">
              <p className="text-lg">
                We've sent a verification link to:
              </p>
              <p className="font-medium text-lg">{email}</p>
            </div>
            <div className="text-muted-foreground space-y-2">
              <p>{description}</p>
              <p className="text-sm">
                Can't find the email? Check your spam/junk folder or{" "}
                <button 
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-primary hover:underline font-medium disabled:opacity-50"
                >
                  {isResending ? "sending..." : "try sending it again"}
                </button>
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={onClose}
            className="mt-4"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 