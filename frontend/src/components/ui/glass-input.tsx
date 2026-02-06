import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export interface GlassInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  glowColor?: "cyan" | "purple" | "pink" | "blue"
}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, label, error, glowColor = "cyan", ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const glowColors = {
      cyan: "from-cyan-400/50 to-cyan-600/50",
      purple: "from-purple-400/50 to-purple-600/50",
      pink: "from-pink-400/50 to-pink-600/50",
      blue: "from-blue-400/50 to-blue-600/50",
    }

    React.useEffect(() => {
      if (props.value !== undefined) {
        setHasValue(String(props.value).length > 0)
      }
    }, [props.value])

    return (
      <div className="relative w-full">
        {/* Label */}
        {label && (
          <motion.label
            className={cn(
              "absolute left-4 text-sm font-medium transition-all duration-300 pointer-events-none",
              isFocused || hasValue
                ? "top-2 text-xs text-white/90"
                : "top-1/2 -translate-y-1/2 text-white/70"
            )}
            initial={false}
            animate={{
              y: isFocused || hasValue ? 0 : "50%",
              scale: isFocused || hasValue ? 0.85 : 1,
            }}
          >
            {label}
          </motion.label>
        )}

        {/* Input */}
        <motion.input
          ref={ref}
          className={cn(
            "glass-input w-full rounded-lg px-4 py-3 text-white placeholder:text-white/50",
            "border border-white/20 focus:border-white/40",
            "bg-white/5 dark:bg-gray-900/30",
            "backdrop-blur-xl",
            "transition-all duration-300",
            label && (isFocused || hasValue) && "pt-6 pb-2",
            error && "border-red-400/50 focus:border-red-400",
            className
          )}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          onChange={(e) => {
            setHasValue(e.target.value.length > 0)
            props.onChange?.(e)
          }}
          {...(props as any)}
          style={{
            ...props.style,
          }}
        />

        {/* Focus glow effect */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              className={cn(
                "absolute inset-0 rounded-lg pointer-events-none -z-10",
                `bg-gradient-to-r ${glowColors[glowColor]} blur-xl opacity-50`
              )}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 0.5, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              className="absolute -bottom-5 left-4 text-xs text-red-400"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)
GlassInput.displayName = "GlassInput"

export { GlassInput }
