"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { LucideProps } from "lucide-react";
import { Loader2, Mail } from "lucide-react";
import { VerificationModal } from "@/app/components/ui/verification-modal";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signin" | "signup";
}

const Icons = {
  spinner: Loader2,
  google: (props: LucideProps) => (
    <svg {...props} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  ),
};

export function AuthModal({ isOpen, onClose, mode }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const formStartTime = useRef<number | null>(null);
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    formStartTime.current = Date.now();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Bot detection checks
    const timeTaken = formStartTime.current ? Date.now() - formStartTime.current : 0;
    if (honeypot || timeTaken < 1500) { // If form filled in less than 1.5 seconds, likely a bot
      setError("Please try again later");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      // Send magic link email
      const result = await signIn("email", {
        email: email.toLowerCase(),
        redirect: false,
        callbackUrl: window.location.href,
      });

      if (result?.error) {
        throw new Error(result.error);
      }
      
      // Show verification modal
      onClose();
      setShowVerificationModal(true);
    } catch (error) {
      console.error("Authentication error:", error);
      setError(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: window.location.href });
  };

  const handleResendVerification = async () => {
    const result = await signIn("email", {
      email: email.toLowerCase(),
      redirect: false,
      callbackUrl: window.location.href,
    });

    if (result?.error) {
      throw new Error(result.error);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto bg-[#fafafa] border-2 border-black/10 rounded-2xl shadow-lg fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {mode === "signin" ? "Sign In" : "Create Account"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="rounded-xl border-2 border-black/10 px-4 py-2 focus:border-primary focus:ring-0"
                />
                {/* Honeypot field - hidden from real users but visible to bots */}
                <input
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ opacity: 0, position: 'absolute', top: 0, left: 0, height: 0, width: 0, zIndex: -1 }}
                  tabIndex={-1}
                  aria-hidden="true"
                  autoComplete="off"
                />
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <Button 
                variant="default"
                className="w-full relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                {mode === "signin" ? "Sign in with Email" : "Sign up with Email"}
              </Button>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-black/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#fafafa] px-2 text-black/60">
                  Or continue with
                </span>
              </div>
            </div>
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              variant="secondary"
              className="w-full relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors hover:bg-secondary/80 bg-zinc-200 hover:bg-zinc-300"
            >
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.google className="mr-2 h-4 w-4" />
              )}
              Google
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <VerificationModal 
        email={email}
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onResend={handleResendVerification}
        title="Check your email"
        description="Click the link in the email to sign in to your account."
      />
    </>
  );
} 