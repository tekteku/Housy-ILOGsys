import * as React from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface LoadingIndicatorProps {
  type?: "spinner" | "skeleton" | "dots"
  text?: string
  className?: string
  count?: number // Nombre de squelettes à afficher
  height?: string
  fullScreen?: boolean
}

export function LoadingIndicator({
  type = "spinner",
  text = "Chargement en cours...",
  className,
  count = 3,
  height = "h-16",
  fullScreen = false
}: LoadingIndicatorProps) {
  const content = React.useMemo(() => {
    switch (type) {
      case "skeleton":
        return (
          <div className="w-full space-y-3">
            {Array.from({ length: count }).map((_, i) => (
              <Skeleton key={i} className={cn(height, "w-full")} />
            ))}
          </div>
        )
      case "dots":
        return (
          <div className="flex items-center justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-2 w-2 rounded-full bg-primary-600",
                    "animate-pulse",
                    i === 0 && "animation-delay-0",
                    i === 1 && "animation-delay-150",
                    i === 2 && "animation-delay-300",
                  )}
                  style={{
                    animationDelay: `${i * 150}ms`
                  }}
                />
              ))}
            </div>
            {text && <span className="ml-2 text-neutral-500 text-sm">{text}</span>}
          </div>
        )
      case "spinner":
      default:
        return (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
            {text && <span className="ml-2 text-neutral-500 text-sm">{text}</span>}
          </div>
        )
    }
  }, [type, text, count, height])

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className={cn("text-center", className)}>
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("py-4", className)}>
      {content}
    </div>
  )
}
