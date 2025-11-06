import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface FontOption {
  value: string
  label: string
  category: string
}

const POPULAR_FONTS: FontOption[] = [
  // Sans-serif fonts
  { value: 'Inter', label: 'Inter', category: 'Modern Sans' },
  { value: 'Roboto', label: 'Roboto', category: 'Google Sans' },
  { value: 'Poppins', label: 'Poppins', category: 'Geometric Sans' },
  { value: 'Montserrat', label: 'Montserrat', category: 'Display Sans' },
  { value: 'Open Sans', label: 'Open Sans', category: 'Humanist Sans' },
  { value: 'Lato', label: 'Lato', category: 'Humanist Sans' },
  { value: 'Nunito', label: 'Nunito', category: 'Rounded Sans' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro', category: 'Professional Sans' },
  
  // Serif fonts
  { value: 'Playfair Display', label: 'Playfair Display', category: 'Elegant Serif' },
  { value: 'Merriweather', label: 'Merriweather', category: 'Reading Serif' },
  { value: 'Lora', label: 'Lora', category: 'Web Serif' },
  { value: 'Georgia', label: 'Georgia', category: 'Classic Serif' },
  { value: 'Times New Roman', label: 'Times New Roman', category: 'Classic Serif' },
  
  // Display fonts
  { value: 'Oswald', label: 'Oswald', category: 'Condensed Sans' },
  { value: 'Raleway', label: 'Raleway', category: 'Elegant Sans' },
  { value: 'Work Sans', label: 'Work Sans', category: 'Professional Sans' },
  { value: 'DM Sans', label: 'DM Sans', category: 'Modern Sans' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', category: 'Versatile Sans' },
]

interface FontSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}

export function FontSelect({ value, onChange, placeholder = 'Selecione uma fonte', label }: FontSelectProps) {
  const [open, setOpen] = useState(false)

  const selectedFont = POPULAR_FONTS.find(font => font.value === value)

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {selectedFont ? (
                <span 
                  className="truncate"
                  style={{ fontFamily: selectedFont.value }}
                >
                  {selectedFont.label}
                </span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0" 
          align="start"
          style={{ width: 'var(--radix-popover-trigger-width)' }}
        >
          <div className="max-h-[300px] overflow-y-auto">
            {POPULAR_FONTS.map((font) => (
              <button
                key={font.value}
                className={cn(
                  "relative flex items-center w-full px-3 py-2.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
                  "border-b border-border last:border-0"
                )}
                onClick={() => {
                  onChange(font.value)
                  setOpen(false)
                }}
              >
                <div className="flex flex-col items-start justify-center flex-1 gap-1 min-w-0">
                  <span 
                    className="font-medium leading-none"
                    style={{ fontFamily: font.value }}
                  >
                    {font.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{font.category}</span>
                </div>
                <Check
                  className={cn(
                    "h-4 w-4 shrink-0",
                    value === font.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

