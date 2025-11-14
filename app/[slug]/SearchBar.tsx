'use client'

import { Search, X } from 'lucide-react'

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  themeMode: 'dark' | 'light'
  primaryColor: string
  textColor: string
  borderColor: string
  roundedClass: string
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  themeMode,
  primaryColor,
  textColor,
  borderColor,
  roundedClass,
}: SearchBarProps) {
  return (
    <div className="mb-8 w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: themeMode === 'dark' ? '#71717a' : '#a1a1aa' }} />
        <input
          type="text"
          placeholder="Pesquisar produtos..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`pl-12 pr-12 py-3 w-full text-base ${roundedClass} border transition-all focus:outline-none focus:ring-2 focus:ring-offset-2`}
          style={{
            backgroundColor: themeMode === 'dark' ? '#1a1a1a' : '#ffffff',
            color: textColor,
            borderColor: borderColor,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = primaryColor
            e.currentTarget.style.boxShadow = `0 0 0 3px ${primaryColor}20`
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = borderColor
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded hover:opacity-70 transition-opacity"
            style={{ color: themeMode === 'dark' ? '#71717a' : '#a1a1aa' }}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}

