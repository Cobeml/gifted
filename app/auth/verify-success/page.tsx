"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

export default function VerifySuccess() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If no stored password or not authenticated, redirect to home
    if (!sessionStorage.getItem("signup_password") || !session?.user) {
      router.push("/");
    }
  }, [session, router]);

  const handleSetPassword = async () => {
    setIsLoading(true);
    setError("");

    try {
      const password = sessionStorage.getItem("signup_password");
      if (!password) {
        throw new Error("No password found");
      }

      const response = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Clear stored password
      sessionStorage.removeItem("signup_password");

      // Redirect to home
      router.push("/");
    } catch (error) {
      console.error("Error setting password:", error);
      setError(error instanceof Error ? error.message : "Failed to set password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-bold">Email Verified!</h1>
        <p className="text-muted-foreground">
          Your email has been verified. Click below to complete your account setup.
        </p>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        <Button
          onClick={handleSetPassword}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Setting up..." : "Complete Setup"}
        </Button>
      </div>
    </div>
  );
} 