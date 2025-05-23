import * as React from "react"
import { cn } from "@/lib/utils"
import { Input, InputProps } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchInputProps extends Omit<InputProps, "onChange"> {
  onSearch?: (value: string) => void
  onChange?: (value: string) => void
  onClear?: () => void
  placeholder?: string
  value?: string
  clearable?: boolean
  searchButtonText?: string
  showSearchButton?: boolean
  className?: string
  inputClassName?: string
  debounceMs?: number
}

export function SearchInput({
  onSearch,
  onChange,
  onClear,
  placeholder = "Rechercher...",
  value: propValue,
  clearable = true,
  searchButtonText,
  showSearchButton = false,
  className,
  inputClassName,
  debounceMs = 300,
  ...props
}: SearchInputProps) {
  const [value, setValue] = React.useState(propValue || "")
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  // Synchroniser la valeur contrôlée
  React.useEffect(() => {
    if (propValue !== undefined && propValue !== value) {
      setValue(propValue)
    }
  }, [propValue, value])

  // Fonction pour gérer le changement de valeur
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    
    // Notification immédiate du changement si nécessaire
    onChange?.(newValue)
    
    // Pour la recherche, on utilise le debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    debounceTimerRef.current = setTimeout(() => {
      onSearch?.(newValue)
    }, debounceMs)
  }

  // Fonction pour effacer le champ
  const handleClear = () => {
    setValue("")
    onChange?.("")
    onSearch?.("")
    onClear?.()
    
    // Focus sur l'input après effacement
    inputRef.current?.focus()
  }

  // Gérer la recherche à l'appui de Entrée
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      onSearch?.(value)
    }
  }

  // Référence pour le focus
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <div className={cn("relative flex w-full max-w-md items-center gap-2", className)}>
      <div className="relative w-full">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
        
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "pl-9 pr-8 w-full focus-visible:ring-offset-1 focus-visible:ring-primary-300",
            inputClassName
          )}
          {...props}
        />
        
        {clearable && value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none focus:text-neutral-600"
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showSearchButton && (
        <Button 
          type="button" 
          onClick={() => onSearch?.(value)}
          className="shrink-0"
        >
          {searchButtonText || (
            <>
              <Search className="h-4 w-4 mr-1" />
              <span className="sr-only md:not-sr-only">Rechercher</span>
            </>
          )}
        </Button>
      )}
    </div>
  )
}
