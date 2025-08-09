import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
      status: {
        pending: "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200/80",
        inProgress: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200/80",
        completed: "border-transparent bg-green-100 text-green-800 hover:bg-green-200/80",
        cancelled: "border-transparent bg-red-100 text-red-800 hover:bg-red-200/80",
        onHold: "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200/80",
        delayed: "border-transparent bg-purple-100 text-purple-800 hover:bg-purple-200/80",
      },
      priority: {
        low: "border-transparent bg-blue-50 text-blue-700 hover:bg-blue-100/80",
        medium: "border-transparent bg-amber-50 text-amber-700 hover:bg-amber-100/80",
        high: "border-transparent bg-red-50 text-red-700 hover:bg-red-100/80",
        critical: "border-transparent bg-red-100 text-red-800 hover:bg-red-200/80",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.25 text-xs",
        lg: "px-3 py-0.75 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: string;
  withDot?: boolean;
  dotColor?: string;
}

function Badge({ className, variant, status, priority, size, icon, withDot, dotColor, ...props }: BadgeProps) {
  return (
    <div 
      className={cn(
        badgeVariants({ variant, status, priority, size }), 
        "relative inline-flex items-center gap-1",
        className
      )} 
      {...props} 
    >
      {withDot && (
        <span 
          className={cn(
            "block w-1.5 h-1.5 rounded-full mr-0.5", 
            dotColor ? dotColor : "bg-current"
          )} 
          aria-hidden="true"
        />
      )}
      {icon && <i className={cn("fas", icon, "text-[0.65rem] mr-1")} aria-hidden="true" />}
      <span>{props.children}</span>
    </div>
  )
}

export { Badge, badgeVariants }
