"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export type CelebrationType = "confetti" | "fireworks" | "hearts" | "stars";

export interface CelebrationProps {
  show: boolean;
  type?: CelebrationType;
  message?: string;
  count?: number;
  onComplete?: () => void;
}

export function Celebration({
  show,
  type = "confetti",
  message,
  count = 100,
  onComplete,
}: CelebrationProps) {
  useEffect(() => {
    if (!show) return;

    const duration = 3000;
    const end = Date.now() + duration;

    const runAnimation = () => {
      switch (type) {
        case "confetti":
          confetti({
            particleCount: count,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#781D32", "#2D3320", "#55613C", "#C9A227", "#E8E4D9"],
          });
          break;

        case "fireworks":
          const defaults = {
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            zIndex: 9999,
            colors: ["#781D32", "#2D3320", "#55613C", "#C9A227"],
          };

          const randomInRange = (min: number, max: number) =>
            Math.random() * (max - min) + min;

          const interval = setInterval(() => {
            const timeLeft = end - Date.now();
            if (timeLeft <= 0) {
              clearInterval(interval);
              return;
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
              ...defaults,
              particleCount,
              origin: {
                x: randomInRange(0.1, 0.3),
                y: Math.random() - 0.2,
              },
            });
            confetti({
              ...defaults,
              particleCount,
              origin: {
                x: randomInRange(0.7, 0.9),
                y: Math.random() - 0.2,
              },
            });
          }, 250);

          return () => clearInterval(interval);

        case "hearts":
          const heartShape = confetti.shapeFromText({ text: "❤️", scalar: 2 });
          confetti({
            shapes: [heartShape],
            particleCount: count / 2,
            spread: 60,
            origin: { y: 0.7 },
            scalar: 2,
          });
          break;

        case "stars":
          const starShape = confetti.shapeFromText({ text: "⭐", scalar: 2 });
          confetti({
            shapes: [starShape],
            particleCount: count / 2,
            spread: 80,
            origin: { y: 0.6 },
            scalar: 2,
            colors: ["#C9A227", "#FFD700", "#FFA500"],
          });
          break;
      }
    };

    runAnimation();

    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [show, type, count, onComplete]);

  return (
    <AnimatePresence>
      {show && message && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
        >
          <div className="bg-gradient-to-r from-[#781D32] to-[#2D3320] text-white px-8 py-4 rounded-full shadow-2xl border-2 border-white/20">
            <p className="text-lg font-bold text-center whitespace-nowrap">
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Custom hook for managing celebration state
export interface CelebrationState {
  show: boolean;
  type: CelebrationType;
  message: string;
  count: number;
}

export function useCelebration() {
  const [celebration, setCelebration] = useState<CelebrationState>({
    show: false,
    type: "confetti",
    message: "",
    count: 100,
  });

  const triggerCelebration = useCallback(
    (options?: Partial<Omit<CelebrationState, "show">>) => {
      setCelebration({
        show: true,
        type: options?.type || "confetti",
        message: options?.message || "",
        count: options?.count || 100,
      });
    },
    []
  );

  const completeCelebration = useCallback(() => {
    setCelebration((prev) => ({ ...prev, show: false }));
  }, []);

  return {
    celebration,
    triggerCelebration,
    completeCelebration,
  };
}
