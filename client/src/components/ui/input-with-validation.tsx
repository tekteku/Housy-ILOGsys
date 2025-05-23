import React, { useState } from "react"
import { Input, type InputProps } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { HelpTooltip } from "@/components/ui/enhanced-tooltip"
import { Check, X, AlertCircle } from "lucide-react"

export interface InputWithValidationProps extends Omit<InputProps, "onChange"> {
  label?: string
  hint?: string
  helpText?: string
  error?: string
  success?: string
  showSuccessIcon?: boolean
  showErrorIcon?: boolean
  labelClassName?: string
  helperClassName?: string
  containerClassName?: string
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void
  isValid?: boolean
  isInvalid?: boolean
  required?: boolean
  validate?: (value: string) => { isValid: boolean; message?: string }
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

export function InputWithValidation({
  label,
  hint,
  helpText,
  error,
  success,
  showSuccessIcon = true,
  showErrorIcon = true,
  className,
  labelClassName,
  helperClassName,
  containerClassName,
  isValid,
  isInvalid,
  required = false,
  validate,
  validateOnChange = false,
  validateOnBlur = true,
  onChange,
  onBlur,
  id,
  ...props
}: InputWithValidationProps) {
  const [localValue, setLocalValue] = useState(props.value as string || "")
  const [localError, setLocalError] = useState<string | undefined>(error)
  const [localSuccess, setLocalSuccess] = useState<string | undefined>(success)
  const [touched, setTouched] = useState(false)
  const [focused, setFocused] = useState(false)
  
  // Générer un ID unique si non fourni
  const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`
  
  // État de validation
  const hasError = error || localError || isInvalid
  const hasSuccess = (success || localSuccess || isValid) && !hasError
  
  // Gérer le changement de valeur
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalValue(value)
    
    // Validation à la saisie si activée
    if (validateOnChange && validate && touched) {
      const validation = validate(value)
      if (!validation.isValid) {
        setLocalError(validation.message || "Invalide")
        setLocalSuccess(undefined)
      } else {
        setLocalError(undefined)
        setLocalSuccess(success || "Valide")
      }
    }
    
    // Appeler le onChange fourni par le parent
    onChange?.(value, e)
  }
  
  // Gérer la perte de focus
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false)
    setTouched(true)
    
    // Validation au blur si activée
    if (validateOnBlur && validate) {
      const validation = validate(localValue)
      if (!validation.isValid) {
        setLocalError(validation.message || "Invalide")
        setLocalSuccess(undefined)
      } else {
        setLocalError(undefined)
        setLocalSuccess(success || "Valide")
      }
    }
    
    onBlur?.(e)
  }
  
  // Gérer le focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true)
    props.onFocus?.(e)
  }

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label 
            htmlFor={inputId} 
            className={cn(
              hasError && "text-red-500",
              labelClassName
            )}
          >
            <span className="flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
              {helpText && (
                <HelpTooltip content={helpText} size="sm" />
              )}
            </span>
          </Label>
          
          {hint && (
            <span className="text-xs text-neutral-500">{hint}</span>
          )}
        </div>
      )}
      
      <div className="relative">
        <Input
          id={inputId}
          className={cn(
            "pr-9", // Make space for icons
            hasError && "border-red-500 focus-visible:ring-red-500",
            hasSuccess && "border-green-500 focus-visible:ring-green-500",
            className
          )}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          aria-invalid={hasError ? "true" : "false"}
          aria-describedby={
            hasError 
              ? `${inputId}-error` 
              : hasSuccess 
              ? `${inputId}-success` 
              : undefined
          }
          required={required}
          {...props}
        />
        
        {/* Icône de validation */}
        {!focused && ( // N'afficher que lorsque non focus
          <>
            {hasSuccess && showSuccessIcon && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                <Check className="h-4 w-4" />
              </div>
            )}
            
            {hasError && showErrorIcon && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                <X className="h-4 w-4" />
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Message d'aide, erreur ou succès */}
      {(hasError || hasSuccess || helpText) && (
        <div 
          className={cn(
            "text-xs flex items-center gap-1.5 mt-1",
            hasError ? "text-red-500" : hasSuccess ? "text-green-600" : "text-neutral-500",
            helperClassName
          )}
          id={hasError ? `${inputId}-error` : hasSuccess ? `${inputId}-success` : undefined}
        >
          {hasError && <AlertCircle className="h-3 w-3" />}
          {hasError ? error || localError : hasSuccess ? success || localSuccess : null}
        </div>
      )}
    </div>
  )
}
