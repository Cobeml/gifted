"use client"

import * as React from "react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Send } from "lucide-react"

function Footerdemo() {
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe")
      }

      setStatus("success")
      setMessage("Successfully subscribed to newsletter!")
      setEmail("")
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message || "Failed to subscribe. Please try again.")
    }

    // Reset status after 3 seconds
    setTimeout(() => {
      setStatus("idle")
      setMessage("")
    }, 3000)
  }

  return (
    <footer className="relative border-t border-zinc-400 dark:border-zinc-600 bg-[hsl(51.95,80%,78%)] dark:bg-zinc-900/80 text-[hsl(0,59%,30%)] dark:text-[hsl(0,59%,40%)] backdrop-blur-sm transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-[hsl(0,59%,30%)] dark:text-[hsl(0,59%,40%)]">Stay Connected</h2>
            <p className="mb-6 text-[hsl(0,59%,30%)] dark:text-[hsl(0,59%,40%)]">
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
              <Button
                type="submit"
                size="icon"
                className={`absolute right-1 top-1 h-8 w-8 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 ${
                  status === "loading" ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={status === "loading"}
              >
                <Send className={`h-4 w-4 ${status === "loading" ? "animate-pulse" : ""}`} />
                <span className="sr-only">Subscribe</span>
              </Button>
            </form>
            {message && (
              <p className={`mt-2 text-sm ${
                status === "success" ? "text-green-500" : "text-red-500"
              }`}>
                {message}
              </p>
            )}
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold text-[hsl(0,59%,30%)] dark:text-[hsl(0,59%,40%)]">Quick Links</h3>
            <nav className="space-y-2 text-sm relative z-30">
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
                  className="block transition-colors hover:text-[hsl(0,59%,40%)] text-[hsl(0,59%,30%)] dark:text-[hsl(0,59%,40%)] cursor-pointer"
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
                  className="block transition-colors hover:text-[hsl(0,59%,40%)] text-[hsl(0,59%,30%)] dark:text-[hsl(0,59%,40%)] cursor-pointer"
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
                  className="block transition-colors hover:text-[hsl(0,59%,40%)] text-[hsl(0,59%,30%)] dark:text-[hsl(0,59%,40%)] cursor-pointer"
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
                  className="block transition-colors hover:text-[hsl(0,59%,40%)] text-[hsl(0,59%,30%)] dark:text-[hsl(0,59%,40%)] cursor-pointer"
                  onClick={(e) => e.preventDefault()}
                >
                  Contact
                </a>
              </div>
            </nav>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold text-[hsl(0,59%,30%)] dark:text-[hsl(0,59%,40%)]">Contact Us</h3>
            <div className="space-y-2 text-sm text-[hsl(0,59%,30%)] dark:text-[hsl(0,59%,40%)]">
              <p>Phone: (347) 389-3371</p>
              <p>Email: support@gifted.ink</p>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center border-t border-zinc-400 dark:border-zinc-600 pt-4">
          <p className="text-sm text-[hsl(0,59%,30%)] dark:text-[hsl(0,59%,40%)]">
            © 2024 Gifted. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export { Footerdemo }