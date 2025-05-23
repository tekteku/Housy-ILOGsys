import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  title: string
  description: string
  icon?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  iconClassName?: string
}

export function EmptyState({
  title,
  description,
  icon = "fa-folder-open",
  action,
  className,
  iconClassName,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-8 px-4", className)}>
      <div className={cn(
        "w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4",
        iconClassName
      )}>
        <i className={`fas ${icon} text-2xl`}></i>
      </div>
      <h3 className="text-lg font-medium text-neutral-800 mb-2">
        {title}
      </h3>
      <p className="text-sm text-neutral-500 mb-6 max-w-sm">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="default" className="animate-fade-in">
          {action.label}
        </Button>
      )}
    </div>
  )
}
