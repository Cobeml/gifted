"use client"

import * as React from "react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Send } from "lucide-react"
import Link from "next/link"
import { VerificationModal } from "@/app/components/ui/verification-modal"

export function Footerdemo() {
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = React.useState("")
  const [showVerificationModal, setShowVerificationModal] = React.useState(false)
  const formStartTime = React.useRef(Date.now())
  const [honeypot, setHoneypot] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Bot detection checks
    const timeTaken = Date.now() - formStartTime.current
    if (honeypot || timeTaken < 1500) { // If form filled in less than 1.5 seconds, likely a bot
      setStatus("success") // Fake success to not alert bots
      setMessage("Thank you for subscribing!")
      return
    }
    
    setStatus("loading")
    
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setStatus("success")
      setMessage(data.message)
      setShowVerificationModal(true)
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Failed to subscribe")
    }
  }

  const handleResendVerification = async () => {
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to resend verification email");
      }
    } catch (error) {
      console.error("Error resending verification:", error);
      throw error;
    }
  };

  return (
    <>
      <footer className="relative border-t border-zinc-200 bg-zinc-300 text-foreground transition-colors duration-300">
        <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
          <div className="grid gap-16 md:grid-cols-3">
            <div className="relative">
              <h2 className="mb-4 text-3xl font-bold tracking-tight font-heading">Stay Connected</h2>
              <p className="mb-6 text-muted-foreground font-body">
                Join our newsletter for the latest updates and exclusive offers.
              </p>
              <form onSubmit={handleSubmit} className="relative">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="pr-12 backdrop-blur-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === "loading"}
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
                <Button
                  type="submit"
                  className="absolute right-1.5 top-1.5 h-7 w-7 p-1.5 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span className="sr-only">Subscribe</span>
                </Button>
              </form>
              {message && !showVerificationModal && (
                <p className={`mt-2 text-sm ${status === "error" ? "text-red-500" : "text-green-500"}`}>
                  {message}
                </p>
              )}
              <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
            </div>
            <div>
              <h3 className="mb-4 text-xl font-semibold font-heading">Quick Links</h3>
              <nav className="space-y-1 text-base relative z-30 font-body">
                <div 
                  onClick={() => {
                    const element = document.querySelector('#home');
                    if (element && element instanceof HTMLElement) {
                      const offset = 80;
                      const top = element.offsetTop - offset;
                      window.scrollTo({
                        top,
                        behavior: "smooth"
                      });
                    }
                  }}
                >
                  <a 
                    href="#home" 
                    className="block transition-colors hover:text-primary cursor-pointer"
                    onClick={(e) => e.preventDefault()}
                  >
                    Home
                  </a>
                </div>
                <div 
                  onClick={() => {
                    const element = document.querySelector('#how-it-works');
                    if (element && element instanceof HTMLElement) {
                      const offset = 80;
                      const top = element.offsetTop - offset;
                      window.scrollTo({
                        top,
                        behavior: "smooth"
                      });
                    }
                  }}
                >
                  <a 
                    href="#how-it-works" 
                    className="block transition-colors hover:text-primary cursor-pointer"
                    onClick={(e) => e.preventDefault()}
                  >
                    How It Works
                  </a>
                </div>
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
                >
                  <a 
                    href="#pricing" 
                    className="block transition-colors hover:text-primary cursor-pointer"
                    onClick={(e) => e.preventDefault()}
                  >
                    Pricing
                  </a>
                </div>
                <div 
                  onClick={() => {
                    const element = document.querySelector('#contact');
                    if (element && element instanceof HTMLElement) {
                      const offset = 80;
                      const top = element.offsetTop - offset;
                      window.scrollTo({
                        top,
                        behavior: "smooth"
                      });
                    }
                  }}
                >
                  <a 
                    href="#contact" 
                    className="block transition-colors hover:text-primary cursor-pointer"
                    onClick={(e) => e.preventDefault()}
                  >
                    Contact
                  </a>
                </div>
              </nav>
            </div>
            <div>
              <h3 className="mb-4 text-xl font-semibold font-heading">Contact Us</h3>
              <div className="space-y-1 text-base font-body">
                <p>Phone: (347) 389-3371</p>
                <p>Email: support@gifted.ink</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-zinc-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Gifted. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
                <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <VerificationModal
        email={email}
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onResend={handleResendVerification}
        title="Verify your email"
        description="Click the link in the email to verify your newsletter subscription."
      />
    </>
  )
}