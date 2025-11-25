import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface FeedbackButtonProps extends Omit<ButtonProps, "children"> {
  children: React.ReactNode
  isLoading?: boolean
  loadingText?: string
  isSuccess?: boolean
  successText?: string
  successDuration?: number
  onSuccess?: () => void
}

export function FeedbackButton({
  children,
  isLoading = false,
  loadingText,
  isSuccess = false,
  successText = "Succès !",
  successDuration = 2000,
  onSuccess,
  className,
  onClick,
  ...props
}: FeedbackButtonProps) {
  const [showSuccess, setShowSuccess] = React.useState(false)

  React.useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true)
      const timer = setTimeout(() => {
        setShowSuccess(false)
        onSuccess?.()
      }, successDuration)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, successDuration, onSuccess])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!isLoading && !showSuccess && onClick) {
      onClick(event)
    }
  }

  return (
    <Button
      className={cn("relative", className)}
      onClick={handleClick}
      disabled={isLoading || showSuccess}
      {...props}
    >
      <span
        className={cn(
          "flex items-center justify-center gap-2 transition-opacity",
          (isLoading || showSuccess) && "opacity-0"
        )}
      >
        {children}
      </span>
      
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText && <span>{loadingText}</span>}
        </span>
      )}
      
      {showSuccess && !isLoading && (
        <span className="absolute inset-0 flex items-center justify-center gap-2 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          {successText}
        </span>
      )}
    </Button>
  )
}
