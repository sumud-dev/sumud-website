import type { Variants } from "framer-motion";

/**
 * Shared animation variants for consistent motion across the application.
 * Use these with Framer Motion's variants prop for optimized performance.
 */

/**
 * Fade in from below animation.
 * Use for individual items that should slide up while fading in.
 */
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
};

/**
 * Fade in from above animation.
 * Use for items that should slide down while fading in.
 */
export const fadeInDown: Variants = {
  initial: {
    opacity: 0,
    y: -20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
};

/**
 * Fade in from left animation.
 */
export const fadeInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
};

/**
 * Fade in from right animation.
 */
export const fadeInRight: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
};

/**
 * Simple fade animation without movement.
 */
export const fadeIn: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

/**
 * Stagger container animation.
 * Apply to a parent element to stagger the animations of children.
 * Children should use fadeInUp or similar variants.
 *
 * @example
 * ```tsx
 * <motion.div variants={staggerContainer} initial="initial" animate="animate">
 *   <motion.div variants={fadeInUp}>Child 1</motion.div>
 *   <motion.div variants={fadeInUp}>Child 2</motion.div>
 * </motion.div>
 * ```
 */
export const staggerContainer: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
      delayChildren: 0,
    },
  },
};

/**
 * Fast stagger container with shorter delays.
 */
export const staggerContainerFast: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
};

/**
 * Scale up animation for hover effects.
 */
export const scaleUp: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
  },
  tap: {
    scale: 0.98,
  },
};

/**
 * Standard transition timing for consistent animation feel.
 */
export const defaultTransition = {
  duration: 0.6,
  ease: [0.4, 0, 0.2, 1], // Smooth easing
};

/**
 * Fast transition for micro-interactions.
 */
export const fastTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};

/**
 * Spring transition for bouncy effects.
 */
export const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};
