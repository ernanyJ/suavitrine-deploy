'use client'

import { useState } from 'react'

interface ProductImageProps {
  imageUrl?: string
  title: string
  themeMode: 'dark' | 'light'
  roundedClass: string
}

export function ProductImage({ imageUrl, title, themeMode, roundedClass }: ProductImageProps) {
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
          className="text-xs"
          style={{ color: themeMode === 'dark' ? '#71717a' : '#a1a1aa' }}
        >
          Sem imagem
        </span>
      </div>
    )
  }

  return (
    <div className={`aspect-square overflow-hidden ${roundedClass}`}>
      <img
        src={imageUrl}
        alt={title}
        className="h-full w-full object-cover"
        onError={() => {
          setImageError(true)
          console.error('Failed to load image:', imageUrl)
        }}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

