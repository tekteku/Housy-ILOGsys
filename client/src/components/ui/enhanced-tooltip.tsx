import * as React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface EnhancedTooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  delay?: number
  className?: string
  contentClassName?: string
  withArrow?: boolean
  disabled?: boolean
}

export function EnhancedTooltip({
  content,
  children,
  side = "top",
  align = "center",
  delay = 0,
  className,
  contentClassName,
  withArrow = true,
  disabled = false
}: EnhancedTooltipProps) {
  // Si aucun contenu ou désactivé, retourner seulement les enfants
  if (!content || disabled) {
    return <>{children}</>
  }

  return (
    <TooltipProvider delayDuration={delay}>
      <Tooltip>
        <TooltipTrigger asChild className={className}>
          <span>{children}</span>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            "px-3 py-1.5 text-xs font-medium bg-neutral-800 text-white border-neutral-800 shadow-lg",
            withArrow && "relative after:content-[''] after:absolute after:border-[5px] after:border-transparent", 
            side === "top" && withArrow && "after:top-full after:border-t-neutral-800 after:left-1/2 after:-ml-1",
            side === "bottom" && withArrow && "after:bottom-full after:border-b-neutral-800 after:left-1/2 after:-ml-1",
            side === "left" && withArrow && "after:left-full after:border-l-neutral-800 after:top-1/2 after:-mt-1",
            side === "right" && withArrow && "after:right-full after:border-r-neutral-800 after:top-1/2 after:-mt-1",
            contentClassName
          )}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Variante avec icône d'aide
interface HelpTooltipProps extends Omit<EnhancedTooltipProps, "children"> {
  iconClassName?: string
  size?: "sm" | "md" | "lg"
}

export function HelpTooltip({
  content,
  iconClassName,
  size = "md",
  ...props
}: HelpTooltipProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <EnhancedTooltip content={content} {...props}>
      <span 
        className={cn(
          "inline-flex items-center justify-center rounded-full border border-neutral-300 text-neutral-500 hover:bg-neutral-100 cursor-help transition-colors",
          sizeClasses[size],
          iconClassName
        )}
      >
        <i className="fas fa-question text-[0.6em]" aria-hidden="true"></i>
        <span className="sr-only">Aide</span>
      </span>
    </EnhancedTooltip>
  )
}
