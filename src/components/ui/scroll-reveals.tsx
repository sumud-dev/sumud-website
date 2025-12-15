"use client";

import { useRef, useEffect, useState, ReactNode } from "react";
import { motion, useInView, useAnimation, Variants } from "framer-motion";

// Animation variants for different reveal effects
const revealVariants: Record<string, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  scaleDown: {
    hidden: { opacity: 0, scale: 1.2 },
    visible: { opacity: 1, scale: 1 },
  },
  rotateIn: {
    hidden: { opacity: 0, rotate: -10 },
    visible: { opacity: 1, rotate: 0 },
  },
};

export type RevealAnimation = keyof typeof revealVariants;
export type RevealDirection = "up" | "down" | "left" | "right";

// Map direction to animation
const directionToAnimation: Record<RevealDirection, RevealAnimation> = {
  up: "fadeUp",
  down: "fadeDown",
  left: "fadeLeft",
  right: "fadeRight",
};

interface ScrollRevealProps {
  children: ReactNode;
  animation?: RevealAnimation;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
}

export function ScrollReveal({
  children,
  animation,
  direction = "up",
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  once = true,
  className = "",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const controls = useAnimation();

  // Use animation prop if provided, otherwise map from direction
  const resolvedAnimation = animation || directionToAnimation[direction] || "fadeUp";

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else if (!once) {
      controls.start("hidden");
    }
  }, [isInView, controls, once]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={revealVariants[resolvedAnimation]}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Staggered children reveal
interface StaggerRevealProps {
  children: ReactNode[];
  animation?: RevealAnimation;
  staggerDelay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
  childClassName?: string;
}

export function StaggerReveal({
  children,
  animation = "fadeUp",
  staggerDelay = 0.1,
  duration = 0.6,
  threshold = 0.1,
  once = true,
  className = "",
  childClassName = "",
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className={className}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={revealVariants[animation]}
          transition={{ duration, ease: [0.25, 0.1, 0.25, 1] }}
          className={childClassName}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Typewriter effect on scroll
interface TypewriterOnScrollProps {
  text: string;
  className?: string;
  speed?: number;
  threshold?: number;
  once?: boolean;
  cursor?: boolean;
  cursorChar?: string;
}

export function TypewriterOnScroll({
  text,
  className = "",
  speed = 50,
  threshold = 0.5,
  once = true,
  cursor = true,
  cursorChar = "|",
}: TypewriterOnScrollProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isInView) {
      if (!once) {
        setDisplayedText("");
        setIsTyping(false);
      }
      return;
    }

    setIsTyping(true);
    let currentIndex = 0;

    const intervalId = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(intervalId);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [isInView, text, speed, once]);

  return (
    <span ref={ref} className={className}>
      {displayedText}
      {cursor && (
        <span
          className={`inline-block ml-0.5 ${isTyping ? "animate-pulse" : "opacity-0"}`}
        >
          {cursorChar}
        </span>
      )}
    </span>
  );
}

// Counter animation on scroll
interface CounterOnScrollProps {
  end: number;
  start?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatter?: (value: number) => string;
}

export function CounterOnScroll({
  end,
  start = 0,
  duration = 2000,
  threshold = 0.5,
  once = true,
  prefix = "",
  suffix = "",
  className = "",
  formatter = (value) => Math.round(value).toString(),
}: CounterOnScrollProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!isInView) {
      if (!once) {
        setCount(start);
      }
      return;
    }

    const startTime = Date.now();
    const difference = end - start;

    const updateCount = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentCount = start + difference * easeOut;
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [isInView, start, end, duration, once]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatter(count)}
      {suffix}
    </span>
  );
}

// Parallax scroll effect
interface ParallaxScrollProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxScroll({
  children,
  speed = 0.5,
  className = "",
}: ParallaxScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
      
      setOffset((clampedProgress - 0.5) * 100 * speed);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        style={{ y: offset }}
        transition={{ type: "tween", duration: 0 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
