import { useToast } from "@/hooks/use-toast"
import { useCallback } from "react"

interface NotificationOptions {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success" | "info" | "warning"
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export function useNotification() {
  const { toast } = useToast()

  const showNotification = useCallback(
    (options: NotificationOptions) => {
      const { title, description, variant = "default", duration = 5000, action } = options
      
      // Déterminer les styles selon la variante
      const variantStyles = {
        success: "bg-green-50 border-green-200 text-green-700",
        info: "bg-blue-50 border-blue-200 text-blue-700",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
        destructive: "bg-red-50 border-red-200 text-red-700",
        default: ""
      }

      toast({
        title,
        description,
        variant: variant === "default" || variant === "destructive" ? variant : "default",
        className: variant !== "default" && variant !== "destructive" 
          ? variantStyles[variant] 
          : "",
        duration,
        action: action ? {
          label: action.label,
          onClick: action.onClick,
        } : undefined,
      })
    },
    [toast]
  )

  // Fonctions d'aide pour les cas d'utilisation courants
  const success = useCallback(
    (title: string, description?: string, duration?: number) => {
      showNotification({ title, description, variant: "success", duration })
    },
    [showNotification]
  )

  const error = useCallback(
    (title: string, description?: string, duration?: number) => {
      showNotification({ title, description, variant: "destructive", duration })
    },
    [showNotification]
  )

  const info = useCallback(
    (title: string, description?: string, duration?: number) => {
      showNotification({ title, description, variant: "info", duration })
    },
    [showNotification]
  )

  const warning = useCallback(
    (title: string, description?: string, duration?: number) => {
      showNotification({ title, description, variant: "warning", duration })
    },
    [showNotification]
  )

  return {
    showNotification,
    success,
    error,
    info,
    warning
  }
}
