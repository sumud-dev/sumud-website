"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/lib/utils/utils";

const floatingActionButtonVariants = cva(
  "fixed z-50 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        primary: "bg-[#781D32] text-white hover:bg-[#781D32]/90 focus:ring-[#781D32]",
        secondary: "bg-[#55613C] text-white hover:bg-[#55613C]/90 focus:ring-[#55613C]",
        outline: "bg-white border-2 border-[#781D32] text-[#781D32] hover:bg-[#781D32]/10 focus:ring-[#781D32]",
      },
      size: {
        sm: "h-10 w-10",
        md: "h-12 w-12",
        lg: "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface FloatingActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof floatingActionButtonVariants> {}

const FloatingActionButton = React.forwardRef<
  HTMLButtonElement,
  FloatingActionButtonProps
>(({ className, variant, size, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(floatingActionButtonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </button>
  );
});

FloatingActionButton.displayName = "FloatingActionButton";

export { FloatingActionButton, floatingActionButtonVariants };
