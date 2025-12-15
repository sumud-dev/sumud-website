"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CulturalEasterEggsProps {
  children: ReactNode;
  enabled?: boolean;
}

// Palestinian cultural symbols and messages
const CULTURAL_MESSAGES = [
  { text: "صمود", translation: "Sumud - Steadfastness" },
  { text: "فلسطين", translation: "Palestine" },
  { text: "الحرية", translation: "Freedom" },
  { text: "العودة", translation: "Return" },
  { text: "المقاومة", translation: "Resistance" },
  { text: "الأمل", translation: "Hope" },
];

const CULTURAL_SYMBOLS = ["🇵🇸", "🫒", "🕊️", "☀️", "🌿", "🏠"];

// Konami code sequence (module-level constant)
const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

export function CulturalEasterEggs({
  children,
  enabled = true,
}: CulturalEasterEggsProps) {
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(CULTURAL_MESSAGES[0]);
  const [currentSymbol, setCurrentSymbol] = useState(CULTURAL_SYMBOLS[0]);
  const [konamiProgress, setKonamiProgress] = useState<string[]>([]);

  const triggerEasterEgg = useCallback(() => {
    const randomMessage =
      CULTURAL_MESSAGES[Math.floor(Math.random() * CULTURAL_MESSAGES.length)];
    const randomSymbol =
      CULTURAL_SYMBOLS[Math.floor(Math.random() * CULTURAL_SYMBOLS.length)];

    setCurrentMessage(randomMessage);
    setCurrentSymbol(randomSymbol);
    setShowEasterEgg(true);

    setTimeout(() => {
      setShowEasterEgg(false);
    }, 3000);
  }, []);

  // Listen for Konami code
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const newProgress = [...konamiProgress, e.code];

      // Check if the sequence matches so far
      const isValid = newProgress.every(
        (key, index) => key === KONAMI_CODE[index]
      );

      if (!isValid) {
        setKonamiProgress([]);
        return;
      }

      if (newProgress.length === KONAMI_CODE.length) {
        triggerEasterEgg();
        setKonamiProgress([]);
      } else {
        setKonamiProgress(newProgress);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, konamiProgress, triggerEasterEgg]);

  // Random trigger on scroll (very low probability)
  useEffect(() => {
    if (!enabled) return;

    let scrollCount = 0;
    const handleScroll = () => {
      scrollCount++;
      // Trigger easter egg every ~50 scrolls with 5% probability
      if (scrollCount % 50 === 0 && Math.random() < 0.05) {
        triggerEasterEgg();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enabled, triggerEasterEgg]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children}

      {/* Easter Egg Display */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="fixed bottom-8 right-8 z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-br from-[#781D32] to-[#2D3320] text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentSymbol}</span>
                <div>
                  <p className="text-2xl font-bold" dir="rtl">
                    {currentMessage.text}
                  </p>
                  <p className="text-sm text-white/80">
                    {currentMessage.translation}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating cultural symbols (subtle background animation) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {enabled &&
          CULTURAL_SYMBOLS.slice(0, 3).map((symbol, index) => (
            <motion.div
              key={symbol}
              className="absolute text-4xl opacity-5"
              initial={{
                x: `${20 + index * 30}%`,
                y: "110%",
              }}
              animate={{
                y: "-10%",
              }}
              transition={{
                duration: 60 + index * 20,
                repeat: Infinity,
                ease: "linear",
                delay: index * 10,
              }}
            >
              {symbol}
            </motion.div>
          ))}
      </div>
    </div>
  );
}

// Hook to manually trigger easter eggs
export function useEasterEgg() {
  const [isTriggered, setIsTriggered] = useState(false);

  const trigger = useCallback(() => {
    setIsTriggered(true);
    setTimeout(() => setIsTriggered(false), 3000);
  }, []);

  return { isTriggered, trigger };
}
