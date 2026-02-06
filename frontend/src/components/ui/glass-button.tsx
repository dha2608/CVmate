import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const glassButtonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-lg font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white",
        cyan: "bg-gradient-to-r from-cyan-400 to-cyan-600 text-white",
        purple: "bg-gradient-to-r from-purple-400 to-purple-600 text-white",
        pink: "bg-gradient-to-r from-pink-400 to-pink-600 text-white",
        blue: "bg-gradient-to-r from-blue-400 to-blue-600 text-white",
        glass: "glass-button text-white",
        outline: "glass-button border-2 border-white/30 text-white hover:border-white/50",
      },
      size: {
        default: "h-11 px-6 py-2.5 text-sm",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  glow?: boolean
  animated?: boolean
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, glow = true, animated = true, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(glassButtonVariants({ variant, size, className }))}
        whileHover={animated ? { 
          scale: 1.02,
          boxShadow: glow ? "0 0 20px rgba(139, 92, 246, 0.5)" : undefined
        } : undefined}
        whileTap={animated ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.2, ease: "easeOut" }}
        {...(props as any)}
      >
        {/* Animated gradient overlay */}
        {animated && variant !== "outline" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "linear"
            }}
          />
        )}
        
        {/* Glow effect */}
        {glow && variant !== "outline" && (
          <div className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 -z-10" />
        )}
        
        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </motion.button>
    )
  }
)
GlassButton.displayName = "GlassButton"

export { GlassButton, glassButtonVariants }
