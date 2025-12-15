"use client";

import * as React from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils/utils";

interface NewsletterSignupProps {
  variant?: "default" | "compact";
  className?: string;
}

export default function NewsletterSignup({
  variant = "default",
  className,
}: NewsletterSignupProps) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    
    // Simulate API call - replace with actual newsletter subscription logic
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={cn("flex gap-2", className)}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          disabled={status === "loading"}
        />
        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "..." : "Subscribe"}
        </Button>
      </form>
    );
  }

  return (
    <div className={cn("text-center py-12", className)}>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
        Stay Connected
      </h2>
      <p className="text-white/80 mb-8 max-w-2xl mx-auto">
        Subscribe to our newsletter for the latest updates on events, campaigns,
        and ways to support Palestinian rights.
      </p>

      {status === "success" ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
          <p className="text-white font-medium">
            Thank you for subscribing! We&apos;ll keep you updated.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
        >
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white focus:ring-white"
            disabled={status === "loading"}
            required
          />
          <Button
            type="submit"
            disabled={status === "loading"}
            className="bg-white text-[#55613C] hover:bg-white/90 font-semibold px-8"
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      )}

      {status === "error" && (
        <p className="text-red-300 mt-4">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
