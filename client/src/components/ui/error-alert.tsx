import * as React from "react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, AlertTriangle, XCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

type ErrorSeverity = "error" | "warning" | "info"

interface ErrorAlertProps {
  title: string
  description?: string
  severity?: ErrorSeverity
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  dismissible?: boolean
  errorCode?: string
}

export function ErrorAlert({
  title,
  description,
  severity = "error",
  action,
  className,
  dismissible = false,
  errorCode
}: ErrorAlertProps) {
  const [dismissed, setDismissed] = React.useState(false)

  if (dismissed) {
    return null
  }

  const getIcon = () => {
    switch (severity) {
      case "error":
        return <XCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "info":
        return <Info className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getAlertClass = () => {
    switch (severity) {
      case "error":
        return "border-red-500/30 bg-red-500/10 text-red-600"
      case "warning":
        return "border-amber-500/30 bg-amber-500/10 text-amber-600"
      case "info":
        return "border-blue-500/30 bg-blue-500/10 text-blue-600"
      default:
        return ""
    }
  }

  return (
    <Alert className={cn("animate-fade-in", getAlertClass(), className)}>
      <div className="flex w-full items-center gap-3">
        {getIcon()}
        <div className="flex-1">
          <AlertTitle className="mb-1 font-medium">{title}</AlertTitle>
          {description && (
            <AlertDescription className="text-sm opacity-80">
              {description}
            </AlertDescription>
          )}
          {errorCode && (
            <p className="text-xs opacity-70 mt-1">
              Code: {errorCode}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {action && (
            <Button 
              onClick={action.onClick} 
              variant="outline" 
              size="sm"
              className="text-xs border-current bg-white/20 hover:bg-white/30"
            >
              {action.label}
            </Button>
          )}
          {dismissible && (
            <Button 
              onClick={() => setDismissed(true)} 
              variant="ghost" 
              size="sm"
              className="opacity-70 hover:opacity-100"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  )
}
