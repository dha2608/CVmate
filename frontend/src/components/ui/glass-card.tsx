import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  glow?: boolean
  delay?: number
  gradient?: "cyan" | "purple" | "pink" | "blue" | "none"
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = true, glow = true, delay = 0, gradient = "none", children, ...props }, ref) => {
    const gradientClasses = {
      cyan: "before:bg-gradient-to-r before:from-cyan-500/20 before:via-transparent before:to-transparent",
      purple: "before:bg-gradient-to-r before:from-purple-500/20 before:via-transparent before:to-transparent",
      pink: "before:bg-gradient-to-r before:from-pink-500/20 before:via-transparent before:to-transparent",
      blue: "before:bg-gradient-to-r before:from-blue-500/20 before:via-transparent before:to-transparent",
      none: "",
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          "glass-card",
          gradient !== "none" && "relative before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 before:rounded-xl before:pointer-events-none",
          gradientClasses[gradient],
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={hover ? {
          y: -4,
          transition: { duration: 0.3, ease: "easeOut" }
        } : undefined}
        {...(props as any)}
      >
        {/* Glow effect on hover */}
        {glow && (
          <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 blur-2xl bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 -z-10 pointer-events-none" />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }
