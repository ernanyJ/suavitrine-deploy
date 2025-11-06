'use client'

import { useState } from 'react'

interface CategoryImageProps {
  imageUrl?: string
  categoryName: string
  themeMode: 'dark' | 'light'
  roundedClass: string
}

export function CategoryImage({ imageUrl, categoryName, themeMode, roundedClass }: CategoryImageProps) {
  const [imageError, setImageError] = useState(false)

  if (!imageUrl || imageError) {
    return (
      <div
        className={`aspect-square flex items-center justify-center ${roundedClass}`}
        style={{
          backgroundColor: themeMode === 'dark' ? '#18181b' : '#f4f4f5',
        }}
      >
        <span
          className="text-xs px-2 text-center"
          style={{ color: themeMode === 'dark' ? '#71717a' : '#71717a' }}
        >
          {categoryName}
        </span>
      </div>
    )
  }

  return (
    <div className={`aspect-square overflow-hidden ${roundedClass}`}>
      <img
        src={imageUrl}
        alt={categoryName}
        className="h-full w-full object-cover"
        onError={() => {
          setImageError(true)
          console.error('Failed to load category image:', imageUrl)
        }}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

