"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Link } from "@/src/i18n/navigation";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocaleError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Page error caught:", error);
  }, [error]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FAFAF9] to-[#E7E5E4] flex items-center justify-center p-4">
        <motion.div
          className="text-center max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-[#3E442B] mb-4">
            Something Went Wrong
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            An unexpected error occurred on this page. Please try again or return home.
          </p>

          {process.env.NODE_ENV === "development" && error.message && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-sm font-mono text-red-700 break-words">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={reset}
              className="bg-[#781D32] hover:bg-[#781D32]/90 text-white px-8 py-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            <Link href="/en">
              <Button
                variant="outline"
                className="border-[#55613C] text-[#55613C] hover:bg-[#55613C] hover:text-white px-8 py-2 w-full sm:w-auto"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
