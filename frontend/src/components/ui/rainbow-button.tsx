import React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import { Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

const rainbowButtonVariants = cva(
  cn(
    "relative cursor-pointer group transition-all duration-300",
    "inline-flex items-center justify-center gap-2 shrink-0",
    "rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
    "text-sm font-semibold whitespace-nowrap",
    "disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none",
    "overflow-hidden",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0"
  ),
  {
    variants: {
      variant: {
        default: cn(
          "text-white shadow-lg shadow-[#4B733C]/50",
          "hover:shadow-xl hover:shadow-[#34D399]/50",
          "hover:scale-[1.02] active:scale-[0.98]",
          "before:absolute before:inset-0",
          "before:bg-gradient-to-r before:from-[#5a8a4a] before:via-[#34D399] before:to-[#4B733C]",
          "before:opacity-0 before:transition-opacity before:duration-300",
          "hover:before:opacity-100"
        ),
        outline:
          "border-2 border-gradient-to-r from-[#4B733C] via-[#5a8a4a] to-[#34D399] bg-background text-foreground shadow-xs hover:shadow-sm hover:bg-accent active:bg-accent/80",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface RainbowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof rainbowButtonVariants> {
  asChild?: boolean
}

const RainbowButton = React.forwardRef<HTMLButtonElement, RainbowButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isDefaultVariant = variant === "default" || variant === undefined
    
    return (
      <Comp
        data-slot="button"
        className={cn(rainbowButtonVariants({ variant, size, className }))}
        ref={ref}
        style={isDefaultVariant ? {
          background: "linear-gradient(90deg, #4B733C, #5a8a4a, #34D399, #4B733C)",
          backgroundSize: "200% 100%",
          animation: "shimmer-gradient 3s ease infinite"
        } : undefined}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">
          <Sparkles className="size-4 animate-pulse" />
          {children}
        </span>
        {/* Shimmer effect overlay */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
            animation: "shimmer 2s infinite"
          }}
        />
      </Comp>
    )
  }
)

RainbowButton.displayName = "RainbowButton"

export { RainbowButton, rainbowButtonVariants, type RainbowButtonProps }
